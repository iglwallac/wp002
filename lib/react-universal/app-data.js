import { encode as encodeBase64 } from 'base-64'

export const APP_DATA_VARIABLE_NAME = '__APP_DATA__'

export function getAppDataAsScriptTag (appData) {
  let javascript
  try {
    javascript = JSON.stringify(appData)
  } catch (e) {
    javascript = '{}'
  }
  // Escape so that is it safe to use as javascript.
  return (
    `<script>var ${APP_DATA_VARIABLE_NAME}='${encodeBase64(unescape(encodeURIComponent(javascript)))}'</script>`
  )
}

export default {
  APP_DATA_VARIABLE_NAME,
  getAppDataAsScriptTag,
}
