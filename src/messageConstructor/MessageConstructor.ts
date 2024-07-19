import TelegramBot from "node-telegram-bot-api";
import { User } from "../database/models"
import MessageText from "./messageText"
import { InlineKeyboardReplyMarkup } from "./replyMarkup/InlineKeyboardReplyMarkup";
import ReplyKeyboardMarkup from "./replyMarkup/ReplyKeyboardMarkup";


export class MessageConstructor {
  text: string;
  reply_markup: InlineKeyboardReplyMarkup | undefined

  constructor(text: string, reply_markup?: InlineKeyboardReplyMarkup) {
    this.text = text
    this.reply_markup = reply_markup
  }

  static welcomeMessage(){
    const text = MessageText.welcomeMessage()
    const reply_markup = InlineKeyboardReplyMarkup.welcomeMessage()
    
    return {text, reply_markup}
  }

  static menu(){
    const messageText = MessageText.menu()
    const replyMarkup = InlineKeyboardReplyMarkup.menu()

    return {
      mainMenu(){
        const text = messageText.mainMenu()
        const reply_markup = ReplyKeyboardMarkup.menu()
        return {text, reply_markup}
      },

      selectPoints(){
        const text = messageText.selectPoints()
        const reply_markup = replyMarkup.selectPoints()
        return {text, reply_markup}
      },

      async presets (user: User) {
        const text = messageText.presets()
        const reply_markup = await replyMarkup.presets(user)
        return {text, reply_markup}
      }
      
    }
  }

  static errors(){
    const messageText = MessageText.errors()
    const replyMarkup = InlineKeyboardReplyMarkup.errors()
    return {
      usernameIsMissing () {
        const text = messageText.usernameIsMissing()
        return new MessageConstructor(text)
      },

      authorizationError() {
        const text = messageText.authorizationError()
        const reply_markup =  replyMarkup.authorizationError()
        return {text, reply_markup}
      }
    }
  }

  static orders(specialOrderType: string, text: string, chatId: string | number, messageId: string | number){
    const messageText = MessageText.orders(specialOrderType, text);
    const inlineMarkup = InlineKeyboardReplyMarkup.orders(chatId, messageId)

    return {
      mainMessage({navLink, orderId} : {navLink?: string, orderId?: string | number} = {}){
        const text = messageText.mainMessage()
        const reply_markup = inlineMarkup.mainMessage({navLink, orderId})
    
        return {text, reply_markup}
      },

      listenerMessage(pointNum: number | string, deliveryTime?: string) {
        const text = messageText.listenerMessage(pointNum, deliveryTime)
        const reply_markup = inlineMarkup.listenerMessage()

        return {text, reply_markup}
      }
    }
  }

}