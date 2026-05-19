declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }
    }

    interface Request {
      files?: Express.Multer.File[];
      user?: {
        id: number;
        email: string;
        role: import('@prisma/client').Role;
      };
    }
  }
}

export {};
