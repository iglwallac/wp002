import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import _partial from 'lodash/partial'
import _parseInt from 'lodash/parseInt'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _size from 'lodash/size'
import _isArray from 'lodash/isArray'
import _find from 'lodash/find'
import _forEach from 'lodash/forEach'
import { connect as connectRedux } from 'react-redux'
import { connect as connectRouter } from 'components/Router/connect'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { SITE_NAME, SEO_ALLOWED_INDEX_QUERY_PARAMS } from 'services/page'
import {
  RESOLVER_TYPE_NOT_FOUND,
  RESOLVER_TYPE_STATIC,
} from 'services/resolver/types'
import { createCanonicalUrl, createPrevUrl, createNextUrl } from 'services/url'
import { get as getConfig } from 'config'

const COMPONENT_NAME =
  process.env.NODE_ENV === 'production' ? 'pc' : 'PageConnect'
export const PAGE_SEO_TYPE_STORE = 'PAGE_SEO_TYPE_STORE'
export const PAGE_SEO_TYPE_LOCATION = 'PAGE_SEO_TYPE_LOCATION'
export const PAGE_SEO_TYPE_MANUAL = 'PAGE_SEO_TYPE_MANUAL'
const { origin } = getConfig()

/**
 * Connects page level behaviors for seo and language to child components.
 * @param {Object}  options - options for the connect.
 * @param {string}  options.seoType - the type of SEO indicates which service will be used to get
 *  the SEO data i.e. PAGE_SEO_TYPE_STORE finds it in the REDUX store and PAGE_SEO_TYPE_LOCATION
 *  uses the url service.
 * @param {string}  options.storeBranch - the branch of the redux store where SEO data lives this
 *  is related to PAGE_SEO_TYPE_STORE.
 * @param {string}  options.storeKey - the key of the redux store branch where SEO data lives this
 *  is related to PAGE_SEO_TYPE_STORE.
 */
export function connect (options) {
  const { storeBranch, seoType = PAGE_SEO_TYPE_STORE } = options
  if (seoType === PAGE_SEO_TYPE_STORE && !storeBranch) {
    throw new Error(
      'The PageConnect options require a storeBranch to know where in the store the seo data exists.',
    )
  }
  return _partial(wrapComponent, options)
}

/**
 * SEO values are found using the location directly.
 * @param {Object} props - component props.
 */
function updateLocationSeo (props) {
  const { page, auth, location, pageConnectActions } = props
  const { setPageLocationSeo } = pageConnectActions

  if (!location) {
    return
  }

  const path = `${location.pathname}${location.search || ''}`
  if (page.get('path') === path) {
    return
  }
  setPageLocationSeo({ auth, location })
}

/**
 * Update SEO data using either the redux store or the url service.
 * @param {Object} options - see pageConnect options.
 * @param {Object} props - component props.
 */
function updateSeo (options, props) {
  const { seoType = PAGE_SEO_TYPE_STORE } = options
  switch (seoType) {
    case PAGE_SEO_TYPE_LOCATION:
      updateLocationSeo(props)
      break
    case PAGE_SEO_TYPE_STORE:
      updateStoreSeo(options, props)
      break
    default:
      // Do nothing
      break
  }
}

/**
 * Update an anonymous user's language based on the language[] query parameter.
 * @param {Object} options - see pageConnect options.
 * @param {Object} props - component props.
 */
function updateAnonymousUserLanguage (options, props) {
  const { auth, user, pageConnectActions } = props
  const { setFeatureTrackingDataPersistent } = pageConnectActions
  // Don't do anything with authenticated users
  if (auth.get('jwt')) {
    return
  }
  const language = createLocationLanguage(props)
  if (
    language.size > 0 &&
    !user.getIn(['data', 'language'], List()).equals(language)
  ) {
    // We are anonymous and allow the query to set our language
    setFeatureTrackingDataPersistent({
      auth,
      data: Map({ userLanguages: List([language]) }),
    })
  }
}

function createLocationLanguage (props) {
  const { location } = props
  const query = _get(location, 'query', {})
  const languageQuery = query['language[]'] || []
  return List(_isArray(languageQuery) ? languageQuery : [languageQuery])
}

/**
 * SEO values are found in the store
 * @param {Object} props - component props.
 */
