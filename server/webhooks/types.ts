type TWebhookEvents = 'validation.webhook' | 'payment.completed';

type TWebhookPaymentSubject = {
  transaction_id: string;
  status: {
    id: number;
    description: string;
  };
  payment_sequence: string;
  created_at: string;
  price: {
    amount: number;
    currency: string;
  };
  price_paid: {
    amount: number;
    currency: string;
  };
  payment_method: {
    name: string;
    refundable: boolean;
  };
  fees: {
    tax: {
      amount: number;
      currency: string;
    };
    gateway: {
      amount: number;
      currency: string;
    };
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    ip: string;
    username: {
      id: string;
      username: string;
    };
    marketing_consent: false;
    country: string;
    postal_code: string;
  };
  products: {
    id: number;
    name: string;
    quantity: number;
    base_price: {
      amount: number;
      currency: string;
    };
    paid_price: {
      amount: number;
      currency: string;
    };
    variables: [
      {
        discord_id: string | undefined;
      },
    ];
    expires_at: string;
    username: {
      id: string;
      username: string;
    };
  }[];
  coupons: [];
  gift_cards: [];
  recurring_payment_reference: null;
  revenue_share: [];
  custom: {
    basketLink: string | undefined;
  };
  decline_reason: null;
};

export type TWebhookData = {
  id: string;
  type: TWebhookEvents;
  date: string;
  subject: TWebhookPaymentSubject;
};
