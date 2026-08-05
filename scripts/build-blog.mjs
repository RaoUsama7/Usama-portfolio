/**
 * Generates the static blog, sitemap, RSS feed and robots.txt into dist/.
 *
 * The blog is deliberately built as plain HTML rather than as routes inside the
 * React SPA. Crawlers get complete markup with no JavaScript execution required,
 * the pages render instantly, and none of it has to coexist with the Three.js
 * scene and GSAP timelines that make the homepage impossible to prerender.
 *
 * Run automatically as part of `npm run build`.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { site, blogMeta, url } from "../content/site.mjs";
import { posts } from "../content/posts/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

/* ------------------------------------------------------------------ */
/* escaping + inline markup                                            */
/* ------------------------------------------------------------------ */

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Only these schemes may appear in a generated href.
const safeHref = (href) =>
  /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : "#";

/**
 * Minimal inline markup for post copy: **bold**, `code`, [label](url).
 * Escaping happens first, so post text can never inject markup.
 */
const inline = (text) =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const target = safeHref(href);
      const external = /^https?:\/\//i.test(target);
      return `<a href="${target}"${
        external ? ' target="_blank" rel="noopener noreferrer"' : ""
      }>${label}</a>`;
    });

/* ------------------------------------------------------------------ */
/* content blocks                                                      */
/* ------------------------------------------------------------------ */

const slugifyHeading = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const renderBlock = (block) => {
  switch (block.type) {
    case "p":
      return `<p>${inline(block.text)}</p>`;
    case "h2": {
      const id = slugifyHeading(block.text);
      return `<h2 id="${escapeHtml(id)}">${inline(block.text)}</h2>`;
    }
    case "h3":
      return `<h3 id="${escapeHtml(slugifyHeading(block.text))}">${inline(
        block.text
      )}</h3>`;
    case "ul":
      return `<ul>${block.items
        .map((item) => `<li>${inline(item)}</li>`)
        .join("")}</ul>`;
    case "ol":
      return `<ol>${block.items
        .map((item) => `<li>${inline(item)}</li>`)
        .join("")}</ol>`;
    case "code":
      return `<pre><code class="language-${escapeHtml(
        block.lang || "text"
      )}">${escapeHtml(block.code)}</code></pre>`;
    case "quote":
      return `<blockquote><p>${inline(block.text)}</p>${
        block.cite ? `<cite>${inline(block.cite)}</cite>` : ""
      }</blockquote>`;
    case "callout":
      return `<aside class="callout">${inline(block.text)}</aside>`;
    default:
      throw new Error(`Unknown block type: ${block.type}`);
  }
};

const renderContent = (content) => content.map(renderBlock).join("\n");

