import Pepesan from "./Pepesan";
import { Router } from "./Router";

export default abstract class Extension {

    private pepesan?: Pepesan

    abstract setRouter(router: Router): void

    setPepesan(pepesan: Pepesan): void {
        this.pepesan = pepesan
    }

}