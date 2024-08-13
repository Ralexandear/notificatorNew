export class ValidationError extends Error {
  constructor(message: string){
    super(message)
  }

  static lengthAboveZero(){
    return new ValidationError('Min length must be above zero!')
  }

  static validationFailed(...text: string[]) {
    const message = 'Validation failed!'
    return new ValidationError(text.length ? message + ' ' + text.join(', ') + ';' : message)
  }

  static valueIsEmpty(){
    return new ValidationError('Presented value is empty')
  }

  static unexpectedLength (length: number) {
    return new ValidationError('Unexpected length ' + length)
  }

  
}

export default ValidationError

