# IT CONSULTING SARL — Premium website

Static, multi-page corporate website (HTML + CSS + vanilla JavaScript). **No build step and no runtime dependencies** — it works on any static host. French only (see "Not implemented").

## 1. Contents

```
index.html                              Accueil
a-propos.html                           À propos (history, legal identity, mission, vision)
services.html                           Vue d'ensemble des services
securite-electronique.html              CCTV, alarmes, détecteurs
reseaux-telecommunications.html         LAN/MAN/PAN/WAN, wireless, serveurs
logiciels-conseil-informatique.html     Audit, logiciels, bases de données
continuite-activite-connectivite.html   Business Continuity Plan, VSAT
genie-civil-pylones.html                Construction de pylônes
formation-imprimerie.html               Formation multimédia, imprimerie
implantations.html                      Goma, Kampala, Juba, Rwanda (+ animated globe)
contact.html                            Contact form + coordonnées
demande-de-devis.html                   Quote request form
404.html                                Custom error page
sitemap.xml, robots.txt                 SEO
assets/css/style.css                    Design system (tokens, components, motion)
assets/js/main.js                       Navigation, reveals, 3D tilt, parallax, page transitions, forms
assets/js/globe.js                      Canvas network globe (no library)
assets/js/config.js                     ← the only file you must edit to activate form delivery
assets/img/                             Optimised photos (WebP), the supplied logo, favicons, social image
assets/fonts/                           Packaged fonts + their OFL licence texts
backend/contact.php                     Form receiver for PHP hosting
backend/netlify-functions/contact.js    Form receiver for Netlify (+ contact.test.js)
.env.example  .gitignore  .htaccess  netlify.toml  package.json
SOURCES.md                              Research sources and what they were used for
```

## 2. Run locally

Any static server works (opening the files directly also works, except the form fetch):

```bash
python3 -m http.server 8080      # then open http://localhost:8080
# or:  npm start                 # uses npx serve (downloads "serve" on first run)
```

There is nothing to build. `package.json` exists for convenience scripts only (no dependencies, so no lockfile).

## 3. Forms — read this before going live

The two forms (contact, quote) validate in the browser (French messages, `aria-invalid`, focus on first error, loading state, honeypot anti-spam).
**A static site cannot send e-mail by itself.** Behaviour depends on `assets/js/config.js`:

| `formEndpoint` | Behaviour |
|---|---|
| `""` (default) | After validation the page says plainly that the message **has not been sent** and offers *Ouvrir ma messagerie* (pre-filled `mailto:`) and *Copier le message*. Nothing is falsely reported as delivered. |
| a URL | The form POSTs JSON to it. Success is shown only when the server answers 2xx with `ok:true`; any error shows a failure message and keeps the user's text. |

**Option A — PHP hosting (cPanel, most shared hosts):** upload the site, set `formEndpoint: "backend/contact.php"`. Set `ITC_MAIL_TO` / `ITC_MAIL_FROM` as environment variables (or edit the two defaults at the bottom of the file on a private host). The sender address must be on a domain configured on the host. Uses PHP `mail()` — no credentials are stored in code.
**Option B — Netlify:** connect the folder, set environment variables `RESEND_API_KEY`, `ITC_MAIL_TO`, `ITC_MAIL_FROM` (a sender verified in Resend), set `formEndpoint: "/.netlify/functions/contact"`. `netlify.toml` already points to `backend/netlify-functions`.
**Option C — a hosted form service** (Formspree, Getform, …): paste its endpoint URL into `formEndpoint` (it accepts JSON). No code change.

Never put API keys in `config.js` or any front-end file; it is public.

## 4. Deployment

- **Apache/cPanel:** upload everything to `public_html/`. `.htaccess` provides the 404 page, gzip and caching.
- **Netlify / Cloudflare Pages / Vercel (static):** publish the folder root; no build command. 404.html is picked up automatically on Netlify/Cloudflare.
- **Nginx:** add `error_page 404 /404.html;` and long-cache headers for `/assets/`.
- **Sub-folder deployment:** all links are relative, so it works in a sub-folder, **except `404.html`**, which uses `<base href="/">`; edit it if you deploy in a sub-folder.
- **Domain:** canonical URLs, Open Graph, sitemap and JSON-LD use `https://www.itconsultinggroup.net/` (the website named in the company profile). Replace it if the production domain differs (search-and-replace across `*.html`, `sitemap.xml`, `robots.txt`).

## 5. Editing content

Pages are plain HTML. The header and footer are repeated in each file (static-site trade-off): to change a menu entry or phone number, search-and-replace across `*.html`. Colours, fonts and spacing are CSS variables at the top of `assets/css/style.css`.
Content blocks carry one of two tags: **« Selon le profil de l'entreprise »** (facts from the company PDF) and **« Repères généraux, hors profil »** (educational context from industry knowledge). Keep this distinction when you add content — never present a general statement as a company capability.

## 6. Design and technical choices

