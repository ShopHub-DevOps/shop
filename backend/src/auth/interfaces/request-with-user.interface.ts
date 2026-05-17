export interface RequestWithUser {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}
