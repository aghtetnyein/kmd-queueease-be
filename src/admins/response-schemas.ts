import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { createResponseSchema } from 'src/response-schema';

export const AdminLoginResponseSchema: SchemaObject = createResponseSchema({
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
  },
  required: ['accessToken'],
});

export const AdminProfileResponseSchema: SchemaObject = createResponseSchema({
  type: 'object',
  properties: {
    profileImgUrl: { type: 'string', nullable: true },
    name: { type: 'string' },
    phoneNo: { type: 'string' },
    email: { type: 'string' },
    restaurant: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        location: { type: 'string' },
        qrCode: { type: 'string' },
        sharedLink: { type: 'string' },
        openDays: { type: 'array', items: { type: 'number' } },
        openHour: { type: 'string' },
        closeHour: { type: 'string' },
        slotDurationInMin: { type: 'number' },
      },
      required: [
        'name',
        'location',
        'qrCode',
        'sharedLink',
        'openDays',
        'openHour',
        'closeHour',
        'slotDurationInMin',
      ],
    },
  },
  required: ['profileImgUrl', 'name', 'phoneNo', 'email', 'restaurant'],
});

export const AdminUpdateResponseSchema: SchemaObject = createResponseSchema({
  type: 'object',
  properties: {
    name: { type: 'string' },
    phoneNo: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['name', 'phoneNo', 'email'],
});

export const AdminChangePasswordResponseSchema: SchemaObject =
  createResponseSchema({
    type: 'object',
  });
