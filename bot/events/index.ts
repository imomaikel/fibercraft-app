import reactionRemove from './reaction-remove';
import messageDelete from './message-delete';
import memberUpdate from './member-update';
import reactionAdd from './reaction-add';
import interaction from './interaction';
import { Event } from '../utils/events';
import message from './message';
import ready from './ready';

// Export all events
export default [ready, message, reactionAdd, reactionRemove, messageDelete, interaction, memberUpdate] as Event[];
