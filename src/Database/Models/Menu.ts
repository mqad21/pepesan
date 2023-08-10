import { DataTypes, ModelAttributes } from "sequelize"
import { Model } from "../../Structures"

export class Menu extends Model {

    declare jid: string
    declare menu?: string | null

    static attributes: ModelAttributes = {
        jid: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        menu: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }

}