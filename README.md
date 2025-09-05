# Curbside Lube Co. — Vite + React

Production‑ready single‑page site for booking mobile oil changes.

## Quick start

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## GitHub Pages

This project includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that deploys `dist/` on every push to `main`.

- If you use a **User/Org Pages** repo named `<your-username>.github.io`, the site is at the domain root and `vite.config.js` uses `base: '/'`.
- If you use a **Project Pages** repo (e.g. `curbside-lube-site`), the site is served at `/curbside-lube-site/` and `vite.config.js` should be `base: '/curbside-lube-site/'`.

### Enable Pages

1. Push to GitHub.
2. Repo → **Settings → Pages** → **Source = GitHub Actions**.
3. Watch the **Actions** tab for **Deploy to GitHub Pages** to go green.
4. Your URL will be shown under **Settings → Pages**.

## Email sending

- **Send via Mail App** works out‑of‑the‑box.
- Optional in‑app sending via **EmailJS**: set `useEmailJS` to `true` in `src/App.jsx` and provide your keys.

