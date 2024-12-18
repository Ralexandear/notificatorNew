import TelegramBot, { InlineKeyboardMarkup } from "node-telegram-bot-api"
import Buttons from "../../../messageConstructor/replyMarkup/Buttons";
import { MessageConstructor } from "../../../messageConstructor/MessageConstructor";
import Bot from "../../..";
import { User } from "../../../../database/models/public/User";


export async function MenuHandler (user: User, message: TelegramBot.Message){
  console.log(MenuHandler.name, user.fullName)
  
  const messageText = message.text;
  if (! messageText) return

  const messageConstructor = MessageConstructor.menu()

  if (messageText === Buttons.status().text) {
    var {text, reply_markup} = await messageConstructor.status(user) as unknown as {text: string, reply_markup: InlineKeyboardMarkup}
  } else if ( messageText === Buttons.presets().text ){
    var {text, reply_markup} = await messageConstructor.presets( user )
    user.program = 'presets'
  } else if (messageText === Buttons.selectPoints().text){
    var {text, reply_markup} = messageConstructor.selectPoints()
    user.program = 'selectPoints'
  }
  else return

  user.deletePreviousInlineMessage()
  //@ts-ignore
  user.sendMessage(text, {reply_markup}, true)
}


export default MenuHandler;