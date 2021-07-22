import _get from 'lodash/get'
import { getRoutes } from 'routes'
import {
  getRouteInfo,
  parseLocation,
} from '.'

export const SET_RESOLVER_REDIRECT_PATH = 'SET_RESOLVER_REDIRECT_PATH'
export const SET_RESOLVER_STATIC_PATHS = 'SET_RESOLVER_STATIC_PATHS'
export const SET_RESOLVER_LOCATION = 'SET_RESOLVER_LOCATION'
export const GET_RESOLVER_DATA = 'GET_RESOLVER_DATA'
export const SET_RESOLVER_DATA = 'SET_RESOLVER_DATA'
export const SET_RESOLVER_PROCESSING = 'SET_RESOLVER_PROCESSING'

const routes = getRoutes()

export function getResolverData (location, auth) {
  return async function getResolverDataThunk (dispatch, getState) {
    const { pathname } = location
    const { resolver: state } = getState()
    dispatch(setResolverLocation(location))
    const data = await getRouteInfo({
      path: pathname,
      auth,
      routes,
      followRedirects: true,
    })
    const path = _get(data, 'path')
    if (path && pathname !== path) {
      dispatch(setResolverRedirectPath(path))
    } else if (state.get('redirectPath')) {
      dispatch(setResolverRedirectPath(null))
    }
    dispatch(setResolverData(data))
    return data
  }
}

export function setResolverRedirectPath (path) {
  return {
    type: SET_RESOLVER_REDIRECT_PATH,
    payload: path,
  }
}

export function setResolverStaticPaths (paths) {
  return {
    type: SET_RESOLVER_STATIC_PATHS,
    payload: paths,
  }
}

export function setResolverLocation (location, processing = true) {
  return {
    type: SET_RESOLVER_LOCATION,
    payload: { location: parseLocation(location), processing },
  }
}

export function setResolverData (data, processing = false) {
  return {
    type: SET_RESOLVER_DATA,
    payload: { data, processing },
  }
}

export function setResolverProcessing (value) {
  return {
    type: SET_RESOLVER_PROCESSING,
    payload: value,
  }
}
