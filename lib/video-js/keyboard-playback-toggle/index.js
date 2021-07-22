import _includes from 'lodash/includes'
import _get from 'lodash/get'
import _toLower from 'lodash/toLower'

export const PLUGIN_NAME = 'KeyboardPlaybackToggle'
const EDITABLE_TAG_NAMES = ['textarea', 'input']

async function togglePlayback (player) {
  if (!player) {
    return
  }
  if (player.paused()) {
    try {
      await player.play()
      return
    } catch (e) {
      // Do nothing the brower might not allow playback
    }
  }
  await player.pause()
}

function onPlayerReady (player, keys) {
  function onKeyDown (e) {
    const tagName = _toLower(_get(e, ['target', 'tagName']) || '')

    if (_includes(keys, e.keyCode) && !_includes(EDITABLE_TAG_NAMES, tagName)) {
      e.preventDefault()
      e.stopPropagation()
      togglePlayback(player)
    }
  }

  // keydown event with capture to block event
  // from getting to player controls
  window.addEventListener('keydown', onKeyDown, true)
  player.on('dispose', () => {
    window.removeEventListener('keydown', onKeyDown, true)
  })
}

function plugin (options = {}) {
  const player = this
  const { keys = [] } = options
  player.ready(() => onPlayerReady(player, keys))
}

export function register (videojs = window.videojs) {
  videojs.registerPlugin(PLUGIN_NAME, plugin)
}
