import { Model } from "sequelize";
import { ShiftAttributes, ShiftCreationAttributes } from "../../../interfaces/Shift.attributes";

export class ShiftModel extends Model<ShiftAttributes, ShiftCreationAttributes> implements ShiftAttributes {
  readonly id!: number;
  readonly date!: Date;
  readonly pointId!: number;
  readonly userId!: number;
}