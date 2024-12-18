import path from 'path';
import fs from 'fs';
import ConfigAttributes from '../interfaces/configInterface';
import Validator from './Validator';
import ValidationError from '../errors/ValidationError';

// Определяем путь к файлу конфигурации
const fileDir = path.resolve(__dirname, '../../config.json');

class ConfigClass {
  private _config: ConfigAttributes

  constructor() {
    // Загружаем конфигурацию при инициализации
    this._config = this.loadConfig();
  }

  // Метод для загрузки конфигурации
  private loadConfig() {
    try {
      const configFile = fs.readFileSync(fileDir, 'utf-8');
      return JSON.parse(configFile); // Парсим JSON из файла
    } catch (error) {
      console.log('❗️Error of loading configuration:', error);
      throw error
    }
  }

  // Метод для получения значения по ключу
  private get(key: keyof ConfigAttributes) {
    return this._config[key];
  }

  // Метод для обновления значения и сохранения файла
  private set(key: keyof ConfigAttributes, value: any) {
    this._config[key] = value;
    this.saveConfig();
  }

  // Метод для сохранения конфигурации в файл
  private saveConfig() {
    try {
      fs.writeFileSync(fileDir, JSON.stringify(this._config, null, 2), 'utf-8');
      console.log('Config updated')
    } catch (error) {
      console.log('❗️Error of saving configuration:', error);
    }
  }

  get enabledPoints() {
    return new Set( this._config.enabledPoints )
  }

  get delimiter() {
    return this._config.delimiter
  }

  get updatingTime() {
    return this._config.updatingTime
  }

  setUpdatingTime(hours: number, minutes: number) {
    if (! ( Validator.number(hours).isHours() && Validator.number(minutes).isMinutes() ) ) {
      throw new ValidationError('Time validation error!')
    }
    this.set('updatingTime', { hours, minutes })
    // CronCleanPoints.updateTimer(hours, minutes)
  }

  get lastShiftClearing() {
    const lastShiftClearingString = this._config.lastShiftClearingDateString;
    return lastShiftClearingString ? new Date( lastShiftClearingString ) : null
  }

  setLastShiftClearing(date = new Date()){
    this.set('lastShiftClearingDateString', date.toISOString())
  }
}

// Экспортируем экземпляр класса
export const Config = new ConfigClass();
console.log(Config, 1)

export default Config;