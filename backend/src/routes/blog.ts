import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput, updateBlogInput } from "@bloghub/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    CONNECTION_POOL_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", authMiddleware);

blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = await createBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({message: "incorrect inputs"});
  }
  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: c.get("userId"),
      },
    });
    c.status(200);
    return c.json({ message: "Blog created successfully", id: blog.id });
  } catch (e) {
    c.status(403);
    console.log(e);
    return c.json({ message: "Internal server error" });
  }
});

blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const { success } = await updateBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({message: "incorrect inputs"});
  }
  try {
    const blog = await prisma.blog.update({
      where: {
        id: body.id
      },
      data: {
        title: body.title,
        content: body.content,
        published: body.published
      },
    });
    c.status(200);
    return c.json({ message: "Blog updated successfully", id: blog.id });
  } catch (e) {
    c.status(403);
    console.log(e);
    return c.json({ message: "Internal server error" });
  }
});

blogRouter.get("/get/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());
  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: c.req.param('id'),
      }
    });
    c.status(200);
    return c.json({ blog });
  } catch (e) {
    c.status(403);
    console.log(e);
    return c.json({ message: "Internal server error" });
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());
  try {
    const blogs = await prisma.blog.findMany({});
    c.status(200);
    return c.json({ blogs });
  } catch (e) {
    c.status(403);
    console.log(e);
    return c.json({ message: "Internal server error" });
  }
});
