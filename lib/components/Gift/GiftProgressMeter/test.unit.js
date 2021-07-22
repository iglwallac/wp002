/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import PropTypes from 'prop-types'
import { createStore as reduxCreateStore } from 'redux'
import { fromJS } from 'immutable'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import { createHistory } from 'services/resolver'
import GiftProgressMeter from 'components/Gift/GiftProgressMeter'
import enStaticText from './lang_en.json'

const giftProgressMeterData = {
  step: {
    active: 2,
    complete: [
      1,
    ],
  },
}

function mountWrapper (component) {
  const store = reduxCreateStore(
    rootReducer,
    createGiftProgressState())
  return mount(component, {
    context: {
      store,
      history: createHistory('/gift/theme'),
    },
    childContextTypes: {
      store: PropTypes.object,
      history: PropTypes.object,
    },
  })
}

function createGiftProgressState () {
  return {
    staticText: fromJS({
      data: {
        giftProgressMeter: { data: enStaticText },
      },
    }),
    resolver: fromJS({ path: '/gift/theme' }),
    gift: fromJS(giftProgressMeterData),
  }
}

describe('GiftProgressMeter', () => {
  describe('initial GiftProgressMeter mount', () => {
    const wrapper = mountWrapper(<GiftProgressMeter />)
    after(() => { wrapper.unmount() })
    it('Should render div with className=gift-progress-meter', () => {
      const result = wrapper.exists('.gift-progress-meter')
      assert.isTrue(result, 'GiftProgressMeter does not exist')
    })
    it('Should render 5 <li> with className=gift-progress-meter__item', () => {
      const steps = 5
      const result = wrapper.find('li.gift-progress-meter__item')
      assert.equal(result.length, steps, `GiftProgressMeter should have ${steps} steps`)
    })
    it('Should render 1 <li> with className=gift-progress-meter__item--active', () => {
      const result = wrapper.find('li.gift-progress-meter__item--active')
      assert.equal(result.length, 1, 'GiftProgressMeter should have 1 active step')
    })
    it('Should render 1 <li> with className=gift-progress-meter__item--complete', () => {
      const result = wrapper.find('li.gift-progress-meter__item--complete')
      assert.equal(result.length, 1, 'GiftProgressMeter should have 1 complete step')
    })
  })
})
