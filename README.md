# Crypto Poker Club - Full-Stack Telegram Web App

This is a full-stack multiplayer Texas Hold'em poker game designed to run as a Telegram Web App. It features a React frontend and a Node.js (Express + WebSocket) backend.

## Architecture

-   **Frontend:** A static site built with React and Vite. It communicates with the backend via REST API (for admin tasks) and WebSockets (for real-time gameplay).
-   **Backend:** A Node.js web service using Express and TypeScript. It manages game state and user data. It authenticates users by validating `initData` from the Telegram Web App.
-   **Database:** PostgreSQL, accessed directly using the `pg` library. The application automatically initializes the required tables on first startup.

## Deployment on Render

This project requires deploying two separate services on [Render](https://render.com/): a **Static Site** for the frontend and a **Web Service** for the backend, connected to a **PostgreSQL Database**.

---

### 1. Backend Deployment (Web Service + PostgreSQL)

1.  **Fork this Repository:**
    Create a fork of this repository in your own GitHub account.

2.  **Create a PostgreSQL Database on Render:**
    *   Click "New +" -> "PostgreSQL".
    *   Give it a name and choose a plan. The free plan is sufficient for development.
    *   After creation, find the "Connections" section and copy the **"Internal Database URL"**. You will need this soon.

3.  **Create a New "Web Service" on Render:**
    *   Click "New +" -> "Web Service".
    *   Connect your GitHub and select your forked repository.

4.  **Configure the Web Service:**
    *   **Name:** Give your service a name (e.g., `poker-backend`).
    *   **Root Directory:** `backend` (This tells Render to look inside the `backend` folder).
    *   **Runtime:** `Node`.
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`

5.  **Add Environment Variables:**
    *   Go to the "Environment" tab for your new web service.
    *   Click "Add Environment Variable" for each of the following:

    | Key            | Description                                                                                             | Example Value                                  |
    | :------------- | :------------------------------------------------------------------------------------------------------ | :--------------------------------------------- |
    | `BOT_TOKEN`      | **Required.** Your Telegram bot token from `@BotFather`. Used to authenticate players.                  | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`     |
    | `DATABASE_URL` | The **Internal Database URL** you copied from your PostgreSQL service.                                  | `postgres://user:password@host:port/database`  |
    | `FRONTEND_URL` | The public URL of your frontend static site (you'll create this in the next section).                     | `https://crypto-poker-club.onrender.com`       |
    | `ADMIN_PASSWORD` | **Optional.** A password to access the admin panel directly from a browser (`/admin` URL), bypassing Telegram. | `supersecret_poker_password`                   |
    
6.  **Deploy:**
    *   Click "Create Web Service". Render will build and deploy your backend. Note the URL it gets (e.g., `https://poker-backend.onrender.com`).

---

### 2. Frontend Deployment (Static Site)

1.  **Create a New "Static Site" on Render:**
    *   Click "New +" -> "Static Site".
    *   Select the same forked repository.

2.  **Configure the Static Site:**
    *   **Name:** Give it a name (e.g., `crypto-poker-club`).
    *   **Root Directory:** Leave this blank (it will use the root of the repository).
    *   **Build Command:** `npm install && npm run build`
    *   **Publish Directory:** `dist`

3.  **Add Environment Variables:**
    *   Go to the "Environment" tab for your new static site.
    *   Add the following variables. **These are crucial for connecting the frontend to the backend.**

    | Key           | Description                                                                              | Example Value                                  |
    | :------------ | :--------------------------------------------------------------------------------------- | :--------------------------------------------- |
    | `VITE_API_URL`  | The public URL of the **backend web service** you deployed in the previous step.          | `https://poker-backend.onrender.com`           |
    | `VITE_WS_URL`   | The WebSocket URL for your backend. It's the same URL but with the `wss://` protocol.    | `wss://poker-backend.onrender.com`             |

4.  **Deploy:**
    *   Click "Create Static Site".
    *   Once deployed, you will get a public URL for your game.

---

### 3. Connecting to Telegram

Follow the previous instructions to connect your **frontend's public URL** to a Telegram bot via [@BotFather](https://t.me/BotFather).