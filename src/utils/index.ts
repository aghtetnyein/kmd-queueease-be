import { BadRequestException } from '@nestjs/common';
import { genSaltSync, hashSync } from 'bcrypt';
import { extname } from 'path';
import { Request } from 'express';

export function getHashedPassword(password: string) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}

export function generateFilename(
  req: Request,
  file: Express.Multer.File,
): string {
  if (!req.body || !req.body.name) {
    throw new BadRequestException('Name is required in the request body');
  }
  if (!file || !file.originalname) {
    throw new BadRequestException('File original name is required');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new BadRequestException('File size should be at most 2MB');
  }

  const fileExtName = extname(file.originalname);
  const formattedName = req.body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomName = `${formattedName}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${randomName}${fileExtName}`;
}
