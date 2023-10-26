import { Model as SequelizeModel, ModelAttributes } from "sequelize"

export abstract class Model extends SequelizeModel {
    
    static attributes: ModelAttributes

}