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

}

export class ArrayOfStringMenu extends Menu {
    menus: string[]

    constructor(jid: string, menus: string[], text: string, template?: string, footer?: string) {
        super(text, jid, template, footer)
        this.menus = menus
        this.saveToDatabase()
    }

    private async saveToDatabase() {
        const menu = new MenuState(this.jid)
        await menu.setMenu(this.menus)
    }

    get formattedMenus() {
        const menus = this.menus.map((menu: string, index: number) => {
            return formatString(this.template, { number: index + 1, menu })
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
    menus: MenuObject[]

    constructor(jid: string, menus: MenuObject[], text: string, template?: string, footer?: string) {
        super(text, jid, template, footer)
        this.menus = menus
        this.saveToDatabase()
    }

    get formattedMenus() {
        const menus = this.menus.map((menu: MenuObject, index: number) => {
            return formatString(this.template, { number: index + 1, menu: menu.text })
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

    private async saveToDatabase() {
        const menu = new MenuState(this.jid)
        await menu.setMenu(this.menus.map((menu: MenuObject) => menu.value))
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.formattedMenus }
    }

}