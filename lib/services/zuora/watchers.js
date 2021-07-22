import { Map } from 'immutable'
import { getZuoraIframeSignatureToken } from 'services/zuora'
import { get as getConfig } from 'config'
import _get from 'lodash/get'
import { getPrimary } from 'services/languages'
import {
  URL_CART_BILLING_PAYMENT,
  URL_ACCOUNT,
} from 'services/url/constants'
import { SET_CHECKOUT_ORDER_ERROR } from 'services/checkout/actions'
import { SET_UPDATE_PAYMENT_ORDER_ERROR } from 'services/update-payment/actions'
import { fromCallback as fromCallbackPromise, delay } from 'bluebird'
import { getExponentialDelay } from 'exponential-backoff'
import {
  getGoogleRecaptchaScript,
  getCaptchaVerifyToken,
  CAPTCHA_ACTION_BILLING_PAYMENT_FORM_VIEW,
} from 'services/captcha'
import { US } from 'services/country'
import * as actions from './actions'

const config = getConfig()
const zuoraCreditCardPageId = _get(config, ['zuoraIframeCreditCardPageId'])
const zuoraIframeUrl = _get(config, ['zuoraIframeUrl'])

function shouldLoadZuoraIframeScript ({ state }) {
  const { resolver } = state
  const path = resolver.getIn(['data', 'path'])

  return (path === URL_CART_BILLING_PAYMENT || path === URL_ACCOUNT)
}

async function getZuoraIframeScript (attempt = 0, maxAttempt = 3) {
  const { default: scriptjs } = await import('scriptjs')
  await fromCallbackPromise(cb => scriptjs('https://static.zuora.com/Resources/libs/hosted/1.3.1/zuora-min.js', () => cb()))
  const { Z } = global

  // Check if Zuora iframe script loaded and try again if not
  /* eslint-disable no-useless-return */
  if (!Z && attempt < maxAttempt) {
    // Try to load the script again
    await delay(getExponentialDelay(300))
    await getZuoraIframeScript(attempt + 1)
    return
  } else if (!Z && attempt === maxAttempt) {
    // We tried too many times and the script didn't load, just give up
    return
  }
  /* eslint-enable no-useless-return */
}

// -----------------------------------
// Watcher for GET_ZUORA_IFRAME_SIGNATURE_TOKEN
// -----------------------------------
export function watchGetZuoraIframeSignatureToken ({ after }) {
  return after(actions.GET_ZUORA_IFRAME_SIGNATURE_TOKEN, async ({ dispatch }) => {
    try {
      const pageId = _get(config, ['zuoraIframeCreditCardPageId'])
      const uri = _get(config, ['zuoraIframeUrl'])
      const { googleRecaptchaSiteKey } = getConfig()

      dispatch({
        type: actions.SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING,
        payload: true,
      })

      await getGoogleRecaptchaScript()
      const { grecaptcha } = global

      // TODO: determine if we want checkout to continue
      // even if Google Recaptcha script fails to load
      if (grecaptcha) {
        await fromCallbackPromise(cb => grecaptcha.ready(() => cb()))
        const token = await grecaptcha.execute(googleRecaptchaSiteKey, {
          action: CAPTCHA_ACTION_BILLING_PAYMENT_FORM_VIEW,
        })
        const tokenResponse = await getCaptchaVerifyToken({ token })
        const { valid } = tokenResponse

        if (valid) {
          const data = await getZuoraIframeSignatureToken({ pageId, uri })

          dispatch({
            type: actions.SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA,
            payload: { data, processing: false },
          })
        }

        dispatch({
          type: actions.SET_ZUORA_IFRAME_CAPTCHA_VALID,
          payload: valid,
        })
      }
    } catch (e) {
      dispatch({
        type: actions.SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA,
        payload: { data: { success: false }, processing: false },
      })
    }
  })
}

// -----------------------------------
// Watcher for SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA
// -----------------------------------
export function watchSetZuoraIframeSignatureTokenData ({ after }) {
  return after(actions.SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA, async ({ state, dispatch }) => {
    const { zuora } = state
    const tokenSuccess = zuora.getIn(['data', 'iframe', 'rsa', 'success'])

    if (tokenSuccess) {
      await getZuoraIframeScript()
      const { Z } = global

      if (Z) {
        dispatch({
          type: actions.SET_ZUORA_IFRAME_SCRIPT_LOADED,
          payload: true,
        })
      } else {
        dispatch({
          type: actions.SET_ZUORA_IFRAME_SCRIPT_LOADED,
          payload: false,
        })
      }
    }
  })
    .when(shouldLoadZuoraIframeScript)
}

