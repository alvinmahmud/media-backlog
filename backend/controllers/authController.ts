import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import {
  AuthenticatedRequest,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "../middleware/auth";

const googleClient = new OAuth2Client();

function publicUser(user: {
  _id: unknown;
  email: string;
  name: string;
  picture?: string | null;
}) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    picture: user.picture || undefined,
  };
}

function developmentAuthEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_DEV_AUTH !== "false"
  );
}

export async function developmentLogin(req: Request, res: Response) {
  if (!developmentAuthEnabled()) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  if (name.length < 2 || name.length > 80 || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ message: "A valid name and email are required" });
    return;
  }

  const user = await User.findOneAndUpdate(
    { developmentKey: email },
    {
      $set: { name, email },
      $setOnInsert: {
        authProvider: "development",
        developmentKey: email,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.cookie(
    SESSION_COOKIE,
    createSessionToken(user.id),
    sessionCookieOptions(),
  );
  res.status(200).json({ user: publicUser(user), developmentAccount: true });
}

export async function googleLogin(req: Request, res: Response) {
  const credential = req.body?.credential;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    res
      .status(503)
      .json({ message: "Google authentication is not configured" });
    return;
  }
  if (typeof credential !== "string" || !credential) {
    res.status(400).json({ message: "A Google credential is required" });
    return;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.name) {
      res.status(401).json({ message: "Google account profile is incomplete" });
      return;
    }

    const user = await User.findOneAndUpdate(
      { googleSub: payload.sub },
      {
        $set: {
          authProvider: "google",
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.cookie(
      SESSION_COOKIE,
      createSessionToken(user.id),
      sessionCookieOptions(),
    );
    res.status(200).json({ user: publicUser(user) });
  } catch {
    res
      .status(401)
      .json({ message: "Google credential could not be verified" });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  const { userId } = (req as AuthenticatedRequest).auth;
  const user = await User.findById(userId);

  if (!user) {
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
    res.status(401).json({ message: "User no longer exists" });
    return;
  }

  res.json({ user: publicUser(user) });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions());
  res.status(204).send();
}
