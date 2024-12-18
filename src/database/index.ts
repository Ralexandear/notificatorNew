import { DataTypes } from "sequelize"
import Postgres from "./Postgres";
import RedisClient from "./Redis";
import { UserModel } from "./models/sequelize/User.model";
import { UserStatusEnum } from "../enums/UserStatus.enum";
import { PresetModel } from "./models/sequelize/Preset.model";
import { PointModel } from "./models/sequelize/Point.model";
import { ListenerModel } from "./models/sequelize/Listener.model";
import { IS_PRODUCTION } from "..";
import { ShiftModel } from "./models/sequelize/Shift.model";

const id = { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false }

UserModel.init (
  {
    id,
    telegramId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      key: 'telegram_id'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: UserStatusEnum.active,
      allowNull: false
    },
    presetStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      key: 'preset_status'
    },
    program: {
      type: DataTypes.STRING(50)
    },
    messageId: {
      type: DataTypes.INTEGER,
      key: 'message_id'
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      key: 'full_name'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize: Postgres,
    tableName: 'users',
    modelName: 'user',
  }
);

PresetModel.init(
  {
    pointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'point_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'user_id'
    },
    listenPointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'listen_point_id'
    },
  }, 
  {
    sequelize: Postgres,
    tableName: 'presets',
    modelName: 'preset',
    timestamps: false
  }
);


PointModel.init(
  {
    id,
  }, 
  {
    sequelize: Postgres,
    tableName: 'points',
    modelName: 'point',
    timestamps: false
  }
)


ShiftModel.init(
  {
    id,
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    pointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'point_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'user_id'
    }
  }, {
    sequelize: Postgres,
    tableName: 'shifts',
    modelName: 'Shift',
  }
)


ListenerModel.init(
  {
    id, 
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    pointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'point_id'
    },
    listenerUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'listener_user_id'
    }
  }, {
    sequelize: Postgres,
    tableName: 'listeners',
    modelName: 'Listener',
    timestamps: false,
    createdAt: true
  }
)


export const initDatabasePromise = (async () => {
  await Postgres.authenticate()
  await Postgres.sync({alter: !IS_PRODUCTION})

  const models = [UserModel, PresetModel, PointModel, ListenerModel, ShiftModel];
  for (const model of models){
    await model.sync({alter: !IS_PRODUCTION})
  }
  
  console.log('Postgres is ready')
    // RedisClient.connect().then(() => console.log('Redis is ready'))

})();
