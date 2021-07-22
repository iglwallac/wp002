export const SET_OFFLINE_MEDIA = 'SET_OFFLINE_MEDIA'

export function setOfflineMediaData (data, processing = false) {
  return {
    type: SET_OFFLINE_MEDIA,
    payload: { data, processing },
  }
}
