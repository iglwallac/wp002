import 'jsdom-global/register'
import jsdom from 'jsdom-global'
import Adapter from 'enzyme-adapter-react-16'
import Enzyme from 'enzyme'

// Do not put this in a before()
const cleanup = jsdom(undefined, { url: 'http://localhost', runScripts: 'outside-only' })

global.BROWSER_TEST = true
global.navigator = {
  userAgent: 'node.js',
}
global.requestAnimationFrame = function requestAnimationFrame (callback) {
  return setTimeout(callback, 0)
}
global.cancelAnimationFrame = function cancelAnimationFrame (id) {
  clearTimeout(id)
}
Enzyme.configure({ adapter: new Adapter() })

after(() => {
  cleanup()
})
