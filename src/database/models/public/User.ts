import TelegramBot, { AnswerCallbackQueryOptions } from "node-telegram-bot-api";
import { UserAttributes } from "../../../interfaces/User.attributes";
import { ProgramType } from "../../../types/Program.type";
import { UserStatusType } from "../../../types/UserStatus.type";
import { UserModel } from "../sequelize/User.model";
import { IncapsulationModel } from "./IncapsulationModel";
import Bot from "../../../bot";
import TelegramQueue from "../../../controllers/TelegramQueue";
import { MessageConstructor } from "../../../bot/messageConstructor/MessageConstructor";


export class User extends IncapsulationModel<UserModel> implements UserAttributes {
  static init(model: UserModel) {
    return new this(model)
  }

  private constructor(protected model: UserModel) {
    super(model)
  }
  
  
  

  get id() {
    return this.model.id
  }

  get telegramId() {
    return this.model.telegramId
  }

  get messageId() {
    return this.model.messageId
  }

  set messageId(messageId: number | null) {
    this.model.messageId = messageId
  }

  get presetStatus() {
    return this.model.presetStatus
  }

  set presetStatus(presetStatus: boolean) {
    this.model.presetStatus = presetStatus
  }

  get status() {
    return this.model.status
  }

  set status(status: UserStatusType) {
    this.model.status = status
  }

  get program() {
    return this.model.program
  }

  set program(program: ProgramType) {
    this.model.program = program
  }

  get fullName() {
    return this.model.fullName
  }

  get username() {
    return this.model.username
  }

  set username(username: string) {
    this.model.username = username
  } 

  checkUsername(username: string) {
    if (username !== this.model.username) this.username = username
  }

  
  openMenu(messageText?: string){
    console.log(`Открытие меню для пользователя`, this.fullName, this.id)
    const {text, reply_markup} = MessageConstructor.menu().mainMenu()
    this.sendMessage(messageText || text, {reply_markup})
    return this
  }


  /** TELEGRAM METHODS */
  async sendMessage(text: string, messageOptions: TelegramBot.SendMessageOptions = {}, saveMessageId = false){
    messageOptions.parse_mode ??= 'HTML';
    messageOptions.disable_web_page_preview ??= undefined
    
    return Bot.sendMessage(this.telegramId, text, messageOptions)
      .then(message => {
        if (saveMessageId) this.messageId = message.message_id
        return message
      })
  }

  async deletePreviousInlineMessage () {
    if (! this.messageId) return this
    //@ts-ignore
    return Bot.editMessageReplyMarkup( null, {chat_id: this.telegramId, message_id:  this.messageId, }).finally(() => this.messageId = null)
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
    
    TelegramQueue.add(job);
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

  // preset() {
  //   const activate = () => this.presetStatus = true
  //   const deactivate = () => this.presetStatus = false
  //   const findAll = () => PresetController.getUserPresets(this.id)
  //   const getPointPreset = (pointId: number) => PresetController.getPointPreset(this.id, pointId)

  //   return {
  //     activate, deactivate, findAll, getPointPreset
  //   }
  // }



}


