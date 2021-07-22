import { getSeo } from 'services/url'

export const SET_PAGE_TITLE = 'SET_PAGE_TITLE'
export const SET_PAGE_PATH = 'SET_PAGE_PATH'
export const SET_PAGE_NEXT_PREV = 'SET_PAGE_NEXT_PREV'
export const SET_PAGE_LANG = 'SET_PAGE_LANG'
export const SET_PAGE_CANONICAL = 'SET_PAGE_CANONICAL'
export const SET_PAGE_SEO = 'SET_PAGE_SEO'
export const SET_PAGE_TOUCH_DEVICE = 'SET_PAGE_TOUCH_DEVICE'

export function setPageTitle (value) {
  return {
    type: SET_PAGE_TITLE,
    payload: value,
  }
}

export function setPageLang (value) {
  return {
    type: SET_PAGE_LANG,
    payload: value,
  }
}

export function setPageTouchDevice (value) {
  return {
    type: SET_PAGE_TOUCH_DEVICE,
    payload: value,
  }
}

export function setPagePath (value) {
  return {
    type: SET_PAGE_PATH,
    payload: value,
  }
}

export function setPageNextPrev (next, prev) {
  return {
    type: SET_PAGE_NEXT_PREV,
    payload: { next, prev },
  }
}

export function setPageCanonical (value) {
  return {
    type: SET_PAGE_CANONICAL,
    payload: value,
  }
}

export function setPageLocationSeo (options = {}) {
  const { location, auth } = options
  if (!location) {
    throw new Error('The location option is required.')
  }
  if (!auth) {
    throw new Error('The auth option is required.')
  }
  return function setPageLocationSeoThunk (dispatch) {
    const seo = getSeo({
      pathname: location.pathname,
      loggedIn: !!auth.get('jwt'),
    })
    dispatch(
      setPageSeo({
        title: seo.title,
        description: seo.description,
        noFollow: seo.noFollow,
        noIndex: seo.noIndex,
        location,
      }),
    )
  }
}

export function setPageSeo (options = {}) {
  const {
    title = 'Gaia - Conscious Media, Yoga & More',
    description,
    noFollow,
    noIndex,
    ogTitle,
    ogImage,
    ogType,
    ogUrl,
    ogDescription,
    ogSiteName,
    location,
    canonical,
    prev,
    next,
    twitterCard,
    twitterImage,
    twitterTitle,
    twitterDescription,
  } = options
  if (!location) {
    throw new Error('The location option is required.')
  }
  return {
    type: SET_PAGE_SEO,
    payload: {
      path: location.pathname + (location.search || ''),
      title,
      description,
      noFollow,
      noIndex,
      ogTitle,
      ogImage,
      ogType,
      ogUrl,
      ogDescription,
      ogSiteName,
      canonical,
      prev,
      next,
      twitterCard,
      twitterImage,
      twitterTitle,
      twitterDescription,
    },
  }
}
