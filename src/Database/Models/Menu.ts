import { DataTypes, ModelAttributes } from "sequelize"
import { Model } from "../../Structures"

export class Menu extends Model {

    declare clientId: string
    declare jid: string
    declare menu?: string | null

    static attributes: ModelAttributes = {
        clientId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        jid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        menu: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }

}