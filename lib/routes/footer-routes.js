/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import Loadable from 'react-loadable'
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

const LoadableFooter = Loadable({
  loader: () => import('components/Footer'),
  loading: () => null,
})

function isFullPlayer (location) {
  const query = location.query
  return !!_get(query, 'fullplayer')
}

function footerHidden (location) {
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
    '/cancel-offer-modal',
    '/roku-billing',
    '/activate',
    '/gaia-updates',
    '/gaia-now',
    '/live',
    '/who-is-watching',
  ]
  return _includes(pathnames, location.pathname)
}

function getFooter (props) {
  const { history, location } = props
  if (isFullPlayer(location) || footerHidden(location)) {
    return null
  }
  return <LoadableFooter location={location} history={history} />
}

export default [
  {
    path: '*',
    component: getFooter,
  },
]
