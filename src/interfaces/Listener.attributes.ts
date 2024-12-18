import { Optional } from "sequelize";

export interface ListenerAttributes {
  id: number;
  pointId: number;
  listenerUserId: number;
  date: Date;
}

export interface ListenerCreationAttributes extends Optional<ListenerAttributes, 'id'> {}