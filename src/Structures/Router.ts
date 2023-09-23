import { Middleware, Next, ParamMiddleware, Request, Route, RouteCallback, RouteMap, RouteType } from "../Types"
import { isTextMatch } from "../Utils"
import { Menu } from "./Menu"

export class Router {

    clientId?: string
    protected _routes: RouteMap
    protected _keys: string[]
    protected _middlewares: Middleware[]
    private _index: number = 0

    constructor() {
        this._routes = new Map()
        this._keys = []
        this._middlewares = []
    }

    get routes() {
        return Array.from(this._routes.values())
    }

    private generateKey(path: string, type: RouteType) {
        return `${type}[${path}]`
    }

    keyword(path: string, callback?: RouteCallback) {
        const type = 'keyword'
        const middleware = async (request: Request) => isTextMatch(request.text!, path)
        return this.initRoute(type, middleware, path, callback)
    }

    button(path: string, callback?: RouteCallback) {
        const type = 'button'
        const middleware = async (request: Request) => isTextMatch(request.button?.text!, path) || isTextMatch(request.button?.value!, path)
        return this.initRoute(type, middleware, path, callback)
    }

    menu(path: string, callback?: RouteCallback) {
        const type = 'menu'
        const middleware = async (request: Request) => {
            const menu = request.menu
            if (!menu) return false
            const menuObject = new Menu(this.clientId!, request.jid!)
            const menus = await menuObject.get()
            if (menus[path]) {
                return true
            }
            return false
        }
        return this.initRoute(type, middleware, path, callback)
    }

    list(path: string, callback?: RouteCallback) {
        const type = 'list'
        const middleware = async (request: Request) => isTextMatch(request.list?.text!, path) || isTextMatch(request.list?.value!, path)
        return this.initRoute(type, middleware, path, callback)
    }

    state(path: string, callback?: RouteCallback) {
        const type = 'state'
        const middleware = async (request: Request) => ((await request.state) === path)
        return this.initRoute(type, middleware, path, callback)
    }

    middleware(middleware: Middleware | ParamMiddleware, callback?: RouteCallback) {
        const type = 'middleware'
        if (Array.isArray(middleware)) {
            const middlewareFunction = middleware.shift()
            return this.initRoute(type, (request: Request, next: Next) => middlewareFunction(request, next, ...middleware))
        }
        return this.initRoute(type, middleware, undefined, callback)
    }

    private initRoute(type: RouteType, middleware: Middleware, path?: string, callback?: RouteCallback) {
        path = path ?? middleware.name ?? ""
        const key = this.generateKey(path, type) + "-" + this._index
        this._index++
        if (!callback) {
            this._keys.push(key)
            this._middlewares.push(middleware)
            return this
        }
        const newKey = [...this._keys, key].join("~")
        this._routes.set(newKey, {
            middlewares: this._middlewares.length === 0 ? [] : [...this._middlewares],
            callback,
            originCallback: callback,
            path,
            type,
            name: ''
        })
        return this
    }

    group(callback: () => void) {
        if (!this._keys?.length || !this._middlewares?.length) {
            return
        }
        callback()
        this._keys.splice(-1)
        this._middlewares.splice(-1)
    }

    name(name: string) {
        const routeArray = Array.from(this._routes.entries())
        const [key, lastRoute] = routeArray[routeArray.length - 1]
        if (lastRoute) {
            lastRoute.name = name
            this._routes.set(key, lastRoute)
        }
    }

}
