import prisma from '../../bot/lib/prisma';
import type { Response } from 'express';
import { TWebhookData } from './types';

type THandleWebhookEvent = {
  data: TWebhookData;
  res: Response;
};
const handleWebhookEvent = async ({ data, res }: THandleWebhookEvent) => {
  try {
    if (data.type === 'payment.completed') {
      const basketLinkId = data.subject.custom.basketLink;
      if (!basketLinkId) return res.status(500).send('Missing Basket Link ID');

      const ident = (
        await prisma.basketLink.findUnique({
          where: { linkId: basketLinkId },
        })
      )?.ident;
      if (!ident) return res.status(500).send('Invalid Basket Link ID');

      const updatedBasket = await prisma.previousBasket.update({
        where: {
          ident,
        },
        data: {
          completed: true,
          transactionId: data.subject.transaction_id,
          pricePaid: data.subject.price_paid.amount,
          tax: data.subject.fees.tax.amount,
          username: data.subject.products[0].username.username,
          usernameId: data.subject.products[0].username.id,
          products: {
            createMany: {
              data: data.subject.products.map((product) => ({
                name: product.name,
                price: product.paid_price.amount,
                productId: product.id,
                quantity: product.quantity,
              })),
            },
          },
        },
      });
      await prisma.basketLink.delete({
        where: { ident },
      });
      if (data.subject.price_paid.amount) {
        await prisma.user.update({
          where: { id: updatedBasket.userId },
          data: {
            totalPaid: {
              increment: data.subject.price_paid.amount,
            },
          },
        });
      }

      return res.status(200).send('Payment received');
    } else {
      res.status(500).send('Unknown data type');
    }
  } catch (error) {
    console.log('Webhook event error', error);
    res.status(500).send('Server error (catch)');
  }
};

export default handleWebhookEvent;
