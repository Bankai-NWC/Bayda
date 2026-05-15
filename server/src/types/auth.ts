import { Role } from '@prisma/client';

import { UserDto } from '../dtos/user-dto.js';

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface ITokenPayload {
  id: number;
  email: string;
  role: Role;
}

export interface IResetPayload {
  id: number;
  purpose: string;
}
