/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import Loadable from 'react-loadable'
import { isExperimentVariationActive } from 'services/optimizely'
import {
  URL_PLAN_SELECTION,
  URL_PLAN_SELECTION_PLANS,
  URL_ACCOUNT_CREATION,
  URL_CART_ACCOUNT_CREATION_CREATE,
  URL_CART_BILLING,
  URL_CART_BILLING_PAYMENT,
  URL_CART_CONFIRMATION,
  URL_EMAIL_SETTINGS,
  URL_FREE_TRIAL,
  URL_FREE_TRIAL_ACCOUNT,
  URL_FREE_TRIAL_CONFIRM,
} from 'services/url/constants'

const LoadableHeader = Loadable({
  loader: () => import('components/Header'),
  loading: () => null,
})

function isFullPlayer (location) {
  const query = location.query
  return !!_get(query, 'fullplayer')
}

function headerHidden (location) {
  const pathnames = [
    '/give',
    '/give/email-submit',
    '/give/video',
    '/cancel-offer-modal',
    '/activate',
    '/gaia-updates',
    '/get-started',
    URL_EMAIL_SETTINGS,
    URL_FREE_TRIAL,
    URL_FREE_TRIAL_ACCOUNT,
    URL_FREE_TRIAL_CONFIRM,
  ]

  return _includes(pathnames, location.pathname)
}

function headerHiddenByExperiment (location, experimentId, variationId) {
  const pathnames = ['/cart/account-creation', '/get-started']
  isExperimentVariationActive()
  return _includes(pathnames, location.pathname)
    && isExperimentVariationActive(experimentId, variationId)
}

function renderHeaderComponent (props) {
  const { history, location } = props
  if (isFullPlayer(location)
    || headerHidden(location)
    || headerHiddenByExperiment(location, '9622812567')) {
    return null
  }
  return (
    <LoadableHeader
      history={history}
      location={location}
      hideLogin={hideLogin(location)}
      hideNavBar={hideNavBar(location)}
      hideUserMenu={hideUserMenu(location)}
    />
  )
}

function hideNavBar (location) {
  const pathnames = [
    URL_PLAN_SELECTION,
    URL_PLAN_SELECTION_PLANS,
    URL_ACCOUNT_CREATION,
    URL_CART_ACCOUNT_CREATION_CREATE,
    URL_CART_BILLING,
    URL_CART_BILLING_PAYMENT,
    URL_CART_CONFIRMATION,
    URL_EMAIL_SETTINGS,
    URL_FREE_TRIAL,
    URL_FREE_TRIAL_ACCOUNT,
    URL_FREE_TRIAL_CONFIRM,
    '/get-started',
    '/give',
    '/give/email-submit',
    '/give/video',
    '/who-is-watching',
  ]
  return _includes(pathnames, location.pathname)
}

function hideUserMenu (location) {
  const pathnames = [
    URL_PLAN_SELECTION,
    URL_PLAN_SELECTION_PLANS,
    URL_ACCOUNT_CREATION,
    URL_CART_ACCOUNT_CREATION_CREATE,
    URL_CART_BILLING,
    URL_CART_BILLING_PAYMENT,
    '/get-started',
    '/give',
    '/give/email-submit',
    '/give/video',
    '/who-is-watching',
  ]
  return _includes(pathnames, location.pathname)
}

function hideLogin (location) {
  const pathnames = ['/give', '/give/email-submit', '/give/video', URL_CART_BILLING, URL_CART_BILLING_PAYMENT]

  return _includes(pathnames, location.pathname)
}

export default [
  {
    path: '*',
    component: renderHeaderComponent,
  },
]
