import * as Interfaces from "../interfaces/databaseInterfaces"

import { Model } from "sequelize";
import { ProgramsType } from "../types/Programs";
import TelegramBot from "node-telegram-bot-api";
import { Bot } from "..";
import TelegramQueue, { TelegramQueueOptions } from "../controllers/TelegramQueue";
import { ListenersType } from "../types/ListenersType";
import { ShiftSelectorType, ShiftType } from "../types/ShiftType";
import UserController from "../controllers/databaseControllers/UserController";
import RedisController from "../controllers/RedisController";
import { MessageConstructor } from "../messageConstructor/MessageConstructor";
import { TempType } from "../types/TempType";
import { PostfixEnum } from "../enums/PostfixEnum";
import { Log } from "../utilities/Log";
import PresetController from "../controllers/databaseControllers/PresetController";
import BotError from "../Errors/BotError";
import { UserStatusEnum } from "../enums/UserStatusEnum";



type AnswerCallbackQueryOptions = Omit<TelegramBot.AnswerCallbackQueryOptions, 'callback_query_id'> & {callback_query_id?: string;};



/**
 * 
 */
export class User extends Model<Interfaces.UserAttributes, Interfaces.UserCreationAttributes> {
  readonly id!: number;
  readonly telegramId!: string;
  messageId!: number | null;
  presetIsActive!: boolean;
  status!: UserStatusEnum;
  program!: ProgramsType;
  private _fullName!: string;
  private _username!: string;
  // private _temp?: Temp
  private _savePromise?: Promise<any> | null

  setStatus(status: UserStatusEnum) {
    this.status = status;
    this.saveIt();
    return this
  }

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
    messageOptions.parse_mode ??= 'HTML';
    messageOptions.disable_web_page_preview ??= undefined
    
    const job = () => Bot.sendMessage(this.telegramId, text, messageOptions)
        .then(message => saveMessageId && this.setMessageId(message.message_id))
    
    TelegramQueue.add(job, options);
    return this
  }

  deletePreviousInlineMessage () {
    if (! this.messageId) return this
    //@ts-ignore
    const job = () => Bot.editMessageReplyMarkup( null, {chat_id: this.telegramId, message_id:  this.messageId, })
      .finally(() => this.setMessageId(null))

    TelegramQueue.add(job);

    return this
  }

  sendSticker (sticker: string | Buffer) {
    const job = () => Bot.sendSticker(this.telegramId, sticker)
    TelegramQueue.add(job)
    return this
  }

  answerCallbackQuery(callbackQueryId: string, options?: AnswerCallbackQueryOptions){
    options ??= {callback_query_id: callbackQueryId, show_alert: false, cache_time: 10}
    options.cache_time ??= 10
    const job  = () => Bot.answerCallbackQuery(callbackQueryId, options)
    TelegramQueue.add(job, {priority: 1});
    
    return this
  }

  editMessageReplyMarkup(messageId: string | number, replyMarkup: TelegramBot.ReplyKeyboardMarkup | TelegramBot.InlineKeyboardMarkup | TelegramBot.ReplyKeyboardRemove | null){
    //@ts-ignore
    const job = () => Bot.editMessageReplyMarkup( replyMarkup, {chat_id: this.telegramId, message_id:  messageId })
    TelegramQueue.add(job);
    return this
  }

  editMessageText(text: string, options: TelegramBot.EditMessageTextOptions = {}) {
    options.message_id ??= this.messageId || undefined;
    options.chat_id ??= this.telegramId
    options.parse_mode ??= 'HTML'
    
    const job = () => Bot.editMessageText(text, options);
    TelegramQueue.add(job);
    return this
  }

  deleteMessage(messageId: number){
    const job = () => Bot.deleteMessage(this.telegramId, messageId);
    TelegramQueue.add(job, {priority: 1})
    return this
  }

 
  // async getTemp() {
  //   return this._temp = await TempController.find( this.id );
  // }

  // async createTemp() {
  //   return this._temp = await TempController.create( this.id );
  // }

  preset() {
    const user = this

    return {
      activate(){
        user.presetIsActive = true;
        user.saveIt()
        return user
      },

      deactivate(){
        user.presetIsActive = false
        user.saveIt()
        return user
      },

      async getForPoint(pointId: number){
        return PresetController.getPresetForPoint(user.id, pointId);
      },

      async getAll(){
        return PresetController.getUserPresets(user.id)
      }
    }
  }
}



/**
 * 
 */
export class Point extends Model<Interfaces.PointAttributes, Interfaces.PointCreationAttributes> {
  readonly id!: number;
  morning!: number | null;
  evening!: number | null;
  // readonly listeners!: ListenersType;
  private _savePromise?: Promise<any> | null

  private saveIt(){
    if (this._savePromise) return this._savePromise;
    return this._savePromise = this.save().then(() => this._savePromise = null);
  }

  async getUser (shiftType: ShiftType) {
    //@ts-ignore
    const userId = this.getUserId()
    if (userId) return await UserController.getById(userId)
  }