function updateStoreSeo (options, props) {
  const { storeKey } = options
  const {
    resolver,
    seoStore = Map(),
    pageConnectActions,
    location,
    history,
    page,
    totalPages,
  } = props
  const { setPageSeo } = pageConnectActions
  const resolverSynced = resolverIsSynced(resolver, location)
  // If the resolver is not ready yet or if there are no pages yet, just bail.
  if (!resolverSynced || totalPages === 0) {
    return
  }

  // The SEO store needs to be synced up with the resolver to start work.
  const resolvedId = resolver.getIn(['data', 'id'])
  const resolvedType = resolver.getIn(['data', 'type'])
  const seoStoreBranch = storeKey ? seoStore.get(storeKey, Map()) : seoStore
  const seoStoreIdsSynced =
    resolvedId === seoStoreBranch.getIn(['id']) &&
    resolvedId === seoStoreBranch.getIn(['data', 'id'])
  const seoStoreSynced =
    !seoStoreBranch.getIn(['processing']) &&
    (seoStoreIdsSynced || resolvedType === RESOLVER_TYPE_STATIC)
  const queryPage = location.query.page ? _parseInt(location.query.page) : null
  const seoStoreBranchPath = queryPage ?
    `${seoStoreBranch.get('path', '')}?page=${queryPage}` : seoStoreBranch.get('path', '')
  const pageSeoStoreBranchPathSynced = page.get('path', '') === seoStoreBranchPath

  if (!seoStoreSynced || seoStoreBranch.size === 0) {
    return
  }

  // If the page path is the same as the seoStoreBranch path, don't do anything
  if (pageSeoStoreBranchPathSynced) {
    return
  }

  // If there is no record of this URL in the resolver we should not index the page if there was
  // also no SEO record.
  const resolverType = resolver.getIn(['data', 'type'])
  const defaultNoIndex = resolverType === RESOLVER_TYPE_NOT_FOUND
  const existingOgUrl = seoStoreBranch.getIn(['data', 'social', 'og', 'url'])
  const query = queryPage ? { page: queryPage } : {}
  const title = seoStoreBranch.getIn(['data', 'seo', 'title'])
  const description = seoStoreBranch.getIn(['data', 'seo', 'description'])
  const locationQuery = location.query
  // defaults to true if there is no query params, which is desired
  let seoAllowedQueryParams = _size(locationQuery) === 0
  const noFollow = seoStoreBranch.getIn(['data', 'seo', 'robots', 'noFollow'])
  let noIndex = seoStoreBranch.getIn(
    ['data', 'seo', 'robots', 'noIndex'],
    defaultNoIndex,
  )
  const ogTitle = seoStoreBranch.getIn(['data', 'social', 'og', 'title'])
  const ogImage = seoStoreBranch.getIn(['data', 'social', 'og', 'image'])
  const ogType = seoStoreBranch.getIn(['data', 'social', 'og', 'type'])
  const ogUrl = existingOgUrl
    ? history.createHref({ pathname: existingOgUrl, query })
    : history.createHref({ pathname: `${origin}${location.pathname}`, query })
  const ogDescription = seoStoreBranch.getIn([
    'data',
    'social',
    'og',
    'description',
  ])

  // loop through the query params and see if there is an allowed param
  if (_size(locationQuery) > 0) {
    _forEach(locationQuery, (value, key) => {
      if (seoAllowedQueryParams) {
        return false
      }
      seoAllowedQueryParams = _find(SEO_ALLOWED_INDEX_QUERY_PARAMS, (param) => {
        return param === key
      })
      return seoAllowedQueryParams
    })
  }
  // if there is not an allowed query param, do not allow the page to be indexed
  if (!seoAllowedQueryParams) {
    noIndex = true
  }

  setPageSeo({
    title,
    description,
    noFollow,
    noIndex,
    ogTitle,
    ogImage,
    ogType,
    ogUrl,
    ogDescription,
    ogSiteName: SITE_NAME,
    canonical: createCanonicalUrl(location),
    prev: createPrevUrl({
      totalPages,
      pathname: location.pathname,
      page: _get(location, ['query', 'page']),
    }),
    next: createNextUrl({
      totalPages,
      pathname: location.pathname,
      page: _get(location, ['query', 'page'], 1),
    }),
    location,
  })
}

function wrapComponent (options, WrappedComponent) {
  const { storeKey, storeBranch } = options
  class PageConnect extends Component {
    componentDidMount () {
      // Skip thunk actions during unit testing
      if (global.BROWSER_TEST) {
        return
      }
      updateAnonymousUserLanguage(options, this.props)
      updateSeo(options, this.props)
    }

    componentWillReceiveProps (nextProps) {
      if (!process.env.BROWSER || global.BROWSER_TEST) {
        return
      }
      updateSeo(options, nextProps)
    }

    render () {
      if (!WrappedComponent) {
        return null
      }
      return (
        <div className="page">
          <WrappedComponent {..._omit(this.props, ['pageConnectActions'])} />
        </div>
      )
    }
  }

  PageConnect.displayName = `${COMPONENT_NAME}(${getDisplayName(
    WrappedComponent,
  )})`

  PageConnect.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    auth: ImmutablePropTypes.map.isRequired,
    page: ImmutablePropTypes.map.isRequired,
    resolver: ImmutablePropTypes.map.isRequired,
    seoStore: ImmutablePropTypes.map,
    totalPages: PropTypes.number,
    pageConnectActions: PropTypes.shape({
      setPageSeo: PropTypes.func.isRequired,
      setPageLocationSeo: PropTypes.func.isRequired,
      setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
    }),
  }

  return compose(
    connectRouter(),
    connectRedux(
      (state) => {
        const stateProps = {
          auth: state.auth,
          resolver: state.resolver,
          page: state.page,
          user: state.user,
        }
        let seoStore
        if (storeBranch && !storeKey) {
          seoStore = state[storeBranch]
        } else if (storeBranch && storeKey) {
          seoStore = state[storeBranch].filter((val, key) => key === storeKey)
        }
        if (seoStore) {
          stateProps.seoStore = seoStore
        }
        return stateProps
      },
      (dispatch) => {
        const actions = getBoundActions(dispatch)
        return {
          pageConnectActions: {
            setPageSeo: actions.page.setPageSeo,
            setPageLocationSeo: actions.page.setPageLocationSeo,
            setFeatureTrackingDataPersistent:
              actions.featureTracking.setFeatureTrackingDataPersistent,
          },
        }
      },
    ),
  )(PageConnect)
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
