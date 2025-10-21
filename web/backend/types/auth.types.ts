// Auth DTOs
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  username: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserResponse;
    token: string;
  };
  error?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  username: string;
  created_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
}
