class FormatterClass {
  date() {
    const getDateWithoutTime = (date: Date) => getDatesWithoutTime(date)[0]
    const getDatesWithoutTime = (...dates: Date[]) => dates.map(e => new Date(e.getFullYear(), e.getMonth(), e.getDate()))

    return {
      getDateWithoutTime, getDatesWithoutTime
    }
  }
}

export const Formatter = new FormatterClass();
export default Formatter