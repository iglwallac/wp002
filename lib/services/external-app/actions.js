export const SET_EXTERNAL_APP_ASSET = 'SET_EXTERNAL_APP_ASSET'
export const SET_EXTERNAL_APP_ASSETS = 'SET_EXTERNAL_APP_ASSETS'

export function setExternalAppAsset (appKey, type, value) {
  return {
    type: SET_EXTERNAL_APP_ASSET,
    payload: { appKey, type, value },
  }
}

export function setExternalAppAssets (appKey, assets) {
  return {
    type: SET_EXTERNAL_APP_ASSETS,
    payload: { appKey, assets },
  }
}
