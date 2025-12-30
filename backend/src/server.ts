import app from "./app";
import { env } from "./config/env";
import { connectPostgres } from "./config/db";
import { connectRedis } from "./config/redis";

const startServer = async () => {
  await connectPostgres();
  await connectRedis();

  app.listen(env.PORT, () => {
    console.log(`🚀 Backend running on port ${env.PORT}`);
  });
};

startServer();
