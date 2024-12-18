import { Optional } from "sequelize";

export interface PresetAttributes {
  userId: number;
  pointId: number;
  listenPointId: number;
}

export interface PresetCreationAttributes extends PresetAttributes {}