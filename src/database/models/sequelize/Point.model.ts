import { Model } from "sequelize";
import { PointAttributes, PointCreationAttributes } from "../../../interfaces/Point.attributes";

/**
 * 
 */
export class PointModel extends Model<PointAttributes, PointCreationAttributes> implements PointAttributes {
  readonly id!: number;
}