import Config from "../config"

export default function splitCommand(callbackData: string){
    const [action, ...params] = callbackData.split( Config.delimiter )
    return {action, params}
  }