/* ------------------------------------------------------------------ */
/* page shell                                                          */
/* ------------------------------------------------------------------ */

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const styles = `
:root{--accent:#5eead4;--bg:#0a0e17;--bg2:#050810;--text:#eae5ec;--muted:#8b93a5;--line:rgba(255,255,255,.09);--code:#0d1420}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg2);color:var(--text);font-family:Geist,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.7;font-size:17px;-webkit-font-smoothing:antialiased}
a{color:inherit}
a:hover{color:var(--accent)}
.wrap{width:min(100% - 40px,760px);margin-inline:auto}
.site-header{border-bottom:1px solid var(--line);position:sticky;top:0;background:rgba(5,8,16,.82);backdrop-filter:blur(12px);z-index:10}
.site-header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0}
.brand{font-weight:600;letter-spacing:.4px;text-decoration:none;font-size:17px}
.site-nav{display:flex;gap:22px;font-size:14px;letter-spacing:1px;text-transform:uppercase}
.site-nav a{text-decoration:none;color:var(--muted)}
.site-nav a:hover,.site-nav a[aria-current]{color:var(--accent)}
main{padding:56px 0 80px}
h1{font-size:clamp(30px,5vw,44px);line-height:1.18;margin:0 0 18px;font-weight:600;letter-spacing:-.4px}
h2{font-size:clamp(21px,3vw,27px);line-height:1.3;margin:44px 0 14px;font-weight:600;letter-spacing:-.2px;scroll-margin-top:80px}
h3{font-size:19px;margin:30px 0 10px;font-weight:600;scroll-margin-top:80px}
p{margin:0 0 18px}
ul,ol{margin:0 0 18px;padding-left:22px}
li{margin-bottom:9px}
li::marker{color:var(--accent)}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.87em;background:rgba(94,234,212,.1);color:var(--accent);padding:.15em .4em;border-radius:4px}
pre{background:var(--code);border:1px solid var(--line);border-radius:10px;padding:16px;overflow-x:auto;margin:0 0 20px;font-size:14px;line-height:1.6}
pre code{background:none;color:#c9d3e3;padding:0;font-size:inherit}
blockquote{margin:0 0 20px;padding:2px 0 2px 20px;border-left:2px solid var(--accent);color:var(--muted);font-style:italic}
blockquote p{margin:0}
cite{display:block;margin-top:8px;font-size:14px;font-style:normal}
.callout{margin:0 0 20px;padding:15px 18px;border:1px solid rgba(94,234,212,.22);border-radius:10px;background:rgba(94,234,212,.05);font-size:16px}
.meta{color:var(--muted);font-size:14px;margin:0 0 10px;letter-spacing:.4px}
.tags{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:0 0 34px}
.tags li{margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 11px}
.lede{font-size:19px;color:#b9c0cd;margin-bottom:34px}
.post-list{list-style:none;padding:0;margin:0}
.post-list li{margin:0;padding:28px 0;border-bottom:1px solid var(--line)}
.post-list li:first-child{padding-top:6px}
.post-list h2{margin:0 0 8px;font-size:22px}
.post-list h2 a{text-decoration:none}
.post-list p{margin:0 0 10px;color:var(--muted);font-size:16px}
.sources{margin-top:52px;padding-top:26px;border-top:1px solid var(--line)}
.sources h2{margin-top:0;font-size:17px;letter-spacing:1px;text-transform:uppercase;color:var(--muted)}
.sources ul{list-style:none;padding:0}
.sources li{font-size:15px;word-break:break-word}
.cta{margin-top:52px;padding:26px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.02)}
.cta h2{margin:0 0 10px;font-size:20px}
.cta p{margin:0 0 16px;color:var(--muted);font-size:16px}
.btn{display:inline-block;background:var(--accent);color:var(--bg);text-decoration:none;font-weight:600;padding:11px 22px;border-radius:999px;font-size:15px}
.btn:hover{color:var(--bg);filter:brightness(1.08)}
.back{display:inline-block;margin-bottom:26px;color:var(--muted);text-decoration:none;font-size:14px}
footer{border-top:1px solid var(--line);padding:26px 0;color:var(--muted);font-size:14px}
footer .wrap{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between}
@media(max-width:600px){body{font-size:16px}main{padding:36px 0 56px}.site-nav{gap:16px;font-size:13px}}
`.trim();

const layout = ({ title, description, canonical, head = "", body }) => `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="author" content="${escapeHtml(site.name)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${escapeHtml(site.name)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:locale" content="${site.locale}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:creator" content="${escapeHtml(site.twitter)}" />
<link rel="alternate" type="application/rss+xml" title="${escapeHtml(
  site.name
)} — Blog" href="${url("/rss.xml")}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" />
<style>${styles}</style>
${head}
</head>
<body>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">${escapeHtml(site.name)}</a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/#about">About</a>
      <a href="/#work">Work</a>
      <a href="/blog/" aria-current="page">Blog</a>
      <a href="/#contact">Contact</a>
    </nav>
  </div>
</header>
<main><div class="wrap">
${body}
</div></main>
<footer><div class="wrap">
  <span>&copy; ${new Date().getFullYear()} ${escapeHtml(site.name)}</span>
  <span><a href="/">Portfolio</a> &middot; <a href="${url(
    "/rss.xml"
  )}">RSS</a></span>
</div></footer>
</body>
</html>`;

