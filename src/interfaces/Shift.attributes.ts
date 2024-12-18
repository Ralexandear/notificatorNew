import { Optional } from "sequelize";

export interface ShiftAttributes {
  id: number;
  date: Date;
  pointId: number;
  userId: number;
  
}

export interface ShiftCreationAttributes extends Optional<ShiftAttributes, 'id'> {}