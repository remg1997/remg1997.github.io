---
layout: default
title: "All Posts"
permalink: /posts/
nav: true
---

{% for post in site.posts %}
- [{{ post.title }}]({{ post.url }}) — {{ post.excerpt | strip_html | truncate: 140 }}
{% endfor %}