const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(
    /</g,
    "\\u003c"
  )}</script>`;

/* ------------------------------------------------------------------ */
/* pages                                                               */
/* ------------------------------------------------------------------ */

const personSchema = {
  "@type": "Person",
  "@id": url("/#person"),
  name: site.name,
  jobTitle: site.jobTitle,
  url: site.origin,
  email: `mailto:${site.email}`,
  knowsAbout: site.skills,
  sameAs: site.socials,
};

const buildPostPage = (post) => {
  const canonical = url(`/blog/${post.slug}/`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonical}#post`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated || post.date,
        author: { "@id": url("/#person") },
        publisher: { "@id": url("/#person") },
        mainEntityOfPage: canonical,
        url: canonical,
        keywords: post.tags.join(", "),
        inLanguage: site.lang,
        wordCount: post.content
          .map((b) => b.text || (b.items || []).join(" ") || b.code || "")
          .join(" ")
          .split(/\s+/).length,
      },
      personSchema,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: url("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: url("/blog/"),
          },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical },
        ],
      },
    ],
  };

  const sources = post.sources?.length
    ? `<section class="sources"><h2>Sources</h2><ul>${post.sources
        .map(
          (s) =>
            `<li><a href="${safeHref(
              s.url
            )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              s.label
            )}</a></li>`
        )
        .join("")}</ul></section>`
    : "";

  const body = `<a class="back" href="/blog/">&larr; All posts</a>
<article>
<h1>${escapeHtml(post.title)}</h1>
<p class="meta"><time datetime="${post.date}">${formatDate(
    post.date
  )}</time> &middot; ${post.readingMinutes} min read</p>
<ul class="tags">${post.tags
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("")}</ul>
<p class="lede">${escapeHtml(post.description)}</p>
${renderContent(post.content)}
${sources}
</article>
<section class="cta">
<h2>Building something like this?</h2>
<p>I'm a full stack developer working in React, Angular, Next.js, Node.js and NestJS — available for freelance and contract work.</p>
<a class="btn" href="/#contact">Get in touch</a>
</section>`;

  return layout({
    // seoTitle/seoDescription keep the SERP snippet inside display limits while
    // the on-page H1 and lede stay as written.
    title: `${post.seoTitle || post.title} — ${site.name}`,
    description: post.seoDescription || post.description,
    canonical,
    head: `<meta property="article:published_time" content="${post.date}" />
<meta property="article:author" content="${escapeHtml(site.name)}" />
${post.tags
  .map((t) => `<meta property="article:tag" content="${escapeHtml(t)}" />`)
  .join("\n")}
${jsonLd(schema)}`,
    body,
  });
};

const buildIndexPage = () => {
  const canonical = url("/blog/");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${canonical}#blog`,
        name: `${site.name} — ${blogMeta.title}`,
        description: blogMeta.description,
        url: canonical,
        inLanguage: site.lang,
        author: { "@id": url("/#person") },
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          url: url(`/blog/${p.slug}/`),
        })),
      },
      personSchema,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: url("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: canonical },
        ],
      },
    ],
  };

  const body = `<h1>Writing</h1>
<p class="lede">${escapeHtml(blogMeta.description)}</p>
<ul class="post-list">
${posts
  .map(
    (p) => `<li>
<h2><a href="/blog/${p.slug}/">${escapeHtml(p.title)}</a></h2>
<p class="meta"><time datetime="${p.date}">${formatDate(p.date)}</time> &middot; ${
      p.readingMinutes
    } min read</p>
<p>${escapeHtml(p.description)}</p>
<ul class="tags">${p.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
</li>`
  )
  .join("\n")}
</ul>`;

  return layout({
    title: `${blogMeta.title} — ${site.name}`,
    description: blogMeta.description,
    canonical,
    head: jsonLd(schema),
    body,
  });
};

/* ------------------------------------------------------------------ */
/* sitemap / rss / robots                                              */
/* ------------------------------------------------------------------ */

