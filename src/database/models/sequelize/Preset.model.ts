import { Model } from "sequelize";
import { PresetAttributes, PresetCreationAttributes } from "../../../interfaces/Preset.attributes";

export class PresetModel extends Model<PresetAttributes, PresetCreationAttributes> implements PresetAttributes {
  userId!: number;
  pointId!: number;
  listenPointId!: number;
}