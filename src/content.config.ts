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
      author: z.string().default("rafael"),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!README.md"],
    base: "./src/content/projects",
  }),
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

const journal = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!README.md"],
    base: "./src/content/journal",
  }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(["active", "archived", "remixed"]).default("active"),
  }),
});

const authors = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!README.md"],
    base: "./src/content/authors",
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      tagline: z.string().optional(),
      avatar: image().optional(),
      links: z
        .object({
          website: z.string().url().optional(),
          github: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          scholar: z.string().url().optional(),
          twitter: z.string().url().optional(),
          email: z.string().email().optional(),
        })
        .default({}),
      order: z.number().default(999),
      featured: z.boolean().default(false),
    }),
});

export const collections = { posts, projects, journal, authors };
