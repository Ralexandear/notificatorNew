import * as Redis from "redis";

const RedisClient = Redis.createClient({name: 'usjobbot'});

RedisClient
  .on("error", (err: any) => {
    console.error("Redis error:", err);
    throw new Error('Redis is not ready!')
  })
  .on("connect", () => {
    console.log("Connected to Redis");
  })
  .on("end", () => {
    console.log("Disconnected from Redis");
  })
  .on("SIGINT", () => {
    console.log("Closing Redis connection on process exit");
    RedisClient.quit()
  })

export default RedisClient

