import { Optional } from "sequelize";
import { ProgramsType } from "../types/Programs";
import { UserStatusEnum } from "../enums/UserStatusEnum";

export interface UserAttributes {
  id: number;
  telegramId: string;
  presetIsActive: boolean;
  status: UserStatusEnum;
  program: ProgramsType;
  messageId: number | null; // добавлено private
  _fullName: string;
  _username: string;
}
  
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'presetIsActive' | 'program' > {}



export interface PointAttributes {
  id: number;
  morning: number | null;
  evening: number | null;
  // listeners: ListenersType
}

export interface PointCreationAttributes extends Optional<PointAttributes, 'morning' | 'evening' > {}


export interface TempAttributes {
  userId: number;
  data: {};
}

export interface TempCreationAttributes extends TempAttributes {}


export interface PresetAttributes {
  id: number;
  userId: number;
  pointId: number;
  pointsToListen: number[]
}

export interface PresetCreationAttributes extends Optional<PresetAttributes, 'id'> {}




