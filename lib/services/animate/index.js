
export function requestAnimationFrame (callback, delay = 0, _window = window) {
  if (!process.env.BROWSER) {
    return callback
  }
  const { requestAnimationFrame: _requestAnimationFrame } = _window
  return setTimeout(() => {
    if (!process.env.BROWSER || !_requestAnimationFrame) {
      return callback()
    }
    return _requestAnimationFrame(callback)
  }, delay)
}

export function cancelAnimationFrame (reference) {
  if (reference) {
    clearTimeout(reference)
  }
}
