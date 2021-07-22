import React from 'react' // eslint-disable-line no-unused-vars
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectRouter } from 'components/Router/connect'
import Head from 'components/Head'

function HeadApp (props) {
  return <Head {...props} />
}

HeadApp.propTypes = {}

export default compose(
  connectRouter(),
  connectRedux(({ user, app, interstitial, auth, resolver, page }) => ({
    contentLang: user.getIn(['data', 'language', 0], 'en'),
    scrollable: app.get('scrollable', true),
    isWebView: app.get('isWebView', false),
    jwt: auth.get('jwt', null),
    interstitial,
    resolver,
    page,
  })),
)(HeadApp)
