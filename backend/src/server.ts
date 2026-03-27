import app from "./app";
import { env } from "./config/env";
import { connectPostgres } from "./config/db";
import { connectRedis } from "./config/redis";

const startServer = async () => {
  await connectPostgres();
  
  try {
    await connectRedis();
  } catch(e) {
    console.warn("⚠️ Redis not available. Running without session caching.");
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Backend running on port ${env.PORT}`);
  });
};

startServer();
