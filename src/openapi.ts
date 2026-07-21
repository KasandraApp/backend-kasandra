export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Kasandra API',
    version: '1.0.0',
    description: 'OpenAPI contract for the Kasandra backend so frontend can integrate against stable request and response shapes.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
  tags: [
    { name: 'Auth', description: 'Authentication and profile endpoints' },
    { name: 'Cash', description: 'Cash transaction management' },
    { name: 'Inventory', description: 'Inventory item management' },
    { name: 'Forecast', description: 'Forecast generation and history' },
    { name: 'What-if', description: 'Scenario simulation and history' },
    { name: 'Alerts', description: 'Alert listing and state changes' },
    { name: 'Health', description: 'Service health checks' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Backend is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  name: { type: 'string' },
                  namaLengkap: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  kataSandi: { type: 'string', minLength: 8 },
                  business_name: { type: 'string' },
                  businessName: { type: 'string' },
                  namaUsaha: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '400': { description: 'Invalid payload' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email/password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login succeeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        },
      },
    },
    '/api/v1/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Start Google OAuth flow',
        responses: {
          '302': { description: 'Redirect to Google OAuth' },
        },
      },
    },
    '/api/v1/cash-transactions': {
      get: {
        tags: ['Cash'],
        summary: 'List cash transactions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Maximum number of records to return' },
          { name: 'offset', in: 'query', schema: { type: 'integer' }, description: 'Number of records to skip' },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
          { name: 'from_date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to_date', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Cash transaction list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        },
      },
      post: {
        tags: ['Cash'],
        summary: 'Create a cash transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'amount', 'transaction_date'],
                properties: {
                  type: { type: 'string', enum: ['income', 'expense'] },
                  amount: { type: 'number' },
                  transaction_date: { type: 'string', format: 'date' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Invalid payload' },
        },
      },
    },
    '/api/v1/cash-transactions/{id}': {
      get: {
        tags: ['Cash'],
        summary: 'Get a cash transaction by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Transaction found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '404': { description: 'Transaction not found' },
        },
      },
      patch: {
        tags: ['Cash'],
        summary: 'Update a cash transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Invalid payload' },
        },
      },
      delete: {
        tags: ['Cash'],
        summary: 'Delete a cash transaction',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/inventory-items': {
      get: {
        tags: ['Inventory'],
        summary: 'List inventory items',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Inventory list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        },
      },
      post: {
        tags: ['Inventory'],
        summary: 'Create an inventory item',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['item_name', 'unit', 'current_stock', 'average_sales_per_day'],
                properties: {
                  item_name: { type: 'string' },
                  unit: { type: 'string' },
                  current_stock: { type: 'number' },
                  average_sales_per_day: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Invalid payload' },
        },
      },
    },
    '/api/v1/inventory-items/{id}': {
      patch: {
        tags: ['Inventory'],
        summary: 'Update an inventory item',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          '200': { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Invalid payload' },
        },
      },
      delete: {
        tags: ['Inventory'],
        summary: 'Delete an inventory item',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/forecast': {
      get: {
        tags: ['Forecast'],
        summary: 'Get latest forecast',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Latest forecast', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '404': { description: 'No forecast found' },
        },
      },
    },
    '/api/v1/forecast/recalculate': {
      post: {
        tags: ['Forecast'],
        summary: 'Recalculate forecast',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Forecast recalculated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Unable to recalculate' },
        },
      },
    },
    '/api/v1/forecast/history': {
      get: {
        tags: ['Forecast'],
        summary: 'Get forecast history',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Forecast history', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        },
      },
    },
    '/api/v1/what-if/simulate': {
      post: {
        tags: ['What-if'],
        summary: 'Simulate a what-if scenario',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['scenario_name', 'inputs'],
                properties: {
                  scenario_name: { type: 'string' },
                  inputs: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Scenario simulated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Invalid payload' },
        },
      },
    },
    '/api/v1/what-if/history': {
      get: {
        tags: ['What-if'],
        summary: 'List what-if history',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Scenario history', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        },
      },
    },
    '/api/v1/what-if/{id}': {
      get: {
        tags: ['What-if'],
        summary: 'Get a specific what-if scenario',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Scenario found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '404': { description: 'Scenario not found' },
        },
      },
      delete: {
        tags: ['What-if'],
        summary: 'Delete a what-if scenario',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'List alerts',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'read', 'resolved'] } }],
        responses: {
          '200': { description: 'Alerts list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
        },
      },
    },
    '/api/v1/alerts/{id}': {
      get: {
        tags: ['Alerts'],
        summary: 'Get a single alert',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Alert found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '404': { description: 'Alert not found' },
        },
      },
    },
    '/api/v1/alerts/{id}/read': {
      patch: {
        tags: ['Alerts'],
        summary: 'Mark an alert as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Alert updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Unable to update' },
        },
      },
    },
    '/api/v1/alerts/{id}/resolve': {
      patch: {
        tags: ['Alerts'],
        summary: 'Resolve an alert',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Alert updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          '400': { description: 'Unable to update' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {},
          error: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              access_token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  full_name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
              business_profile: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  business_name: { type: 'string' },
                },
              },
              is_new_user: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
};
