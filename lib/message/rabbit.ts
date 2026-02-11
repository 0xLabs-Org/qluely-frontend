import * as amqp from 'amqplib';
import type { Channel, Connection, ConsumeMessage } from 'amqplib';

class RabbitMQ {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    if (this.connection && this.channel) return;

    try {
      console.log('Connecting to RabbitMQ...');

      const channelModel = await amqp.connect(this.url, { heartbeat: 60 }); // ChannelModel
      this.connection = channelModel.connection;
      this.channel = await channelModel.createChannel();

      if (this.connection) {
        this.connection.on('error', (err) => {
          console.error('RabbitMQ connection error:', err);
          this.connection = null;
          this.channel = null;
        });

        this.connection.on('close', () => {
          console.warn('RabbitMQ connection closed. Reconnecting...');
          this.connection = null;
          this.channel = null;
          setTimeout(() => this.connect(), 3000);
        });
      }
      console.log('RabbitMQ connected');
    } catch (error) {
      // Suppress logs in development to avoid spam if service is not running
      if (process.env.NODE_ENV === 'development') {
        console.warn('RabbitMQ connection failed:', (error as Error).message || error);
      } else {
        console.error('RabbitMQ connection failed. Retrying...');
      }
      setTimeout(() => this.connect(), 5000);
    }
  }

  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect();
    }
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }
    return this.channel;
  }

  async publish(queue: string, message: object) {
    const channel = await this.getChannel();

    await channel.assertQueue(queue, { durable: true });

    const payload = Buffer.from(
      JSON.stringify({
        ...message,
        _meta: {
          sentAt: new Date().toISOString(),
        },
      }),
    );

    const ok = channel.sendToQueue(queue, payload, {
      persistent: true,
      contentType: 'application/json',
    });

    if (!ok) {
      console.warn(`RabbitMQ backpressure on queue: ${queue}`);
    }
  }
  async consumeBatch(
    queue: string,
    handler: (msg: import('amqplib').GetMessage, channel: Channel) => Promise<void>,
    maxMessages = 10,
  ) {
    const channel = await this.getChannel();

    await channel.assertQueue(queue, { durable: true });

    for (let i = 0; i < maxMessages; i++) {
      const msg = await channel.get(queue, { noAck: false });

      if (!msg) {
        console.log('No more messages in queue');
        break;
      }

      try {
        await handler(msg, channel);
        channel.ack(msg);
      } catch (err) {
        console.error('Message processing failed:', err);
        channel.nack(msg, false, true);
      }
    }
  }

  async consume(queue: string, handler: (msg: ConsumeMessage, channel: Channel) => Promise<void>) {
    const channel = await this.getChannel();

    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        await handler(msg, channel);
        channel.ack(msg);
      } catch (err) {
        console.error('Message processing failed:', err);
        channel.nack(msg, false, true);
      }
    });
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    // Connection is closed when channel is closed
    this.connection = null;
  }
}

export const rabbit = new RabbitMQ(process.env.RABBITMQ_URL!);
