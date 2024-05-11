import messageDelete from './message-delete';
import interaction from './interaction';
import { Event } from '../utils/events';
import reaction from './reaction';
import message from './message';
import ready from './ready';

// Export all events
export default [ready, message, reaction, messageDelete, interaction] as Event[];
