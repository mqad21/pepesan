import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."
import { Menu as MenuState } from "../../Structures/Menu"
import { MenuObject } from "../Chat"
import { formatString } from "../../Utils"

export class Menu extends MessageResponse {
    text: string
    template: string
    footer?: string
    databaseMenu?: { [key: number]: string }

    constructor(text: string, template?: string, footer?: string) {
        super()
        this.text = text
        this.template = template ?? "{number}. {menu}"
        this.footer = footer
    }

    static fromArrayOfString(menus: string[], text: string, template?: string, footer?: string) {
        return new ArrayOfStringMenu(menus, text, template, footer)
    }

    static fromArrayOfObject(menus: MenuObject[], text: string, template?: string, footer?: string) {
        return new ArrayOfObjectMenu(menus, text, template, footer)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

    async saveToDatabase(jid: string | null) {
        if (!jid) return
        const menu = new MenuState(jid)
        await menu.setMenu(this.databaseMenu)
    }

}

export class ArrayOfStringMenu extends Menu {
    menus: { [key: number]: string }

    constructor(menus: string[], text: string, template?: string, footer?: string) {
        super(text, template, footer)
        this.menus = Object.fromEntries(menus.map((menu: string, index: number) => [index + 1, menu]))
        this.databaseMenu = this.menus
    }

    get formattedMenus() {
        const menus = Object.entries(this.menus).map(([key, value]: [string, string]) => {
            return formatString(this.template, { number: key, menu: value })
        })
        let formattedMenus = menus.join("\n")
        if (this.text) {
            formattedMenus = this.text + "\n\n" + formattedMenus
        }
        if (this.footer) {
            formattedMenus = formattedMenus + "\n\n" + this.footer
        }
        return formattedMenus
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.formattedMenus }
    }

}

export class ArrayOfObjectMenu extends Menu {
    menus: { [key: number]: MenuObject }

    constructor(menus: MenuObject[], text: string, template?: string, footer?: string) {
        super(text, template, footer)
        this.menus = Object.fromEntries(menus.map((menu: MenuObject, index: number) => [menu.code ?? index + 1, menu]))
        this.databaseMenu = Object.fromEntries(menus.map((menu: MenuObject, index: number) => [menu.code ?? index + 1, menu.value]))
    }

    get formattedMenus() {
        const menus = Object.entries(this.menus).map(([key, value]: [string, MenuObject]) => {
            return formatString(this.template, { number: key, menu: value.text })
        })
        let formattedMenus = menus.join("\n")
        if (this.text) {
            formattedMenus = this.text + "\n\n" + formattedMenus
        }
        if (this.footer) {
            formattedMenus = formattedMenus + "\n\n" + this.footer
        }
        return formattedMenus
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.formattedMenus }
    }

}