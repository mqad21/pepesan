import { Model } from "./Model";
import Pepesan from "./Pepesan";
import { Router } from "./Router";

export abstract class Extension {

    private pepesan?: Pepesan

    abstract setRouter(router: Router): void

    abstract getModels?(): Model[]

    setPepesan(pepesan: Pepesan): void {
        this.pepesan = pepesan
    }

}