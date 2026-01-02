export interface JwtUser {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}
