import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { format as formatDateTime } from 'services/date-time'
import { checkUserSubscriptionStatus } from 'services/user-account'
import {
  URL_GIFT_SELECT,
  URL_GIFT_THEME,
  URL_GIFT_RECIPIENT,
  URL_GIFT_PREVIEW,
  URL_GIFT_PAYMENT,
} from 'services/url/constants'
import {
  GIFT_STEP_ONE,
  GIFT_STEP_TWO,
  GIFT_STEP_THREE,
  GIFT_STEP_FOUR,
  GIFT_STEP_FIVE,
} from 'services/gift'
import * as actions from './actions'

function setFormattedSendDate (locale) {
  const dateFormatString = 'MM/DD/YYYY'
  const today = formatDateTime(new Date(), locale, dateFormatString)

  return today
}

function isGiftGiverPage ({ state }) {
  const { resolver } = state
  const path = resolver.getIn(['data', 'path'])

  return (
    path === URL_GIFT_SELECT ||
    path === URL_GIFT_THEME ||
    path === URL_GIFT_RECIPIENT ||
    path === URL_GIFT_PREVIEW ||
    path === URL_GIFT_PAYMENT
  )
}

function getGiftGiverStep (state) {
  const { resolver } = state
  const path = resolver.getIn(['data', 'path'])
  let step

  switch (path) {
    case URL_GIFT_SELECT:
      step = GIFT_STEP_ONE
      break
    case URL_GIFT_THEME:
      step = GIFT_STEP_TWO
      break
    case URL_GIFT_RECIPIENT:
      step = GIFT_STEP_THREE
      break
    case URL_GIFT_PREVIEW:
      step = GIFT_STEP_FOUR
      break
    case URL_GIFT_PAYMENT:
      step = GIFT_STEP_FIVE
      break
    default:
      // do nothing
  }

  return step
}

// -----------------------------------
// Watcher for checking data server side
// -----------------------------------
export function onGiftGiverHydrationComplete ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state }) => {
    const { app, page, staticText } = state
    const locale = page.get('locale')
    const step = getGiftGiverStep(state)
    if (app.get('bootstrapComplete')) {
      dispatch({
        type: actions.SET_GIFT_CHEKOUT_STEP,
        payload: step,
      })

      if (step === GIFT_STEP_THREE) {
        dispatch({
          type: actions.SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM,
          payload: { key: 'sendDate', value: setFormattedSendDate(locale) },
        })

        dispatch({
          type: actions.SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM,
          payload: { key: 'message', value: staticText.getIn(['data', 'giftGivePage', 'data', 'defaultRecipientMessage']) },
        })
      }
    }
  })
    .when(isGiftGiverPage)
}

// -----------------------------------
// Watcher for componentDidMount/DidUpdate
// -----------------------------------
export function onGiftGiverMountAndUpdate ({ after }) {
  return after(SET_RESOLVER_DATA, async ({ dispatch, state }) => {
    const { page, staticText } = state
    const locale = page.get('locale')
    const step = getGiftGiverStep(state)
    dispatch({
      type: actions.SET_GIFT_CHEKOUT_STEP,
      payload: step,
    })

    if (step === GIFT_STEP_THREE) {
      dispatch({
        type: actions.SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM,
        payload: { key: 'sendDate', value: setFormattedSendDate(locale) },
      })

      dispatch({
        type: actions.SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM,
        payload: { key: 'message', value: staticText.getIn(['data', 'giftGivePage', 'data', 'defaultRecipientMessage']) },
      })
    }
  })
    .when(isGiftGiverPage)
}

// -----------------------------------
// Watcher for GET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS
// -----------------------------------
export function onGetGiftCheckoutRecipientSubStatus ({ after }) {
  // eslint-disable-next-line max-len
  return after(actions.GET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS, async ({ action, dispatch }) => {
    const { payload } = action

    try {
      dispatch({
        type: actions.SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING,
        payload: true,
      })

      const data = await checkUserSubscriptionStatus({ email: payload })

      dispatch({
        type: actions.SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_DATA,
        payload: { data, processing: false },
      })
    } catch (e) {
      // do nothing for now
    }
  })
    .when(isGiftGiverPage)
}
