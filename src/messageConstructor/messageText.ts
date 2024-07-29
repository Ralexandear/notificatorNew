// import { User } from "../database/models";

import { Point, User } from "../database/models"
import { PostfixEnum } from "../enums/PostfixEnum"
import { ShiftSelectorType, ShiftType } from "../types/ShiftType"

const getDateString = (date = new Date()) => date.toLocaleDateString('ru', {weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'})
const getUserlink = (user: User) => `<a href="t.me/${user.username}">${user.name}</a>`

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
      },
      
      acception(user: User){
        return `✅ ${getUserlink(user)} принял заказ в работу`
      }
    }
  }

  points () {
    return {
      pointList() {
        return getDateString()
      },

      async pointIsBusy( point: Point, shiftTypeToSelect: ShiftSelectorType ) {
        const textArray = [getDateString(), '']

        const shiftTypes: ShiftType[] = shiftTypeToSelect === 'full' ? ['evening', 'morning'] : [ shiftTypeToSelect ]
        
        for (const shiftType of shiftTypes){
          const user = await point.getUser( shiftType );
          const postfix = PostfixEnum[ shiftType ];
          textArray.push(point.point + postfix + ': ' + (user === undefined ? '🟢' : getUserlink(user)))
        }

        return textArray.join('\n')
      }
    }
  }

  notifications(){
    return {
      pointLost(user: User, point: string){
        return [getUserlink(user), 'принудительно занял точку', point].join(' ')
      }
    }
  }

  presets(selectedPoint: Point) {
    return `Настройки пресетов для точки: ${selectedPoint.point}`
  }

  
}

export const MessageText = new MessageTextClass()
export default MessageText;