import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: any;
}
export declare const verifyFirebaseToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=verifyFirebaseToken.d.ts.map