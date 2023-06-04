import { readFileSync, write, writeFileSync } from "fs"
import { State as StateModel } from "../Database"

export class State {

    jid: string
    private PREFIX_LENGTH = global.CONFIG?.statePrefixLength ?? 9
    private PATH = global.CONFIG?.statePath ?? './state'

    get prefix() {
        return this.jid.substring(0, this.PREFIX_LENGTH)
    }

    get filePath() {
        return `${this.PATH}/${this.prefix}.json`
    }

    constructor(jid: string) {
        this.jid = jid
    }

    async get() {
        if (global.CONFIG?.stateType === 'db') {
            return await this.getFromDb()
        }
        return await this.getFromFile()
    }

    private async getFromDb() {
        const [stateModel] = await StateModel.findOrCreate({
            where: { jid: this.jid }, defaults: { jid: this.jid, state: "" },
        })
        return stateModel.state
    }

    private async getFromFile() {
        try {
            const file = readFileSync(this.filePath, { encoding: 'utf-8' })
            const data = JSON.parse(file)
            return data[this.jid]
        } catch (error) {
            return null
        }
    }

    async setState(state: string) {
        if (global.CONFIG?.stateType === 'db') {
            await this.setDbState(state)
        } else {
            await this.setFileState(state)
        }
    }

    async setFileState(state: string) {
        let data = {}
        try {
            const file = readFileSync(this.filePath, { encoding: 'utf-8' })
            data = JSON.parse(file)
        } catch (error) {
            // do nothing
        } finally {
            data[this.jid] = state
            writeFileSync(this.filePath, JSON.stringify(data))
        }
    }

    async setDbState(state: string) {
        await StateModel.update({ state }, {
            where: {
                jid: this.jid
            }
        })
    }

    async deleteState() {
        if (global.CONFIG?.stateType === 'db') {
            await this.deleteDbState()
        } else {
            await this.deleteFileState()
        }
    }

    async deleteFileState() {
        try {
            const file = readFileSync(this.filePath, { encoding: 'utf-8' })
            const data = JSON.parse(file)
            delete data[this.jid]
            writeFileSync(this.filePath, JSON.stringify(data))
        } catch (error) {
            // do nothing
        }
    }

    async deleteDbState() {
        await StateModel.update({ state: null }, {
            where: {
                jid: this.jid
            }
        })
    }

}