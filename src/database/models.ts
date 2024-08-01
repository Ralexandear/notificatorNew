import * as Interfaces from "../bot/interfaces/databaseInterfaces"

import { Model } from "sequelize";
import { ProgramsType } from "../bot/types/Programs";
import TelegramBot from "node-telegram-bot-api";
import { Bot, log } from "../bot/main";
import TelegramQueue, { TelegramQueueOptions } from "../controllers/TelegramQueue";
import { ListenersType } from "../bot/types/ListenersType";
import { ShiftSelectorType, ShiftType } from "../bot/types/ShiftType";
import UserController from "../controllers/databaseControllers/UserController";
import RedisController from "../controllers/RedisController";
import { MessageConstructor } from "../bot/messageConstructor/MessageConstructor";
import { TempType } from "../bot/types/TempType";
import { PostfixEnum } from "../bot/enums/PostfixEnum";
import { Log } from "../bot/utilities/Log";
import PresetController from "../controllers/databaseControllers/PresetController";
import BotError from "../bot/Errors/BotError";
import { UserStatusEnum } from "../bot/enums/UserStatusEnum";
import PointsController from "../controllers/databaseControllers/PointsController";



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

  saveIt(){
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
    return this
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
    options.disable_web_page_preview ??= true
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
        // user.saveIt()
        return user
      },

      deactivate(){
        user.presetIsActive = false
        // user.saveIt()
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
  readonly _listeners!: ListenersType;
  private _savePromise?: Promise<any> | null
  private _changed!: Set<keyof Point> //sequelize key


  private saveIt(){
    if (this._savePromise) return this._savePromise;
    return this._savePromise = this.save().then(() => this._savePromise = null);
  }

  async getUser (shiftType: ShiftType) {
    const userId = this.getUserId( shiftType )
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
      console.log(e)
      this[e] = this[e] === user.id ? null : this[e]
    })
   
    await this.saveIt()
    return true
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
    
    const shiftsArr = ['morning', 'evening'] as ShiftType[];

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

      shiftsArr.forEach(e => this.setUser(e, user))
      const preset = await user.preset().getForPoint(this.id);
      preset.enable(shiftType);

      await this.save();
      return true;
    }

    const courierId = this.getUserId( shiftType );
    
    if (courierId) {
      if (! setForce) return false;
      const postfix = PostfixEnum[ shiftType ];
      notifyUser(courierId, postfix);
    }
    
    await this.setUser(shiftType, user).saveIt();
    return true
  }

  listeners (shiftType: ShiftSelectorType) {
    const shifts: ShiftType[] = shiftType === 'full' ? ['morning', 'evening'] : [ shiftType ];
    const point = this;
    let isChanged = false;
    
    const save = async () => {
      if (! isChanged) return this
      point._changed.add('listeners');
      return point.save();
    }

    return {
      async enable (userId: number) {
        shifts.forEach(e => {
          const listeners = point._listeners[e];
          if (listeners.includes(userId)) return;
          isChanged = true;
          listeners.push(userId);
        })
        return save();
      }, 

      async disable (userId: number) {
        shifts.forEach( e => point._listeners[e] = point._listeners[e].filter(e => e === userId && (isChanged = true)) );
        return save();
      },

      async get () {
        if (shiftType === 'full') {
          log('unexpected shiftType')
          return
        }

        const userIds = point._listeners[ shiftType ]
        if (userIds.length) return await UserController.getByIds( ...userIds )
      }
    }
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


  async addPointsToListen(...pointIds: (number | string)[]){
    const intPoints = pointIds.map(e => {
      if (typeof e === 'string') e = +e
      if (! isNaN(e)) return e;
      throw BotError.cannotParseInt()
    })
    
    intPoints.forEach(e => ! this.pointsToListen.includes(e) && this.pointsToListen.push(e));
    
    const point = await PointsController.find(this.pointId);
    const shiftsArr = ['morning', 'evening'] as ShiftType[];
    const shiftType: ShiftSelectorType | null = shiftsArr.every(e => point.getUserId(e)) && 'full' || shiftsArr.find(e => point.getUserId(e)) || null
    
    if (shiftType) await this.enable(shiftType);

    this._changed.add('pointsToListen')
    await this.save()

    return this
  }


  async removePointsToListen(...pointIds: (number | string)[]){
    const intPoints = pointIds.map(e => {
      if (typeof e === 'string') e = +e
      if (! isNaN(e)) return e;
      throw BotError.cannotParseInt()
    })
    intPoints.forEach(e => this.pointsToListen = this.pointsToListen.filter(x => x !== e));
    
    const point = await PointsController.find(this.pointId);
    const shiftsArr = ['morning', 'evening'] as ShiftType[];
    const shiftType: ShiftSelectorType | null = shiftsArr.every(e => point.getUserId(e)) && 'full' || shiftsArr.find(e => point.getUserId(e)) || null

    if (shiftType) await this.disable(shiftType);

    this._changed.add('pointsToListen')
    await this.save()

    return this
  }


  async enable(shiftType: ShiftSelectorType) {
    if (! this.pointsToListen.length) {
      log(`Can't enable presets for userId: ${this.userId}, pointId: ${this.pointId}, Points to listen not found!`)
      return
    }

    const points = await PointsController.getPoints(...this.pointsToListen);
    const promises = points.map(e => e.listeners(shiftType).enable(this.userId))
    await Promise.all(promises);
    return this
  }

  async disable(shiftType: ShiftSelectorType) {
    const points = await PointsController.getAll();
    const promises = points.map(e => e.listeners(shiftType).disable(this.userId))
    await Promise.all(promises);
    return this
  }


}