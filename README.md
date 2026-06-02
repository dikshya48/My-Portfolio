# Sketchbook Portfolio

A monochrome design portfolio with an artist sketchbook aesthetic — textured paper, graphite typography, blueprint grids, and charcoal smudges.

## Quick start

**Easiest (Mac):** Double-click `start.command` in Finder. It opens the site in your browser at `http://localhost:8080`.

**Or run in Terminal:**

```bash
cd /Users/dikshyagiri/Documents/myportfolio
python3 -m http.server 8080
```

Then open **http://localhost:8080** in Chrome, Safari, or Firefox.

> **Note:** Opening `index.html` directly (file://) also works now, but using a local server is recommended.

## Customize

- **Hero title** — Edit the SVG text in `index.html` (`hero__title-svg`)
- **Projects** — Update work cards in the `#work` section
- **Contact** — Change the email and social links in `#contact`
- **Colors** — CSS variables in `css/styles.css` (`:root`)

## Structure

```
index.html      Main page
css/styles.css  All styles & textures
js/main.js      Scroll reveals & nav highlight
```

No build step required. Fully responsive and static-hosting friendly (Netlify, Vercel, GitHub Pages).
