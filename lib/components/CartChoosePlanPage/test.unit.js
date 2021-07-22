/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import PropTypes from 'prop-types'
import { createStore as reduxCreateStore } from 'redux'
import { fromJS, Map } from 'immutable'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import { createHistory } from 'services/resolver'
import { createLocation } from 'test'
import CartChoosePlanPage from 'components/CartChoosePlanPage'
import { URL_PLAN_SELECTION_PLANS } from 'services/url/constants'
import enStaticText from './lang_en.json'

const PATHNAME = '/plan-selection'

const cartChoosePlanPageData = {
  step: 1,
  eventStep: 1,
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createCartChoosePlanPageState(),
  )
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

function createCartChoosePlanPageState () {
  return {
    staticText: fromJS({
      data: {
        cartChoosePlanPage: { data: enStaticText },
      },
    }),
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    checkout: fromJS(cartChoosePlanPageData),
  }
}

describe('CartChoosePlanPage', () => {
  describe('initial CartChoosePlanPage mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<CartChoosePlanPage />)
    })
    after(() => { wrapper.unmount() })
    it('Should render div with className=cart-choose-plan', () => {
      const result = wrapper.find('.cart-choose-plan')
      assert.exists(result, 'CartChoosePlanPage does not exist')
    })
    it('Should have a clickable continue button to go on to the next step', () => {
      const clickableButton = wrapper.find({ href: URL_PLAN_SELECTION_PLANS })
      assert.exists(clickableButton, `The continue button should go to  url ${URL_PLAN_SELECTION_PLANS}`)
    })
  })
})
