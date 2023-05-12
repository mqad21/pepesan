import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."
import { Menu as MenuState } from "../../Structures/Menu"
import { MenuObject } from "../Chat"
import { formatString } from "../../Utils"

export class Menu extends MessageResponse {
    text: string
    jid: string
    template: string
    footer?: string

    constructor(text: string, jid: string, template?: string, footer?: string) {
        super()
        this.text = text
        this.jid = jid
        this.template = template ?? "{number}. {menu}"
        this.footer = footer
    }

    static fromArrayOfString(jid, menus: string[], text: string, template?: string, footer?: string) {
        return new ArrayOfStringMenu(jid, menus, text, template, footer)
    }

    static fromArrayOfObject(jid, menus: MenuObject[], text: string, template?: string, footer?: string) {
        return new ArrayOfObjectMenu(jid, menus, text, template, footer)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

    async saveToDatabase(menus: { [key: number]: string }) {
        const menu = new MenuState(this.jid)
        await menu.setMenu(menus)
    }

}

export class ArrayOfStringMenu extends Menu {
    menus: { [key: number]: string }

    constructor(jid: string, menus: string[], text: string, template?: string, footer?: string) {
        super(text, jid, template, footer)
        this.menus = Object.fromEntries(menus.map((menu: string, index: number) => [index, menu]))
        this.saveToDatabase(this.menus)
    }

    get formattedMenus() {
        const menus = Object.entries(this.menus).map(([key, value]: [string, string], index: number) => {
            return formatString(this.template, { number: `${parseInt(key) + 1}`, menu: value })
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

    constructor(jid: string, menus: MenuObject[], text: string, template?: string, footer?: string) {
        super(text, jid, template, footer)
        this.menus = Object.fromEntries(menus.map((menu: MenuObject, index: number) => [index, menu]))
        this.saveToDatabase(Object.fromEntries(menus.map((menu: MenuObject, index: number) => [menu.code ?? index, menu.value])))
    }

    get formattedMenus() {
        const menus = Object.entries(this.menus).map(([key, value]: [string, MenuObject], index: number) => {
            return formatString(this.template, { number: value.code ?? index + 1, menu: value.text })
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