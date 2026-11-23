# Gabriel's Rugs

A rug listing site with one page per rug and an editing page at `/admin`.
It runs on the same setup as sunken.fyi: one Cloudflare Worker, a D1
database for the rug list and an R2 bucket for photos. The free tier covers it,
and it needs no domain: it lives at `gabriels-rugs.<subdomain>.workers.dev`.

## For Gabriel: editing the site

Open **/admin** on your phone and enter the password. It stays remembered on that phone.

- **Add a rug:** tap **+ Add a rug**, add photos (first one is the cover),
  type the width and length in feet and inches, and the price. Leave the price
  blank to show "Ask". Tap **Save** and it's on the site right away.
- **Sold or on hold:** tap **Available / On hold / Sold** under any rug. A sold rug
  stays on the site, faded and marked Sold. Set it to **Hidden** in Edit to
  take it off the site entirely.
- **Edit or delete:** tap **Edit** on the rug.
- **Contact & shop info:** your phone number, Instagram, pickup area, how
  people pay and the line over the top photo.

The "Text me" buttons open a text to your number with the rug number filled
in ("Hi! Is rug No. 04 still available?").

Photos from an iPhone (HEIC) are converted on the phone and resized, so
uploads are quick. Location data is stripped before anything is saved.

## Pages

| Path | What |
| --- | --- |
| `/` | All rugs, newest first, sold ones last. `?size=runner\|small\|medium\|large` filters. |
| `/rug/<number>` | One rug: photos, size, pile, material, condition, description. Share previews show the cover photo. |
| `/admin` | Editing page (password: the `ADMIN_KEY` secret). |

Sizes sort themselves: long and narrow (at most 3'6" wide, 2.5× as long) is a
runner; otherwise by floor area: under 40 sq ft is small, under 76 is medium,
76 and up (8' × 9'6") is large.

## Deploy (once)

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** →
   pick this repo → Deploy. The D1 database and R2 bucket are created on the
   first deploy.
3. In the Worker → **Settings → Variables and Secrets**, add a secret
   **`ADMIN_KEY`**: Gabriel's password. Make it long, because it's the only lock.
4. Open `https://gabriels-rugs.<subdomain>.workers.dev/admin`, sign in, and fill
   in **Contact & shop info** first.

After that, every commit to `main` deploys by itself.

## Develop

```sh
npm install
echo 'ADMIN_KEY=test-password-123' > .dev.vars
npm run dev      # http://localhost:8787
npm test
```

Reused from sunken.fyi: the password check (`authorized`), `jpeg.js`
(JPEG size and location stripping) and the admin page's HEIC-to-JPEG
conversion.
