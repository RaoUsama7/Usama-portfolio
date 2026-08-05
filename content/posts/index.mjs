import aiModelLandscape from "./ai-model-landscape-mid-2026.mjs";
import aiCodingProductivity from "./ai-coding-productivity-data.mjs";
import reactServerComponents from "./react-server-components-2026.mjs";
import threejsPerformance from "./cutting-a-megabyte-off-a-threejs-site.mjs";

/**
 * Every post on the site. To add one: create a file in this folder following the
 * same shape, import it here, and rebuild — the blog pages, sitemap and RSS feed
 * are all generated from this array.
 */
export const posts = [
  threejsPerformance,
  aiModelLandscape,
  aiCodingProductivity,
  reactServerComponents,
].sort((a, b) => (a.date < b.date ? 1 : -1));

export const postBySlug = (slug) => posts.find((post) => post.slug === slug);
