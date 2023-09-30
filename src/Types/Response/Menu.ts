import { AnyMessageContent } from "@whiskeysockets/baileys"
import { MessageResponse } from "."
import { Menu as MenuState } from "../../Structures/Menu"
import { MenuObject } from "../Chat"
import { formatString } from "../../Utils"

export class Menu extends MessageResponse {
    text: string
    template: string | ((menu: MenuObject) => string)
    header?: string
    footer?: string
    databaseMenu?: { [key: number]: MenuObject }
    menus: MenuObject[]

    constructor(menus: MenuObject[], text: string, template?: string, footer?: string) {
        super()
        const { menuHeader, menuTemplate } = global.CONFIG
        this.menus = menus ?? []
        this.header = menuHeader
        this.text = text
        this.template = template ?? menuTemplate ?? "{number}. {menu}"
        this.footer = footer
    }

    static fromArrayOfString(menus: string[], text: string, template?: string, footer?: string) {
        return new ArrayOfStringMenu(menus, text, template, footer)
    }

    static fromArrayOfObject(menus: MenuObject[], text: string, template?: string, footer?: string) {
        return new ArrayOfObjectMenu(menus, text, template, footer)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.formattedMenus }
    }

    get formattedMenus() {
        const menus = this.menus.map(menu => {
            if (typeof this.template === "function") return this.template(menu)
            return formatString(this.template, { number: menu.code, menu: menu.text })
        })
        let formattedMenus = menus.join("\n")
        if (this.header) {
            formattedMenus = this.header + "\n\n" + formattedMenus
        }
        if (this.text) {
            formattedMenus = this.text + "\n\n" + formattedMenus
        }
        if (this.footer) {
            formattedMenus = formattedMenus + "\n\n" + this.footer
        }
        return formattedMenus
    }

    async saveToDatabase(clientId: string, jid: string | null) {
        if (!jid) return
        const menu = new MenuState(clientId, jid)
        await menu.setMenu(this.databaseMenu)
    }

}

export class ArrayOfStringMenu extends Menu {

    constructor(menus: string[], text: string, template?: string, footer?: string) {
        const menuObjects = menus.map((menu, index) => {
            return { text: menu, value: menu, code: (index + 1).toString() } as MenuObject
        })
        super(menuObjects, text, template, footer)
        this.databaseMenu = Object.fromEntries(menus.map((menu: string, index: number) => [index + 1, {
            text: menu,
            value: menu,
            code: (index + 1).toString(),
            order: index
        }]))
    }

}

export class ArrayOfObjectMenu extends Menu {

    constructor(menus: MenuObject[], text: string, template?: string, footer?: string) {
        const menuObjects = menus.map((menu, index) => {
            return { text: menu.text, value: menu.value, code: menu.code ?? (index + 1).toString() } as MenuObject
        })
        super(menuObjects, text, template, footer)
        this.databaseMenu = Object.fromEntries(menus.map((menu: MenuObject, index: number) => [menu.code ?? index + 1, {
            text: menu.text,
            value: menu.value,
            code: menu.code ?? (index + 1).toString(),
            order: index
        }]))
    }

}