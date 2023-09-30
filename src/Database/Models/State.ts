import { DataTypes, ModelAttributes } from "sequelize"
import { Model } from "../../Structures"

export class State extends Model {

    declare id: number
    declare clientId: string
    declare jid: string
    declare state?: string | null

    static attributes: ModelAttributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        clientId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        jid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }

}