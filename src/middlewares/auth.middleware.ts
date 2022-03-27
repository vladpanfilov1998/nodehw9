import {NextFunction, Response} from 'express';

import {ErrorHandler} from '../error/ErrorHandler';
import {IRequestExtended} from '../interfaces';
import {tokenService, userService} from '../services';

class AuthMiddleware {
    public async checkToken(req: IRequestExtended, res: Response, next: NextFunction): Promise<void | Error> {
        try {
            const token = req.get('Authorization');

            if (!token) {
                next(new ErrorHandler('No token', 400));
                return;
            }

            const {tokenType} = req;

            const tokenPairFromDb = await tokenService.getTokenPairFromDb(token, tokenType);

            if (!tokenPairFromDb) {
                next(new ErrorHandler('Token not valid', 401));
                return;
            }

            const {userEmail} = await tokenService.verifyToken(token as string, tokenType);

            const userFromToken = await userService.getUserByEmail(userEmail);

            if (!userFromToken) {
                next(new ErrorHandler('Token not valid', 401));
                return;
            }

            req.user = userFromToken;

            next();
        } catch (e: any) {
            next(e);
        }
    }
}

export const authMiddleware = new AuthMiddleware();