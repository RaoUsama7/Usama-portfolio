export default {
  slug: "cutting-a-megabyte-off-a-threejs-site",
  title: "Cutting a megabyte off the critical path of a Three.js site",
  description:
    "A real audit of this portfolio: a lazy-loaded chunk that wasn't lazy, 2.5 seconds of hard-coded setTimeout, a progress bar that lied, and a preload hint that doubled a 2.3 MB download.",
  // Kept inside search-result limits: ~60 chars incl. the site suffix, ~155 desc.
  seoTitle: "Cutting 1 MB off a Three.js site critical path",
  seoDescription:
    "A real performance audit: a lazy chunk that wasn't lazy, 2.5s of hard-coded setTimeout, and a preload hint that doubled a 2.3 MB download.",
  date: "2026-08-04",
  updated: "2026-08-04",
  tags: ["Performance", "Core Web Vitals", "Three.js", "React"],
  readingMinutes: 10,
  content: [
    {
      type: "p",
      text: "This site is a React and Three.js portfolio with an animated 3D character, GSAP scroll timelines and a physics-driven tech-stack section. It looked fine and took far too long to become usable. This is what was actually wrong, in the order the fixes mattered.",
    },
    {
      type: "p",
      text: "Every number here is measured against a production build, not estimated.",
    },
    { type: "h2", text: "1. The lazy-loaded chunk that wasn't lazy" },
    {
      type: "p",
      text: "The heaviest section of the site — Three.js plus a Rapier physics world plus eight textures — was already wrapped the way everyone wraps these things:",
    },
    {
      type: "code",
      lang: "tsx",
      code: `const TechStack = lazy(() => import("./TechStack"));

// ...later, in the page body:
<Suspense fallback={<div>Loading....</div>}>
  <TechStack />
</Suspense>`,
    },
    {
      type: "p",
      text: "This does nothing for initial load. `lazy()` defers the *import until the element renders* — and this element renders on first paint, near the bottom of a page nobody has scrolled yet. React dutifully fetched a **907 KB** chunk and mounted a physics simulation the user could not see.",
    },
    {
      type: "callout",
      text: "`lazy()` + `<Suspense>` splits the chunk. It does not defer it. If the component is in your first render tree, the chunk is on your critical path — you have changed which file it lives in, not when it downloads.",
    },
    {
      type: "p",
      text: "The fix is to defer the *render*, not the import — a wrapper that mounts its children only once a sentinel approaches the viewport:",
    },
    {
      type: "code",
      lang: "tsx",
      code: `const check = () => {
  const { top } = node.getBoundingClientRect();
  if (top - margin <= window.innerHeight) {
    setIsVisible(true);
    return true;
  }
  return false;
};

if (check()) return;                  // already in range on mount
window.addEventListener("scroll", onScroll, { passive: true });`,
    },
    {
      type: "p",
      text: "I reached for `IntersectionObserver` first and it never fired. The cause was specific to this codebase and worth knowing about: every block container on the page computes to **width 0**, because the sections take their width from absolutely positioned and viewport-unit children rather than from normal flow. A zero-area target never intersects anything, so the observer sat silent forever. Rect math has no such failure mode.",
    },
    {
      type: "p",
      text: "Result: 907 KB of JavaScript and eight texture requests moved off first paint, loading on approach instead.",
    },
    { type: "h2", text: "2. Two and a half seconds of hard-coded waiting" },
    {
      type: "p",
      text: "After everything had finished loading, the loading screen stayed up through a chain of timers:",
    },
    {
      type: "code",
      lang: "tsx",
      code: `if (percent >= 100) {
  setTimeout(() => {
    setLoaded(true);
    setTimeout(() => setIsLoaded(true), 1000);
  }, 600);
}
// ...and later, before dismissing:
setTimeout(() => { initialFX(); setIsLoading(false); }, 900);`,
    },
    {
      type: "p",
      text: "600 + 1000 + 900 = **2.5 seconds** of pure waiting on a fully loaded page. Trimmed to 1000 ms total, which keeps the transition readable and returns a second and a half.",
    },
    {
      type: "p",
      text: "There is a second bug hiding in that snippet. It sits in the **render body**, not in an effect — so every re-render while `percent` was 100 scheduled another pair of timers. It happened to work. It was never correct.",
    },
    { type: "h2", text: "3. The progress bar was lying" },
    {
      type: "p",
      text: "The percentage counter was driven entirely by timers with no connection to the actual download. The second phase was the memorable part:",
    },
    {
      type: "code",
      lang: "ts",
      code: `interval = setInterval(() => {
  percent = percent + Math.round(Math.random());  // averages +0.5
  setLoading(percent);
  if (percent > 91) clearInterval(interval);
}, 2000);                                          // every 2 seconds`,
    },
    {
      type: "p",
      text: "Half a percent every two seconds. On a slow connection the bar crawled around 50–60% for minutes while a 2.3 MB model downloaded behind it, then snapped to 100. Users read a stalled progress bar as a broken page, and they are usually right.",
    },
    {
      type: "p",
      text: "The replacement streams the response and reports real bytes against `Content-Length`:",
    },
    {
      type: "code",
      lang: "ts",
      code: `const total = Number(response.headers.get("Content-Length")) || 0;
const reader = response.body.getReader();
let received = 0;

for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
  received += value.length;
  // Clamp: a compressed transfer reports fewer bytes than it yields.
  onProgress(Math.min(received / total, 1));
}`,
    },
    {
      type: "p",
      text: "Two details that matter. Clamp the ratio, because a gzipped or brotli-compressed response reports the *compressed* length in the header while the stream yields decompressed bytes. And never let the reported number move backwards, whichever phase is reporting.",
    },
    { type: "h2", text: "4. A preload hint that doubled a 2.3 MB download" },
    {
      type: "p",
      text: "The 3D model is fetched by JavaScript, so it cannot start downloading until the module graph executes. A preload hint in `<head>` starts it about a round trip earlier. My first attempt made things worse:",
    },
    {
      type: "code",
      lang: "html",
      code: `<!-- WRONG: downloads the file twice -->
<link rel="preload" as="fetch" href="/models/character.enc" crossorigin />`,
    },
    {
      type: "p",
      text: "A preload only satisfies a later request if the CORS and credentials modes **match exactly**. This resource is same-origin and fetched with default credentials; `crossorigin` sets the preload to anonymous. The two never matched, so the browser downloaded 2.3 MB, threw it away, and downloaded it again.",
    },
    {
      type: "p",
      text: "I only caught it because I checked the network panel instead of assuming the hint worked. The resource timing entries told the story immediately — two entries for one URL, one with `initiatorType: \"link\"` and one with `\"fetch\"`, both with a real transfer size. After removing the attribute, the pair reads `link: 2284 KB` and `fetch: 0 KB`: downloaded once, served from the preload cache.",
    },
    {
      type: "callout",
      text: "Always verify a preload actually got used. An unused preload is strictly worse than no preload — it costs bandwidth, competes for connections, and Chrome only warns about it in the console if the resource goes entirely unused.",
    },
    { type: "h2", text: "5. The unglamorous rest" },
    {
      type: "ul",
      items: [
        "**Five 404s per page load.** Every project image in the work carousel pointed at a `.png` that was not in the build. Broken images on the page a prospective client looks at hardest.",
        "**A render loop that outlived its component.** `requestAnimationFrame` was never cancelled on unmount, keeping an entire disposed Three.js scene alive.",
        "**Listeners that were never removed.** `removeEventListener` was being called with freshly created arrow functions, which removes nothing at all — a different function identity every time.",
        "**A texture reshuffle on every render.** `Math.random()` sat in JSX, so every sphere silently changed its logo on each re-render.",
        "**984 KB of dead Draco decoder** shipped in `public/`, never requested, because the model is not Draco-compressed at all.",
      ],
    },
    { type: "h2", text: "What generalises" },
    {
      type: "ol",
      items: [
        "**Read the network panel before optimising.** Four of the five real problems here were invisible in the source and obvious in resource timing.",
        "**Code splitting is about when, not where.** A chunk rendered on first paint is on your critical path no matter how it is imported.",
        "**Artificial delay is technical debt with interest.** Timers added to smooth an animation are still there long after the thing they were smoothing changed.",
        "**Honest progress beats smooth progress.** A bar that jumps but tracks reality beats a bar that glides and lies.",
        "**Verify every performance hint.** Preload, prefetch and preconnect all fail silently, and a mismatched hint costs more than none.",
      ],
    },
    {
      type: "p",
      text: "None of this required changing how the site looks. It is the same design, the same animations, the same 3D character — just without a megabyte of work happening before anyone can read the first sentence.",
    },
  ],
  sources: [
    {
      label: "MDN — rel=preload",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload",
    },
    {
      label: "web.dev — Optimize Largest Contentful Paint",
      url: "https://web.dev/articles/optimize-lcp",
    },
    {
      label: "React — lazy",
      url: "https://react.dev/reference/react/lazy",
    },
  ],
};
