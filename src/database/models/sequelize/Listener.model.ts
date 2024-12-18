import { Model } from "sequelize";
import { ListenerAttributes, ListenerCreationAttributes } from "../../../interfaces/Listener.attributes";

export class ListenerModel extends Model<ListenerAttributes, ListenerCreationAttributes> implements ListenerAttributes {
  id!: number
  pointId!: number;
  listenerUserId!: number;
  date!: Date;
}