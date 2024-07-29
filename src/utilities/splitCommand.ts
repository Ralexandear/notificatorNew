import { Delimiter } from "../config"

export default function splitCommand(callbackData: string){
    const [action, ...params] = callbackData.split( Delimiter )
    return {action, params}
  }