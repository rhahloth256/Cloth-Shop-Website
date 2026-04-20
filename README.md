# HaRié - Cloth Shop Website

A static e-commerce website for HaRié clothing brand, hosted on Cloudflare Pages with a GitHub-backed CMS for product management.

## Website

- **Live Site**: https://hariecollection.com
- **Admin Panel**: /admin.html
- **Product Data**: [data/products.json](data/products.json)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, Bootstrap 5.3, Vanilla JS |
| Hosting | Cloudflare Pages |
| Backend | Cloudflare Workers (Functions) |
| Data Storage | GitHub (via GitHub API) |
| Auth | Cookie-based (adminAuth) |

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Panel│────▶│ Cloudflare       │────▶│ GitHub API      │
│  (admin.html)│     │ Functions        │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │                        │
                           │                        ▼
                           │                 ┌───────────────┐
                           └────────────────▶│ Cloudflare    │
                                           │ Pages Deploy │
                                           └───────────────┘
```

## How Product Updates Work

1. **Admin edits products** in `admin.html` (add/edit/delete)
2. **Image uploads** go to `/upload-image` → Cloudflare Function → GitHub
3. **Save button** POSTs to `/save-products` → Cloudflare Function → GitHub
4. **GitHub commit** triggers Cloudflare Pages auto-deploy
5. **Website updates** by reading the new `data/products.json`

## Project Structure

```
├── index.html              # Home page
├── shop.html              # Product listing page
├── admin.html             # Admin dashboard
├── data/
│   └── products.json     # Product data (committed to GitHub)
├── assets/
│   ├── css/styles.css    # Custom styles
│   ├── js/
│   │   ├── admin-panel.js # Admin panel logic
│   │   ├── main.js        # Home page logic
│   │   └── products.js    # Product display logic
│   └── img/               # Static images
├── functions/
│   ├── _middleware.js     # Auth middleware
│   ├── login.js           # Login handler
│   ├── logout.js          # Logout handler
│   ├── save-products.js   # Save products to GitHub
│   └── upload-image.js    # Upload images to GitHub
└── README.md
```

## Cloudflare Functions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | Authenticate admin user |
| `/logout` | POST | Clear auth cookie |
| `/upload-image` | POST | Upload product image to GitHub |
| `/save-products` | POST | Save products array to GitHub |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token with repo scope |

## Product JSON Schema

```json
{
  "id": "string",
  "name": "string",
  "category": "men" | "women" | "bags" | "shoes",
  "price": number,
  "description": "string",
  "image": "string (URL)",
  "featured": boolean,
  "in_stock": boolean,
  "discount": number | null,
  "badge": "string" | null,
  "size": "string" | null
}
```

## Development

No build step required. The site is pure static HTML/JS.

To test locally:
1. Clone the repository
2. Serve with any static server (e.g., `npx serve`)

## Deployment

The site auto-deploys from GitHub via Cloudflare Pages on every commit to `main`.

To deploy manually:
1. Push changes to `main` branch
2. Cloudflare Pages detects the change and deploys

## Admin Usage

1. Navigate to `/admin.html`
2. Login with admin credentials
3. Add, edit, or delete products
4. Click **Save** to push changes to GitHub
5. Site automatically redeploys with new content
