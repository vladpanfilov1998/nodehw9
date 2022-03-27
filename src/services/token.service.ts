import jwt from 'jsonwebtoken';

import {config} from '../config';
import {IToken, Token} from '../entity';
import {ITokenPair, IUserPayload} from '../interfaces';
import {tokenRepository} from '../repositories';

class TokenService {
    public generateTokenPair(payload: IUserPayload): ITokenPair {
        const accessToken = jwt.sign(
            payload,
            config.SECRET_ACCESS_KEY as string,
            {expiresIn: config.EXPIRES_IN_ACCESS},
        );
        const refreshToken = jwt.sign(
            payload,
            config.SECRET_REFRESH_KEY as string,
            {expiresIn: config.EXPIRES_IN_REFRESH},
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    public async saveToken(userId: number, refreshToken: string, accessToken: string): Promise<IToken> {
        const tokenFromDb = await tokenRepository.findTokenByUserId(userId);
        if (tokenFromDb) {
            tokenFromDb.refreshToken = refreshToken;
            tokenFromDb.accessToken = accessToken;
            return tokenRepository.createToken(tokenFromDb);
        }

        return tokenRepository.createToken({accessToken, refreshToken, userId});
    }

    public async deleteUserTokenPair(userId: number) {
        return tokenRepository.deleteByParams({userId});
    }

    public async verifyToken(authToken: string, tokenType = config.TYPE_ACCESS): Promise<IUserPayload> {
        let secretWord = config.SECRET_ACCESS_KEY;

        if (tokenType === config.TYPE_REFRESH) {
            secretWord = config.SECRET_REFRESH_KEY;
        }

        return jwt.verify(authToken, secretWord as string) as IUserPayload;
    }

    public async getTokenPairFromDb(token: string | undefined, tokenType: string | undefined): Promise<Token | undefined> {
        return tokenRepository.findByParams(
            tokenType === config.TYPE_ACCESS
                ? {accessToken: token}
                : {refreshToken: token},
        );
    }
}

export const tokenService = new TokenService();