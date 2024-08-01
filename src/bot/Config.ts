import fs from 'fs';
import path from 'path';
import ConfigAttributes from './interfaces/ConfigInterface';

const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse( fs.readFileSync(configPath, 'utf-8') ) as {[key: string]: any};

const {delimiter, enabledPoints, lastShiftClearing} = config;

if ([delimiter, enabledPoints, lastShiftClearing].includes(undefined)) {
  throw new Error("Can not read config.json file, file is corrupt")
}


class ConfigClass implements ConfigAttributes {
	delimiter: string;
	enabledPoints: Set<number>;
	private path: string;
	private lastShiftClearing: Date;

  constructor() {
		this.delimiter = delimiter;
		this.enabledPoints = new Set(enabledPoints);
		this.path = configPath;
		this.lastShiftClearing = new Date(lastShiftClearing || undefined);
	}
}

export const Config = new ConfigClass();
export default Config
