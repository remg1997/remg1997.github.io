source "https://rubygems.org"

# Hello! This is where you manage which Jekyll version is used to run.
# When you want to use a different version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
#
# This will help ensure the proper Jekyll version is running.

# This is the default theme for new Jekyll sites.
# gem "minima", "~> 2.5"

# If you want to use GitHub Pages, remove the "gem \"jekyll\"" above and
# uncomment the line below. To upgrade, run `bundle update github-pages`.
# gem "github-pages", "~> 228", group: :jekyll_plugins

# Use Jekyll directly (recommended for custom themes)
gem "jekyll", "~> 4.3"

# Awesome Jekyll Theme as a gem-based theme
gem "awesome-jekyll-theme"

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-seo-tag"
  gem "jekyll-paginate"
  gem "jekyll-sitemap"
  gem "jekyll-include-cache"
  gem "jekyll-archives"
  gem "jekyll-polyglot"
  gem "jekyll-remote-theme"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Add webrick for Ruby 3.0+
gem "webrick", "~> 1.7"

# Add csv for Ruby 3.4+
gem "csv"
