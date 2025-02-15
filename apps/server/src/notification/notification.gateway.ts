import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // 사용자의 소켓 ID 저장
      const userSocketIds = this.userSockets.get(userId) || [];
      this.userSockets.set(userId, [...userSocketIds, client.id]);

      client.data.userId = userId;
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const userSocketIds = this.userSockets.get(userId) || [];
      this.userSockets.set(
        userId,
        userSocketIds.filter(id => id !== client.id)
      );
      
      // 사용자의 모든 소켓이 연결 해제되면 Map에서 제거
      if (this.userSockets.get(userId)?.length === 0) {
        this.userSockets.delete(userId);
      }
    }
    
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // 특정 사용자에게 알림 전송
  sendNotificationToUser(userId: string, notification: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds?.length) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }
} 