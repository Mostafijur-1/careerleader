# Career Leader

Career Leader is a full-stack web application that helps students explore career paths using a personality assessment, receive personalized recommendations, and connect with mentors for guidance.

It supports:
- Multi-role users (`student`, `mentor`, `admin`)
- Mentor request and chat workflow
- English/Bangla language switching
- JWT-based login persistence (no re-login on refresh until token expiry)

---

## 1) Project Purpose

Career Leader solves a common student problem: uncertainty after school/college about job, higher study, and entrepreneurship paths.

The platform provides:
- A structured personality + interest assessment
- Career recommendations based on assessment signals
- Mentor discovery and one-to-one mentorship communication
- Admin controls for mentor activation/deactivation

---

## 2) Tech Stack and Tools

### Core stack
- `Next.js 16` (App Router)
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`

### Backend and data
- Next.js API routes (`app/api/*`)
- `MongoDB` via `mongodb` driver
- Static JSON datasets in `data/*`

### Security and auth
- Password hashing: `bcryptjs`
- Session persistence: `jsonwebtoken` in secure HTTP-only cookie

### Quality and deployment
- `ESLint` (Next.js + TypeScript rules)
- Deployment config for `Vercel`

---

## 3) High-Level Architecture

This is a monorepo-style single Next.js app where frontend and backend live together.

- `app/` - UI pages, API routes, providers, reusable components
- `lib/` - Business logic and helper utilities (assessment, recommendations, DB, auth, i18n)
- `data/` - Question bank, careers, mentor showcase/resource data

Flow:
1. User interacts with React UI (`app/*`)
2. UI calls internal API routes (`app/api/*`)
3. API routes execute domain logic from `lib/*`
4. Data is read/written from MongoDB + static JSON sources
5. Response is rendered in UI

---

## 4) Folder Guide

### `app/`
- `app/page.tsx` - Home page, mentor cards, notifications, chat modal entry
- `app/assessment/page.tsx` - Assessment UI and result rendering
- `app/admin/page.tsx` - Admin controls for mentor activation/deactivation
- `app/mentor/page.tsx` - Mentor inbox/conversation page
- `app/auth/page.tsx` - Standalone auth page
- `app/components/*` - Auth modal/button/dialog, language toggle, providers, boundaries
- `app/contexts/*` - User and language global state
- `app/api/auth/route.ts` - Register/login/logout/session lookup + mentor admin actions
- `app/api/assessment/route.ts` - Questions and scoring endpoint
- `app/api/recommend/route.ts` - Recommendation endpoint
- `app/api/mentorship/route.ts` - Mentor listing, request lifecycle, messaging, notifications

### `lib/`
- `lib/db.ts` - MongoDB connection and collection access
- `lib/auth.ts` - JWT signing/verification + auth cookie constants
- `lib/assessment.ts` - MBTI-like scoring and interest extraction
- `lib/recommendation.ts` - Career matching logic
- `lib/siteI18n.ts` - English/Bangla translation dictionary and access helpers

### `data/`
- `assessment_questions*.json` - assessment questions
- `careers.json` - career catalog
- `mentor_showcase.json` - sample/display mentor profiles
- `resources.json` - learning resources metadata

---

## 5) Main Features

### A) Authentication and roles
- Register/login for student and mentor
- Admin login for platform management
- Passwords are hashed with bcrypt before DB storage
- Mentor accounts require admin activation

### B) JWT login persistence
- On login, backend generates JWT and sets HTTP-only auth cookie
- On app load/refresh, frontend calls `GET /api/auth?me=true`
- If cookie token is valid, user context is restored automatically
- Default token/cookie validity: **7 days**

### C) Career assessment
- User answers Likert-scale questions
- System calculates MBTI-style dimensions
- Interest vectors are derived from answers
- Recommendations are generated from personality + interests

### D) Mentor connection and chat
- Students can browse mentors by track/category
- Send mentorship request (pending -> accepted/rejected)
- Chat unlocks when mentor accepts
- Student gets message notifications

### E) Admin workflow
- Admin can view mentors
- Admin can activate/deactivate mentor account status

### F) Bilingual UI (English/Bangla)
- Site-wide translation object in `lib/siteI18n.ts`
- Language state via `LanguageContext`
- Choice stored in `localStorage` and restored on next visit

---

## 6) Authentication Details (JWT)

### Current behavior
- JWT is issued at login and stored in HTTP-only cookie
- Frontend does not need to manually store token in localStorage
- Session remains across refresh/reopen while cookie is valid

### Expiry
- Token expiry: `7d`
- Cookie max age: `7 days`

### Important env variable
- `JWT_SECRET` must be set in production to a long random secret

---

## 7) Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
MONGODB_URI=your_connection_string
MONGODB_DB=career_leader
JWT_SECRET=replace_with_a_long_random_secret
```

- `MONGODB_URI` - required
- `MONGODB_DB` - optional (defaults to `career_leader`)
- `JWT_SECRET` - required for secure JWT signing in production

---

## 8) Run Locally

### clone 
```bash
git clone "https://github.com/Mostafijur-1/careerleader.git"
```

### Install
```bash
npm install
```

### Start dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Other scripts
```bash
npm run build   # production build
npm run start   # run production build
npm run lint    # lint codebase
```

---

## 9) API Summary

### `POST /api/auth`
Actions:
- `register`
- `login`
- `logout`
- `activate-mentor`
- `deactivate-mentor`

### `GET /api/auth`
Queries:
- `?mentors=true` -> list mentors (admin use-case)
- `?me=true` -> return current logged-in user from JWT cookie

### `GET /api/assessment`
- Returns localized assessment questions

### `POST /api/assessment`
- Accepts answers, computes personality/interests, returns recommendation-ready result

### `POST /api/recommend`
- Returns recommendations based on provided profile inputs

### `GET/POST /api/mentorship`
- Mentor list by category
- Send/request status operations
- Conversation/messages
- Student notifications

---

## 10) Presentation Talking Points

Use this as your quick presentation flow:

1. **Problem**: Students struggle to pick a career path confidently.
2. **Solution**: Career Leader combines assessment + mentor support in one platform.
3. **Differentiator**: Personalized recommendations and guided mentorship workflow.
4. **Tech strength**: Full-stack Next.js, modular domain logic, bilingual UX.
5. **Security**: Password hashing + JWT cookie session persistence.
6. **Scalability path**: Add stricter RBAC middleware, tests, analytics, and richer recommendation models.

---

## 11) Current Limitations and Roadmap

### Known gaps
- Automated tests are not yet implemented
- Authorization checks can be strengthened further at API boundary
- Some datasets are static JSON and may need CMS/admin editing flow later

### Next improvements
- Add route-level auth guards and role-based middleware
- Add unit/integration tests for auth, assessment, mentorship APIs
- Add audit logging for admin actions
- Add recommendation explainability in UI

---

## 12) Deployment (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables from `.env.example`
4. Deploy

`vercel.json` is included for project-level deployment config.

---

## 13) Security Notes

- Never commit `.env.local` or real credentials
- Always use strong `JWT_SECRET` in non-local environments
- Keep MongoDB user permissions minimal (least privilege)

---

## 14) License / Ownership

Project developed as `Career Leader` application.  
Update this section with your organization/license policy if needed.
