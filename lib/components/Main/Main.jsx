import React from 'react'
import _get from 'lodash/get'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import Loadable from 'react-loadable'
import { get as getConfig } from 'config'
import { getPageTitle } from 'services/page'
import { connect as connectRedux } from 'react-redux'
import { connect as connectAlertBar } from 'components/AlertBar/connect'
// import { RESOLVER_TYPE_NOT_FOUND } from 'services/resolver/types'
import { BACK_TO_TOP_SCROLL_DURATION } from 'components/BackToTop'
// import { ERROR_TYPE_404 } from 'components/ErrorPage/types'
import GoogleTagManager from 'components/GoogleTagManager'
import InboundTracking from 'components/InboundTracking'
import Interstitial from 'components/Interstitial'
import Resolver from 'components/Resolver'
import ScrollTo from 'components/ScrollTo'
import Toasty from 'components/Toasty'

const config = getConfig()
const popupFeatureToggle = _get(config, ['features', 'marketing', 'specialOfferPromoPopup'])
const dataPrivacyCompliance = _get(config, ['features', 'anonymousUser', 'dataPrivacyCompliance'])

const LoadableMainLoader = Loadable({
  loader: () => import('components/MainLoader'),
  loading: () => null,
})

const LoadablePopupMarketingPromo = Loadable({
  loader: () => import('components/PopupMarketingPromo'),
  loading: () => null,
})

const LoadableCookieBanner = Loadable({
  loader: () => import('components/CookieBanner'),
  loading: () => null,
})

function renderPopup (location) {
  if (popupFeatureToggle) {
    return (
      <LoadablePopupMarketingPromo
        location={location}
        timer={30000}
      />
    )
  }
  return null
}

function Main ({
  enableRoutes,
  clientReady,
  scrolling,
  location,
  children,
  history,
  title,
}) {
  return (
    <div className="main">
      <GoogleTagManager location={location} pageTitle={title} />
      <InboundTracking location={location} />
      {scrolling ? (
        <ScrollTo
          duration={BACK_TO_TOP_SCROLL_DURATION}
          easing="easeOutCubic"
          offset={-170}
          runOnMount
          delay={1}
        />
      ) : null}
      <main className="main__content">
        {enableRoutes ? children : null}
      </main>
      {clientReady ? (
        <React.Fragment>
          <LoadableMainLoader location={location} history={history} />
          {renderPopup(location)}
          {dataPrivacyCompliance ? (
            <LoadableCookieBanner location={location} />
          ) : null}
          <Resolver history={history} />
          <Interstitial />
          <Toasty />
        </React.Fragment>
      ) : null}
    </div>
  )
}

Main.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

export default compose(
  connectAlertBar(),
  connectRedux(
    state => ({
      clientReady: state.app.get('bootstrapComplete'),
      enableRoutes: state.app.get('enableRoutes'),
      scrolling: state.backToTop.get('scrolling'),
      location: state.resolver.get('location'),
      title: getPageTitle(state.page),
    }),
  ),
)(Main)
