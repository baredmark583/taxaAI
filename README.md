# Crypto Poker Club - Full-Stack Telegram Web App

This is a full-stack multiplayer Texas Hold'em poker game designed to run as a Telegram Web App. It features a React frontend and a Node.js (Express + WebSocket) backend.

## Architecture

-   **Frontend (Game Client):** A static site built with React and Vite. This is the main interface for players. It communicates with the backend via WebSockets for real-time gameplay.
-   **Backend (Game Server):** A Node.js web service using Express and TypeScript. It manages game state, user data, and serves the primary API. It authenticates users by validating `initData` from the Telegram Web App.
-   **Backend (Admin Panel):** A separate Next.js application that provides a dashboard for managing users and game assets. It communicates with the Game Server's API.
-   **Database:** PostgreSQL, accessed directly using the `pg` library. The application automatically initializes the required tables on first startup.

## Deployment on Render

This project requires deploying three separate services on [Render](https://render.com/): a **Static Site** for the frontend, and two **Web Services** (one for the game server, one for the admin panel), all connected to a single **PostgreSQL Database**.

---

### 1. Database Deployment (PostgreSQL)

1.  **Fork this Repository:**
    Create a fork of this repository in your own GitHub account.

2.  **Create a PostgreSQL Database on Render:**
    *   Click "New +" -> "PostgreSQL".
    *   Give it a name and choose a plan. The free plan is sufficient for development.
    *   After creation, find the "Connections" section and copy the **"Internal Database URL"**. You will need this for both the Game Server and the Admin Panel.

---

### 2. Backend Deployment (Game Server)

1.  **Create a New "Web Service" on Render:**
    *   Click "New +" -> "Web Service".
    *   Connect your GitHub and select your forked repository.

2.  **Configure the Web Service:**
    *   **Name:** Give your service a name (e.g., `poker-backend`).
    *   **Root Directory:** `backend` (This tells Render to look inside the `backend` folder).
    *   **Runtime:** `Node`.
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`

3.  **Add Environment Variables:**
    *   Go to the "Environment" tab. Click "Add Environment Variable" for each of the following:

    | Key             | Description                                                                     | Example Value                                  |
    | :-------------- | :------------------------------------------------------------------------------ | :--------------------------------------------- |
    | `BOT_TOKEN`     | **Required.** Your Telegram bot token from `@BotFather`.                        | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`     |
    | `DATABASE_URL`  | The **Internal Database URL** you copied from your PostgreSQL service.          | `postgres://user:password@host:port/database`  |
    | `FRONTEND_URL`  | The public URL of your frontend static site (you'll create this next).          | `https://crypto-poker-club.onrender.com`       |
    | `ADMIN_APP_URL` | The public URL of your admin panel web service (you'll create this later).      | `https://poker-admin.onrender.com`             |
    | `ADMIN_PASSWORD`| **Optional.** A password for the legacy browser-based admin login.              | `supersecret_poker_password`                   |
    
4.  **Deploy:**
    *   Click "Create Web Service". Note the URL it gets (e.g., `https://poker-backend.onrender.com`). Render will also assign it a port (usually `10000`), which you'll need for the admin panel's internal URL.

---

### 3. Frontend Deployment (Game Client)

1.  **Create a New "Static Site" on Render:**
    *   Click "New +" -> "Static Site".
    *   Select the same forked repository.

2.  **Configure the Static Site:**
    *   **Name:** Give it a name (e.g., `crypto-poker-club`).
    *   **Root Directory:** Leave this blank.
    *   **Build Command:** `npm install && npm run build`
    *   **Publish Directory:** `dist`

3.  **Add Environment Variables:**
    *   Go to the "Environment" tab. Add the following:

    | Key            | Description                                                            | Example Value                                |
    | :------------- | :--------------------------------------------------------------------- | :------------------------------------------- |
    | `VITE_API_URL` | The public URL of the **backend game server** from the previous step.  | `https://poker-backend.onrender.com`         |
    | `VITE_WS_URL`  | The WebSocket URL for your backend (`wss://` protocol).                | `wss://poker-backend.onrender.com`           |

4.  **Deploy:**
    *   Click "Create Static Site". This is the URL you'll give to Telegram.

---

### 4. Backend Deployment (Admin Panel)

1.  **Create a New "Web Service" on Render:**
    *   Click "New +" -> "Web Service".
    *   Connect GitHub and select your forked repository.

2.  **Configure the Web Service:**
    *   **Name:** Give it a name (e.g., `poker-admin`).
    *   **Root Directory:** `backend/my-app` (This is crucial).
    *   **Runtime:** `Node`.
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`

3.  **Add Environment Variables:**
    *   Go to the "Environment" tab. Add the following:

    | Key                     | Description                                                                                                                              | Example Value                        |
    | :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- |
    | `INTERNAL_API_URL`      | **Recommended.** The private URL of the game server for faster server-to-server communication. The format is `http://<game-server-name>:<port>`. | `http://poker-backend:10000`         |
    | `NEXT_PUBLIC_API_URL`   | The public URL of the **backend game server**. Required for client-side requests.                                                        | `https://poker-backend.onrender.com` |

    **Note:** Using the `INTERNAL_API_URL` is highly recommended for performance. It allows the admin panel to fetch initial data from the game server over Render's fast private network, preventing timeout errors and significantly speeding up the initial load of the dashboard.

4.  **Deploy:**
    *   Click "Create Web Service". You can now access your new admin panel at its public URL.

---

### 5. Connecting to Telegram

Follow the previous instructions to connect your **frontend's (Game Client) public URL** to a Telegram bot via [@BotFather](https://t.me/BotFather).