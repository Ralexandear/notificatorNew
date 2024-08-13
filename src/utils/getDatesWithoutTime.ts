export function getDatesWithoutTime(...date: Date[]) {
  return date.map(e => new Date(e.getFullYear(), e.getMonth(), e.getDate()))
}

export default getDatesWithoutTime