import { NextFunction, Request, Response } from "express";

type AttemptWindow = { count: number; resetsAt: number };
const attempts = new Map<string, AttemptWindow>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 12;

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = attempts.get(key);
  const window =
    !current || current.resetsAt <= now
      ? { count: 0, resetsAt: now + WINDOW_MS }
      : current;

  window.count += 1;
  attempts.set(key, window);

  res.setHeader("RateLimit-Limit", MAX_ATTEMPTS);
  res.setHeader(
    "RateLimit-Remaining",
    Math.max(0, MAX_ATTEMPTS - window.count),
  );
  res.setHeader("RateLimit-Reset", Math.ceil(window.resetsAt / 1000));

  if (window.count > MAX_ATTEMPTS) {
    res
      .status(429)
      .json({ message: "Too many sign-in attempts. Try again later." });
    return;
  }

  next();
}
