import { DataTypes } from "sequelize"
import * as Models from "./models"
import Postgres from "./Postgres";
import RedisClient from "./Redis";
import { ListenersDefaultValue } from "../types/ListenersType";

Models.User.init (
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    telegramId: { type: DataTypes.STRING(100), allowNull: false},
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    presetsIsActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    program: {type: DataTypes.STRING(50)},
    messageId: { type: DataTypes.INTEGER },
    _fullName: {type: DataTypes.STRING(100)},
    _username: {type: DataTypes.STRING(50)}
  }, {
    sequelize: Postgres,
    tableName: 'users',
    modelName: 'user',
  }
);




export const initDatabasePromise = (async () => {
  return Promise.all([
    Postgres.authenticate()
      .then(() => Postgres.sync())
      .then(async () => {
        for (const modelName of Object.keys(Models) as Array<keyof typeof Models>){
          await Models[ modelName ].sync()
        }
      })
      .then(() => console.log('Postgres is ready')),
    RedisClient.connect().then(() => console.log('Redis is ready'))
  ])
})();
