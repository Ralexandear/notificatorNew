import { Optional } from "sequelize";
import { ProgramsType } from "../types/Programs";
import { ListenersType } from "../types/ListenersType";

export interface UserAttributes {
  id: number;
  telegramId: string;
  presetsIsActive: boolean;
  isActive: boolean;
  program: ProgramsType;
  messageId: number | null; // добавлено private
  _fullName: string;
  _username: string;
}
  
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'presetsIsActive' | 'program' > {}



export interface PointAttributes {
  id: number;
  morningCourierId: number;
  eveningCourierId: number;
  listeners: ListenersType
}

export interface PointCreationAttributes extends Optional<PointAttributes, 'morningCourierId' | 'eveningCourierId' | 'listeners'> {}



