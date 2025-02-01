import { genSaltSync, hashSync } from 'bcrypt';

export function getHashedPassword(password: string) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}
