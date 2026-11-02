import { OpenAPIObject } from '@nestjs/swagger';

const bearer = [{ bearer: [] }];
const idParam = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'integer' },
});
const ok = (description = 'Success') => ({ '200': { description } });
const json = (schema: object) => ({
  required: true,
  content: { 'application/json': { schema } },
});
const unauthorized = { '401': { description: 'Missing or invalid JWT' } };
const adminOnly = { ...unauthorized, '403': { description: 'Admin role required' } };

export const openApiDocument: OpenAPIObject = {
  openapi: '3.0.3',
  info: {
    title: 'GaariHaat API',
    description: 'Backend for the used car & bike marketplace.',
    version: '1.0.0',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Vehicles' },
    { name: 'Favorites' },
    { name: 'Payments' },
    { name: 'Admin' },
    { name: 'Analytics' },
  ],
  components: {
    securitySchemes: {
      bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      RegisterDto: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      LoginDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      UpdateProfileDto: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          address: { type: 'string' },
          streetNo: { type: 'string' },
          postalCode: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      CreateVehicleDto: {
        type: 'object',
        required: ['title', 'description', 'brand', 'type', 'price'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          brand: { type: 'string' },
          type: { type: 'string', enum: ['car', 'bike'] },
          price: { type: 'number', minimum: 0 },
          images: { type: 'array', items: { type: 'string' }, description: 'URLs returned by POST /vehicles/upload' },
        },
      },
      InitializePaymentDto: {
        type: 'object',
        required: ['vehicleId'],
        properties: {
          vehicleId: { type: 'number' },
          paymentMethod: { type: 'string', enum: ['sslcommerz', 'bkash'] },
        },
      },
      SSLCommerzIpnDto: {
        type: 'object',
        required: ['tran_id', 'status'],
        properties: {
          tran_id: { type: 'string' },
          val_id: { type: 'string' },
          amount: { type: 'string' },
          card_type: { type: 'string' },
          bank_tran_id: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: { tags: ['Auth'], summary: 'Register a new user', requestBody: json({ $ref: '#/components/schemas/RegisterDto' }), responses: { '201': { description: 'User created, returns token' }, '400': { description: 'Validation error / email taken' } } },
    },
    '/auth/login': {
      post: { tags: ['Auth'], summary: 'Login and receive a JWT', requestBody: json({ $ref: '#/components/schemas/LoginDto' }), responses: { '201': { description: 'Returns access token and user' }, '401': { description: 'Invalid credentials' } } },
    },
    '/users/profile': {
      get: { tags: ['Users'], summary: 'Get current user profile', security: bearer, responses: { ...ok(), ...unauthorized } },
      put: { tags: ['Users'], summary: 'Update current user profile', security: bearer, requestBody: json({ $ref: '#/components/schemas/UpdateProfileDto' }), responses: { ...ok(), ...unauthorized } },
    },
    '/users/profile/upload-image': {
      post: {
        tags: ['Users'], summary: 'Upload profile image', security: bearer,
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } } } },
        responses: { '201': { description: 'Image uploaded' }, '400': { description: 'Invalid file' }, ...unauthorized },
      },
    },
    '/vehicles': {
      get: { tags: ['Vehicles'], summary: 'List vehicles', parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected', 'sold'] } }], responses: ok() },
      post: { tags: ['Vehicles'], summary: 'Create a vehicle listing', security: bearer, requestBody: json({ $ref: '#/components/schemas/CreateVehicleDto' }), responses: { '201': { description: 'Vehicle created (pending approval)' }, ...unauthorized } },
    },
    '/vehicles/my-vehicles': {
      get: { tags: ['Vehicles'], summary: "List current user's vehicles", security: bearer, responses: { ...ok(), ...unauthorized } },
    },
    '/vehicles/upload': {
      post: {
        tags: ['Vehicles'], summary: 'Upload up to 10 vehicle images (max 10MB each)', security: bearer,
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } },
        responses: { '201': { description: 'Returns { success, images, count }' }, '400': { description: 'No files / invalid type' }, ...unauthorized },
      },
    },
    '/vehicles/{id}': {
      get: { tags: ['Vehicles'], summary: 'Get vehicle by id', parameters: [idParam('id', 'Vehicle id')], responses: { ...ok(), '404': { description: 'Not found' } } },
    },
    '/vehicles/{id}/sold': {
      put: { tags: ['Vehicles'], summary: 'Mark own vehicle as sold', security: bearer, parameters: [idParam('id', 'Vehicle id')], responses: { ...ok(), ...unauthorized } },
    },
    '/favorites': {
      get: { tags: ['Favorites'], summary: "List current user's favorites", security: bearer, responses: { ...ok(), ...unauthorized } },
    },
    '/favorites/{vehicleId}': {
      post: { tags: ['Favorites'], summary: 'Add vehicle to favorites', security: bearer, parameters: [idParam('vehicleId', 'Vehicle id')], responses: { '201': { description: 'Added' }, ...unauthorized } },
      delete: { tags: ['Favorites'], summary: 'Remove vehicle from favorites', security: bearer, parameters: [idParam('vehicleId', 'Vehicle id')], responses: { ...ok('Removed from favorites'), ...unauthorized } },
    },
    '/favorites/{vehicleId}/check': {
      get: { tags: ['Favorites'], summary: 'Check if vehicle is a favorite', security: bearer, parameters: [idParam('vehicleId', 'Vehicle id')], responses: { ...ok('{ isFavorite: boolean }'), ...unauthorized } },
    },
    '/payments/initialize': {
      post: { tags: ['Payments'], summary: 'Initialize a payment for a vehicle', security: bearer, requestBody: json({ $ref: '#/components/schemas/InitializePaymentDto' }), responses: { '201': { description: 'Payment session created' }, ...unauthorized } },
    },
    '/payments/calculate-fee/{vehicleId}': {
      get: { tags: ['Payments'], summary: 'Calculate listing fee for a vehicle', security: bearer, parameters: [idParam('vehicleId', 'Vehicle id')], responses: { ...ok(), ...unauthorized } },
    },
    '/payments/sslcommerz/ipn': {
      post: { tags: ['Payments'], summary: 'SSLCommerz IPN callback', requestBody: json({ $ref: '#/components/schemas/SSLCommerzIpnDto' }), responses: ok() },
    },
    '/payments/sslcommerz/success': {
      post: { tags: ['Payments'], summary: 'SSLCommerz success callback', requestBody: json({ type: 'object' }), responses: ok() },
    },
    '/payments/sslcommerz/fail': {
      post: { tags: ['Payments'], summary: 'SSLCommerz failure callback', requestBody: json({ type: 'object' }), responses: ok() },
    },
    '/payments/sslcommerz/cancel': {
      post: { tags: ['Payments'], summary: 'SSLCommerz cancel callback', requestBody: json({ type: 'object' }), responses: ok() },
    },
    '/payments/vehicle/{vehicleId}': {
      get: { tags: ['Payments'], summary: 'Get payment by vehicle', security: bearer, parameters: [idParam('vehicleId', 'Vehicle id')], responses: { ...ok(), ...unauthorized } },
    },
    '/payments/transaction/{transactionId}': {
      get: { tags: ['Payments'], summary: 'Get payment by transaction id', security: bearer, parameters: [{ name: 'transactionId', in: 'path', required: true, schema: { type: 'string' } }], responses: { ...ok(), ...unauthorized } },
    },
    '/payments': {
      get: { tags: ['Payments'], summary: 'List all payments (admin)', security: bearer, parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'paid', 'failed'] } }], responses: { ...ok(), ...adminOnly } },
    },
    '/payments/stats': {
      get: { tags: ['Payments'], summary: 'Payment statistics (admin)', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/payments/paid': {
      get: { tags: ['Payments'], summary: 'List paid payments (admin)', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/admin/vehicles': {
      get: { tags: ['Admin'], summary: 'List vehicles awaiting review', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/admin/vehicles/pending': {
      get: { tags: ['Admin'], summary: 'List pending vehicles', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/admin/vehicles/sold': {
      get: { tags: ['Admin'], summary: 'List sold vehicles', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/admin/vehicles/{id}/approve': {
      post: { tags: ['Admin'], summary: 'Approve a vehicle', security: bearer, parameters: [idParam('id', 'Vehicle id')], responses: { '201': { description: 'Approved' }, ...adminOnly } },
    },
    '/admin/vehicles/{id}/reject': {
      post: { tags: ['Admin'], summary: 'Reject a vehicle', security: bearer, parameters: [idParam('id', 'Vehicle id')], responses: { '201': { description: 'Rejected' }, ...adminOnly } },
    },
    '/admin/users': {
      get: { tags: ['Admin'], summary: 'List all users', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/admin/users/{id}': {
      get: { tags: ['Admin'], summary: 'Get user by id', security: bearer, parameters: [idParam('id', 'User id')], responses: { ...ok(), ...adminOnly } },
      delete: { tags: ['Admin'], summary: 'Delete a user', security: bearer, parameters: [idParam('id', 'User id')], responses: { ...ok(), ...adminOnly } },
    },
    '/analytics': {
      get: { tags: ['Analytics'], summary: 'Overall analytics (admin)', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/analytics/brands': {
      get: { tags: ['Analytics'], summary: 'Vehicles grouped by brand (admin)', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
    '/analytics/types': {
      get: { tags: ['Analytics'], summary: 'Vehicles grouped by type (admin)', security: bearer, responses: { ...ok(), ...adminOnly } },
    },
  },
};
