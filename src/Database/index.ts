import { Dialect, Sequelize } from "sequelize"
import { Model } from "../Structures"
import { DbConfig } from "../Types"
import * as PepesanModels from "./Models"

export class Database {

    sql?: Sequelize
    name: string
    user: string
    pass: string
    path: string
    dialect: Dialect
    host: string
    port: number
    timezone: string
    models: typeof Model[]
    syncAlter?: boolean

    constructor(dbConfig?: DbConfig, models?: typeof Model[]) {
        this.name = dbConfig?.name ?? 'pepesan'
        this.user = dbConfig?.user ?? 'admin'
        this.pass = dbConfig?.pass ?? '#p3p3s4n!'
        this.path = dbConfig?.path ?? './data.sqlite'
        this.dialect = dbConfig?.dialect ?? 'sqlite'
        this.host = dbConfig?.host ?? 'localhost'
        this.port = dbConfig?.port ?? 3306
        this.syncAlter = dbConfig?.syncAlter ?? false
        this.timezone = dbConfig?.timezone ?? '+07:00'
        this.models = models ?? []
        this.initSql()
        this.initModels()
    }

    private initSql() {
        this.sql = new Sequelize({
            dialect: this.dialect,
            host: this.host,
            port: this.port,
            database: this.name,
            username: this.user,
            password: this.pass,
            storage: this.path,
            timezone: this.timezone,
            define: {
                underscored: true
            }
        })
    }

    private initModels() {
        const sqlModels = [...Object.values(PepesanModels), ...this.models]
        for (const model of sqlModels) {
            model.init(model.attributes, {
                sequelize: this.sql!
            })
            model.sync({ alter: this.syncAlter })
        }
    }
}

export * from './Models'

