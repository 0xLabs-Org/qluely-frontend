export type EventPayload = {
  'email.send': { to: string; type: 'LOGIN' | 'REGISTER'; ideompotencyKey: string };
  'credit.update': { userId: string; credits: number; ideompotencyKey: string };
};
export type EventMap = {
  'email.send': EventPayload['email.send'];
  'credit.update': EventPayload['credit.update'];
};
