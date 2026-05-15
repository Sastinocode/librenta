# Librenta

## Overview
LIBRENTA is a peer-to-peer (P2P) marketplace landing page for renting sports equipment (kayaks, surfboards, mountain bikes, etc.) in Spain. It is a waitlist/early-adopter capture page designed to collect leads before a full platform launch.

## Architecture
- **Type:** Static HTML site (no build system, no package manager)
- **Frontend:** Single `index.html` file using:
  - Tailwind CSS (via CDN)
  - Vanilla JavaScript (embedded)
  - Google Fonts (Plus Jakarta Sans, Be Vietnam Pro)
  - Material Symbols Outlined (icons)
- **Form Handling:** Netlify Forms (for waitlist submissions)
- **Backend:** None — fully static

## Project Structure
```
librenta-github-repo/   # Static site root
  index.html            # Main landing page (HTML + CSS + JS)
  netlify.toml          # Original Netlify deployment config
serve.js                # Simple Node.js HTTP server for local development
replit.md               # This file
```

## Development
The site is served via a minimal Node.js HTTP server (`serve.js`) on port 5000.

- **Workflow:** "Start application" runs `node serve.js`
- **Port:** 5000 (0.0.0.0)
- **Deployment:** Configured as a static site pointing to `librenta-github-repo/`

## Notes
- Tailwind CSS is loaded via CDN (not recommended for production, but sufficient for this landing page)
- Netlify Forms integration requires actual Netlify hosting to work — form submissions won't function in the Replit environment
