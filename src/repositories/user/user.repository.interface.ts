import {DeleteResult, UpdateResult} from 'typeorm';

import {IUser} from '../../entity';

export interface IUserRepository {
    getUsers(): Promise<IUser[]>;

    getUserByEmail(email: string): Promise<IUser | undefined>;

    createUser(user: IUser): Promise<IUser>;

    updateUser(id: number, password: string, email: string): Promise<UpdateResult>;

    deleteUser(id: number): Promise<DeleteResult>;
}