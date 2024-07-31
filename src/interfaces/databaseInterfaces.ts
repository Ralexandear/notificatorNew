import { Optional } from "sequelize";
import { ProgramsType } from "../types/Programs";
import { UserStatusEnum } from "../enums/UserStatusEnum";
import { ListenersType } from "../types/ListenersType";
import { ShiftType } from "../types/ShiftType";

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
  _listeners: ListenersType
}

export interface PointCreationAttributes extends Optional<PointAttributes, 'morning' | 'evening' | '_listeners'> {}


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


// export interface ListenerInterface {
//   userId: number;
//   pointId: number;
//   shiftType: ShiftType
// }


