import { onMemberBoostEnd, onMemberBoostStart } from '../plugins/boost';
import { event } from '../utils/events';

export default event('guildMemberUpdate', async (client, oldMember, newMember) => {
  const oldStatus = oldMember.premiumSince;
  const newStatus = newMember.premiumSince;

  if (!oldStatus && newStatus) {
    await onMemberBoostStart({ member: newMember });
    return;
  }

  if (oldStatus && !newStatus) {
    await onMemberBoostEnd({ member: newMember });
    return;
  }
});
