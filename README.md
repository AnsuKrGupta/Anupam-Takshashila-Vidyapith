# atvnirmali.org

Website of Anupam Takshashila Vidyapith, Nirmali. Hosted on Vercel; every push to `main` deploys to https://www.atvnirmali.org.

- `src/site.html` — all page content (one template, 8 sections). Edit text here.
- `public/` — files served as-is: `images/`, `robots.txt`, `llms.txt`, `og-image.jpg`, `logo.png`.
- `build.mjs` — splits the template into real pages (`/`, `/about/`, `/admissions/`, `/facilities/`, `/gallery/`, `/notices/`, `/blog/`, `/contact/`) with their own title, description and structured data, and writes `sitemap.xml` and `404.html` into `dist/`. Page titles and descriptions are set in the `PAGES` list at the top.
- The FAQ on the home page doubles as the FAQ structured data; edit it in `src/site.html` only.

Preview locally:

```bash
node build.mjs
```

then serve `dist/` with any static server.

Add new images to `public/images/` as WebP (e.g. `cwebp -q 78 -resize 1400 0 in.jpg -o out.webp`), never as base64 inside the HTML.
