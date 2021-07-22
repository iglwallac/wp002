import _get from 'lodash/get'
import { get as getConfig } from 'config'
import { EN } from 'services/languages/constants'
import { campaignShouldRender, getVariation } from 'services/testarossa'
import {
  isAccountCancelFlow,
  isAccountPauseFlow,
  isCheckoutFlowPage,
} from 'services/url'

const config = getConfig()
const enabled = _get(config, ['features', 'zendeskChat'])
const zendeskCheckoutFlowEnabled = _get(config, ['features', 'zendeskChatOnCheckoutFlowEnabled'])// Documentation for the chat widget
// https://api.zopim.com/files/meshim/widget/controllers/LiveChatAPI-js.html

const MAX_ATTEMPTS = 10

let currentLocation = null
let currentLanguage = EN
let initialized = false
let timer = null
let attempts = 0

function shouldShow () {
  const embed = _get(currentLocation, 'query.embed')

  if (currentLanguage !== EN
    || embed === 'true') {
    return false
  }

  let showChat = false

  const { pathname } = currentLocation
  if (campaignShouldRender({ campaign: 'ME-2809' })) {
    const variation = getVariation({ campaign: 'ME-2809' })
    if (_get(variation, 'friendlyId') === 1) {
      const visibilityRules = _get(variation, 'criteria').find(i => _get(i, 'type') === 'VISIBILITY')
      const benchmarks = _get(visibilityRules, 'benchmarks')
      const allowedPaths = benchmarks.map(i => _get(i, 'value'))
      showChat = allowedPaths.includes(pathname)
    }
  }

  // keep cancel and checkout outside of experiment
  if (
    isAccountCancelFlow(pathname) ||
    isAccountPauseFlow(pathname) ||
    (zendeskCheckoutFlowEnabled && isCheckoutFlowPage(pathname))
  ) {
    showChat = true
  }
  return showChat
}

function waitForZE (location, language, isLoggedIn) {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (attempts < MAX_ATTEMPTS) {
    timer = setTimeout(() => {
      attempts += 1
      zendesk(location, language, isLoggedIn)
    }, 1000)
  }
}

export default function zendesk (location, language, isLoggedIn) {
  // im adding this because of the 'setOnStatus'
  // event listener. If CR comes online or goes offline while a visitor is on a page,
  // we need to keep the page context when the status changes so that we can appropriately
  // show or hide the chat wiget.
  currentLocation = location
  currentLanguage = language

  if (enabled) {
    const zE = global.zE
    if (zE) {
      /* eslint-disable react/no-did-update-set-state */
      /* eslint-disable no-undef */
      if (!initialized) {
        initialized = true
        // setup and theme
        zE(() => {
          $zopim(() => {
            $zopim.livechat.theme.setColor('#01B4B4')
            $zopim.livechat.theme.reload()
            $zopim.livechat.button.setOffsetHorizontal(15)
            $zopim.livechat.setDisableSound(true)
            // hide the chat widget by default
            $zopim.livechat.hideAll()
            $zopim.livechat.setOnStatus((status) => {
              if (status === 'online') {
                if (shouldShow()) {
                  $zopim.livechat.button.show()
                }
              } else {
                $zopim.livechat.hideAll()
              }
            })
          })
        })
      }

      zE(() => {
        $zopim(() => {
          if (shouldShow()) {
            $zopim.livechat.button.show()
          } else {
            $zopim.livechat.hideAll()
          }
        })
      })
      return
    }
    waitForZE(location, language, isLoggedIn)
  }
}
