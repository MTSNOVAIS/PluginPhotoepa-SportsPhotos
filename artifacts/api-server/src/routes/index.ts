import { Router, type IRouter } from "express";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);

router.get("/proxy-image", async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  const allowed = ["cdn.thesportsdb.com", "www.thesportsdb.com", "r2.thesportsdb.com"];
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    res.status(400).json({ error: "Invalid url" });
    return;
  }

  if (!allowed.some((h) => hostname === h || hostname.endsWith("." + h))) {
    res.status(403).json({ error: "Domain not allowed" });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({ error: "Upstream error" });
      return;
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "attachment");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

export default router;
