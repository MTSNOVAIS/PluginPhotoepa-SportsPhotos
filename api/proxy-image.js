const ALLOWED = ["r2.thesportsdb.com", "cdn.thesportsdb.com", "www.thesportsdb.com"];

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing url");

  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).send("Invalid url"); }

  if (!ALLOWED.includes(parsed.hostname)) return res.status(403).send("Domain not allowed");

  const upstream = await fetch(url);
  const buffer = await upstream.arrayBuffer();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(Buffer.from(buffer));
}
