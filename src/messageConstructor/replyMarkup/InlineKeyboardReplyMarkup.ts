import TelegramBot from "node-telegram-bot-api";
import Buttons from "./Buttons";
import { User } from "../../database/models";
import PointsController from "../../controllers/PointsController";
import { Delimiter, Icons } from "../../config";



type InlineKeyboardRow = TelegramBot.InlineKeyboardButton[];
const maxRowWidth = 4


export class InlineKeyboardReplyMarkup implements TelegramBot.InlineKeyboardMarkup {
  inline_keyboard: TelegramBot.InlineKeyboardButton[][];

  constructor(columns: number, ...buttons: InlineKeyboardRow) {
    const row: InlineKeyboardRow = [];
    this.inline_keyboard = buttons.reduce((arr: InlineKeyboardRow[], button, index) => {
      row.push(button);
      if ((index + 1) % columns === 0 || index === buttons.length - 1) {
        arr.push([...row]);
        row.length = 0;
      }
      return arr;
    }, []);
    if (row.length) this.inline_keyboard.push(row);
  }

  static welcomeMessage(){
    return new InlineKeyboardReplyMarkup(1, Buttons.textToAdmin())
  }

  static errors(){
    return {
      authorizationError(){
        return new InlineKeyboardReplyMarkup(1, Buttons.textToAdmin())
      }
    }
  }

  static orders(chatId: number | string, messageId: number | string) {
    return {
      mainMessage({navLink, orderId} : {navLink?: string, orderId?: string | number} = {}) {
        const buttons: Buttons[] = [];

        if ( navLink ) buttons.push( Buttons.navButton( navLink ) )
        buttons.push( Buttons.linkToMessage( chatId, messageId ))
    
        const reply_markup = new InlineKeyboardReplyMarkup(2, ...buttons);
        if ( orderId ) reply_markup.inline_keyboard.unshift([ Buttons.acceptOrder( orderId )])
        return reply_markup
      },

      listenerMessage(){
        return new InlineKeyboardReplyMarkup(1, Buttons.linkToMessage( chatId, messageId ))
      }
    }
  }

  static menu() {
    return {
      selectPoints(){
        return new InlineKeyboardReplyMarkup(1, Buttons.fullShift(), Buttons.halfShift())
      },

      async presets(user: User) {
        if (! user.presetsIsActive) return new InlineKeyboardReplyMarkup(1, Buttons.activate());
        
        const points = await PointsController.getAll()
        const icon = Icons.redPin
        const buttons = (points.map(point => Buttons.emptyButton([icon, point.point].join(' '), [icon, point.id].join( Delimiter ))))
        const reply_markup = new InlineKeyboardReplyMarkup(maxRowWidth, ...buttons);
        reply_markup.inline_keyboard.unshift( [ Buttons.deactivate() ] )
        
        return reply_markup
      }
    }
  }




}

