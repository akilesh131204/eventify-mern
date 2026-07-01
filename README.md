# Eventify — Online Event Management Platform

A full-stack MERN application for creating, discovering, and managing events with ticket sales, attendee registration, schedules, and organizer analytics.

## Tech Stack

- **Frontend:** React 19 (Vite), React Router, Tailwind CSS v4, Framer Motion, Recharts, Axios
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Auth, bcryptjs
- **Payments:** Razorpay (test mode)
- **Deployment:** Frontend → Netlify, Backend → Render, Database → MongoDB Atlas

## Roles

- **Attendee** — browse events, buy tickets, manage/cancel/transfer registrations
- **Organizer** — create & manage events, set ticket types, view attendees, export CSV, view analytics
- **Admin** — approve/reject events, manage users (block/unblock), view all payment transactions

## Project Structure

```
event-platform/
├── client/        # React frontend (Vite)
└── server/        # Express backend API
```

## 1. Local Setup

### Backend

```bash
cd server
npm install
cp .env.example .env   # then fill in your real values
npm run seed            # creates default admin: admin@eventify.com / Admin@123
npm run dev              # starts on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev              # starts on http://localhost:5173
```

## 2. Environment Variables

### server/.env
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for signing JWTs |
| `JWT_EXPIRE` | Token expiry, e.g. `7d` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | From Razorpay Dashboard (test mode) |
| `SMTP_HOST/PORT/USER/PASS/FROM` | For sending ticket confirmation emails (Gmail App Password works) |
| `CLIENT_URL` | Your deployed frontend URL (for CORS) |

### client/.env
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of your backend API, e.g. `https://your-api.onrender.com/api` |

## 3. MongoDB Atlas Setup

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new Cluster (free M0 tier is enough)
3. Database Access → Add a new database user with password
4. Network Access → Add IP `0.0.0.0/0` (allow from anywhere, for Render)
5. Connect → Drivers → copy the connection string into `MONGO_URI`

## 4. Razorpay Test Mode Setup

1. Sign up at https://dashboard.razorpay.com
2. Switch to **Test Mode** (toggle top-left)
3. Settings → API Keys → Generate Test Key
4. Copy `Key Id` and `Key Secret` into `server/.env`
5. Use Razorpay's test card `4111 1111 1111 1111`, any future expiry, any CVV to simulate payments

## 5. Deployment

### Backend on Render
1. Push your code to GitHub
2. New → Web Service → connect your repo, set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env` in the Render dashboard
6. Deploy — note your live URL, e.g. `https://eventify-api.onrender.com`

### Frontend on Netlify
1. New site from Git → connect repo, set base directory to `client`
2. Build command: `npm run build`
3. Publish directory: `client/dist`
4. Add environment variable `VITE_API_URL` pointing to your Render backend `/api`
5. Deploy — note your live URL, e.g. `https://eventify.netlify.app`
6. Go back to Render and set `CLIENT_URL` to this Netlify URL, then redeploy backend

## 6. API Overview

Base URL: `/api`

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/me` |
| Events | `GET /events`, `GET /events/:id`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id`, `GET /events/organizer/mine`, `PUT /events/:id/schedule` |
| Payments | `POST /payments/create-order`, `POST /payments/verify` |
| Registrations | `GET /registrations/mine`, `GET /registrations/:id`, `PUT /registrations/:id/cancel`, `PUT /registrations/:id/transfer`, `GET /registrations/event/:eventId`, `GET /registrations/event/:eventId/export`, `PUT /registrations/checkin/:ticketCode` |
| Analytics | `GET /analytics/organizer/overview`, `GET /analytics/event/:eventId` |
| Admin | `GET /admin/stats`, `GET /admin/users`, `PUT /admin/users/:id/block`, `GET /admin/events`, `PUT /admin/events/:id/approve`, `PUT /admin/events/:id/reject`, `GET /admin/payments` |

## 7. Default Test Accounts

After running `npm run seed` in `server/`:
- **Admin:** admin@eventify.com / Admin@123

Register normally through the UI to create attendee/organizer test accounts.

## 8. Submitting Your Work

1. Push `client/` and `server/` to a single GitHub repository (with the `.gitignore` files included, so `node_modules` is excluded)
2. Deploy backend to Render and frontend to Netlify as above
3. Submit both live URLs (Netlify frontend + Render backend) and the GitHub repo link in your course portal
