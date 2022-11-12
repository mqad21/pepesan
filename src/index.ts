import { Router } from './Structures'
import Pepesan from './Structures/Pepesan'
import { Config } from './Types'

export * from './Structures'
export * from './Types'
export * from './Utils'

export const init = (router: Router, config: Config) => {
    return new Pepesan(router, config)
}
export default { init }