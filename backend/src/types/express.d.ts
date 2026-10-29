import type { Role, UserStatus } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        badgeNumber: string;
        email: string;
        role: Role;
        status: UserStatus;
        avatarPath: string | null;
      };
    }
  }
}

export {};
