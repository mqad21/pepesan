import { Sequelize } from "sequelize"
import { Model } from "../Structures"
import { DbConfig } from "../Types"
import * as PepesanModels from "./Models"

export class Database {

    sql?: Sequelize
    name: string
    user: string
    pass: string
    path: string
    models: typeof Model[]

    constructor(dbConfig?: DbConfig, models?: typeof Model[]) {
        this.name = dbConfig?.name ?? 'pepesan'
        this.user = dbConfig?.user ?? 'admin'
        this.pass = dbConfig?.pass ?? '#p3p3s4n!'
        this.path = dbConfig?.path ?? './data.sqlite'
        this.models = models ?? []
        this.initSql()
        this.initModels()
    }

    private initSql() {
        this.sql = new Sequelize({
            dialect: 'sqlite',
            database: this.name,
            username: this.user,
            password: this.pass,
            storage: this.path,
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
            model.sync({ alter: true })
        }
    }
}

export * from './Models'

