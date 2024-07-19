import { Delimiter } from "../../config";


export default class Buttons {
  text: string;
  callback_data?: string;
  url?: string;
  request_contact?: boolean;
  // request_user?: boolean;

  constructor (text: string | number, {callback_data, url}: { callback_data?:string, url?:string } = {}) {
    this.text = text.toString();
    
    if (callback_data || url){
      if (callback_data) this.callback_data = callback_data;
      if (url) this.url = url;
    }
  }

  toKeyboardButton () {
    this.callback_data = undefined;
    this.url = undefined;
    return this;
  }

  requestContact() {
    this.request_contact = true;
    return this
  }

  static textToAdmin(){
    const username = process.env.ADMIN_USERNAME
    if (! username) throw 'Required parameter username is missing'
    const text = '✍️ Написать администратору'
    const url = `t.me/${username}`

    return new Buttons(text, { url })
  }

  static emptyButton(text: string = ' ', callback_data: string = ' '){
    return {text, callback_data}
  }

  static linkToMessage(chatId: number | string, messageId: number | string){
    const text = 'К сообщению 📩'
    const url = `t.me/c/${chatId.toString().substring(4)}/${messageId}`
    return new Buttons(text, { url })
  }

  static navButton ( navLink: string ) {
    const text = '🚗 Навигатор'
    const url = navLink
    return new Buttons(text, {url})
  }

  static acceptOrder( orderId: number | string ){
    const text = '✅ Взять в работу'
    const callback_data = ['acceptOrder', orderId].join(Delimiter)
    return new Buttons(text, {callback_data})
  }

  static selectPoints () {
    const text = '📍 Выбрать точки'
    const callback_data = 'selectPoints'
    return new Buttons(text, {callback_data})
  }

  static status () {
    const text = '❓ Статус'
    const callback_data = 'status'
    return new Buttons(text, {callback_data})
  }

  static presets () {
    const text = '🔧 Пресеты'
    const callback_data = 'presets'
    return new Buttons(text, {callback_data})
  }

  static fullShift () {
    const text = '🚗 Полные смены'
    const callback_data = 'fullShift'
    return new Buttons(text, {callback_data})
  }

  static halfShift () {
    const text = '🚙 Половинки'
    const callback_data = 'halfShift'
    return new Buttons(text, {callback_data})
  }

  static activate () {
    const text = '🔊 Активировать'
    const callback_data = 'activate'
    return {text, callback_data}
  }

  static deactivate () {
    const text = '🔇 Выключить'
    const callback_data = 'deactivate'
    return {text, callback_data}
  }


}