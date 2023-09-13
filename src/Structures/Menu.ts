import { Menu as MenuModel } from "../Database"
import { MenuObject } from "../Types"

export class Menu {

    jid: string

    constructor(jid: string) {
        this.jid = jid
    }

    async get() {
        const [menuModel] = await MenuModel.findOrCreate({
            where: { jid: this.jid }, defaults: { jid: this.jid, menu: "" },
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
                jid: this.jid
            }
        })
    }

    async deleteMenu() {
        await MenuModel.update({ menu: null }, {
            where: {
                jid: this.jid
            }
        })
    }

}