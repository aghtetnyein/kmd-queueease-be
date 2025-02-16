import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { createResponseSchema } from 'src/response-schema';

export const CustomerLoginResponseSchema: SchemaObject = createResponseSchema({
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
  },
  required: ['accessToken'],
});

export const GetCustomerProfileResponseSchema: SchemaObject =
  createResponseSchema({
    type: 'object',
    properties: {
      name: { type: 'string' },
      phoneNo: { type: 'string' },
      email: { type: 'string' },
      isAccountCreated: { type: 'boolean' },
    },
    required: ['name', 'phoneNo', 'email', 'isAccountCreated'],
  });

export const CustomerUpdateResponseSchema: SchemaObject = createResponseSchema({
  type: 'object',
  properties: {
    name: { type: 'string' },
    phoneNo: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['name', 'phoneNo', 'email'],
});

export const CustomerChangePasswordResponseSchema: SchemaObject =
  createResponseSchema({
    type: 'object',
  });
