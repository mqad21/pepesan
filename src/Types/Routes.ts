import { Controller } from "../Structures"
import { Request, Response } from "./Chat"
import { Middleware } from "./Middleware"

export type Route = {
    path: string,
    name: string,
    callback?: RouteCallback,
    originCallback?: RouteCallback,
    child?: Route[],
    type: RouteType,
    middlewares?: Middleware[],
}

export type RouteType = 'keyword' | 'state' | 'middleware' | 'button' | 'list' | 'menu'

export type RouteMap = Map<string, Route>

export type SyncCallback = ((request: Request, ...args: any) => void | Response | Response[]) | (() => void | Response | Response[])

export type AsyncCallback = ((request: Request, ...args: any) => Promise<void | Response | Response[]>) | (() => Promise<void | Response | Response[]>)

export type Callback = SyncCallback | AsyncCallback

export type RouteCallback = [typeof Controller, string] | Callback