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
import GiftThemePage from 'components/Gift/GiftThemePage'
import { GIFT_THEME_TYPE_BIRTHDAY, GIFT_STEP_TWO } from 'services/gift'
import enStaticText from './lang_en.json'

const PATHNAME = '/gift/preview'

const giftThemePageData = {
  step: {
    active: GIFT_STEP_TWO,
    complete: [
      1,
    ],
  },
  theme: {
    selected: GIFT_THEME_TYPE_BIRTHDAY,
  },
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createGiftThemeState())
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

function createGiftThemeState () {
  return {
    staticText: fromJS({
      data: {
        giftThemePage: { data: enStaticText },
      },
    }),
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    gift: fromJS(giftThemePageData),
  }
}

describe('GiftThemePage', () => {
  describe('initial GiftThemePage mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<GiftThemePage />)
    })
    after(() => { wrapper.unmount() })
    it('Should render div with className=gift-theme', () => {
      const result = wrapper.exists('.gift-theme')
      assert.isTrue(result, 'GiftThemePage does not exist')
    })
    it('Should render the GiftProgressMeter with className=gift-progress-meter', () => {
      const result = wrapper.exists('.gift-progress-meter')
      assert.isTrue(result, 'GiftProgressMeter does not exist')
    })
    it('Should render step 2 as active for GiftProgressMeter', () => {
      const result = wrapper.find('.gift-progress-meter__number--active')
      assert.equal(result.text(), GIFT_STEP_TWO, 'GiftProgressMeter should be on step 2')
    })
    it('Should render more than 1 theme to select', () => {
      const result = wrapper.find('.gift-theme__theme-item')
      assert.isTrue(result.length > 1, 'There should be more than 1 theme to select')
    })
    it('Should render the selected theme as Birthday', () => {
      const selected = wrapper.find('.gift-theme__theme-item--selected')
      const birthday = wrapper.find('.gift-theme__theme-item--birthday')
      assert.equal(selected.html(), birthday.html(), 'The selected theme item should equal Birthday')
    })
    it('Should have a clickable continue button to go on to the next step', () => {
      const clickableButton = wrapper.find('.gift-theme__continue.button--primary')
      assert.isTrue(clickableButton.length > 0, 'The continue button should be clickable')
    })
  })
})
