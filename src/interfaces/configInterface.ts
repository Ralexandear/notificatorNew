export default interface ConfigAttributes {
  delimiter: string;
  enabledPoints: number[];
  updatingTime: {
    hours: number;
    minutes: number;
  },
  lastShiftClearingDateString: string;
}