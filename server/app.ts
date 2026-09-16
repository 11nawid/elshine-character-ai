import path from "path";
import express from "express";
import { usersRouter } from "./routes/users";
import { charactersRouter } from "./routes/characters";
import { chatsRouter } from "./routes/chats";
import { aiRouter } from "./routes/ai";
import { errorMiddleware, notFoundHandler } from "./errors";

export interface CreateAppOptions {
  /** Static directory served before the 404 handler (e.g. Vite's dist output). */
  staticDir?: string;
  /** Middleware injected before the 404 handler (e.g. Vite dev server middleware). */
  beforeNotFound?: express.RequestHandler[];
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https: http:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss: https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
      );
    }
    next();
  });

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  app.use("/api/users", usersRouter);
  app.use("/api/characters", charactersRouter);
  app.use("/api/chats", chatsRouter);
  app.use("/api", aiRouter);

  if (options.beforeNotFound) {
    app.use(...options.beforeNotFound);
  }

  if (options.staticDir) {
    app.use(express.static(options.staticDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(options.staticDir!, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}