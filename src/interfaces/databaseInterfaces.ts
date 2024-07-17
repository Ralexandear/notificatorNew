import { Optional } from "sequelize";
import { ProgramsType } from "../types/programs";

export interface UserAttributes {
  id: number;
  telegramId: string;
  presetsIsActive: boolean;
  isActive: boolean;
  program: ProgramsType;
  messageId: number | null; // добавлено private
}
  
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' > {}


export interface UserdataAttributes {
  userId: number;
  name: string;
  username: string;
}

export interface UserdataCreationAttributes extends UserdataAttributes {}




