import {NextFunction, Response} from 'express';

import {actionType} from '../constants';
import {IRequestExtended} from '../interfaces';
import {postService} from '../services';
import {commentValidator} from '../validators';
import {ErrorHandler} from '../error/ErrorHandler';

class CommentMiddleware {
    public commentValidator(req: IRequestExtended, res: Response, next: NextFunction): void | Error {
        try {
            const {
                text,
            } = req.body;

            const payload = {
                text,
            };

            const {error} = commentValidator.validate(payload);

            if (error) {
                next(new ErrorHandler(`Error in Comment Data : ${error.message}`, 400));
                return;
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }

    public async checkIsPostExist(req: IRequestExtended, res: Response, next: NextFunction): Promise<void | Error> {
        try {
            const {postId} = req.params;

            const userPost = await postService.getUserPostByParams({id: +postId});

            if (!userPost) {
                next(new ErrorHandler('Post not found', 404));
                return;
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }

    public verifyActionType(req: IRequestExtended, res: Response, next: NextFunction): void | Error {
        try {
            const {action} = req.body;

            if (!action) {
                next(new ErrorHandler('No action', 400));
                return;
            }

            if (action !== actionType.TYPE_LIKE || action !== actionType.TYPE_DISLIKE) {
                next(new ErrorHandler('Action type not valid', 400));
                return;
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }
}

export const commentMiddleware = new CommentMiddleware();