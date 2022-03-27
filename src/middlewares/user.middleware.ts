import {NextFunction, Response} from 'express';

import {IRequestExtended} from '../interfaces';
import {userService} from '../services';
import {loginAndUpdateUserValidator, registrationValidator} from '../validators';
import {ErrorHandler} from '../error/ErrorHandler';

class UserMiddleware {
    public async checkIsUserExist(req: IRequestExtended, res: Response, next: NextFunction): Promise<void | Error> {
        try {
            const userFromDb = await userService.getUserByEmail(req.body.email);

            if (!userFromDb) {
                next(new ErrorHandler('User not found', 404));
                return;
            }

            req.user = userFromDb;
            next();
        } catch (e: any) {
            next(e);
        }
    }

    public async checkIsUserNotExist(req: IRequestExtended, res: Response, next: NextFunction) {
        try {
            const userFromDb = await userService.getUserByEmail(req.body.email);

            if (userFromDb) {
                next(new ErrorHandler('User with this email already exist', 400));
                return;
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }

    public async checkUserByParams(req: IRequestExtended, res: Response, next: NextFunction): Promise<void | Error> {
        try {
            if (+req.params.id !== req.user?.id) {
                next(new ErrorHandler('No access', 403));
                return;
            }
            next();
        } catch (e: any) {
            next(e);
        }
    }

    public checkConfirmPassword(req: IRequestExtended, res: Response, next: NextFunction): void | Error {
        try {
            const {password, confirmPassword} = req.body;

            if (password !== confirmPassword) {
                next(new ErrorHandler('Passwords do not match', 400));
                return;
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }

    public registrationValidator(req: IRequestExtended, res: Response, next: NextFunction): void | Error {
        try {
            const {
                firstName, lastName, age, phone, email, password,
            } = req.body;

            const payload = {
                firstName,
                lastName,
                age,
                phone,
                email,
                password,
            };

            const {error} = registrationValidator.validate(payload);

            if (error) {
                next(new ErrorHandler(`Error in User Data : ${error.message}`, 400));
                return;
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }

    public loginValidator(req: IRequestExtended, res: Response, next: NextFunction): void | Error {
        try {
            const {email, password} = req.body;

            const payload = {
                email,
                password,
            };

            const {error} = loginAndUpdateUserValidator.validate(payload);

            if (error) {
                next(new ErrorHandler(`${error.message}`, 400));
                return;
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }
}

export const userMiddleware = new UserMiddleware();