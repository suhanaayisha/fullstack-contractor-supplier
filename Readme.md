# Contractor · Supplier

A small full-stack marketplace where **contractors** request construction equipment and **suppliers** bid to provide it.

> **Note:** This started as a trial project to practise full-stack development with React, Node/Express and MongoDB. See [Known limitations and next steps](#known-limitations-and-next-steps) for what I'd improve next.

> **Live demo:** it's hosted on Render's free plan, which sleeps when nobody uses the app. The first visit after a while takes about a minute to load.

## What it does

**Contractors** can:
- Create a request by choosing equipment from a list, a quantity and the date they need it by
- See the bids placed on each of their requests
- Accept a bid, which rejects the other bids and closes the request, or reject bids one at a time
- Delete their requests

**Suppliers** can:
- Browse open requests from all contractors
- Place a bid with a price. The request then moves out of their open list.
- See their bids and whether each one is pending, accepted or rejected
- Delete bids that haven't been accepted

Both sign up with an email address and a password. New passwords must be at least 8 characters and include upper and lower case letters, a number and a special character.

## Tech stack

| Part     | Tech                                               |
|----------|----------------------------------------------------|
| Frontend | React 16 (function components and hooks), React Router 5, Axios, react-icons |
| Backend  | Node.js, Express 4, Mongoose 9                     |
| Database | MongoDB (MongoDB Atlas or a local install)         |

## Project structure

```
├── backend/
│   ├── server.js        # Express app and all /api routes
│   └── schema/          # Mongoose models: user, request, bid, equipment
├── client/
│   └── src/
│       ├── Components/  # Pages (Login, SignUp, Contractor, Supplier, Bids) and shared UI
│       ├── routers/     # Client-side routes
│       ├── utils/       # Validation, date and currency helpers
│       └── styles.css
└── package.json         # Root scripts
```

## Running locally

### Prerequisites

- **Node.js 20.19 or newer.** Mongoose 9 requires it.
- **A MongoDB database.** Either:
  - a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas). Choose the free M0 tier when you create it.
  - MongoDB installed on your machine. On macOS:
    ```bash
    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community
    ```

### 1. Install dependencies

From the root folder:

```bash
npm install
```

This also installs the `backend/` and `client/` dependencies.

### 2. Point the app at your database

Create a file called `.env.development` in the root folder:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<your-cluster>.mongodb.net/
JWT_SECRET=<a long random string>
```

`JWT_SECRET` signs login tokens. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The backend won't start without it.

For a local MongoDB install, use `MONGODB_URI=mongodb://localhost/fullstack-app`.

Git ignores this file, so your credentials stay out of the repository.

### 3. Start the app

Run the backend and the frontend in two terminals:

```bash
# Terminal 1, from the root folder: API on http://localhost:3001
npm start

# Terminal 2: React app on http://localhost:3000
cd client
npm start
```

Or start both from the root folder with `npm run dev`.

Open **http://localhost:3000**, sign up as a contractor or a supplier, and log in.

The first time the backend connects to an empty database, it adds a starter list of equipment (Excavator, Crane, Bulldozer and others). Change that list in the `equipment` collection in MongoDB.

## Deploying to Render

The app deploys as one Render web service: Express serves the API and the built React app from the same URL. The setup is in [`render.yaml`](render.yaml).

1. In the Render dashboard, choose **New → Blueprint** and select this repository.
2. When asked, enter `MONGODB_URI`. Render generates `JWT_SECRET` for you.
3. In MongoDB Atlas, under **Network Access**, allow connections from `0.0.0.0/0`, because Render's free plan has no fixed IP addresses.

On the free plan, the service sleeps when it isn't used, so the first visit after a while can take about a minute.

## API overview

All routes are under `/api`. In development, the React dev server forwards them to port 3001.

`/login` returns a JWT that lasts 7 days. Routes marked 🔒 need it in an `Authorization: Bearer <token>` header. The server takes the user's identity and role from the token, never from the request body.

| Method | Route                | Who                | Purpose                                                       |
|--------|----------------------|--------------------|---------------------------------------------------------------|
| GET    | `/getUserData`       | Anyone             | List users, without passwords                                 |
| POST   | `/putUserData`       | Anyone             | Sign up (the password is hashed with bcrypt)                  |
| POST   | `/login`             | Anyone             | Check an email and password, and return a JWT                 |
| GET    | `/getEquipment`      | Anyone             | List equipment, alphabetically                                |
| GET    | `/getRequestData`    | 🔒 Logged in       | Contractors: their own requests. Suppliers: all requests.     |
| POST   | `/putRequestData`    | 🔒 Contractor      | Create a request                                              |
| DELETE | `/deleteRequestData` | 🔒 Contractor      | Delete your request and its bids                              |
| GET    | `/getBidData`        | 🔒 Logged in       | Suppliers: their own bids. Contractors: bids on their requests. |
| POST   | `/putBidData`        | 🔒 Supplier        | Bid on an open request (price must be above 0)                |
| POST   | `/updateBidStatus`   | 🔒 Contractor      | Accept or reject a bid on your request                        |
| POST   | `/deleteBidData`     | 🔒 Supplier        | Delete your bid, unless it has been accepted                  |

## Known limitations and next steps

As a trial project, it leaves out some things a real product needs:

- **The token is kept in `localStorage`.** That's simple, but any script injected into the page could read it. An httpOnly cookie would be safer.
- **No logout on the server.** Logging out deletes the token in the browser, but a copied token stays valid until it expires after 7 days. A token blocklist or short-lived tokens with refresh tokens would fix this.
- **No rate limiting on `/login`**, so passwords could be brute-forced.
- **No automated tests.**
