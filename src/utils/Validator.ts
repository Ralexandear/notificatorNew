import ValidationError from "../errors/ValidationError";
import { PrimitiveType } from "../types/primitiveType";
import getDateWithoutTime from "./getDatesWithoutTime";

class ValidatorClass {
  private error: typeof ValidationError
  
  constructor () {
    this.error = ValidationError
  }
  


  checkType(typeExpected: PrimitiveType, data: any) {
    const currentType = typeof data
    
    if (currentType === typeExpected) {
      if (currentType !== 'object') return data
      else if (data instanceof Date && ! isNaN(data.getTime())) return data
    }
    throw new TypeError(`Expected type of data is '${typeExpected}', but recieved ${currentType}. Data: ${data}`)
  }



  string(data: any) {
    const text = this.checkType('string', data) as string; //if void then value is string

    const isNotEmpty = () => Boolean(text.length)
    const isEqualTo =(text: string) => text === text
    const isInList = (...strings: string[]) => strings.includes(text)

    const length = (min: number, max?: number) => {
      if (! this.number(min).isPositive()) {
        throw this.error.lengthAboveZero();
      }

      return max ? Validator.number(text.length).isBetween(min, max) : Validator.number(text.length).isBiggerThan(min)
    }
    
    return {
      isNotEmpty, isEqualTo, isInList, length
    }
  }

  number(data: any) {
    const integer = this.checkType('number', data) as number;

    const isPositive = () => integer > 0;
    const isZero = () => integer === 0;
    const isNegative = () => integer < 0
    const isBiggerThan = (numberForComparison: number) => integer > numberForComparison
    const isEqualTo = (numberForComparison: number) => integer === numberForComparison
    const isBetween = (min: number, max: number) => {
      if (this.number(max).isBiggerThan(min)) return integer >= min && integer <= max
      throw new this.error(`Parameter 'maximum' must be above zero, but it is not. Min value: ${min}, max val: ${max}`)
    }
    
    return {
      isPositive, isZero, isNegative, isBiggerThan, isEqualTo, isBetween
    }
  }

  date(data: any) {
    const date = this.checkType('object', data) as Date;
    
    const comparison = (dateForComparison: Date, strict = false) => {
      const formattedDates = (() => {
        const dates = [date, dateForComparison];
        return strict ? dates : getDateWithoutTime(...dates)
      })();

      const [timestamp, timestampToCompare] = formattedDates.map(e => e.getTime())



      const isBiggerThan = () => timestamp - timestampToCompare > 0
      const isLowerThan = () => timestamp - timestampToCompare < 0
      const isEqualTo = () => timestamp === timestampToCompare

      return {
        isBiggerThan, isLowerThan, isEqualTo
      }
    }

    const isBetween = (dateFrom: Date, dateTo: Date) => {
      const timestamp = date.getTime()
      return timestamp >= dateFrom.getTime() && timestamp <= dateTo.getTime()
    }

    return {
      comparison, isBetween
    } 
  }

}

export const Validator = new ValidatorClass();
export default Validator