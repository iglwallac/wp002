import _assign from 'lodash/assign'
import { stringify } from 'services/query-string'

let callbackId = 0

// eslint-disable-next-line import/prefer-default-export
export function sendSubscription (options = {}) {
  const { path, formData, onError, onSuccess } = options
  const head = document.documentElement.firstChild
  const script = document.createElement('script')
  // eslint-disable-next-line no-plusplus
  const callbackName = `subscriptionCallback${++callbackId}`
  const qsData = _assign({}, formData, { callback: callbackName })
  let wasSuccessful = false
  window[callbackName] = function setCallback () {
    head.removeChild(script)
    if (onSuccess && !wasSuccessful) {
      onSuccess()
      wasSuccessful = true
    }
  }
  script.src = `https://subscriptions.gaia.com/${path}?${stringify(qsData)}`
  script.addEventListener(
    'error',
    () => {
      head.removeChild(script)
      if (onError) {
        onError()
      }
    },
    false,
  )
  head.appendChild(script)
  setTimeout(() => {
    /* Because responsys has a bug that responds with an error, even if resopnse is successful.
      Do this until Responsys resopnds with correct HTTP respons. */
    if (onSuccess && !wasSuccessful) {
      onSuccess()
      wasSuccessful = true
    }
  }, 500)
}
