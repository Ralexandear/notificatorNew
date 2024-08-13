import TelegramBot, { InlineKeyboardMarkup } from "node-telegram-bot-api"
import { User } from "../../../../database/models"
import Buttons from "../../../messageConstructor/replyMarkup/Buttons";
import { MessageConstructor } from "../../../messageConstructor/MessageConstructor";
import Bot from "../../..";


export async function MenuHandler (user: User, message: TelegramBot.Message){
  console.log(MenuHandler.name, user.name)
  
  const messageText = message.text;
  if (! messageText) return

  const messageConstructor = MessageConstructor.menu()

  if (messageText === Buttons.status().text) {
    var {text, reply_markup} = await messageConstructor.status(user) as unknown as {text: string, reply_markup: InlineKeyboardMarkup}
  } else if ( messageText === Buttons.presets().text ){
    var {text, reply_markup} = await messageConstructor.presets( user )
    user.setProgram('presets')
  } else if (messageText === Buttons.selectPoints().text){
    var {text, reply_markup} = messageConstructor.selectPoints()
    user.setProgram('selectPoints')
  }
  else return

  user.deletePreviousInlineMessage()
  //@ts-ignore
  user.sendMessage(text, {reply_markup}, true)
}


export default MenuHandler;