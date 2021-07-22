import _assign from 'lodash/assign'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import ReactDOM from 'react-dom'

const Component = videojs.getComponent('Component')
export const PLUGIN_NAME = 'VideoPlayerApps'
const COMPONENT_NAME = 'VideoPlayerApp'

/**
 * Get the DOMNode for this plugin element
 * @param {Object} player VideoJS player instance
 * @return {HTMLElement} The DOMNode for this plugin element
 */
function getPlayerDomNode (player) {
  return player.getChild(COMPONENT_NAME).el()
}

function VideoPlayerApps (options = {}) {
  const player = this
  if (!_isFunction(options.render)) {
    throw new Error('The render option is required to be a function')
  }
  const { render } = options
  player.ready(() => {
    player.addChild(COMPONENT_NAME, options)
    const component = render(player)
    // Create the React app
    ReactDOM.render(component, getPlayerDomNode(player))
    // // On dispose unmount the React app
    player.on('dispose', function onDisposeUnmountComponent () {
      ReactDOM.unmountComponentAtNode(getPlayerDomNode(player))
    })
    player.on('touchend', function onTap () {
      player.userActive(true)
      player.setTimeout(() => {
        player.userActive(false)
      }, 5000)
    })
  })
}

class VideoPlayerApp extends Component {
  constructor(player, options){
    super(player, options)
  }
}

export function register (videojs = window.videojs) {
  videojs.registerComponent(COMPONENT_NAME, VideoPlayerApp)
  videojs.registerPlugin(PLUGIN_NAME, VideoPlayerApps)
}
