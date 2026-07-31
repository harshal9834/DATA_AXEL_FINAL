import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            locale?: string;
        }
    }
}
export declare const languageMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=languageMiddleware.d.ts.map