// -----------------------------------
// Watcher for SET_ZUORA_IFRAME_CLIENT_READY
// -----------------------------------
export function watchSetZuoraIframeClientReady ({ before }) {
  return before(actions.SET_ZUORA_IFRAME_CLIENT_READY, async ({ state, action, dispatch }) => {
    const { zuora, user, plans, auth, userAccount, staticText } = state
    const { payload } = action
    const userLanguage = getPrimary(user.getIn(['data', 'language']))
    const previousClientReady = zuora.getIn(['data', 'iframe', 'clientReady'])
    const nextClientReady = payload
    const { default: countryCodeLookup } = await import('country-code-lookup')
    const { byCountry, byIso } = countryCodeLookup
    let lookupCountry = byIso(US)
    const selectedPlan = plans.get('selection', Map())
    const planCountry = selectedPlan.get('country')
    const authCountry = auth.get('country')
    const subscriptionPaymentCountry = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'cardCountry'])
    const zuoraStaticText = staticText.getIn(['data', 'zuoraIframe', 'data'], Map())

    // check to see if the user is logged in and has a payment method
    if (auth.get('jwt') && subscriptionPaymentCountry) {
      lookupCountry = byCountry(subscriptionPaymentCountry)
    } else if (planCountry) {
      // if the user has selected a plan
      lookupCountry = byIso(planCountry)
    } else if (authCountry) {
      // if the user is logged in get the country
      lookupCountry = byIso(authCountry)
    }

    const { Z } = global

    const iframeSubmitCallback = (response) => {
      if (!response.success || response.success !== 'true') {
        return dispatch({
          type: actions.SET_ZUORA_PAYMENT_TOKEN_ERROR,
          payload: 'paymentError',
        })
      }

      return dispatch({
        type: actions.SET_ZUORA_PAYMENT_TOKEN_DATA,
        payload: {
          refId: _get(response, ['refId']),
          token: _get(response, ['token']),
          country: _get(response, ['creditCardCountry']),
          postalCode: _get(response, ['creditCardPostalCode']),
        },
      })
    }

    const errorMessageCallback = (key, code, message) => {
      const expirationDateRegex = /.*Expiration date.*future date.*/ig
      const invalidCreditCardRegex = /.*Transaction Declined.*Invalid CC Number.*/ig
      let newMessage = message

      if (key === 'error') {
        dispatch({
          type: actions.SET_ZUORA_PAYMENT_TOKEN_ERROR,
          payload: 'paymentTokenError',
        })
      }

      // there was an error so halt processing
      dispatch({
        type: actions.SET_ZUORA_PAYMENT_TOKEN_PROCESSING,
        payload: false,
      })

      if (expirationDateRegex.test(message)) {
        newMessage = zuoraStaticText.get('expirationDateError', message)
      } else if (invalidCreditCardRegex.test(message)) {
        newMessage = zuoraStaticText.get('invalidCreditCardError', message)
      }

      Z.sendErrorMessageToHpm(key, newMessage)
    }

    const onRenderComplete = () => {
      // tell the client that render is complete, so display the iframe
      dispatch({
        type: actions.SET_ZUORA_IFRAME_RENDER_COMPLETE,
        payload: true,
      })
    }


    if (Z && nextClientReady && nextClientReady !== previousClientReady) {
      // pre-populated values
      const prepopulate = {
        creditCardCountry: _get(lookupCountry, 'iso3'),
      }

      // set up the params to render the iframe
      const iframeParams = {
        signature: zuora.getIn(['data', 'iframe', 'rsa', 'signature']),
        token: zuora.getIn(['data', 'iframe', 'rsa', 'token']),
        tenantId: zuora.getIn(['data', 'iframe', 'rsa', 'tenantId']),
        key: zuora.getIn(['data', 'iframe', 'rsa', 'key']),
        id: zuoraCreditCardPageId,
        locale: userLanguage,
        url: zuoraIframeUrl,
        style: 'inline',
        retainValues: 'true',
        submitEnabled: 'true',
      }

      // render the iframe
      // documentation for renderWithErrorHandler can be found at:
      // https://knowledgecenter.zuora.com/Billing/Billing_and_Payments/LA_Hosted_Payment_Pages/B_Payment_Pages_2.0/N_Error_Handling_for_Payment_Pages_2.0/Customize_Error_Messages_for_Payment_Pages_2.0#Invoke_the_Alternate_Render_Function_for_Custom_Error_Handling
      Z.renderWithErrorHandler(
        iframeParams,
        prepopulate,
        iframeSubmitCallback,
        errorMessageCallback,
      )

      // runs when render is complete
      Z.runAfterRender(onRenderComplete)
    }
  })
    .when(shouldLoadZuoraIframeScript)
}

// -----------------------------------
// Watcher for SET_CHECKOUT_ORDER_ERROR
// -----------------------------------
export function watchSetCheckoutUpdatePaymentOrderError ({ after }) {
  return after([SET_CHECKOUT_ORDER_ERROR, SET_UPDATE_PAYMENT_ORDER_ERROR], async ({ dispatch }) => {
    dispatch({
      type: actions.SET_ZUORA_PAYMENT_TOKEN_PROCESSING,
      payload: false,
    })
  })
    .when(shouldLoadZuoraIframeScript)
}
