import { ShiftAttributes } from "../../../interfaces/Shift.attributes";
import { ShiftModel } from "../sequelize/Shift.model";
import { IncapsulationModel } from "./IncapsulationModel";

export class Shift extends IncapsulationModel<ShiftModel> implements ShiftAttributes {
  private constructor(protected model: ShiftModel) {
    super(model)
  }

  static init(model: ShiftModel) {
    return new this(model)
  }

  get id() {
    return this.model.id
  }

  get pointId() {
    return this.model.pointId
  }

  get userId() {
    return this.model.userId
  }

  get date() {
    return this.model.date
  }
}