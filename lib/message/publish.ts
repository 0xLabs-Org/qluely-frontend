import { rabbit } from './rabbit';
import { EventMap } from './types';

export async function publishEvent<K extends keyof EventMap>(queue: K, payload: EventMap[K]) {
  return publishToQueue(queue, payload);
}

/**
 * Generic queue producer
 */
export async function publishToQueue<T extends object>(queueName: string, payload: T) {
  try {
    await rabbit.connect();
    await rabbit.publish(queueName, payload);
  } catch (error) {
    console.error('Failed to publish message to queue:', queueName, error);
    // Optionally rethrow or handle as needed
  }
}
