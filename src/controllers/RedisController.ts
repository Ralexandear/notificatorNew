import { RedisClientType } from "redis";
import RedisClient from "../database/Redis";

export class RedisControllerClass {
  protected redis: RedisClientType
  
  constructor(redis: RedisClientType){
    this.redis = redis;
  }
  get(key: string | number): Promise<string | null> {
    return this.redis.get( key.toString() )
  }

  set(key: string | number, data: {} | [], ttl: number = 86_400): Promise<string> {
    return this.redis.setEx( key.toString(), ttl, JSON.stringify(data) );
  }

  closeConnection() {
    this.redis.quit();
  }
}

const RedisController = new RedisControllerClass( RedisClient as RedisClientType);

export default RedisController
