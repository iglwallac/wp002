import { dispatchQueuedActions, unloadQueuedActions } from './'

function unloadDispatchQueue () {
  window.addEventListener('unload', () => {
    unloadQueuedActions()
  }, false)
}

export default function middleware () {
  if (process.env.BROWSER) {
    unloadDispatchQueue()
  }
  return (next) => {
    return (action) => {
      if (process.env.BROWSER) {
        const { type, payload } = action
        // this little ditty gives us the ability to hook into actions
        // at the component level and do cool shit
        dispatchQueuedActions(type, payload || {})
      }
      next(action)
    }
  }
}
