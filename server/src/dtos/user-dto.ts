import type { Role, User } from '@prisma/client';

type UserData = Pick<User, 'id' | 'email' | 'fullName' | 'phone' | 'role' | 'isActivated'>;

export class UserDto implements UserData {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  isActivated: boolean;

  constructor(user: UserData) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.phone = user.phone;
    this.role = user.role;
    this.isActivated = user.isActivated;
  }
}
