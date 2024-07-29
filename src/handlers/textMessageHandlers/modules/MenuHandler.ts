import TelegramBot from "node-telegram-bot-api"
import { User } from "../../../database/models"
import Buttons from "../../../messageConstructor/replyMarkup/Buttons";
import { MessageConstructor } from "../../../messageConstructor/MessageConstructor";
import Bot from "../../..";


export async function MenuHandler (user: User, message: TelegramBot.Message){
  console.log(MenuHandler.name, user.name)
  
  const messageText = message.text;
  if (! messageText) return

  const messageConstructor = MessageConstructor.menu()

  if (messageText === Buttons.status().text) {
    return
    // const points = []
    // const postfix = ['', '.1']

    // console.log('Проверяем занятые точки')
    // for (let [point, data] of allPoints.data){
    //   ['morning', 'evening'].forEach((type, el) => {
    //     if (data[type] === id) points.add(point + postfix[el])
    //   })
    // }

    // let text = new Date().toLocaleDateString('ru', {weekday: "long", month: "short", day: "numeric", year: 'numeric'})
    //   + '\n\nТочки на сегодня:\n' + (points.join(', ') || '❌ Точки не найдены' )

    // try{
    //   console.log('Deleting previous inline message')
    //   if (user.lastInlineMessageId) await bot.editMessageReplyMarkup(null, {chat_id: id, message_id: user.lastInlineMessageId})
    // }
    // finally{
    //   console.log('Sending status message is ready')
    //   return bot.sendMessage(id, text)
    //     .then(() =>  console.log('Status message was send successfully'))
    //     .catch(err => {
    //       console.error(err, 'An error occured while sending status message')
    //     })
    // }
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