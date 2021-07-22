import { isTouch } from 'environment'

export default function getViewport () {
  const { innerWidth, innerHeight } = global
  if (innerWidth) {
    return {
      unavailable: false,
      touchable: isTouch(),
      height: innerHeight,
      width: innerWidth,
    }
  }
  const { document } = global
  const { documentElement } = document
  const { clientHeight, clientWidth } = documentElement
  return {
    touchable: isTouch(),
    height: clientHeight,
    width: clientWidth,
    ready: false,
  }
}
