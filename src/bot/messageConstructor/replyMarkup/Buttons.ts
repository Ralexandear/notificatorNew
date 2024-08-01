import Config from '../../Config';

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
    return new Buttons(text, { callback_data })
  }

  static selectButton(text: string = '', ...params: (string | number)[]){
    const callback_data = ['slct', ...params].join(Config.delimiter)
    return new Buttons(text, { callback_data })
  }

  static backButton(text = '↪️ Назад', ...params: (string | number)[]) {
    const callback_data = ['bck', ...params].join(Config.delimiter)
    return new Buttons(text, { callback_data })
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

  static acceptOrder( ...orderId: (number | string)[] ){
    const text = '✅ Взять в работу'
    const callback_data = ['acceptOrder', ...orderId].join(Config.delimiter)
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

  static activate (text= '🔊 Активировать', ...params: (string | number)[]) {
    const callback_data = ['actvt', ...params].join(Config.delimiter)
    return {text, callback_data}
  }

  static deactivate (text = '🔇 Выключить', ...params: (string | number)[]) {
    const callback_data = ['dctvt', ...params].join(Config.delimiter)
    return {text, callback_data}
  }

  static setForce(...params: (string | number)[]){
    const text = '🗿 Принудительно перезаписать'
    const callback_data = ['setForce', ...params].join(Config.delimiter)
    return {text, callback_data}
  }


}