import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createApp } from "./server/app";
import { ensureDefaultCharacters } from "./server/repos/character-repo";

dotenv.config();

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

async function startServer() {
  await ensureDefaultCharacters();
  const isDev = process.env.NODE_ENV !== "production";
  const PORT = Number(process.env.PORT || 3000);

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    const app = createApp({ beforeNotFound: [vite.middlewares] });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    const app = createApp({
      staticDir: path.join(process.cwd(), "dist"),
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();