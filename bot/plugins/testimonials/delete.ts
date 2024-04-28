import prisma from '../../lib/prisma';

type TOnTestimonialMessageDelete = {
  messageId: string;
};
export const _onTestimonialMessageDelete = async ({ messageId }: TOnTestimonialMessageDelete) => {
  try {
    await prisma.testimonial.delete({
      where: {
        messageId,
      },
    });
  } catch {}
};
