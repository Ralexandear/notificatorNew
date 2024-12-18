import { Model } from "sequelize";
import { UserAttributes, UserCreationAttributes } from "../../../interfaces/User.attributes";
import { UserStatusType } from "../../../types/UserStatus.type";
import { ProgramType } from "../../../types/Program.type";

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  readonly id!: number;
  readonly telegramId!: string;
  messageId!: number | null;
  presetStatus!: boolean;
  status!: UserStatusType;
  program!: ProgramType;
  fullName!: string;
  username!: string;
}