  getUserId( shiftType: ShiftType ) {
    return this[shiftType]
  }

  private setUser (shiftType: ShiftType, user: User) {
    Log(user.name, 'записался на точку', this.id, shiftType)
    this[shiftType] = user.id
    return this
  }

  async removeUser(user: User, shiftType: ShiftSelectorType){
    const shifts: ShiftType[] = shiftType === 'full' ? ['evening', 'morning'] : [ shiftType ];

    shifts.forEach(e => {
      Log(user.name, 'снялся с точки', this.id, e)
      this[e] = this[e] === user.id ? null : this[e]
    })
   
    await this.saveIt()
    return true
  }

  async getListeners (shiftType: ShiftType) {
    //@ts-ignore
    const userIds = this.listeners[ shiftType ]
    if (userIds.length) return await UserController.getByIds( ...userIds )
  }

  get point () {
    return 'К' + this.id
  }

  async setUserToShift(user: User, shiftType: ShiftSelectorType, setForce = false) {
    const notifyUser = (courierId: number, postfix: string ) => UserController.getById( courierId )
      .then(user => {
        const {text, reply_markup} = MessageConstructor.notifications().pointLost(user, this.point + postfix)
        user.sendMessage(text, {reply_markup})
      });

    
    //  if ( ! (['morning', 'evening'] as ShiftType[]).includes(shiftType)) {
    //     const courierId = this.getUserId(shiftType)
        
    //     if ( courierId ) {
    //       const postfix = PostfixEnum[ shiftType ]
    //       notifyUser(courierId, postfix);
    //     }
    //     this.setUser(shiftType, user.id)
    //   } else {
    //     throw new TypeError('Unexpected shift type recieved!');
    //   }

    //   return this.saveIt()
    // }


    if (shiftType === 'full') {
      const shifts = [this.morning, this.evening]

      if (setForce){
        check: {
          if (this.morning) it:{
            if (this.morning === user.id) break it;
            const onlyOneCourier = this.morning === this.evening
            const postfix = onlyOneCourier ? PostfixEnum.full : PostfixEnum.morning

            notifyUser(this.morning, postfix);
            if (onlyOneCourier) break check;
          }

          if (this.evening) it:{
            if (this.evening === user.id) break it;
            const postfix = PostfixEnum.evening
            notifyUser(this.evening, postfix)
          }
        }
      }
      else if (shifts.some(courierId => courierId && courierId !== user.id)) return false

      await this.setUser('morning', user).setUser('evening', user).saveIt()
      return true;
    } else if (! (['morning', 'evening'] as ShiftType[]).includes(shiftType)) {
      throw new TypeError(`Unexpected type of shiftType param, 'morning' or 'evening' expected, but recieved '${shiftType}'`)
    }

    const courierId = this.getUserId( shiftType );
    
    if (courierId) it: {
      if (! setForce) return false;
      const postfix = PostfixEnum[ shiftType ];
      notifyUser(courierId, shiftType);
    }
    
    await this.setUser(shiftType, user).saveIt();
    return true
  }
}



// /**
//  * 
//  */
// export class Temp extends Model<Interfaces.TempAttributes, Interfaces.TempCreationAttributes> {
//   readonly userId!: number;
//   private _data!: TempType

//   get data () {
//     return this._data;
//   }

//   clear () {
//     this._data = {}
//     this.save();
//     return this
//   }

//   saveChanges() {
//     //@ts-ignore
//     this._changed.add('_data')
//     this.save()
//     return this
//   }
// }



/**
 * 
 */
export class Preset extends Model<Interfaces.PresetAttributes, Interfaces.PresetCreationAttributes> implements Interfaces.PresetAttributes {
  readonly id!: number;
  readonly userId!: number;
  readonly pointId!: number;
  pointsToListen!: number[];
  private _savePromise?: Promise<any> | null
  private _changed!: Set<keyof Preset> //sequelize key

  private saveIt(){
    if (this._savePromise) return this;

    this._savePromise = this.save().then(() => this._savePromise = null);
    
    return this
  }

  addPointsToListen(...points: (number | string)[]){
    const intPoints = points.map(e => {
      if (typeof e === 'string') e = +e
      if (! isNaN(e)) return e;
      throw BotError.cannotParseInt()
    })
    
    intPoints.forEach(e => ! this.pointsToListen.includes(e) && this.pointsToListen.push(e));
    
    this._changed.add('pointsToListen')
    this.saveIt();

    return this
  }


  removePointsToListen(...points: (number | string)[]){
    const intPoints = points.map(e => {
      if (typeof e === 'string') e = +e
      if (! isNaN(e)) return e;
      throw BotError.cannotParseInt()
    })
    
    intPoints.forEach(e => this.pointsToListen = this.pointsToListen.filter(x => x === e));
    
    this._changed.add('pointsToListen')
    this.saveIt();

    return this
  }
}