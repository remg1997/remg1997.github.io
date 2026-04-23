import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  return rss({
    title: "The Artificial Engineer",
    description:
      "Practical ML engineering notes. Deep dives for engineers and accessible explainers for everyone.",
    site: context.site ?? "https://theartificialengineer.ai",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
      categories: [post.data.track, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
