import { config } from "../config/config";

class LoadBalancer {
  private servers: string[];
  private currentIndex: number;
  private strategy: string;

  constructor(servers: number, strategy: string) {
    this.servers = Array.from({ length: servers }, (_, i) => `server-${i + 1}`);
    this.currentIndex = 0;
    this.strategy = strategy;

    console.log(
      `Load balancer initialized with ${servers} servers using ${strategy} strategy`,
    );
  }

  getNextServer(): string {
    if (this.strategy === "round-robin") {
      return this.getRoundRobinServer();
    } else if (this.strategy === "random") {
      return this.getRandomServer();
    } else {
      return this.getRoundRobinServer();
    }
  }

  private getRoundRobinServer(): string {
    const server = this.servers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.servers.length;
    return server;
  }

  private getRandomServer(): string {
    const randomIndex = Math.floor(Math.random() * this.servers.length);
    return this.servers[randomIndex];
  }
}

let loadBalancerInstance: LoadBalancer;

export function initLoadBalancer(): LoadBalancer {
  if (!loadBalancerInstance) {
    loadBalancerInstance = new LoadBalancer(
      config.loadBalancer.servers,
      config.loadBalancer.strategy,
    );
  }
  return loadBalancerInstance;
}

export function getLoadBalancer(): LoadBalancer {
  if (!loadBalancerInstance) {
    return initLoadBalancer();
  }
  return loadBalancerInstance;
}

export function getNextServer(): string {
  const loadBalancer = getLoadBalancer();
  const server = loadBalancer.getNextServer();
  console.debug(`Load balancer selected server: ${server}`);
  return server;
}
