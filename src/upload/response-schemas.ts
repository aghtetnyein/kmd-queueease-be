import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { createResponseSchema } from 'src/response-schema';

export const UploadResponseSchema: SchemaObject = createResponseSchema({
  type: 'object',
  properties: {
    url: { type: 'string' },
  },
  required: ['url'],
});
