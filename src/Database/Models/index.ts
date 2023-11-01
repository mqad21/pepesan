import { Model } from 'sequelize';

export * from './State'
export * from './Menu'

type Constructor<T> = new (...args: any[]) => T;

export type ModelType<T extends Model<T>> = Constructor<T> & typeof Model;