import { Menu as MenuModel } from "../Database"
import { MenuObject } from "../Types"

export class Menu {

    clientId: string
    jid: string

    constructor(clientId: string, jid: string) {
        this.clientId = clientId
        this.jid = jid
    }

    async get() {
        const [menuModel] = await MenuModel.findOrCreate({
            where: { jid: this.jid, clientId: this.clientId }, defaults: { jid: this.jid, menu: "" },
        })
        return JSON.parse(menuModel.menu ? menuModel.menu : "{}") as { [key: string]: MenuObject }
    }

    async setMenu(menu: any) {
        if (global.CONFIG?.reusableMenu) {
            const defaultMenu = await this.get()
            menu = { ...defaultMenu, ...menu }
        }
        await MenuModel.update({ menu: JSON.stringify(menu) }, {
            where: {
                clientId: this.clientId,
                jid: this.jid
            }
        })
    }

    async deleteMenu() {
        await MenuModel.update({ menu: null }, {
            where: {
                clientId: this.clientId,
                jid: this.jid
            }
        })
    }

}