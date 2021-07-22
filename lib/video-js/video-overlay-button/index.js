import PropTypes from 'prop-types'
import { Map } from 'immutable'

const videojs = window.videojs
const Button = videojs.getComponent('Button')
export const PLUGIN_NAME = 'VideoOverlayButtons'
const COMPONENT_NAME = 'VideoOverlayButton'
let videoPlayerInfoDisabled = false

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
function onPlayerReady(player, options) {
  player.addClass('vjs-video-overlay-buttons')

  player.controlBar.videoOverlayButton = player.controlBar.addChild('videoOverlayButton', {
    videoPlayerInfoDisabled: options.videoPlayerInfoDisabled,
    setFeatureTrackingDataPersistent: options.setFeatureTrackingDataPersistent,
  })
}

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you if not, remove the wait for "ready"!
 *
 * @function videoPlayerOverlayButtons
 * @param    {Object} [options={}]
 * An object of options left to the plugin author to define.
 */
function videoPlayerOverlayButtons(options = {}) {
  this.ready(() => {
    onPlayerReady(this, options)
  })
}

/**
 * Button to toggle video overlay
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends Button
 * @class VideoPlayerOverlayToggle
 */
class VideoPlayerOverlayButton extends Button {
  constructor(player, options) {
    super(player, options);
    videoPlayerInfoDisabled = this.options_.videoPlayerInfoDisabled
    videoPlayerInfoDisabled ? this.controlText(this.localize('Show Video Player Info')) :
      this.controlText(this.localize('Hide Video Player Info'))
  }

  buildCSSClass() {
    if (!videoPlayerInfoDisabled) {
      return 'vjs-video-overlay-button icon-v2 icon-v2--eye'
    } else {
      return 'vjs-video-overlay-button icon-v2 icon-v2--hide'
    }
  }

  handleClick() {
    const { player_, options_ } = this
    const { setFeatureTrackingDataPersistent } = options_
    setFeatureTrackingDataPersistent({
      data: Map({ disableVideoInfo: !videoPlayerInfoDisabled }),
    })
    if (videoPlayerInfoDisabled) {
      player_.controlBar.videoOverlayButton.controlText(
        player_.controlBar.videoOverlayButton.localize('Hide Video Player Info')
      )
      player_.controlBar.videoOverlayButton.removeClass('icon-v2--eye')
      player_.controlBar.videoOverlayButton.addClass('icon-v2--hide')
    } else {
      player_.controlBar.videoOverlayButton.controlText(
        player_.controlBar.videoOverlayButton.localize('Show Video Player Info')
      )
      player_.controlBar.videoOverlayButton.removeClass('icon-v2--hide')
      player_.controlBar.videoOverlayButton.addClass('icon-v2--eye')
    }
    videoPlayerInfoDisabled = !videoPlayerInfoDisabled
  }
}

export function register(videojs = window.videojs) {
  videojs.registerComponent(COMPONENT_NAME, VideoPlayerOverlayButton)
  // Register the plugin with video.js.
  registerPlugin(PLUGIN_NAME, videoPlayerOverlayButtons)
}

VideoPlayerOverlayButton.propTypes = {
  videoPlayerInfoDisabled: PropTypes.bool.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}
