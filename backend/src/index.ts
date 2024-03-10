import { Hono } from "hono"; 
import { blogRouter } from "./routes/blog";
import { userRouter } from "./routes/user";

const app = new Hono<{
  Bindings: {
    CONNECTION_POOL_URL: string;
    JWT_SECRET: string;
  };
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
