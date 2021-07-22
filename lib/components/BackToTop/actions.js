import { BACK_TO_TOP_SCROLL_DURATION } from 'components/BackToTop'

export const SET_BACK_TO_TOP_SCROLLING = 'SET_BACK_TO_TOP_SCROLLING'

export function setBackToTopScrolling (value) {
  return {
    type: SET_BACK_TO_TOP_SCROLLING,
    payload: value,
  }
}

export function setBackToTopScroll () {
  return function setBackToTopScrollThunk (dispatch) {
    dispatch(setBackToTopScrolling(true))
    return setTimeout(() => dispatch(setBackToTopScrolling(false)), BACK_TO_TOP_SCROLL_DURATION)
  }
}
