# Damien Boyle Interiors — PRD

## Original Problem Statement
Premium interior design portfolio + business website with AI assistant "Kylie", admin backend for gallery/booking management. Fully responsive. React + FastAPI + MongoDB.

## User Choices (confirmed)
- Kylie AI model: **Gemini 3 Flash** (gemini-3-flash-preview via Emergent LLM key)
- Email notifications: **Skipped for v1** (bookings stored + shown in admin dashboard)
- Admin auth: **Simple JWT email+password** (Bearer token)
- Calendar sync: **No** (email/admin only)
- Launch sections: **About Damien only** (no testimonials), and per later instruction **no Damien portrait**
- Design: Uploaded `design.md` adopted — Playfair Display + Inter, warm brass/parchment/ink palette. Uploaded **Whole** font used for the logo. Cinematic cross-fading hero (room to room).

## Architecture
- Backend `/app/backend/server.py`: FastAPI, all routes /api-prefixed. JWT auth (bcrypt), object storage for uploads, Gemini chat for Kylie, seed of admin + 6 default projects.
- Frontend `/app/frontend/src`: React Router pages (Home, Portfolio, ProjectDetail, Services, About, Contact, AdminLogin, AdminDashboard), AuthContext (localStorage token), KylieChat floating widget.
- MongoDB collections: users, projects, files, bookings, chat_messages.

## Personas
- Potential client: browse portfolio, services, book consultation, chat with Kylie.
- Owner/admin: manage projects & gallery images, review/triage bookings & leads.

## Implemented (2026-07-06)
- Cinematic hero with cross-fading luxury rooms + ken-burns motion.
- Home (brand story, featured projects, services strip, CTAs), Portfolio (category filters), Project detail (gallery), Services (offerings/process/pricing), About (no portrait), Contact (booking form).
- Kylie floating chat widget with lead-capture form -> bookings pipeline (source kylie_chat).
- Admin: JWT login, bookings dashboard (status + delete), project/gallery CRUD with image upload to object storage, cover selection.
- Verified: 20/20 backend tests, all critical frontend flows pass.

## Known Limitations
- **Kylie replies require Emergent Universal Key balance** — currently exhausted (Budget 0.0), so /api/chat returns a graceful 500. Top up to enable live replies.
- Email notifications not implemented (per v1 choice).

## Backlog
- P1: Enable Kylie once key topped up; add streaming responses.
- P1: Email booking alerts (Resend) if desired.
- P2: Project image drag-reorder in admin; testimonials section; Google Calendar sync.
- P2: Migrate FastAPI startup/shutdown to lifespan; tighten CORS to explicit origins.

## Next Tasks
- Confirm Kylie works after key top-up; optionally add email notifications.
