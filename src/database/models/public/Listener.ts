import { ListenerAttributes } from "../../../interfaces/Listener.attributes";
import { ListenerModel } from "../sequelize/Listener.model";
import { IncapsulationModel } from "./IncapsulationModel";

export class Listener extends IncapsulationModel<ListenerModel> implements ListenerAttributes {
  constructor(protected model: ListenerModel) {
    super(model)
  }

  static init(model: ListenerModel) {
    return new this(model)
  }

  get id() {
    return this.model.id
  }

  get listenerUserId() {
    return this.model.listenerUserId
  }

  get pointId() {
    return this.model.pointId
  }

  get date() {
    return this.model.date
  }
}