# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Jekyll 4.3 personal blog ("The Artificial Engineer") deployed to GitHub Pages at `theartificialengineer.ai` (see `CNAME`). It uses the [`awesome-jekyll-theme`](https://github.com/a-chacon/awesome-jekyll-theme) as a **remote theme** (see `_config.yml`), so most layouts/partials/assets are not in-tree — only local overrides live here.

## Common commands

```bash
bundle install                              # first-time setup / after Gemfile changes
bundle exec jekyll serve                    # local dev server with live reload (http://127.0.0.1:4000)
bundle exec jekyll serve --drafts           # include posts in _drafts/
bundle exec jekyll build                    # one-off production build into _site/
JEKYLL_ENV=production bundle exec jekyll build   # mirror CI build
```

There is no lint or test suite. CI (`.github/workflows/pages.yml`) runs `bundle exec jekyll build` on push to `main` and publishes via the GitHub Pages deploy action; the workflow does **not** use the `github-pages` gem, it uses plain Jekyll with `bundler-cache`.

## Architecture

### Two-track content model

The blog has two audience tracks surfaced as separate nav pages, each filtering `site.posts` by category:

- `_pages/engineers.md` → `site.categories.engineers`
- `_pages/everyone.md`  → `site.categories.everyone`

**Posts route themselves into a track via the `categories:` front matter** (e.g. `categories: [everyone]`), *not* by folder. There is a single flat `_posts/` directory. A post with no matching category will appear in `/posts/` (which iterates `site.posts`) but not in either track page.

### Navigation

The local `_includes/navbar.html` overrides the theme's navbar. It iterates `site.pages` and includes any page with `nav: true` in its front matter. To add a nav item, set `nav: true` on the page; to hide one, remove it. Order follows Jekyll's page iteration order.

### Collections

`_config.yml` defines two collections beyond `_posts`:

- `pages` (from `_pages/`) — permalinks set by each page's own `permalink:` front matter
- `projects` (from `_projects/`) — permalink pattern `/projects/:title/`, rendered via the theme's `project` / `projects` layouts

### Local overrides vs. remote theme

When editing layout/styling, check whether the file exists locally first — local files shadow theme files of the same name:

- `_layouts/default.html` — minimal custom default that pulls in theme CSS (`dist-style.css` + `main.css`), runs `{% seo %}`, and includes `navbar.html` + `footer.html`
- `_includes/navbar.html`, `_includes/custom_head.html`, `_includes/contact_channels.html`
- Layouts like `home`, `blog`, `post`, `project`, `projects` referenced in front matter come from the **remote theme** and are not in this repo — to customize them, copy the file from the theme into `_layouts/` and edit locally.

### Config worth knowing

- `permalink: /:categories/:title/` — post URLs embed their category (e.g. `/everyone/why-this-blog/`), unless a post overrides with its own `permalink:` front matter (as the sample post does)
- `paginate: 5` with `paginate_path: "/page:num/"`
- Plugins include `jekyll-polyglot` (multi-language support, currently only `default_lang: en`) and `jekyll-archives` (category/tag archives at `/categories/` and `/tags/`)
- `rrss:` block feeds the theme's social links; `contact_channels:` is used by the local include
