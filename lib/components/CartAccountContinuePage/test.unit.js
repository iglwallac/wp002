/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import PropTypes from 'prop-types'
import { createStore as reduxCreateStore } from 'redux'
import { fromJS } from 'immutable'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import { createHistory } from 'services/resolver'
import { createLocation } from 'test'
import CartAccountContinuePage from 'components/CartAccountContinuePage'
import { URL_CART_ACCOUNT_CREATION_CREATE } from 'services/url/constants'
import plan from 'services/plans/test/plan.json'
import enCartOrderSummaryText from 'components/CartOrderSummary/lang_en.json'
import enStaticText from './lang_en.json'

const PATHNAME = '/cart/account-creation'

const cartAccountContinuePageData = {
  step: 2,
  eventStep: 3,
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createCartAccountContinuePageState())
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

function createCartAccountContinuePageState () {
  return {
    staticText: fromJS({
      data: {
        cartAccountContinuePage: { data: enStaticText },
        cartOrderSummary: { data: enCartOrderSummaryText },
      },
    }),
    resolver: fromJS({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    checkout: fromJS(cartAccountContinuePageData),
    plans: fromJS({ selection: plan }),
  }
}

describe('CartAccountContinuePage', () => {
  describe('initial CartAccountContinuePage mount', () => {
    const history = createHistory(PATHNAME)
    const wrapper = mountWrapper(<CartAccountContinuePage history={history} />)
    after(() => { wrapper.unmount() })
    it('Should render div with className=cart-account-continue', () => {
      const result = wrapper.find('.cart-account-continue')
      assert.exists(result, 'CartAccountContinuePage does not exist')
    })
    it('Should have a clickable continue button to go on to the next step', () => {
      const clickableButton = wrapper.find({ href: URL_CART_ACCOUNT_CREATION_CREATE })
      assert.exists(clickableButton, `The continue button should go to  url ${URL_CART_ACCOUNT_CREATION_CREATE}`)
    })
    it('Should have the cart summary component present', () => {
      const orderSummary = wrapper.exists('.cart-order-summary')
      assert.isTrue(orderSummary, 'The cart order summary should be present')
    })
  })
})
