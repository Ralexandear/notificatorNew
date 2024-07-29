import { DataTypes } from "sequelize"
import * as Models from "./models"
import Postgres from "./Postgres";
import RedisClient from "./Redis";
import { ListenersDefaultValue } from "../types/ListenersType";
import { UserStatusEnum } from "../enums/UserStatusEnum";

Models.User.init (
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    telegramId: { type: DataTypes.STRING(100), allowNull: false},
    status: { type: DataTypes.STRING(50), defaultValue: UserStatusEnum.active, allowNull: false },
    presetIsActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
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

Models.Preset.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    pointId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    pointsToListen: { 
      type: DataTypes.ARRAY(DataTypes.INTEGER), 
      allowNull: false 
    }
  }, 
  {
    sequelize: Postgres,
    tableName: 'presets',
    modelName: 'preset',
    timestamps: false
  }
);


Models.Point.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  morning: { type: DataTypes.INTEGER },
  evening: { type: DataTypes.INTEGER },
  // listeners: { type: DataTypes.JSON, defaultValue: ListenersDefaultValue, allowNull: false }
}, 
{
  sequelize: Postgres,
  tableName: 'points',
  modelName: 'point',
  timestamps: false
}
)


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
