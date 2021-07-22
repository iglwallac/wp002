import { RENDER_MODAL, REMOVE_MODAL } from './actions'
import { setProps, clearProps } from './'

export default function middleware () {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { type } = action
      switch (type) {
        case RENDER_MODAL: {
          const { payload = {} } = action
          const { name, props } = payload
          clearProps()
          setProps(name, props)
          break
        }
        case REMOVE_MODAL:
          clearProps()
          break
        default:
          break
      }
    }
    next(action)
  }
}
