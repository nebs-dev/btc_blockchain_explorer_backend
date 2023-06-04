import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { EventsSubscribeDto } from './types/events-subscribe.dto';
import config from 'src/config/config';

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private blockCypherSocket: WebSocket;

  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('Initialized');
    this.blockCypherSocket = new WebSocket(
      `${config().blockcypher.socketUrl}?token=${config().blockcypher.apiKey}`,
    );

    this.blockCypherSocket.on('open', () => {
      // console.log('WebSocket connection established with BlockCypher');
      // this.blockCypherSocket.send(JSON.stringify({ event: 'ping' }));
    });

    this.blockCypherSocket.on('message', (message) => {
      const notification = JSON.parse(message.toString('utf8'));

      console.log('Received message:', notification);
      console.log('SENDING NOTIFICATION TO CLIENTS');
      this.server.emit('push_notification', notification);
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log(`Client Disconnected: ${client.id}`);
  }

  async handleConnection(client: WebSocket) {
    this.server.emit(
      'push_notification',
      'Welcome to the API Socket Server 🚀',
    );
    console.log(`Client Connected: ${client.id}`);
  }

  subscribeToTransactionOrAddress(data: EventsSubscribeDto) {
    console.log('SUBSCRIBING TO TRANSACTION: ', data.hash);
    console.log('SUBSCRIBING TO ADDRESS: ', data.address);

    // Send a subscription request to the BlockCypher WebSocket API
    this.blockCypherSocket.send(
      JSON.stringify({
        event: 'tx-confirmation',
        hash: data.hash,
        address: data.address,
      }),
    );
  }
}