- **Identity:** deep slate/navy, ivory/paper, warm sand rules, and the logo's own greens (bright leaf `#74c61c`, deep `#2c6a0a`, sampled from the supplied logo). Headings in *GFS Baskerville*, text in *Carlito*, both SIL OFL, subset to Latin and packaged locally (internal font names changed to "ITC Display"/"ITC Text" to respect the OFL Reserved Font Name clause; licence texts included). Baskerville only has old-style figures, so numerals-heavy elements use the sans-serif.
- **Logo:** `assets/img/logo-it-consulting.png` is a **byte-identical copy** of the file supplied (transparent PNG, black lettering). It is only ever placed on light surfaces (header, white plate in the footer). The favicons are the same artwork scaled proportionally on white, with no recolouring or distortion.
- **3D & motion:** perspective stages with layered Z-planes tilting with the pointer (hero), a canvas orthographic dot-globe with great-circle links between Goma, Kampala, Juba and Rwanda (drag to rotate; pauses off-screen and in hidden tabs; fewer dots on low-power devices; static frame under reduced motion), layered photo stacks with scroll parallax, mask image reveals, staggered text reveals, hover zoom, animated nav indicator and dropdown, smooth FAQ accordions, page entrance/exit fades. `prefers-reduced-motion` disables all of it; the site is fully usable without JavaScript animation (content is revealed immediately if IntersectionObserver is unavailable).
- **Globe geography:** land is drawn from coarse hand-traced polygons (Africa most carefully). It is stylised, not cartographic.
- **Accessibility:** semantic landmarks, skip link, one `h1` per page, keyboard-operable menu/dropdown/accordions (Esc closes), visible focus rings, labelled form fields with `aria-describedby` errors and a live status region, alt text on all photos.

## 7. Company facts — how the PDF was used

Copied from the profile: name, legal form (SARL), creation date **25 January 2018**, RCCM **CD/GOM/RCCM/18-B-0676**, siège social in Goma, representations in Uganda / South Sudan / Rwanda, all phone numbers and e-mails, vision, mission, service list, the "sur-mesure / pragmatiques" and "nous vous écoutons" statements, the 24h/24 real-time CCTV statement (attributed to the profile).
**Experience since 2016** (the PDF says "depuis notre création en 2016") and **legal creation 25 January 2018** are shown separately and never merged.
Nothing invented: no clients, projects, testimonials, certifications, awards, partnerships, statistics, Rwanda address, team or sites. Photo captions are generic; the GPS overlays (which carried site names/IDs) were cropped out.

### Please verify (differences or ambiguities in the PDF)
1. **Headquarters address** appears twice with different spellings: slide 2 "Numéro 022, Avenue Les Messagers, Quartier Le Volcan, Commune de Goma…" and the contact slide "N°22, Avenue Messager, Quartier Les Volcans". The site uses the slide-2 (siège social) wording.
2. Typos corrected on display: "Roard" → Road (Kampala), "Nonr-Kivu", "Busness Continue Plan" → Business Continuity Plan, "proffessiolle", "Oïl" → "Pity Oil" (Juba). Confirm the exact Juba landmark spelling.
3. The 2016 vs 2018 dates (above) — confirm the wording you prefer.
4. "Mission" in the PDF ends with "mauvais fonctionnement des équipes" (probably *équipements*); the site words it neutrally ("dysfonctionnements").
5. "PTNTIC" is expanded as *Postes, Télécommunications et Nouvelles Technologies de l'Information et de la Communication* (the DRC ministry designation); the PDF only gives the acronym.
6. Rwanda: no address or phone in the PDF — the site says so and does not invent one.
7. The 24h/24 CCTV claim comes from the PDF and is attributed to it. Remove it if you cannot stand behind it as a service level.

## 8. Images

All photographs come from your PDF (not stock), extracted from the embedded originals, cropped where needed and converted to WebP:

| File | PDF page | Notes |
|---|---|---|
| cctv-installer, cctv-poles | 4 | as extracted |
| tower-foundation, tower-site | 5 | bottom ~20 % cropped (GPS overlay with site ID); tower-site also cropped to remove an equipment-cabinet logo |
| vsat-roof | 7 | bottom cropped (overlay naming a third party) |
| vsat-dish, mast-antenna, power-backup-cabinet | 7 | as extracted |
| rooftop-mast, server-rack | 8 | as extracted |
| cabinet-maintenance | 8 | bottom cropped (overlay naming a third party) |

**Deliberately not used:** the PDF photo with a Médecins Sans Frontières vehicle (visible third-party branding) and the group photo at the tower gate (third-party site sign and another company's name on a vest). Use them only with written permission.
Camera brand marks on some equipment are visible in two photos; this implies no partnership. **Please confirm you own or have the right to publish every photograph.**
Illustrations (software, training, printing, diagrams) are original SVG created for this site and are described as illustrations. No AI-generated or stock image is used.
Image resolution is limited by the PDF originals (max 1080 px wide); the hero uses small framed photos on purpose.

## 9. Testing status (honest summary)

**Done, in headless Chromium (Playwright) against a local server:**
- all 13 pages at 1440 px and 390 px: HTTP 200, no console/page errors, no failed requests, no broken images, no horizontal overflow, exactly one `h1`;
- desktop dropdown (open/close/outside click/Esc), mobile menu (opens full-height, submenu, Esc, navigation), FAQ accordions;
- forms: empty submit, invalid e-mail, too-short message, `?service=` prefill, honest no-endpoint fallback (mailto content verified), copy button, honeypot, **mocked endpoint**: loading state, POST JSON payload, success + reset, server-error state with data preserved;
- reduced-motion emulation; globe drawing and drag; every internal link and asset resolves;
- `node backend/netlify-functions/contact.test.js` (validation, honeypot, header-injection, success/failure with mocked fetch).

**Not done / not possible here:** sending a real e-mail (needs your credentials/host); running `backend/contact.php` (PHP is not installed in the build environment — the code is straightforward but **untested**); Firefox/Safari/real mobile devices; Lighthouse/axe audits; screen-reader testing. Please test the form once on your real host.

## 10. Not implemented
- **English version / language switcher.** Translating all pages was not done, and a decorative switcher was refused. The site is `lang="fr"`. A real EN version would be a copy of each page with an `hreflang` link.
- No CMS, database, login or admin area (none was needed).
