import { ShiftSelectorType } from "../bot/types/ShiftType";

export const PostfixEnum: {[key in ShiftSelectorType]: string} = Object.freeze(
  {
    morning: '',
    evening: '.1',
    full: '.2'
  }
)