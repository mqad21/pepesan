import { Request, Response } from "./Chat"

export type Next = () => true

type MiddlewareReturn = Response | boolean

export type Middleware = (request: Request, next: Next, ...args: any) => Promise<MiddlewareReturn> | MiddlewareReturn

export type ParamMiddleware = [Middleware, ...any]