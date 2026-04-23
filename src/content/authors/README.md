# authors/

Contributor profiles for The Artificial Engineer.

## Adding a new contributor

Create `<slug>.md` where `<slug>` matches the `author:` field used in posts. Frontmatter schema (see `src/content.config.ts`):

```yaml
---
name: "Full Name"           # required, display name
role: "Guest contributor"   # required, e.g. "Founder & Editor", "Contributor"
tagline: "One-liner."       # optional, shown on profile page + card
avatar: ./slug.jpg          # optional, co-located image
links:                      # optional, all fields individually optional
  website: https://...
  github: https://github.com/...
  linkedin: https://linkedin.com/in/...
  scholar: https://scholar.google.com/...
  twitter: https://twitter.com/...
  email: name@domain.com
order: 10                   # lower = earlier in Contributors grid; default 999
featured: false             # optional marker
---

Long-form bio goes in the Markdown body. Shown on the author's profile page at /authors/<slug>/.
```

Posts reference an author via the `author:` frontmatter field (the slug, not the display name). See `src/content/posts/why-this-blog.md` for an example.
