import PropTypes from 'prop-types'
import { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { isCartConfirmation } from 'services/url'
import { URL_LOGIN, URL_LOGOUT } from 'services/url/constants'
import { isSynced as resolverIsSynced } from 'components/Resolver/synced'
import { createGaiaScreenModel } from 'services/resolver'
import { RESOLVER_TYPE_NODE } from 'services/resolver/types'
import { getPrimary } from 'services/languages'

const TYPE_PAGE_CATEGORY_UPDATE_DETAIL = 'detail'
const TYPE_PAGE_CATEGORY_UPDATE_VIDEO = 'video'

function getDataLayerName ({ dataLayerName }) {
  return dataLayerName || 'dataLayer'
}

function pushPageView (props, location) {
  const { pageTitle, auth, user } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  setTimeout(() => {
    const search = location.search || ''
    const data = {
      event: 'Pageview',
      pageURL: location.pathname + search,
      pageTitle: pageTitle || '',
      loggedInStatus: auth.get('jwt') ? 'Logged In' : false,
      memberStatus: auth.get('jwt') ? 'member' : 'anonymous',
      pageLanguage: userLanguage,
    }
    if (auth.get('uid')) {
      data.userId = auth.get('uid')
    }
    if (isCartConfirmation(location.pathname)) {
      const { plans, checkout } = props
      // get the account uuid from gcsi or account number from zuora
      const uuid = checkout.getIn(['orderData', 'gcsi', 'uuid']) || checkout.getIn(['orderData', 'billing', 'accountNumber'])
      const price = plans.getIn(['selection', 'firstPayment'])
      const sku = plans.getIn(['selection', 'sku'])

      const product = {
        id: sku,
        quantity: 1,
        price,
        category: 'Plans',
        name: plans.getIn(['selection', 'heading']),
        coupon: null,
        uuid,
      }
      const actionField = {
        id: uuid,
        revenue: price,
        tax: '0.00',
        shipping: '0.00',
      }

      data.ecommerce = {
        purchase: {
          actionField,
          products: [product],
        },
      }
    }

    window[getDataLayerName(props)].push(data)
  }, 0)
}

function pushPageCategoryUpdate (props, type = null) {
  const { detail, video } = props
  const detailSiteSegment = detail.getIn(['data', 'siteSegment', 'name'], undefined)
  const videoSiteSegment = video.getIn(['data', 'siteSegment', 'name'], undefined)
  // this sets siteSegment for the server side load
  let siteSegment = detailSiteSegment || videoSiteSegment || undefined
  // this sets siteSegment for the client side load
  if (type === TYPE_PAGE_CATEGORY_UPDATE_DETAIL) {
    siteSegment = detailSiteSegment
  }
  if (type === TYPE_PAGE_CATEGORY_UPDATE_VIDEO) {
    siteSegment = videoSiteSegment
  }

  setTimeout(() => {
    const data = {
      event: 'pageCategoryUpdate',
      pageCategory: siteSegment,
    }

    window[getDataLayerName(props)].push(data)
  }, 0)
}

function resolverChanged (resolver, nextResolver) {
  return !resolver.get('data').equals(nextResolver.get('data'))
}

class GoogleTagManager extends Component {
  componentDidMount () {
    const { props } = this
    const { app, auth, resolver, location, page, setEventPageViewed } = props
    const resolverType = resolver.getIn(['data', 'type'], null)

    pushPageView(props, location)

    // Create screen/page event model based on location path and path info
    const gaiaScreen = createGaiaScreenModel({ resolver })
    setEventPageViewed({ auth, location, page, app, gaiaScreen })

    if (resolverType === RESOLVER_TYPE_NODE) {
      pushPageCategoryUpdate(props)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }
    const props = this.props
    const {
      auth,
      location,
      resolver,
      page,
      video,
      setEventPageViewed,
      clearUpstreamContext,
    } = props
    const {
      auth: nextAuth,
      resolver: nextResolver,
      location: nextLocation,
      page: nextPage,
      video: nextVideo,
      app: nextApp,
      upstreamContext,
    } = nextProps
    const resolverSynced = resolverIsSynced(nextResolver, nextLocation)
    const resolverType = nextResolver.getIn(['data', 'type'])
    const queryChanged = location.search !== nextLocation.search
    const nextPagePath = nextPage.get('path')
    const previousPagePath = page.get('path')
    const nextVideoId = nextVideo.getIn(['data', 'id'])
    const previousVideoId = video.getIn(['data', 'id'])

    // login and logout page views
    if (!auth.get('jwt') && nextAuth.get('jwt')) {
      pushPageView(nextProps, { pathname: URL_LOGIN })
    } else if (auth.get('jwt') && !nextAuth.get('jwt')) {
      pushPageView(nextProps, { pathname: URL_LOGOUT })
    }

    // Track all location changes through the resolver so we can leverage
    // its path info
    if (resolverChanged(resolver, nextResolver)) {
      pushPageView(nextProps, nextLocation)
      setEventPageViewed({
        auth: nextAuth,
        location: nextLocation,
        page: nextPage,
        app: nextApp,
        upstreamContext,
        gaiaScreen: createGaiaScreenModel({ resolver: nextResolver }),
      })
      /**
       * Don't clear upstreamContext if we are redirecting to the VideoPlayer
       * VideoPlayer needs the upstreamContext for the 'video played' event
       * - If we clear upstreamContext here, it is cleared before the 'video
       *   played' event is fired by VideoPlayer
       */
      if (upstreamContext && !nextLocation.query.fullplayer) {
        clearUpstreamContext()
      }
    }

    // Add siteSegment as pageCategory to the dataLayer
    if (resolverSynced && resolverType === RESOLVER_TYPE_NODE) {
      // a crappy workaround to keep some things from firing twice...
      let triggerVideo = true
      // for detail pages
      if (nextPagePath !== previousPagePath ||
        (nextPagePath === previousPagePath && queryChanged)
      ) {
        triggerVideo = false
        pushPageCategoryUpdate(nextProps, TYPE_PAGE_CATEGORY_UPDATE_DETAIL)
      }
      // for video pages
      if (nextVideoId !== previousVideoId && triggerVideo) {
        pushPageCategoryUpdate(nextProps, TYPE_PAGE_CATEGORY_UPDATE_VIDEO)
      }
    }
  }

  shouldComponentUpdate () {
    // The HTML never changes so don't ever update
    return false
  }

  render () {
    return null
  }
}

GoogleTagManager.propTypes = {
  dataLayerName: PropTypes.string,
  additionalEvents: PropTypes.object,
  location: PropTypes.object.isRequired,
  pageTitle: PropTypes.string,
  scriptId: PropTypes.string,
  app: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  video: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  setEventPageViewed: PropTypes.func,
}

export default connect(
  state => ({
    app: state.app,
    auth: state.auth,
    user: state.user,
    resolver: state.resolver,
    plans: state.plans,
    page: state.page,
    detail: state.detail,
    video: state.video,
    checkout: state.checkout,
    upstreamContext: state.upstreamContext.get('data'),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      actions,
      setEventPageViewed: actions.eventTracking.setEventPageViewed,
      clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
    }
  },
)(GoogleTagManager)
