import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

const ResponseStatus: SchemaObject = { type: 'number' };

const ResponseMeta: SchemaObject = {
  type: 'object',
  properties: {
    meta: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        path: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
      required: ['success', 'message', 'path', 'timestamp'],
    },
  },
  required: ['meta'],
};

export const createResponseSchema = (body: SchemaObject) => ({
  type: 'object',
  properties: {
    statusCode: ResponseStatus,
    meta: ResponseMeta,
    body,
  },
  required: ['statusCode', 'meta', 'body'],
});
