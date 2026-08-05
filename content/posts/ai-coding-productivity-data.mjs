export default {
  slug: "ai-coding-productivity-data",
  title: "The AI coding productivity data is messier than the headlines",
  description:
    "METR's follow-up study is reported as an 18% speedup. Read the confidence intervals and the authors' own caveats and the picture gets a lot less certain — here's what the evidence actually supports.",
  seoTitle: "AI coding productivity: what the data shows",
  seoDescription:
    "METR reported an 18% speedup. Read the confidence intervals and the authors' own caveats and the picture gets far less certain than the headlines.",
  date: "2026-07-21",
  updated: "2026-07-21",
  tags: ["AI", "Developer Productivity", "Engineering"],
  readingMinutes: 8,
  content: [
    {
      type: "p",
      text: "There is a statistic doing the rounds: AI coding tools made experienced developers 19% *slower* in early 2025, then 18% *faster* in the follow-up. It gets cited as proof that the tools crossed a threshold, or that developers learned to use them. Both stories are tidy. Neither is supported by the study they come from.",
    },
    {
      type: "p",
      text: "I went and read [METR's own write-up](https://metr.org/blog/2026-02-24-uplift-update/) rather than the summaries. It is worth doing, because the authors are considerably more careful than the people quoting them.",
    },
    { type: "h2", text: "What the numbers actually are" },
    {
      type: "p",
      text: "METR's original study found tasks took **19% longer** with AI, with a confidence interval of **+2% to +39%**. That result was reasonably robust — the interval does not cross zero, so the slowdown was a real effect in that sample.",
    },
    { type: "p", text: "The follow-up reported two groups:" },
    {
      type: "ul",
      items: [
        "Original developers: **18% speedup**, confidence interval **−38% to +9%**",
        "Newly recruited developers: **4% speedup**, confidence interval **−15% to +9%**",
      ],
    },
    {
      type: "callout",
      text: "Both of those intervals cross zero. That means the data is consistent with a large speedup, with no effect at all, and with a modest slowdown. Reporting the midpoint as though it were the finding throws away the part that tells you how much to trust it.",
    },
    {
      type: "p",
      text: "This is the single most common way engineering statistics get mangled. A point estimate without its interval is not a weaker version of the result — it is a different claim, and usually a false one.",
    },
    { type: "h2", text: "The authors' own caveats are stronger than the result" },
    {
      type: "p",
      text: "METR describe their own findings as *very weak evidence*, and they are explicit about why. Their stated concerns include selection bias — they note they are systematically missing developers with the most optimistic expectations about AI's value — along with 30–50% of developers declining to submit tasks they did not want to do without AI, a lower participant rate ($50/hr against $150/hr) that may have shifted who took part, and measurement difficulties once developers ran AI agents concurrently.",
    },
    {
      type: "p",
      text: "Note the direction: the authors think the true speedup **could be much higher** than they measured. This is not a debunking. It is a research team saying, in public, that their own headline number should not be load-bearing. That is good science and terrible copy, which is why the caveats rarely survive the trip into a listicle.",
    },
    { type: "h2", text: "Where the evidence is more solid" },
    {
      type: "p",
      text: "Task-level speedups on scoped work are well replicated across multiple sources: writing a function, generating tests, producing boilerplate. Reported gains cluster in the 20–55% range depending on task and language, with the largest gains in popular languages on simple tasks and gains fading toward zero — or going negative — on niche and legacy codebases. McKinsey's survey of 4,500 developers reported a 46% reduction in time on routine coding tasks.",
    },
    {
      type: "p",
      text: "Adoption is not in question either. Stack Overflow's 2025 survey put monthly AI assistant usage at **92.6%** of developers. Whatever the productivity effect is, it is now the default working condition of the profession.",
    },
    { type: "h2", text: "The finding that should worry you more" },
    {
      type: "p",
      text: "Buried under the speed debate is a result with clearer operational consequences: AI-generated pull requests are reported to sit in review roughly **4.6× longer**, and to carry **15–18% more security vulnerabilities**. Meanwhile senior engineers capture close to **5× the productivity gain** of junior engineers.",
    },
    {
      type: "p",
      text: "Put those together and the organisational picture explains itself. Many teams report faster coding and no improvement in delivery velocity. That is exactly what you would expect if the bottleneck moved rather than disappeared — code generation got cheap, and review, which was already the constraint, got more expensive per unit of code.",
    },
    {
      type: "quote",
      text: "Writing code faster only helps if writing code was the bottleneck. On most teams it was not.",
    },
    { type: "h2", text: "What I do with this" },
    {
      type: "ol",
      items: [
        "**Measure your own team, not the industry.** Cycle time from first commit to merged, before and after. Everything else is someone else's codebase.",
        "**Treat AI output as a draft from a fast junior.** Useful volume, needs real review. The 15–18% vulnerability figure is a review-process problem, not a reason to stop.",
        "**Watch review latency as the primary metric.** If PR volume rises and review time rises with it, you have moved the bottleneck rather than removed it.",
        "**Be careful with juniors.** If seniors capture 5× the gain, handing juniors the same tools without mentorship widens the gap instead of closing it.",
        "**Keep the specification work.** The tools are good at producing code from a clear description and bad at deciding what should exist. That judgement is still the job.",
      ],
    },
    {
      type: "p",
      text: "The honest summary of the current evidence is: large, real gains on scoped tasks; unclear and contested effects on end-to-end delivery; and a measurable shift of cost into review and security. Anyone quoting you a single confident percentage for what AI will do to your team's productivity is selling something.",
    },
  ],
  sources: [
    {
      label: "METR — We are changing our developer productivity experiment design",
      url: "https://metr.org/blog/2026-02-24-uplift-update/",
    },
    {
      label:
        "METR — Measuring the impact of early-2025 AI on experienced open-source developer productivity",
      url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/",
    },
    {
      label: "Panto — AI coding productivity statistics 2026",
      url: "https://www.getpanto.ai/blog/ai-coding-productivity-statistics",
    },
    {
      label:
        "arXiv — Adoption and impact of command-line AI coding agents at Microsoft",
      url: "https://arxiv.org/pdf/2607.01418",
    },
  ],
};
