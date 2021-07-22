import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import compose from 'recompose/compose'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _parseInt from 'lodash/parseInt'
import _replace from 'lodash/replace'
import _size from 'lodash/size'
import _split from 'lodash/split'
import _toString from 'lodash/toString'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { getSeo, isFullUrl } from 'services/url'
import { historyRedirect } from 'services/navigation'
import { getAuthIsLoggedIn } from 'services/auth'
import { LTM } from 'services/currency'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { connect as connectPage, PAGE_SEO_TYPE_MANUAL } from 'components/Page/connect'

const HOSTNAME = _get(global, ['location', 'hostname'], 'www.gaia.com')
const HOSTNAME_REGEX = new RegExp(`^https?://${HOSTNAME}/?`, 'i')

function handleRedirect (props, url) {
  const { history, auth, user = Map() } = props
  const language = user.getIn(['data', 'language'])
  if (isFullUrl(url)) {
    if (HOSTNAME_REGEX.test(url)) {
      window.location.href = url
      return
    }
    historyRedirect({
      url: '/',
      language,
      history,
      auth,
    })
    return
  }
  historyRedirect({
    language,
    history,
    auth,
    url,
  })
}

function handleAddToPlaylist (props, addToPlaylist, url) {
  const { auth, location, batchPlaylistItems } = props
  const showLogin = _get(location, ['query', 'login'])
  if (!getAuthIsLoggedIn(auth)) {
    if (!window) {
      return
    }
    if (showLogin === undefined) {
      window.location.href = `${window.location.href}&login=true`
    }
  }
  sessionStorage.setItem('whoiswatching', true)
  handleRedirect(props, `${url}`)
  const ids = _map(_split(addToPlaylist, ','), _parseInt)
  if (_size(ids) === 0) {
    return
  }
  batchPlaylistItems({ ids, type: 'default', add: true })
}

async function handlePlansSku (options = {}) {
  const { props } = options
  let { sku } = options
  const {
    setPlansLocalizedSelection,
    userAccount,
    history,
    plans,
    auth,
    user = Map(),
  } = props
  const whitespaceRegex = /\s/g
  // remove any whitespace so it doesn't matter if there are spaces in the sku
  const cleanSku = _replace(sku, whitespaceRegex, '')

  if (
    !plans.get('processing') &&
    !plans.get('processingLocalized') &&
    !plans.get('selection') &&
    !plans.get('planError')
  ) {
    const language = user.getIn(['data', 'language'])
    const dataPlans = plans.getIn(['data', 'plans'], List())
    const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
    const latamPricing = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'latamPricing'])
    const currency = latamPricing ? LTM : currencyIso

    if (!getAuthIsLoggedIn(auth) && dataPlans.size === 0) {
      // wait to load plans - watcher in plans service should load these
      return
    } else if (getAuthIsLoggedIn(auth) &&
      (dataPlans.size === 0 || userAccount.getIn(['details', 'data', 'billing', 'subscriptions'], Map()).size === 0)) {
      // wait to load plans and userAccount details - watcher in plans service should load these

      return
    }

    // Get the translation data for this plan to help localization
    // strip spaces in the sku coming from the plan
    // and compare it to the sku coming in from the url
    const plan = dataPlans.find(item => _replace(item.get('sku'), whitespaceRegex, '') === cleanSku)
    // If we find a plan use it instead of the sku since it has
    // translation data.
    if (plan) {
      sku = undefined
    }
    const planData = await setPlansLocalizedSelection({ sku, plan, language, currency })
    if (!planData.getIn(['plans', 0, 'sku'])) {
      historyRedirect({ history, url: '/plan-selection', auth, language })
      return
    }
    historyRedirect({
      history,
      url: '/cart/account-creation',
      auth,
      language,
    })
  }
}

function updateSeo (props) {
  // @TODO replace with connectedPage HOC
  const { page, auth, location, setPageSeo } = props
  const path = location.pathname + _toString(location.search || '')
  if (page.get('path') === path) {
    return
  }
  const seo = getSeo({
    pathname: location.pathname,
    loggedIn: !!auth.get('jwt'),
  })
  setPageSeo({
    title: seo.title,
    description: seo.description,
    noFollow: seo.noFollow,
    noIndex: seo.noIndex,
    location,
  })
}

function updateData (props) {
  const {
    location,
    inboundTracking,
  } = props
  const sku = _get(location, ['query', 'sku'])
  const url = _get(location, ['query', 'url'])
  const addToPlaylist = _get(location, ['query', 'playlistAdd'])

  // Wait for inbound tracking to finished processing
  if (
    !inboundTracking.get('initialized') ||
    inboundTracking.get('processing') ||
    !inboundTracking.get('data')
  ) {
    return
  }
  // We can now do work
  if (sku) {
    handlePlansSku({ props, sku })
  } else if (addToPlaylist) {
    handleAddToPlaylist(props, addToPlaylist, url)
  } else if (url) {
    handleRedirect(props, url)
  } else {
    handleRedirect(props, '/')
  }
}

class GoPage extends PureComponent {
  componentDidMount () {
    updateData(this.props)
    updateSeo(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER) {
      updateData(nextProps)
    }
  }

  render () {
    const { props } = this
    const { staticText } = props
    return (
      <div className="go-page">
        <Sherpa type={TYPE_LARGE} />
        <p className="go-page__message">
          {staticText.getIn(['data', 'oneMomentPleaseWeAreLocatingYourPath'])}
        </p>
      </div>
    )
  }
}

GoPage.propTypes = {
  setPlansLocalizedSelection: PropTypes.func.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  setPageSeo: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
}

export default compose(
  connect(
    state => ({
      staticText: state.staticText.getIn(['data', 'goPage']),
      inboundTracking: state.inboundTracking,
      userAccount: state.userAccount,
      plans: state.plans,
      auth: state.auth,
      user: state.user,
      page: state.page,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPlansLocalizedSelection: actions.plans.setPlansLocalizedSelection,
        batchPlaylistItems: actions.playlist.batchPlaylistItems,
        setInPlaylist: actions.playlist.setInPlaylist,
        setPageSeo: actions.page.setPageSeo,
      }
    },
  ),
  connectPage({ seoType: PAGE_SEO_TYPE_MANUAL }),
)(GoPage)
