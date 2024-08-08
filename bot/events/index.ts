import messageDelete from './message-delete';
import reactionAdd from './reaction-add';
import interaction from './interaction';
import { Event } from '../utils/events';
import message from './message';
import ready from './ready';

// Export all events
export default [ready, message, reactionAdd, messageDelete, interaction] as Event[];
