import messageDelete from './message-delete';
import memberUpdate from './member-update';
import interaction from './interaction';
import { Event } from '../utils/events';
import reaction from './reaction';
import message from './message';
import ready from './ready';

// Export all events
export default [ready, message, reaction, messageDelete, interaction, memberUpdate] as Event[];
