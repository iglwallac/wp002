/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import PropTypes from 'prop-types'
import { createStore as reduxCreateStore } from 'redux'
import { fromJS } from 'immutable'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import { createHistory } from 'services/resolver'
import CookieBanner from 'components/CookieBanner'
import enStaticText from './lang_en.json'

const cookieBannerDataShow = {
  canSetCookie: false,
}

const cookieBannerDataHide = {
  canSetCookie: true,
}

function showMountWrapper (component, options = {}) {
  const { history = createHistory('/video/e-motion') } = options
  const store = reduxCreateStore(
    rootReducer,
    createCookieBannerShowState())
  return mount(component, {
    context: {
      store,
      history,
    },
    childContextTypes: {
      store: PropTypes.object,
      history: PropTypes.object,
    },
  })
}

function hideMountWrapper (component, options = {}) {
  const { history = createHistory('/video/e-motion') } = options
  const store = reduxCreateStore(
    rootReducer,
    createCookieBannerHideState())
  return mount(component, {
    context: {
      store,
      history,
    },
    childContextTypes: {
      store: PropTypes.object,
      history: PropTypes.object,
    },
  })
}

function createCookieBannerShowState () {
  return {
    staticText: fromJS({
      data: {
        cookieBanner: { data: enStaticText },
      },
    }),
    resolver: fromJS({ path: '/video/e-motion' }),
    cookie: fromJS(cookieBannerDataShow),
  }
}

function createCookieBannerHideState () {
  return {
    staticText: fromJS({
      data: {
        cookieBanner: { data: enStaticText },
      },
    }),
    resolver: fromJS({ path: '/video/e-motion' }),
    cookie: fromJS(cookieBannerDataHide),
  }
}

describe('CookieBanner', () => {
  describe('Initial CookieBanner mount when it should be visible', () => {
    const location = createHistory('/video/e-motion')
    const wrapper = showMountWrapper(<CookieBanner location={location} />)
    after(() => { wrapper.unmount() })
    it('Should render div with className=cookie-banner', () => {
      const result = wrapper.find('.cookie-banner')
      assert.exists(result, 'CookieBanner does not exist when it should')
    })
  })
  describe('Initial CookieBanner mount when it should be hidden', () => {
    const location = createHistory('/video/e-motion')
    const wrapper = hideMountWrapper(<CookieBanner location={location} />)
    after(() => { wrapper.unmount() })
    it('Should render null when the CookieBanner is hidden', () => {
      const result = wrapper.isEmptyRender()
      assert.isTrue(result, 'CookieBanner exists when it should not')
    })
  })
})
