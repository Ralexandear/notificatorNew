import { ShiftType } from "../../../bot/types/ShiftType";
import { PresetAttributes } from "../../../interfaces/Preset.attributes";
import { PresetModel } from "../sequelize/Preset.model";
import { IncapsulationModel } from "./IncapsulationModel";

export class Preset extends IncapsulationModel<PresetModel> implements PresetAttributes {
  constructor(protected model: PresetModel) {
    super(model)
  }

  get userId() {
    return this.model.userId
  }

  get pointId() {
    return this.model.pointId
  }

  get listenPointId() {
    return this.model.listenPointId
  }

  activate(shiftType: ShiftType) {
    
  }
}