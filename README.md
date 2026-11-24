# Gabriel's Rugs

A rug listing site with one page per rug and an editing page at `/admin`.
It runs on the same setup as sunken.fyi: one Cloudflare Worker, a D1
database for the rug list and an R2 bucket for photos. The free tier covers it,
and it needs no domain: it lives at `gabriels-rugs.<subdomain>.workers.dev`.

## For Gabriel: editing the site

Open **/admin** on your phone and sign in. It stays signed in on that phone.

- **Your password:** the first time, sign in with the password you were given,
  then go to **Contact & shop info → Change password** and pick your own (at
  least 10 characters). Changing it signs out every other phone or computer.

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
| `/admin` | Editing page. |

## Passwords

- **Gabriel's password** is set and changed at `/admin`. It's stored hashed
  (PBKDF2) in D1, never in plain text.
- **`ADMIN_KEY`** (a Cloudflare secret) is the **recovery password**. It always
  signs in, so if Gabriel forgets his password, sign in with it and set a new one.
  Keep it to yourself.
- Signing in gives that device a session token (kept 180 days); the password
  itself isn't stored on the phone. Signing out ends that session.
- 8 wrong passwords from one connection within 15 minutes locks that
  connection out for 15 minutes.

Sizes sort themselves: long and narrow (at most 3'6" wide, 2.5× as long) is a
runner; otherwise by floor area: under 40 sq ft is small, under 76 is medium,
76 and up (8' × 9'6") is large.

## Deploy (once)

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** →
   pick this repo → Deploy. The D1 database and R2 bucket are created on the
   first deploy.
3. In the Worker → **Settings → Variables and Secrets**, add a secret
   **`ADMIN_KEY`**: the recovery password. Make it long. Give it to Gabriel
   for his first sign-in, and he then sets his own.
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

Reused from sunken.fyi: the admin page pattern, `jpeg.js`
(JPEG size and location stripping) and the admin page's HEIC-to-JPEG
conversion.
