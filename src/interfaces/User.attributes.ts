import { Optional } from "sequelize";
import { UserStatusType } from "../types/UserStatus.type";
import { ProgramType } from "../types/Program.type";

export interface UserAttributes {
  id: number;
  telegramId: string;
  presetStatus: boolean;
  status: UserStatusType;
  program: ProgramType;
  messageId: number | null; // добавлено private
  fullName: string;
  username: string;
}
  
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'presetStatus' | 'program' | 'status' > {}