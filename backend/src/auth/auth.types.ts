export interface JwtPayload {
  sub: string;
  email?: string;
  walletAddress?: string;
  role?: string;
}
