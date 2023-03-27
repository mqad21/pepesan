import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."
import { Menu as MenuState } from "../../Structures/Menu"
import { MenuObject } from "../Chat"

export class Menu extends MessageResponse {
    text: string
    jid: string

    constructor(text: string, jid: string) {
        super()
        this.text = text
        this.jid = jid
    }

    static fromArrayOfString(jid, menus: string[], text: string) {
        return new ArrayOfStringMenu(jid, menus, text)
    }

    static fromArrayOfObject(jid, menus: MenuObject[], text: string) {
        return new ArrayOfObjectMenu(jid, menus, text)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class ArrayOfStringMenu extends Menu {
    menus: string[]

    constructor(jid: string, menus: string[], text: string) {
        super(text, jid)
        this.menus = menus
        this.saveToDatabase()
    }

    private async saveToDatabase() {
        const menu = new MenuState(this.jid)
        await menu.setMenu(this.menus)
    }

    get formattedMenus() {
        const menus = this.menus.map((menu: string, index: number) => {
            return `${index + 1}. ${menu}`
        })
        let formattedMenus = menus.join("\n")
        if (this.text) {
            formattedMenus = this.text + "\n\n" + formattedMenus
        }
        return formattedMenus
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.formattedMenus }
    }

}

export class ArrayOfObjectMenu extends Menu {
    menus: MenuObject[]

    constructor(jid: string, menus: MenuObject[], text: string) {
        super(text, jid)
        this.menus = menus
        this.saveToDatabase()
    }

    get formattedMenus() {
        const menus = this.menus.map((menu: MenuObject, index: number) => {
            return `${index + 1}. ${menu.text}`
        })
        let formattedMenus = menus.join("\n")
        if (this.text) {
            formattedMenus = this.text + "\n\n" + formattedMenus
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