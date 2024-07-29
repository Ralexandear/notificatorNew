import { ShiftSelectorType } from "../types/ShiftType";

export const PostfixEnum: {[key in ShiftSelectorType]: string} = Object.freeze(
  {
    morning: '',
    evening: '.1',
    full: '.2'
  }
)