import express from "express";
import dotenv from "dotenv";
import routes from "./routes/usernameRoutes";
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
    await connectRedis();
    await initBloomFilter();
    initLoadBalancer();

    app.use("/api", routes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    console.table(routerlogger(app));
  } catch (error) {
    console.error("Failed to initialize services", error);
    process.exit(1);
  }
}

initializeServices();
