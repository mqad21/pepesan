import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."
import { ListObject } from "../index"

export class List extends MessageResponse {
    buttonText: string
    title: string
    text: string
    footer: string

    constructor(buttonText: string, title: string, text: string, footer: string) {
        super()
        this.buttonText = buttonText
        this.title = title ?? " "
        this.text = text ?? " "
        this.footer = footer
    }

    static fromArrayOfArrayOfString(sections: string[], lists: string[][], descriptions: string[][], buttonText: string, title: string, text: string, footer: string) {
        return new ArrayOfArrayStringList(sections, lists, descriptions, buttonText, title, text, footer)
    }

    static fromArrayOfArrayOfObject(sections: string[], lists: ListObject[][], buttonText: string, title: string, text: string, footer: string) {
        return new ArrayOfArrayOfObjectList(sections, lists, buttonText, title, text, footer)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class ArrayOfArrayStringList extends List {
    sections: string[]
    lists: string[][]
    descriptions: string[][]

    constructor(sections: string[], lists: string[][], descriptions: string[][], buttonText: string, title: string, text: string, footer: string) {
        super(buttonText, title, text, footer)
        this.sections = sections
        this.lists = lists
        this.descriptions = descriptions
    }

    get formattedList() {
        return this.sections.map((section: string, index: number) => {
            return {
                title: section,
                rows: this.lists[index].map((list: string, listIndex: number) => ({
                    title: list,
                    rowId: `option${listIndex}`,
                    description: this.descriptions[index][listIndex],
                }))
            }
        })
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { buttonText: this.buttonText, title: this.title, text: this.text, footer: this.footer, sections: this.formattedList }
    }

}

export class ArrayOfArrayOfObjectList extends List {
    sections: string[]
    lists: ListObject[][]

    constructor(sections: string[], lists: ListObject[][], buttonText: string, title: string, text: string, footer: string) {
        super(buttonText, title, text, footer)
        this.sections = sections
        this.lists = lists
    }

    get formattedList() {
        return this.sections.map((section: string, index: number) => {
            return {
                title: section,
                rows: this.lists[index].map((list: ListObject) => ({
                    title: list.text,
                    rowId: list.value,
                    description: list.description,
                }))
            }
        })
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { buttonText: this.buttonText, title: this.title, text: this.text, footer: this.footer, sections: this.formattedList }
    }

}