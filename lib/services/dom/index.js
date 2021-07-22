import _has from 'lodash/has'

export function inViewport (elem) {
  let top = elem.offsetTop
  let left = elem.offsetLeft
  const width = elem.offsetWidth
  const height = elem.offsetHeight

  while (elem.offsetParent) {
    // eslint-disable-next-line no-param-reassign
    elem = elem.offsetParent
    top += elem.offsetTop
    left += elem.offsetLeft
  }

  return (
    top < window.pageYOffset + window.innerHeight &&
    left < window.pageXOffset + window.innerWidth &&
    top + height > window.pageYOffset &&
    left + width > window.pageXOffset
  )
}

export function isVisible (elem) {
  // This is taken from JQuery / Sizzle
  return elem.offsetWidth > 0 || elem.offsetHeight > 0 // visible
}

export function getResizeEventName () {
  if (_has(window, 'onorientationchange')) {
    return 'orientationchange'
  }
  return 'resize'
}

export function getElementToWindowTopOffset (el) {
  const rect = el.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  return rect.top + scrollTop
}
