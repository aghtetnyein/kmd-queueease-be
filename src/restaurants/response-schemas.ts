import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { create } from 'lodash';
import { createResponseSchema } from 'src/response-schema';

export const CreateRestaurantResponseSchema: SchemaObject =
  createResponseSchema({
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      location: { type: 'string' },
      qrCode: { type: 'string' },
      sharedLink: { type: 'string' },
    },
    required: ['id', 'name', 'location', 'qrCode', 'sharedLink'],
  });

export const UpdateRestaurantResponseSchema: SchemaObject =
  createResponseSchema({
    type: 'object',
    properties: {
      name: { type: 'string' },
      location: { type: 'string' },
      qrCode: { type: 'string' },
      sharedLink: { type: 'string' },
    },
    required: ['name', 'location', 'qrCode', 'sharedLink'],
  });
