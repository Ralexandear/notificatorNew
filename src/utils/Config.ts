import path from 'path';
import fs from 'fs';
import ConfigAttributes from '../interfaces/configInterface';

// Определяем путь к файлу конфигурации
const fileDir = path.resolve(__dirname, '../../config.json');

class ConfigClass {
  _config: ConfigAttributes

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
      console.log('❗️Ошибка загрузки конфигурации:', error);
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
    } catch (error) {
      console.log('❗️Ошибка сохранения конфигурации:', error);
    }
  }

  get enabledPoints() {
    return new Set( this._config.enabledPoints )
  }

  get delimiter() {
    return this._config.delimiter
  }
}

// Экспортируем экземпляр класса
export const Config = new ConfigClass();
export default Config;