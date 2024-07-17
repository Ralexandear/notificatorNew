import * as Interfaces from "../interfaces/databaseInterfaces"

import { Model } from "sequelize";
import { ProgramsType } from "../types/programs";
import TelegramBot from "node-telegram-bot-api";
import { Bot } from "..";
import TelegramQueue, { TelegramQueueOptions } from "../utilities/TelegramQueue";

// extends Model<Interfaces.UserAttributes, Interfaces.UserCreationAttributes>  
export class User extends Model<Interfaces.UserAttributes, Interfaces.UserCreationAttributes> {
  readonly id!: number;
  readonly telegramId!: string;
  messageId!: number | null;
  protected presetsIsActive!: boolean;
  isActive!: boolean;
  program!: ProgramsType;

  private setMessageId(messageId: number) {
    this.messageId = messageId;
  }

  sendMessage(text: string, messageOptions: TelegramBot.SendMessageOptions = {}, saveMessageId = false, options?: TelegramQueueOptions){
    if (! messageOptions.parse_mode) messageOptions.parse_mode = 'HTML';
    const job = () => Bot.sendMessage(this.telegramId, text, messageOptions)
        .then(message => saveMessageId && this.setMessageId(message.message_id))
    
    TelegramQueue.add(job, options);
    return this
  }
    

}