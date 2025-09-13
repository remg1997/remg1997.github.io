---
layout: blog
title: "For Engineers"
permalink: /engineers/
nav: true
excerpt: "Deep technical dives, reproducible experiments, and production lessons learned the hard way."
---

{% assign posts = site.categories.engineers %}
{% for post in posts %}
- [{{ post.title }}]({{ post.url }}) — {{ post.excerpt | strip_html | truncate: 140 }}
{% endfor %}

<div class="track-engineers">

## 🔧 Technical Deep Dives

This is where we get into the nitty-gritty details that matter when you're building ML systems. 

**What you'll find here:**
- Reproducible experiments with full code
- Performance benchmarks and comparisons  
- Architecture breakdowns of real systems
- Debugging stories and lessons learned
- Scaling challenges and solutions

**Recent topics I'm exploring:**
- Fine-tuning efficiency techniques for resource-constrained environments
- Production inference optimization strategies
- Building robust evaluation pipelines

Every post includes runnable code, detailed methodology, and honest assessments of what works (and what doesn't) in practice.

---

*Have a specific engineering challenge you'd like me to tackle? Email me at rafael@theartificialengineer.ai*

</div>
