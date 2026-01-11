import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket Gateway for real-time vehicle updates
 * 
 * Events emitted:
 * - 'vehicle:approved' - When a vehicle is approved by admin
 * - 'vehicle:rejected' - When a vehicle is rejected by admin
 * - 'vehicle:created' - When a new vehicle is created
 * - 'vehicle:updated' - When a vehicle is updated
 * - 'vehicle:deleted' - When a vehicle is deleted
 * - 'vehicle:sold' - When a vehicle is marked as sold
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/vehicles',
})
export class VehiclesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VehiclesGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`📱 Client connected: ${client.id} (Total: ${this.connectedClients.size})`);
    
    // Send welcome message
    client.emit('connected', {
      message: 'Connected to Vehicle Marketplace real-time updates',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`📴 Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  /**
   * Emit event when a vehicle is approved
   */
  emitVehicleApproved(vehicle: any) {
    this.logger.log(`🚗 Broadcasting vehicle approved: ${vehicle.id} - ${vehicle.title}`);
    this.server.emit('vehicle:approved', {
      event: 'vehicle:approved',
      data: vehicle,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event when a vehicle is rejected
   */
  emitVehicleRejected(vehicleId: number, reason?: string) {
    this.logger.log(`❌ Broadcasting vehicle rejected: ${vehicleId}`);
    this.server.emit('vehicle:rejected', {
      event: 'vehicle:rejected',
      data: { vehicleId, reason },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event when a new vehicle is created
   */
  emitVehicleCreated(vehicle: any) {
    this.logger.log(`🆕 Broadcasting new vehicle created: ${vehicle.id}`);
    this.server.emit('vehicle:created', {
      event: 'vehicle:created',
      data: vehicle,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event when a vehicle is updated
   */
  emitVehicleUpdated(vehicle: any) {
    this.logger.log(`✏️ Broadcasting vehicle updated: ${vehicle.id}`);
    this.server.emit('vehicle:updated', {
      event: 'vehicle:updated',
      data: vehicle,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event when a vehicle is deleted
   */
  emitVehicleDeleted(vehicleId: number) {
    this.logger.log(`🗑️ Broadcasting vehicle deleted: ${vehicleId}`);
    this.server.emit('vehicle:deleted', {
      event: 'vehicle:deleted',
      data: { vehicleId },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event when a vehicle is marked as sold
   */
  emitVehicleSold(vehicle: any) {
    this.logger.log(`💰 Broadcasting vehicle sold: ${vehicle.id}`);
    this.server.emit('vehicle:sold', {
      event: 'vehicle:sold',
      data: vehicle,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle ping from client to keep connection alive
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
