import TelegramBot from "node-telegram-bot-api";
import { botInitializationPromise } from "../..";
import Notificator from "./modules/Notificator";
import UserController from "../../controllers/UserController";
import { User } from "../../database/models";
import { MessageConstructor } from "../../messageConstructor/MessageConstructor";



export async function TextMessageHandler(message: TelegramBot.Message) {
  await botInitializationPromise;
  try{
    console.log(TextMessageHandler.name, message);
    if (message?.chat?.type !== 'private') return Notificator(message);
    const telegramId = message.chat.id.toString()
    const user = await UserController.find( telegramId );
    const messageText = message.text;
      
    if (! user){
      const notUser = User.build({telegramId, _fullName: [message.from?.first_name, message.from?.last_name].join(' ') || 'Неопознанная лама', _username: message.from?.username || ''}, {isNewRecord: false})
      
      if (messageText === '4d348b') {
        if (! notUser.username) {
          const {text} = MessageConstructor.errors().usernameIsMissing()
          notUser.sendMessage(text)
          return
        }
        
        const user = User.build(notUser.dataValues)
        user.openMenu(`Авторизация успешно завершена!`)
        return
      }

      if (messageText === '/start') {
        var {text, reply_markup} = MessageConstructor.welcomeMessage()
        notUser.sendSticker('https://cdn.tlgrm.app/stickers/a02/150/a02150f8-6e7d-4269-aa3b-2097aafc2f32/256/5.webp');
      } else  {
        var {text, reply_markup} = MessageConstructor.errors().authorizationError();
      }

      notUser.sendMessage(text, {reply_markup})
      return
    }

    console.log('Пользователь:', user.name, 'id', user.id, 'Сообщение:', messageText)
 
    if (! user.isActive){
      const {text, reply_markup} = MessageConstructor.errors().authorizationError();
      user.sendMessage(text, {reply_markup})
    }

    if (messageText && ['/start',  '/menu'].includes(messageText)){
      user.openMenu()
      return
    }
    
    await mods.Menu({id, bot, user, messageText});
  }
  catch(e){
    console.error(e)
  }
  finally{
    user?.save()
  }
}