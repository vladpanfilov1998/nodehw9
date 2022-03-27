import {Router} from 'express';

import {authController} from '../controller';
import {authMiddleware, tokenTypeMiddleware, userMiddleware} from '../middlewares';

const router = Router();

router.post('/registration', userMiddleware.registrationValidator, userMiddleware.checkIsUserNotExist, authController.registration);
router.post('/login', userMiddleware.loginValidator, userMiddleware.checkIsUserExist, authController.login);
router.post('/logout', tokenTypeMiddleware.tokenTypeAccess, authMiddleware.checkToken, authController.logout);
router.post('/refresh', tokenTypeMiddleware.tokenTypeRefresh, authMiddleware.checkToken, authController.refresh);

export const authRouter = router;