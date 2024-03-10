import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@bloghub/medium-common";

export const userRouter = new Hono<{
  Bindings: {
    CONNECTION_POOL_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = await signupInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({message: "incorrect inputs"});
  }
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    c.status(200);
    return c.json({ jwt });
  } catch (e) {
    c.status(403);
    console.error(e);
    return c.json({ error: "error while signing up" });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = await signinInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({message: "incorrect inputs"});
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (user == null) {
      c.status(403);
      return c.json({ error: "Incorrect email or password" });
    }
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    c.status(200);
    return c.json({ jwt });
  } catch (e) {
    c.status(403);
    console.error(e);
    return c.json({ error: "error while signing in" });
  }
});
