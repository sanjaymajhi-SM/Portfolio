# Nabin — Full Stack Developer Portfolio

A professional portfolio website with Node.js/Express backend and an AI-powered chatbot assistant.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | HTML5, CSS3, Vanilla JavaScript   |
| Backend      | Node.js, Express                  |
| AI Chatbot   | Anthropic Claude API              |
| Email        | Nodemailer + Gmail SMTP           |
| Security     | Helmet, CORS, express-rate-limit  |
| Fonts        | Sora + JetBrains Mono (Google)    |

---

## Project Structure

```
portfolio/
├── server.js               # Express app entry point
├── package.json
├── .env.example            # Copy to .env and fill in values
├── .gitignore
│
├── routes/
│   ├── chat.js             # POST /api/chat — AI chatbot
│   ├── contact.js          # POST /api/contact — contact form
│   └── projects.js         # GET /api/projects — project data
│
└── public/
    ├── index.html          # Single-page portfolio
    ├── css/
    │   └── style.css       # All styles (dark minimalist)
    └── js/
        └── main.js         # Frontend JS (nav, form, chatbot)
```

---

## Quick Start

### 1. Install dependencies

```bash
cd portfolio
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
PORT=3000
NODE_ENV=development

# Required for AI chatbot
ANTHROPIC_API_KEY=your_key_here

# Optional: for email delivery from contact form
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=where_to_send@example.com
```

> **Getting an Anthropic API key:** Sign up at https://console.anthropic.com → API Keys → Create Key

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords → Generate

### 3. Run the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Open http://localhost:3000

---

## API Endpoints

| Method | Endpoint         | Description                   |
|--------|-----------------|-------------------------------|
| GET    | /api/health      | Server health check           |
| GET    | /api/projects    | List all projects             |
| GET    | /api/projects/:id| Get single project            |
| POST   | /api/chat        | Send message to AI chatbot    |
| POST   | /api/contact     | Submit contact form           |

### POST /api/chat

```json
{
  "messages": [
    { "role": "user", "content": "What are Nabin's skills?" }
  ]
}
```

Response:
```json
{
  "reply": "Nabin specializes in React, Node.js, Python..."
}
```

### POST /api/contact

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "message": "Hi, I'd love to work with you!"
}
```

---

## Customization

### Update your info

1. **Name, title, description** — edit `public/index.html`
2. **Projects** — edit the `PROJECTS` array in `routes/projects.js`
3. **AI personality** — edit `SYSTEM_PROMPT` in `routes/chat.js`
4. **Contact links** — update email/GitHub/LinkedIn in `public/index.html`
5. **Colors** — change `--accent` in `public/css/style.css` (currently `#e8ff6b`)

### Add a real database

To store projects in MongoDB/PostgreSQL, replace the static array in `routes/projects.js` with your DB queries.

---

## Deployment

### Vercel / Railway / Render

1. Push to GitHub
2. Connect your repo on the platform
3. Set environment variables in the platform dashboard
4. Deploy

### Self-hosted (VPS)

```bash
npm install --production
NODE_ENV=production node server.js
```

Use nginx as a reverse proxy and PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name portfolio
pm2 save
```

---

## Security Features

- **Helmet.js** — sets secure HTTP headers
- **CORS** — whitelisted origins only
- **Rate limiting** — 100 req/15min general, 20 req/15min for chat
- **Input validation** — express-validator on all POST routes
- **Body size limits** — 10kb max payload
- **XSS protection** — HTML escaping on all user output
- **No secrets in frontend** — API key stays server-side only

---

## License

MIT — free to use and customize.
