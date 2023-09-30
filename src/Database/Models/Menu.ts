import { DataTypes, ModelAttributes } from "sequelize"
import { Model } from "../../Structures"

export class Menu extends Model {
    
    declare id: number
    declare clientId: string
    declare jid: string
    declare menu?: string | null

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
        menu: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }

}