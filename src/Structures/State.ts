import { State as StateModel } from "../Database"

export class State {

    jid: string

    constructor(jid: string) {
        this.jid = jid
    }

    async get() {
        const [stateModel] = await StateModel.findOrCreate({
            where: { jid: this.jid }, defaults: { jid: this.jid, state: "" },
        })
        return stateModel.state
    }

    async setState(state: string) {
        await StateModel.update({ state }, {
            where: {
                jid: this.jid
            }
        })
    }

    async deleteState() {
        await StateModel.update({ state: null }, {
            where: {
                jid: this.jid
            }
        })
    }

}