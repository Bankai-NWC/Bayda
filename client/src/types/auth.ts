export interface IUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  isActivated: boolean;
}

export type RegisterFields = {
  fullName: string[];
  email: string[];
  phone: string[];
  password: string[];
};

export type LoginFields = {
  email: string[];
  password: string[];
};

export type FormState<T = Record<string, string[]>> = {
  errors?: Partial<T>;
  serverError?: string;
  success?: boolean;
  user?: IUser;
};

export interface IUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  isActivated: boolean;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
}
