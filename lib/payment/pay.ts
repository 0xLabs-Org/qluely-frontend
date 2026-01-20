'use client';

export async function pay(amount: number) {
  const res = await fetch('/api/razorpay/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });

  if (!res.ok) {
    throw new Error('Failed to create order');
  }

  const order = await res.json();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: 'Your App Name',
    description: 'Plan purchase',
    handler: async (response: any) => {
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });

      if (!verifyRes.ok) {
        throw new Error('Payment verification failed');
      }
    },
    theme: { color: '#000000' },
  };

  const Razorpay = (window as any).Razorpay;
  const rzp = new Razorpay(options);
  rzp.open();
}
