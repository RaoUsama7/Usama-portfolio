// Single source of truth for everything SEO needs to know about this site.
// CHANGE `origin` TO YOUR REAL DOMAIN — canonical URLs, the sitemap, robots.txt
// and every Open Graph tag are derived from it.
export const site = {
  origin: "https://usamarao.com",
  name: "Usama Rao",
  jobTitle: "Full Stack Developer",
  // Used as the homepage <title>. Keep under ~60 chars so it isn't truncated.
  title: "Usama Rao — Full Stack Developer (React, Next.js, NestJS)",
  description:
    "Full stack developer building scalable web applications with React, Angular, Next.js, Node.js and NestJS. Available for freelance and contract work.",
  locale: "en_US",
  lang: "en",
  twitter: "@The_real_me007",
  email: "raorvp20@gmail.com",
  socials: [
    "https://github.com/RaoUsama7",
    "https://www.linkedin.com/in/usamarao007",
    "https://x.com/The_real_me007",
  ],
  skills: [
    "React.js",
    "Angular",
    "Next.js",
    "TypeScript",
    "Node.js",
    "NestJS",
    "MongoDB",
    "PostgreSQL",
    "Microservices",
  ],
};

export const blogMeta = {
  title: "Blog — AI & Web Engineering",
  description:
    "Notes on AI tooling, model releases and web performance engineering — written for people who have to ship and maintain the result.",
};

export const url = (path = "/") =>
  `${site.origin}${path.startsWith("/") ? path : `/${path}`}`;
