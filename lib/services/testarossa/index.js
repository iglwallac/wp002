// ---------------------------------
// V12 API Hooks
// ---------------------------------

export function dispatch (func) {
  const { V12 } = global
  if (V12) return V12.dispatch(func)
  return null
}

export function isDisabled () {
  const { V12 } = global
  if (V12) return V12.isDisabled()
  return false
}

export function isEnabled () {
  const { V12 } = global
  if (V12) return V12.isEnabled()
  return true
}

export function hasInitialized () {
  const { V12 } = global
  if (V12) return V12.hasInitialized()
  return false
}

export function isProcessing () {
  const { V12 } = global
  if (V12) return V12.isProcessing()
  return false
}

export function getState (key, fallback) {
  const { V12 } = global
  if (V12) return V12.getState(key, fallback)
  return null
}

export function setState (updater, callback) {
  const { V12 } = global
  if (V12) V12.setState(updater, callback)
}

export function getContext (key, fallback) {
  const { V12 } = global
  if (V12) return V12.getContext(key, fallback)
  return null
}

export function setContext (updater, callback) {
  const { V12 } = global
  if (V12) V12.setContext(updater, callback)
}

export function getSubject (props) {
  const { V12 } = global
  if (V12) return V12.getSubject(props)
  return {}
}

export function getCampaign (props) {
  const { V12 } = global
  if (V12) return V12.getCampaign(props)
  return {}
}

export function getVariation (props) {
  const { V12 } = global
  if (V12) return V12.getVariation(props)
  return {}
}

export function updateSubject (props) {
  const { V12 } = global
  if (V12) V12.updateSubject(props)
}

export function trackSubject (props) {
  const { V12 } = global
  if (V12) V12.trackSubject(props)
}

export function addListener (type, handler) {
  const { V12 } = global
  if (V12) V12.addListener(type, handler)
}

export function emitEvent (type, args) {
  const { V12 } = global
  if (V12) V12.emitEvent(type, args)
}

export function removeListener (type, handler) {
  const { V12 } = global
  if (V12) V12.removeListener(type, handler)
}

export function deactivateSubject (props) {
  const { V12 } = global
  if (V12) V12.deactivateSubject(props)
}

export function campaignShouldRender (props) {
  const { V12 } = global
  if (V12) return V12.campaignShouldRender(props)
  return false
}

export function variationShouldRender (props) {
  const { V12 } = global
  if (V12) return V12.variationShouldRender(props)
  return false
}

export function getSubjectVariables (props) {
  const { V12 } = global
  if (V12) return V12.getSubjectVariables(props)
  return {}
}