const buildSitemap = () => {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    { loc: url("/"), lastmod: today, priority: "1.0", changefreq: "monthly" },
    {
      loc: url("/blog/"),
      lastmod: posts[0]?.date || today,
      priority: "0.8",
      changefreq: "weekly",
    },
    ...posts.map((p) => ({
      loc: url(`/blog/${p.slug}/`),
      lastmod: p.updated || p.date,
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
};

const buildRobots = () => `User-agent: *
Allow: /

Sitemap: ${url("/sitemap.xml")}
`;

const buildRss = () => {
  const items = posts
    .map(
      (p) => `  <item>
    <title>${escapeHtml(p.title)}</title>
    <link>${url(`/blog/${p.slug}/`)}</link>
    <guid isPermaLink="true">${url(`/blog/${p.slug}/`)}</guid>
    <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
    <description>${escapeHtml(p.description)}</description>
  </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeHtml(site.name)} — Blog</title>
  <link>${url("/blog/")}</link>
  <atom:link href="${url("/rss.xml")}" rel="self" type="application/rss+xml" />
  <description>${escapeHtml(blogMeta.description)}</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>
`;
};

/* ------------------------------------------------------------------ */

const write = async (relativePath, contents) => {
  const target = join(dist, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
  return relativePath;
};

const main = async () => {
  if (!existsSync(dist)) {
    throw new Error("dist/ not found — run `vite build` before this script.");
  }

  // Fail loudly rather than shipping a sitemap full of the placeholder domain.
  if (!/^https?:\/\/[^/]+$/.test(site.origin)) {
    throw new Error(
      `content/site.mjs: origin must be a bare origin like https://example.com (got "${site.origin}")`
    );
  }

  const slugs = new Set();
  const warnings = [];
  for (const post of posts) {
    if (slugs.has(post.slug)) throw new Error(`Duplicate slug: ${post.slug}`);
    slugs.add(post.slug);
    for (const field of ["title", "description", "date", "content", "tags"]) {
      if (!post[field]) throw new Error(`Post ${post.slug} is missing ${field}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
      throw new Error(`Post ${post.slug} has a non ISO date: ${post.date}`);
    }
    // Search results truncate around these lengths — flag, don't fail.
    const titleLength = (post.seoTitle || post.title).length + site.name.length + 3;
    const descLength = (post.seoDescription || post.description).length;
    if (titleLength > 60) {
      warnings.push(`${post.slug}: <title> is ${titleLength} chars (aim <= 60) — add a shorter seoTitle`);
    }
    if (descLength > 160) {
      warnings.push(`${post.slug}: description is ${descLength} chars (aim <= 160) — add a shorter seoDescription`);
    }
  }
  warnings.forEach((w) => console.warn(`  ! ${w}`));

  const written = [
    await write("blog/index.html", buildIndexPage()),
    ...(await Promise.all(
      posts.map((post) =>
        write(`blog/${post.slug}/index.html`, buildPostPage(post))
      )
    )),
    await write("sitemap.xml", buildSitemap()),
    await write("robots.txt", buildRobots()),
    await write("rss.xml", buildRss()),
  ];

  // The SPA's index.html is built by Vite; make sure it carries the canonical.
  const html = await readFile(join(dist, "index.html"), "utf8");
  if (!html.includes('rel="canonical"')) {
    console.warn("  ! dist/index.html has no canonical link");
  }
  if (!html.includes(site.origin)) {
    console.warn(
      `  ! dist/index.html does not reference ${site.origin} — update the absolute URLs in index.html to match content/site.mjs`
    );
  }
  if (!existsSync(join(dist, "og-image.png"))) {
    console.warn(
      "  ! public/og-image.png missing — og:image points at it but nothing is there.\n" +
        "    Export public/og-image.svg to PNG at 1200x630. Most platforms will not render an SVG."
    );
  }

  console.log(`\n  blog: ${posts.length} posts + ${written.length - posts.length} generated files`);
  written.forEach((f) => console.log(`    dist/${f}`));
  console.log(`\n  origin: ${site.origin}\n`);
};

main().catch((error) => {
  console.error(`\nBlog build failed: ${error.message}\n`);
  process.exit(1);
});
