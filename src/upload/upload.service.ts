import { Injectable } from '@nestjs/common';
import { generateFilename } from '../utils';
import { Request } from 'express';

@Injectable()
export class UploadService {
  async saveImage(req: Request, file: Express.Multer.File): Promise<string> {
    const fileName = generateFilename(req, file);
    return `/uploads/${fileName}`;
  }
}
