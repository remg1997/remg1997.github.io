import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      track: z.enum(["engineers", "everyone"]),
      excerpt: z.string(),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      readingTime: z.string().optional(),
      author: z.string().default("Rafael Mosquera"),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kind: z.enum(["publication", "dataset", "competition"]),
      date: z.coerce.date(),
      venue: z.string().optional(),
      description: z.string(),
      link: z.string().url().optional(),
      image: image().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    }),
});

export const collections = { posts, projects };
