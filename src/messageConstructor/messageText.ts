// import { User } from "../database/models";

export class MessageTextClass {
  // private user: User
  
  // constructor( user: User ){
  //   this.user = user
  // };

  welcomeMessage(){
    return `Бот для получения заказов СНК. Для подключения, напишите администратору`
  }

  menu(){
    return {
      mainMenu() {
        return 'Кнопки меню обновлены!'
      },

      presets() {
        return 'Пресеты позволяют получать дополнительные уведомления о заказах выбранных курьеров'
      },

      selectPoints() {
        return 'Какие смены желаете выбрать?'
      }

      
    }
  }

  errors() {
    return {
      usernameIsMissing(){
        return '⚠️ Использование бота невозможно без никнейма.\n🔄Пожалуйста, установите никнейм и повторите попытку!'
      },

      authorizationError() {
        return `❗️Ошибка авторизации\nДля получения дополнительной информации, обратитесь к администратору!`
      }
    }
  }

  orders(specialOrderType: string, messageText: string) {
    return {
      mainMessage(){
        return [specialOrderType, messageText].join('\n\n')
      },

      listenerMessage(pointNum: string | number, deliveryTime?: string){
        let text = `У курьера К${pointNum} новый заказ\n\nТип: ${specialOrderType}`
        if (deliveryTime) text += '\n\nДоставить до: ' + deliveryTime
        return text
      }
    }
  }

  
}

export const MessageText = new MessageTextClass()
export default MessageText;