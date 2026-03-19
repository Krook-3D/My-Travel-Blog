#  My Travel Journal Template

A beautiful, fully client-side travel journal built with vanilla HTML, CSS and JavaScript. Add destinations, write stories, upload photos, and browse your memories — no backend, no login, no dependencies.

---

##  Features

- **Destination cards** — front page grid with cover photo, city, country, date and description preview
- **Destination pages** — full-page view with hero photo, story and photo gallery
- **Photo gallery** — add multiple photos per destination with a lightbox viewer
- **Persistent header photo** — set a custom banner image for the home page
- **Image compression** — photos are automatically compressed before saving (keeps localStorage well under the 5 MB limit)
- **Edit & delete** — update any destination or remove it entirely
- **Custom dialogs** — no browser `alert()` or `confirm()`, everything uses built-in styled dialogs
- **Fully offline** — works by opening `index.html` directly in a browser, no server needed
- **Responsive** — works on desktop and mobile

---

##  Project Structure

```
travel-journal/
├── index.html   # Markup and page structure
├── style.css    # All styles, animations and responsive rules
└── app.js       # All logic — data, routing, gallery, lightbox, compression
```

---

##  Getting Started

### Run locally

Just open `index.html` in any modern browser:

```bash
# Clone the repo
git clone https://github.com/Krook-3D/My-Travel-Blog.git

# Open in browser
open My-Travel-Blog/index.html
```


---

##  How Data Is Stored

All data is saved in your browser's **`localStorage`**:

| Key | Contents |
|---|---|
| `travel_destinations` | JSON array of all destinations (city, country, date, description, cover photo, gallery) |
| `travel_header_photo` | Base64 string of the home page banner photo |

### Important limitations

- Data is **device and browser specific** — clearing browser data will erase everything
- There is no sync across devices
- localStorage has a **~5 MB limit** — image compression keeps photos small (~150–200 KB each), but very large galleries may eventually hit this ceiling

>  If you want data to follow you across devices, the next step is connecting to a cloud database like [Firebase](https://firebase.google.com/) or [Supabase](https://supabase.com/) — both have free tiers.

---

## Image Compression

Photos are compressed automatically using the Canvas API before being stored:

- Max dimension: **1200px** (gallery photos), **1800px** (header banner)
- Output quality: **75%** JPEG
- A typical 4 MB phone photo is reduced to ~150–200 KB

---

## Usage Guide

### Add a destination
Click the **+** button in the bottom-right corner, fill in the city, country, date, description and optionally a cover photo.

### View a destination
Click any card on the home page to open its full page.

### Add gallery photos
On a destination page, click **+ Add Photos** in the gallery section. You can select multiple photos at once.

### Set a header photo
On the home page, click ** Set Header Photo** in the bottom-right of the banner.

### Edit or delete
Open a destination page and use the **Edit** or **Delete** buttons at the bottom.

---

## Built With

- HTML5
- CSS3 (custom properties, grid, animations)
- Vanilla JavaScript (ES6+, Canvas API, FileReader API, localStorage)
- [Google Fonts](https://fonts.google.com/) — Playfair Display, Libre Baskerville, Josefin Sans

---

## License

MIT — free to use, modify and share.
