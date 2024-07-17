import { DataTypes } from "sequelize"
import * as Models from "./models"
import Postgres from "./Postgres";

Models.User.init (
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    telegramId: { type: DataTypes.STRING(100), allowNull: false},
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    presetsIsActive: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    program: {type: DataTypes.STRING(50)},
    messageId: { type: DataTypes.INTEGER },
  }, {
    sequelize: Postgres,
    tableName: 'users',
    modelName: 'user',
  }
);

