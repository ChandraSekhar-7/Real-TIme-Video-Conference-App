# Convene — real-time video, whiteboard & collaboration

A full-stack video conferencing app: multi-user WebRTC video calls, screen
sharing, a live collaborative whiteboard, encrypted chat + file sharing, and
JWT authentication backed by MongoDB.


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

