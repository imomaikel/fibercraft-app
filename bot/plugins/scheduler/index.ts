import { _scheduleWipeTimeReset } from './wipe';
import { hoursToMilliseconds } from 'date-fns';

const scheduleEvents = () => {
  // Wipe time reset
  setInterval(() => {
    _scheduleWipeTimeReset();
  }, hoursToMilliseconds(1));
};

export default scheduleEvents;
