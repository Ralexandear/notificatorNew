import TelegramBot from "node-telegram-bot-api";
import { botInitializationPromise } from "../..";
import UserController from "../../../controllers/databaseControllers/UserController";
import splitCommand from "../../utilities/splitCommand";
import Buttons from "../../messageConstructor/replyMarkup/Buttons";
import { MessageConstructor } from "../../messageConstructor/MessageConstructor";
import { AcceptOrderHandler } from "./modules/AcceptOrderHandler";
import { SelectPointsHandler } from "./modules/SelectPointsHandler";
import PresetHandler from "./modules/PresetHandler";
import { User } from "../../../database/models/public/User";

export async function CallbackQueryHandler (callback: TelegramBot.CallbackQuery) {
  try{
    await botInitializationPromise;
    console.log('new callback', callback)

    const telegramId = callback.from.id.toString()
    const user = await UserController.find( telegramId );

    if (! user) return
    
    const username = callback.from.username;
    if (! username){
      const {text, reply_markup} = MessageConstructor.errors().usernameIsMissing();
      user.sendMessage(text, {reply_markup})
      console.log('Username is missing, callbackId', callback.id)
      return
    }
    
    user.checkUsername( username );
    if (! callback.data) return

    const {action} = splitCommand( callback.data )
    console.log(CallbackQueryHandler.name, 'Пользователь:', user.fullName, 'id', user.id, 'комманда:', action)
    
    
    if (action === Buttons.acceptOrder().callback_data) {
      AcceptOrderHandler(user, callback)
      return
    }
    //@ts-ignore Ошибка в библиотеке note-telegram-bot-api
    user.answerCallbackQuery(callback.id, {cache_time: 2});

    // if (user.messageId !== callback.message?.message_id) {
    //   console.log('Inline message id !== user.messageId, work stopped')
    //   return
    // }

    let handler: (user: User, callback: TelegramBot.CallbackQuery) => Promise<any>;
    
    if (user.program === 'selectPoints') handler = SelectPointsHandler
    else if (user.program === 'presets') handler = PresetHandler
    else {
      console.log('Unhandled user program:', user.program)
      return
    }
    
    console.log('Selected callback handler', handler.name, 'callbackId:', callback.id);
    await handler(user, callback)
  } catch (e) {
    console.log('Catched error', e)
  }
}