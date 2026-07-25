# Convene — real-time video, whiteboard & collaboration

A full-stack video conferencing app: multi-user WebRTC video calls, screen
sharing, a live collaborative whiteboard, encrypted chat + file sharing, and
JWT authentication backed by MongoDB.

```
convene/
├── server/   Express + Socket.io + MongoDB API and signaling server
└── client/   React + Vite + Tailwind frontend
```

## Features

- **Multi-user video calling** — full-mesh WebRTC (good for small rooms,
  roughly up to 8–10 people)
- **Screen sharing** — swaps your camera track for a screen-capture track on
  every active peer connection, one click to stop
- **Live whiteboard** — freehand canvas synced in real time over Socket.io,
  with color/stroke controls and periodic autosave
- **Encrypted file sharing** — uploads are stored server-side and referenced
  in chat; message content is AES-256 encrypted at rest in MongoDB
- **User authentication** — JWT-based, bcrypt password hashing, protected
  REST routes and Socket.io handshake
- **Extras**: speaking indicator (Web Audio driven glow), pin/spotlight a
  tile with a double-click, raised hand, floating emoji reactions,
  participants drawer, rate limiting, mongo-sanitize, helmet

## Prerequisites

- Node.js 18+
- A MongoDB instance (local install or a free MongoDB Atlas cluster)

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/convene
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
DATA_ENCRYPTION_KEY=<64 hex characters — e.g. `openssl rand -hex 32`>
```

Start it:

```bash
npm run dev      # nodemon, auto-restarts on change
# or
npm start
```

The API runs on `http://localhost:5000`. Health check: `GET /api/health`.

## 2. Frontend setup

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. If your API isn't on `localhost:5000`, set
`VITE_API_URL` in a `client/.env` file before running.

## 3. Try it out

1. Register two accounts (e.g. in two browser tabs/profiles, since a browser
   only grants camera/mic to one tab set at a time — normal for local dev).
2. From the dashboard, create a room in tab A — note the `xxxx-xxxx-xxxx` code.
3. Join that code from tab B.
4. Toggle mic/camera, share your screen, open the whiteboard and draw, drop a
   file in chat, raise your hand, send a reaction.

## Notes on scaling this up

- **Mesh vs. SFU**: this uses a full-mesh WebRTC topology (every participant
  connects directly to every other). It's simple and needs no media server,
  but bandwidth/CPU cost grows with participant count. For rooms larger than
  ~10 people, swap in an SFU (e.g. mediasoup, LiveKit, Janus).
- **TURN server**: only STUN servers are configured by default. Users behind
  restrictive NATs/firewalls may fail to connect without a TURN server — add
  one in `client/src/hooks/useWebRTC.js` (`ICE_SERVERS`).
- **Encryption**: chat messages are encrypted at rest with AES-256; media
  itself is protected in transit by WebRTC's mandatory DTLS-SRTP. For
  production, also terminate the API over HTTPS/WSS.
- **File storage**: uploads are saved to `server/uploads/` on local disk.
  For production, swap in S3 or another object store.
