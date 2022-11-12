import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."
import { ButtonObject } from "../index"

export class Button extends MessageResponse {
    text: string
    footer: string

    constructor(text: string, footer: string) {
        super()
        this.text = text ?? " "
        this.footer = footer
    }

    static fromArrayOfString(buttons: string[], text: string, footer: string) {
        return new ArrayOfStringButton(buttons, text, footer)
    }

    static fromArrayOfObject(buttons: ButtonObject[], text: string, footer: string) {
        return new ArrayOfObjectButton(buttons, text, footer)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class ArrayOfStringButton extends Button {
    buttons: string[]

    constructor(buttons: string[], text: string, footer: string) {
        super(text, footer)
        this.buttons = buttons
    }

    get formattedButtons() {
        return this.buttons.map((button: string, index: number) => {
            return {
                buttonId: 'btn' + index,
                buttonText: {
                    displayText: button
                },
                type: 1
            }
        })
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.text, footer: this.footer, buttons: this.formattedButtons }
    }

}

export class ArrayOfObjectButton extends Button {
    buttons: ButtonObject[]

    constructor(buttons: ButtonObject[], text: string, footer: string) {
        super(text, footer)
        this.buttons = buttons
    }

    get formattedButtons() {
        return this.buttons.map((button: ButtonObject) => {
            return {
                buttonId: button.value,
                buttonText: {
                    displayText: button.text
                },
                type: 1
            }
        })
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.text, footer: this.footer, buttons: this.formattedButtons, }
    }

}