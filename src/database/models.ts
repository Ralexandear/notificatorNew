import * as Interfaces from "../interfaces/databaseInterfaces"

import { Model } from "sequelize";
import { ProgramsType } from "../types/Programs";
import TelegramBot from "node-telegram-bot-api";
import { Bot } from "..";
import TelegramQueue, { TelegramQueueOptions } from "../utilities/TelegramQueue";
import { ListenersType } from "../types/ListenersType";
import PointsController from "../controllers/PointsController";
import { ShiftType } from "../types/ShiftType";
import UserController from "../controllers/UserController";
import RedisController from "../controllers/RedisController";
import UserdataController from "../controllers/UserdataController";
import { MessageConstructor } from "../messageConstructor/MessageConstructor";

export class User extends Model<Interfaces.UserAttributes, Interfaces.UserCreationAttributes> {
  readonly id!: number;
  readonly telegramId!: string;
  messageId!: number | null;
  presetsIsActive!: boolean;
  isActive!: boolean;
  program!: ProgramsType;
  private _fullName!: string;
  private _username!: string;
  private _savePromise?: Promise<any> | null

  private saveIt(){
    if (this._savePromise) return this;

    this._savePromise = Promise.all([
      this.save(),
      this.saveToRedis()
    ])
    .then(() => this._savePromise = null);
    
    return this
  }

  get name() {
    return this._fullName
  }

  set name( name: string ) {
    this._fullName = name;
    this.saveIt()
  }

  get username(){
    return this._username
  }

  private set username( username: string ){
    this._username = username
    this.saveIt()
  }

  checkUsername( username: string ){
    if (this.username !== username) this.username = username
    return this
  }

  setProgram( program: ProgramsType ){
    this.program = program;
    this.saveIt();
    return this
  }


  saveToRedis(){
    RedisController.set(this.telegramId, this.dataValues)
    return this
  }

  private setMessageId(messageId: number | null) {
    this.messageId = messageId;
    this.saveIt()
  }

  openMenu(messageText?: string){
    console.log(`Открытие меню для пользователя`, this.name, this.id)
    const {text, reply_markup} = MessageConstructor.menu().mainMenu()
    this.sendMessage(messageText || text, {reply_markup})
    return this
  }

  sendMessage(text: string, messageOptions: TelegramBot.SendMessageOptions = {}, saveMessageId = false, options?: TelegramQueueOptions){
    if (! messageOptions.parse_mode) messageOptions.parse_mode = 'HTML';
    const job = () => Bot.sendMessage(this.telegramId, text, messageOptions)
        .then(message => saveMessageId && this.setMessageId(message.message_id))
    
    TelegramQueue.add(job, options);
    return this
  }

  deletePreviousInlineMessage () {
    if (! this.messageId) return this
    //@ts-ignore
    const job = () => Bot.editMessageReplyMarkup( null, {chat_id: this.telegramId, message_id:  this.messageId, })
    
    this.setMessageId(null);
    TelegramQueue.add(job);

    return this
  }

  sendSticker (sticker: string | Buffer) {
    const job = () => Bot.sendSticker(this.telegramId, sticker)
    TelegramQueue.add(job)
    return this
  }
}



export class Points extends Model<Interfaces.PointAttributes, Interfaces.PointCreationAttributes> {
  readonly id!: number;
  morningCourierId!: number;
  eveningCourierId!: number;
  readonly listeners!: ListenersType;

  async getUser (shiftType: ShiftType) {
    //@ts-ignore
    const userId: number | null = this[shiftType + 'CourierId' ]
    if (userId) return await UserController.getById(userId)
  }

  async getListeners (shiftType: ShiftType) {
    const userIds = this.listeners[ shiftType ]
    if (userIds.length) return await UserController.getByIds( ...userIds )
  }

  get point () {
    return 'К' + this.id
  }
}