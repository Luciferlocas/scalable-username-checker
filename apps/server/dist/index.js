"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const usernameRoutes_1 = __importDefault(require("./routes/usernameRoutes"));
const logger_1 = require("./utils/logger");
const bloomFilterService_1 = require("./services/bloomFilterService");
const redisService_1 = require("./services/redisService");
const databaseService_1 = require("./services/databaseService");
const loadBalancerService_1 = require("./services/loadBalancerService");
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use(express_1.default.json());
async function initializeServices() {
    try {
        await (0, databaseService_1.connectToDatabase)();
        logger_1.logger.info("Connected to database");
        await (0, redisService_1.connectRedis)();
        logger_1.logger.info("Connected to Redis");
        await (0, bloomFilterService_1.initBloomFilter)();
        logger_1.logger.info("Bloom filter initialized");
        (0, loadBalancerService_1.initLoadBalancer)();
        logger_1.logger.info("Load balancer initialized");
        app.use("/api", usernameRoutes_1.default);
        app.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT}`);
        });
        console.table((0, express_list_endpoints_1.default)(app));
    }
    catch (error) {
        logger_1.logger.error("Failed to initialize services", error);
        process.exit(1);
    }
}
initializeServices();
