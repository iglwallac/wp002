export const GET_ASSETS_LIST = 'GET_ASSETS_LIST'
export const GET_ASSET = 'GET_ASSET'
export const SET_ASSETS_LIST = 'SET_ASSETS_LIST'
export const SET_ASSET = 'SET_ASSET'
export const SET_ASSET_ERROR = 'SET_ASSET_ERROR'

export function getAssetsList (params, language) {
  return {
    type: GET_ASSETS_LIST,
    payload: { params, language },
  }
}

export function getAsset (assetId, language) {
  return {
    type: GET_ASSET,
    payload: { assetId, language },
  }
}

export function setAssetsList (data, language) {
  return {
    type: SET_ASSETS_LIST,
    payload: {
      data,
      language,
    },
  }
}

export function setAsset (assetId, language, data) {
  return {
    type: SET_ASSET,
    payload: {
      assetId,
      language,
      data,
    },
  }
}

export function setAssetError (assetId, language, error) {
  return {
    type: SET_ASSET_ERROR,
    payload: {
      assetId,
      language,
      error,
    },
  }
}
