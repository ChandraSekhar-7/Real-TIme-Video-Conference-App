import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, name, email }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Same verification logic, reused by Socket.io handshake middleware.
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
