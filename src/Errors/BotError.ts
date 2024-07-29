export class BotError extends Error {
  static requiredParameterIsMissing () {
    return new BotError('One of required parameters is missing')
  }

  static cannotParseInt(data: string = 'data'){
    return new BotError(`Can not parse "${data}" to int`)
  }
}

export default BotError