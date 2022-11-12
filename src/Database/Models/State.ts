import { DataTypes, ModelAttributes } from "sequelize"
import { Model } from "../../Structures"

export class State extends Model {

    declare jid: string
    declare state?: string | null

    static attributes: ModelAttributes = {
        jid: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }

}