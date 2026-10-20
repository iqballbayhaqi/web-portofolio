# SEO: balee.web.id

Target query: `iqbal software engineer`.
Canonical homepage: https://balee.web.id/

## Publish and verify

1. Deploy the reviewed changes to the production host. Local edits do not affect Google.
2. Confirm the HTTPS homepage, robots.txt, sitemap.xml, data.json, JavaScript, and profile photo return HTTP 200. Make HTTP and www URLs redirect permanently to https://balee.web.id/ in the active web-server configuration. Check that nonexistent pages return HTTP 404.
3. Verify ownership of balee.web.id in Google Search Console. Submit https://balee.web.id/sitemap.xml, inspect the homepage with the live URL test, and request indexing.
4. Check the rendered page and structured data in Google's Rich Results Test. Person markup describes identity; it does not guarantee a rich result or a ranking.
5. In Search Console Performance, filter the query `iqbal software engineer`; track impressions, clicks, and average position, including country and device. Compare equivalent periods after Google recrawls. Average position is not a fixed ranking for every user.
6. Add the canonical portfolio URL to your LinkedIn and GitHub profiles. Publish useful project case studies describing your actual work, technical decisions, and outcomes without invented metrics.

## Maintain consistency

Update static index.html content and JSON-LD alongside data.json when changing your name, role, employer, or SEO description. Production currently fetches data from GitHub main first, so publish the corresponding data.json there too. Update sitemap lastmod only for meaningful published page changes.

## Local checks

Run `python -m unittest discover -s tests`.

Google references:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/appearance/structured-data/profile-page

No ranking guarantee: indexing and ranking depend on Google, competition, and external signals.

## Public audit: 2026-10-20

The live host is Nginx 1.24.0 (Ubuntu); .htaccess rules do not configure it.

Confirmed live findings:
- Homepage returns 200, but its canonical still targets iqbalbayhaqi.com.
- robots.txt and sitemap.xml still reference the old domain.
- /assets/img/og-image.png returns 404.
- www.balee.web.id and /index.html return 200 without canonical redirects.
- HTTP redirects to HTTPS, and a nonexistent URL returns 404.
- Live data.json still contains the old name spelling, SEO URL, and preview image.

Local fixes include metadata, visible profile, static experience, JSON-LD, sitemap, crawl access, preview-image references, SEO data URLs, and the About heading ID. All referenced local assets exist.

Search-engine spot checks:
- General search queries for site:balee.web.id and the quoted domain did not provide a matching domain result in the returned results. This is not proof of non-indexing.
- Bing returned unrelated results for both site: and quoted-domain queries; results were inconclusive.
- DuckDuckGo required a human CAPTCHA; Yahoo returned HTTP 500; Brave returned HTTP 429. Rankings were not verified on those engines.

Next actions:
1. Deploy local changes, including data.json on GitHub main because production currently prioritizes that source.
2. Review deploy/nginx-seo.conf.example against the actual Nginx server block; validate using nginx -t before applying. The example has not been installed or validated on the VPS.
3. Verify the site in Bing Webmaster Tools and submit https://balee.web.id/sitemap.xml. DuckDuckGo sources many traditional links from Bing: https://duckduckgo.com/duckduckgo-help-pages/results/sources .
4. Verify indexing in Google Search Console and Bing Webmaster Tools. Their authenticated reports are needed for reliable index status and performance; public spot checks cannot prove a top-ten position.

Bing sitemap documentation: https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed
