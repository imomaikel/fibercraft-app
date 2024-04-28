import { onTestimonialMessageDelete } from '../plugins/testimonials';
import { event } from '../utils/events';
import prisma from '../lib/prisma';

export default event('messageDelete', async (client, message) => {
  const guild = message.guild;

  if (!guild) return;

  try {
    const testimonial = await prisma.testimonial.findFirst({
      where: { messageId: message.id },
    });
    if (testimonial) {
      await onTestimonialMessageDelete({ messageId: message.id });
    }
  } catch {}
});
