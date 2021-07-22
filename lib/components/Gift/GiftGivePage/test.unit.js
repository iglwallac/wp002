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
import GiftGivePage from 'components/Gift/GiftGivePage'
import { GIFT_THEME_TYPE_BIRTHDAY, GIFT_STEP_THREE } from 'services/gift'
import { format as formatDateTime, getDateTime } from 'services/date-time'
import enStaticText from './lang_en.json'

const PATHNAME = '/gift/give'

const firstName = 'Dan'
const lastName = 'Smith'
const email = 'dan123789@example.com'
const confirmEmail = email
const giverAnonymous = true
const recipientFirstName = 'Don'
const recipientLastName = 'Jones'
const recipientEmail = 'don904572@example.com'
const recipientConfirmEmail = recipientEmail
const currentDate = getDateTime(Date())
const recipientMessage = 'test message'
const dateFormatString = 'MM/DD/YYYY'
const locale = 'en_US'
const recipientSendDate = formatDateTime(currentDate, locale, dateFormatString)

const giftGivePageData = {
  step: {
    active: GIFT_STEP_THREE,
    complete: [
      1,
      2,
    ],
  },
  theme: {
    selected: GIFT_THEME_TYPE_BIRTHDAY,
  },
  checkout: {
    data: {
      giver: {
        firstName,
        lastName,
        email,
        confirmEmail,
        giverAnonymous,
      },
      recipient: {
        firstName: recipientFirstName,
        lastName: recipientLastName,
        email: recipientEmail,
        confirmEmail: recipientConfirmEmail,
        sendDate: recipientSendDate,
        message: recipientMessage,
      },
    },
  },
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createGiftGiveState())
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

function createGiftGiveState () {
  return {
    staticText: fromJS({
      data: {
        giftGivePage: { data: enStaticText },
      },
    }),
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    gift: fromJS(giftGivePageData),
    user: fromJS({ emailAvailable: true, emailAvailabilityProcessing: false }),
  }
}

describe('GiftGivePage', () => {
  describe('initial GiftGivePage mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<GiftGivePage />)
    })
    after(() => { wrapper.unmount() })
    it('Should render div with className=gift-give', () => {
      const result = wrapper.exists('.gift-give')
      assert.isTrue(result, 'GiftGivePage does not exist')
    })
    it('Should render the GiftProgressMeter with className=gift-progress-meter', () => {
      const result = wrapper.exists('.gift-progress-meter')
      assert.isTrue(result, 'GiftProgressMeter does not exist')
    })
    it('Should render step 3 as active for GiftProgressMeter', () => {
      const result = wrapper.find('.gift-progress-meter__number--active')
      assert.equal(result.text(), GIFT_STEP_THREE, 'GiftProgressMeter should be on step 3')
    })
    it('Should render a form', () => {
      const result = wrapper.exists('.gift-give__form')
      assert.isTrue(result, 'GiftGivePage should have a form')
    })
    it(`Should render ${firstName} as the firstName form input value`, () => {
      const result = wrapper.find('#input-giverFirstName').props().value
      assert.equal(result, firstName, `GiftGivePage from giverFirstName form input value should be ${firstName}`)
    })
    it(`Should render ${lastName} as the lastName form input value`, () => {
      const result = wrapper.find('#input-giverLastName').props().value
      assert.equal(result, lastName, `GiftGivePage from giverLastName form input value should be ${lastName}`)
    })
    it(`Should render ${email} as the email form input value`, () => {
      const result = wrapper.find('#input-giverEmail').props().value
      assert.equal(result, email, `GiftGivePage from giverEmail form input value should be ${email}`)
    })
    it(`Should render ${confirmEmail} as the confirmEmail form input value`, () => {
      const result = wrapper.find('#input-giverConfirmEmail').props().value
      assert.equal(result, confirmEmail, `GiftGivePage from giverConfirmEmail form input value should be ${confirmEmail}`)
    })
    it(`Should render ${recipientFirstName} as the recipientFirstName form input value`, () => {
      const result = wrapper.find('#input-recipientFirstName').props().value
      assert.equal(result, recipientFirstName, `GiftGivePage from recipientFirstName form input value should be ${recipientFirstName}`)
    })
    it(`Should render ${recipientLastName} as the recipientLastName form input value`, () => {
      const result = wrapper.find('#input-recipientLastName').props().value
      assert.equal(result, recipientLastName, `GiftGivePage from recipientLastName form input value should be ${recipientLastName}`)
    })
    it(`Should render ${recipientEmail} as the recipientEmail form input value`, () => {
      const result = wrapper.find('#input-recipientEmail').props().value
      assert.equal(result, recipientEmail, `GiftGivePage from recipientEmail form input value should be ${recipientEmail}`)
    })
    it(`Should render ${recipientConfirmEmail} as the recipientConfirmEmail form input value`, () => {
      const result = wrapper.find('#input-recipientConfirmEmail').props().value
      assert.equal(result, recipientConfirmEmail, `GiftGivePage from recipientConfirmEmail form input value should be ${recipientConfirmEmail}`)
    })
    it(`Should render ${recipientSendDate} as the recipientSendDate form input value`, () => {
      const result = wrapper.find('#input-recipientSendDate').props().value
      assert.equal(result, recipientSendDate, `GiftGivePage from recipientSendDate form input value should be ${recipientSendDate}`)
    })
    it(`Should render ${recipientMessage} as the recipientMessage form input value`, () => {
      const result = wrapper.find('#input-recipientMessage').props().value
      assert.equal(result, recipientMessage, `GiftGivePage from recipientMessage form input value should be ${recipientMessage}`)
    })
    it('Should render a clickable continue button given the state', () => {
      const result = wrapper.exists('.form-button--primary')
      assert.isTrue(result, 'GiftGivePage should have a clickable Continue button')
    })
  })
})
