import express from "express";
import dotenv from "dotenv";
import routes from "./routes/usernameRoutes";
import { logger } from "./utils/logger";
import { initBloomFilter } from "./services/bloomFilterService";
import { connectRedis } from "./services/redisService";
import { connectToDatabase } from "./services/databaseService";
import { initLoadBalancer } from "./services/loadBalancerService";
import routerlogger from "express-list-endpoints";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

async function initializeServices() {
  try {
    await connectToDatabase();
    logger.info("Connected to database");

    await connectRedis();
    logger.info("Connected to Redis");

    await initBloomFilter();
    logger.info("Bloom filter initialized");

    initLoadBalancer();
    logger.info("Load balancer initialized");

    app.use("/api", routes);

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    console.table(routerlogger(app));
  } catch (error) {
    logger.error("Failed to initialize services", error);
    process.exit(1);
  }
}

initializeServices();
