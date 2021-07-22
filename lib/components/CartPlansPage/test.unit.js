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
import CartPlansPage from 'components/CartPlansPage'
import enStaticText from './lang_en.json'

const PATHNAME = '/plan-selection/plans'

const cartPlansPageData = {
  step: 1,
  eventStep: 2,
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createCartPlansPageState(),
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

function createCartPlansPageState () {
  return {
    staticText: fromJS({
      data: {
        cartPlansPage: { data: enStaticText },
      },
    }),
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    checkout: fromJS(cartPlansPageData),
  }
}

describe('CartPlansPage', () => {
  describe('initial CartPlansPage mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<CartPlansPage />)
    })
    after(() => { wrapper.unmount() })
    it('Should render div with className=cart-plans', () => {
      const result = wrapper.exists('.cart-plans')
      assert.isTrue(result, 'CartPlansPage does not exist')
    })
    it('Should render div with className=plan-grid or className=plan-grid-v2', () => {
      // Check to make sure a plan grid renders
      const planGrid = wrapper.exists('.plan-grid')
      const planGridV2 = wrapper.exists('.plan-grid-v2')
      const planGridExists = planGrid || planGridV2
      assert.isTrue(planGridExists, 'plan grid does not exist')
    })
  })
})
