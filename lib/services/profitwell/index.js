import {
  post as apiPost,
  TYPE_BROOKLYN_JSON,
} from 'api-client'
import { get as getConfig } from 'config'
import _get from 'lodash/get'

const config = getConfig()
export const profitwellApiUrl = 'https://public.profitwell.com/js/profitwell.js'
export const profitwellApiName = 'profitwell'
export const profitwellApiKey = _get(config, 'profitwellApiKey')
export const profitwellScriptId = `${profitwellApiName}-js`
export const profitwellTagType = 'script'

/* eslint-disable */
export async function getProfitwellApi (win, doc, name = profitwellApiName, tag = profitwellTagType, scriptUrl = profitwellApiUrl, onSuccess, onError, attempt = 0, maxAttempt = 3) {
  if (!win || !doc) {
    return
  }

  const existingScript = doc.getElementById(profitwellScriptId)

  if (!existingScript) {
    win[name] = win[name] ||
    function () {
      (win[name].q = win[name].q || []).push(arguments)
    }

    const profitwellScript = doc.createElement(tag)
    profitwellScript.setAttribute('id', profitwellScriptId)
    profitwellScript.setAttribute('data-pw-auth', profitwellApiKey)
    const scriptList = doc.getElementsByTagName(tag)[0]
    profitwellScript.async = 1
    profitwellScript.src = `${scriptUrl}?auth=${profitwellApiKey}`
    scriptList.parentNode.insertBefore(profitwellScript, scriptList)

    profitwellScript.onload = () => {
      if (onSuccess) {
        onSuccess()
      }
    }

    profitwellScript.onerror = async () => {
      if (onError) {
        console.log('profitwell script load failed...')
      }

      // delete the script tag since there was an error
      doc.getElementById(profitwellScriptId).remove()

      // try to fetch the script again until we reach the maxAttempt limit
      if (attempt < maxAttempt) {
        await delay(500)
        getProfitwellApi(win, doc, name, tag, scriptUrl, onSuccess, onError, attempt + 1)
      }
    }
  }

  if (existingScript && onSuccess) {
    onSuccess()
  }
}
/* eslint-enable */

export async function postProfitwellEntitle (options = {}) {
  try {
    const { auth } = options
    const res = await apiPost('v1/user/profitwell/entitle', null, { auth }, TYPE_BROOKLYN_JSON)
    return handlePostProfitwellEntitle(res)
  } catch (err) {
    return handlePostProfitwellEntitle({})
  }
}

export function handlePostProfitwellEntitle (res) {
  const data = _get(res, ['body'], {})
  const success = _get(data, 'success', false)

  return {
    success,
  }
}
