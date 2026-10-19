# Homelab talk — slides & resources

One static page that works two ways:

- **Read mode** (default) — a scrolling page attendees open on their phones/laptops.
- **Present mode** — full-screen 16:9 slides for the projector. Open `…/?present`, or press **P** / click **▶ Present**.

No build step, no dependencies, nothing loaded from third-party servers (strict CSP in `index.html`), so it works offline on conference wifi.

## Presenter keys

| Key | Action |
|---|---|
| → / Space / PgDn / click | Next slide (clickers send PgUp/PgDn) |
| ← / PgUp / click left third | Previous slide |
| Home / End | First / last slide |
| F | Fullscreen |
| T | Toggle light/dark (light usually reads better on projectors) |
| N | Show/hide speaker notes (visible to the audience if your screen is mirrored) |
| P / Esc | Switch between present and read mode |

The current slide is kept in the URL (`#5`), so a refresh won't send you back to the start.

**Speaker notes are public.** They're hidden on screen but sit in the page source, so anyone can read them.
Keep anything you wouldn't put on a slide out of them: IPs, domains, SSIDs, family names, passwords.

## Fill in your content

Every personal item is marked `TODO:` and shows up highlighted on the page:

```sh
grep -n 'TODO' index.html
```

## Preview locally

```sh
cd ~/homelab-talk && python3 -m http.server 8000
# http://localhost:8000          (read mode)
# http://localhost:8000/?present (present mode)
```

## Publish on GitHub Pages

```sh
cd ~/homelab-talk
git init -b main
git add .
git commit -m "Homelab talk slides"
gh repo create homelab-talk --public --source=. --push   # or create it on github.com and `git push`
```

Then on GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
The site appears at `https://<your-username>.github.io/homelab-talk/` after a minute or two.

## Adding photos

Three slides have photo slots: **Then → now**, **Meet the hardware**, and **The scene of the crime**.
Each slot shows a dashed placeholder with the filename it expects until you save that file:

| File | Slide |
|---|---|
| `photos/then.jpg`, `photos/now.jpg` | Then → now |
| `photos/node1.jpg`, `photos/node2.jpg`, `photos/network.jpg` | Meet the hardware |
| `photos/disaster.jpg` | The scene of the crime (16:9 works best) |

Landscape shots work best; the grid crops them to 4:3. To add another photo, copy one of the existing `<figure class="photo">` blocks.
Update the `alt` text and caption too (both marked TODO).

**Before you publish photos to a public site, scrub them.** This is a security talk; someone in the audience will check.

```sh
cd ~/homelab-talk/photos
mogrify -auto-orient -resize '1600x1600>' -quality 82 *.jpg   # fix rotation, shrink phone photos (~200–400 KB each)
exiftool -all= -overwrite_original *.jpg                       # strip EXIF, including GPS (your home address)
exiftool -gps:all *.jpg                                         # should print nothing
```

Keep that order: rotation is stored in EXIF, so fix it before stripping or photos can end up sideways.

Also look at each photo for things you wouldn't post publicly: Wi-Fi passwords on router stickers,
serial numbers, sticky notes with credentials, monitors showing IPs or hostnames, mail with your address,
or a window that shows the outside of your house.

## QR code for the last slide

Once you know the final URL:

```sh
qrencode -o qr.png -s 12 -m 2 'https://<your-username>.github.io/homelab-talk/'
```

Commit `qr.png`. Until it exists, the last slide shows a placeholder.
