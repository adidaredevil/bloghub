import { verify } from "hono/jwt";

export async function authMiddleware(c: any , next: any)  {
  const jwt = c.req.header("Authorization");
  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  const token = jwt.split(" ")[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    c.set("userId", payload.id);
    await next();
  } catch (e) {
    c.status(403);
    console.error(e);
    return c.json({ error: "Internal Error" });
  }
}