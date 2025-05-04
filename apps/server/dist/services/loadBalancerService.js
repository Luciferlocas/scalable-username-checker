"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLoadBalancer = initLoadBalancer;
exports.getLoadBalancer = getLoadBalancer;
exports.getNextServer = getNextServer;
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
class LoadBalancer {
    constructor(servers, strategy) {
        this.servers = Array.from({ length: servers }, (_, i) => `server-${i + 1}`);
        this.currentIndex = 0;
        this.strategy = strategy;
        logger_1.logger.info(`Load balancer initialized with ${servers} servers using ${strategy} strategy`);
    }
    getNextServer() {
        if (this.strategy === "round-robin") {
            return this.getRoundRobinServer();
        }
        else if (this.strategy === "random") {
            return this.getRandomServer();
        }
        else {
            return this.getRoundRobinServer();
        }
    }
    getRoundRobinServer() {
        const server = this.servers[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.servers.length;
        return server;
    }
    getRandomServer() {
        const randomIndex = Math.floor(Math.random() * this.servers.length);
        return this.servers[randomIndex];
    }
}
let loadBalancerInstance;
function initLoadBalancer() {
    if (!loadBalancerInstance) {
        loadBalancerInstance = new LoadBalancer(config_1.config.loadBalancer.servers, config_1.config.loadBalancer.strategy);
    }
    return loadBalancerInstance;
}
function getLoadBalancer() {
    if (!loadBalancerInstance) {
        return initLoadBalancer();
    }
    return loadBalancerInstance;
}
function getNextServer() {
    const loadBalancer = getLoadBalancer();
    const server = loadBalancer.getNextServer();
    logger_1.logger.debug(`Load balancer selected server: ${server}`);
    return server;
}
