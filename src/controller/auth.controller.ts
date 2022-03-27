import {NextFunction, Request, Response} from 'express';

import {IUser} from '../entity';
import {IRequestExtended, ITokenData} from '../interfaces';
import {tokenRepository} from '../repositories';
import {authService, tokenService, userService} from '../services';

class AuthController {
    public async registration(req: Request, res: Response, next: NextFunction): Promise<Response<ITokenData | Error> | undefined> {
        try {
            const data = await authService.registration(req.body);

            return res.status(201)
                .json(data);
        } catch (e: any) {
            next(e);
        }
    }

    public async logout(req: IRequestExtended, res: Response, next: NextFunction): Promise<Response<string | Error> | undefined> {
        try {
            const {id} = req.user as IUser;

            await tokenService.deleteUserTokenPair(id);

            return res.sendStatus(204);
        } catch (e: any) {
            next(e);
        }
    }

    public async login(req: IRequestExtended, res: Response, next: NextFunction): Promise<Response<Response | Error> | undefined> {
        try {
            const {
                id,
                email,
                password: hashPassword,
            } = req.user as IUser;
            const {password} = req.body;

            await userService.compareUserPasswords(password, hashPassword);

            const {
                refreshToken,
                accessToken,
            } = tokenService.generateTokenPair({
                userId: id,
                userEmail: email,
            });

            await tokenRepository.createToken({
                refreshToken,
                accessToken,
                userId: id,
            });

            return res.status(200)
                .json({
                    refreshToken,
                    accessToken,
                    user: req.user,
                });
        } catch (e: any) {
            next(e);
        }
    }

    public async refresh(req: IRequestExtended, res: Response, next: NextFunction): Promise<Response | undefined | Error> {
        try {
            const {
                id,
                email,
            } = req.user as IUser;

            await tokenService.deleteUserTokenPair(id);

            const {
                refreshToken,
                accessToken,
            } = tokenService.generateTokenPair({
                userId: id,
                userEmail: email,
            });

            await tokenRepository.createToken({
                refreshToken,
                accessToken,
                userId: id,
            });

            return res.status(200).json({
                refreshToken,
                accessToken,
                user: req.user,
            });
        } catch (e: any) {
            next(e);
        }
    }
}

export const authController = new AuthController();