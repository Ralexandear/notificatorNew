import fs from 'fs';
import path from 'path';
import ConfigAttributes from '../interfaces/ConfigInterface';

const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse( fs.readFileSync(configPath, 'utf-8') ) as {[key: string]: any};

const {Delimiter, EnabledPoints} = config as ConfigAttributes;

//@ts-ignore
if ([Delimiter, EnabledPoints].includes(undefined)) {
  throw new Error("Can not read config.json file, file is corrupt")
}

const EnabledPointsSet = new Set(EnabledPoints);

export {Delimiter, EnabledPointsSet}