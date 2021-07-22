/* eslint-disable react/jsx-filename-extension */
import { createStore as reduxCreateStore } from 'redux'
import PropTypes from 'prop-types'
import { fromJS } from 'immutable'
// import Button from 'components/Button'
import React from 'react'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
// import _ from 'lodash'
import { createHistory } from 'services/resolver'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import { createPlayerSrc } from 'services/brightcove'
import EventDetailsPage from './EventDetailsPage'
import Banner from './Banner'
import PromoVideoBanner from './PromoVideoBanner'
import langEn from './lang_en.json'
import EVENTDETAILS from './test/eventDetails.json'

const eventDetails = fromJS(EVENTDETAILS)

function mountWrapper (component, state) {
  const store = reduxCreateStore(
    rootReducer,
    {
      staticText: fromJS({
        data: {
          eventDetailsPage: { data: langEn },
        },
      }),
      liveAccessEvents: fromJS({
        eventDetails: {
          en: {
            data: {
              event: state,
            },
          },
        },
      }),
      resolver: fromJS({ path: '/events/billy-carson-chronicles-of-the-annunaki', query: { default: 2 } }),
    })
  return mount(component, {
    context: {
      store,
      history: createHistory('/'),
    },
    childContextTypes: {
      store: () => { },
      history: PropTypes.object,
    },
  })
}

describe('EventDetailsPage', () => {
  describe('Banner component', () => {
    const speaker = eventDetails.get('speakerName')
    const dateText = eventDetails.get('localeTitleDate')
    const title = eventDetails.get('titleShort')
    const location = eventDetails.get('venueLocation')
    const media = eventDetails.get('heroMedia')
    describe('all props defined', () => {
      let wrapper
      const props = { speaker, dateText, title, location, media }
      before(() => {
        wrapper = mount(<Banner {...props} />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Banner> with correct props', () => {
        const banner = wrapper.find(Banner)
        assert.equal(banner.length, 1)
        let result = banner.find('.title')
        assert.equal(result.length, 1)
        result = banner.find('.speaker')
        assert.equal(result.length, 1)
      })
    })
    describe('no title defined', () => {
      let wrapper
      const props = { speaker, dateText, location, media }
      before(() => {
        wrapper = mount(<Banner {...props} />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Banner> without a title div', () => {
        const banner = wrapper.find(Banner)
        assert.equal(banner.length, 1)
        let result = banner.find('.title')
        assert.equal(result.length, 0)
        result = banner.find('.speaker')
        assert.equal(result.length, 1)
      })
    })
    describe('no speaker defined', () => {
      let wrapper
      const props = { title, dateText, location, media }
      before(() => {
        wrapper = mount(<Banner {...props} />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Banner> without a speaker div', () => {
        const banner = wrapper.find(Banner)
        assert.equal(banner.length, 1)
        let result = banner.find('.title')
        assert.equal(result.length, 1)
        result = banner.find('.speaker')
        assert.equal(result.length, 0)
      })
    })
  })
  describe('PromoVideoBanner component', () => {
    const speaker = eventDetails.get('speakerName')
    const dateText = eventDetails.get('localeTitleDate')
    const title = eventDetails.get('titleShort')
    const location = eventDetails.get('venueLocation')
    const media = eventDetails.get('heroMedia')
    const promoUrl = createPlayerSrc(1263232739001, 6053684164001)
    describe('all props defined', () => {
      let wrapper
      const props = { speaker, dateText, title, location, media, promoUrl }
      before(() => {
        wrapper = mountWrapper(<PromoVideoBanner
          {...props}
          location={{ pathname: '/events/billy-carson-chronicles-of-the-annunaki' }}
        />, EVENTDETAILS)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <PromoVideoBanner> with a DropInVideoPlayer', () => {
        const banner = wrapper.find(PromoVideoBanner)
        assert.equal(banner.length, 1)
        let result = banner.find('.event-details-page__promo-video-banner__event-title')
        assert.equal(result.length, 1)
        result = banner.find(DropInVideoPlayer)
        assert.equal(result.length, 1)
        result = banner.find('.event-details-page__promo-video-banner__speaker-date')
        assert.equal(result.length, 1)
      })
    })
    describe('no title defined', () => {
      let wrapper
      const props = { speaker, dateText, location, media, promoUrl }
      before(() => {
        wrapper = mountWrapper(<PromoVideoBanner
          {...props}
          location={{ pathname: '/events/billy-carson-chronicles-of-the-annunaki' }}
        />, EVENTDETAILS)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <PromoVideoBanner> without a title div', () => {
        const banner = wrapper.find(PromoVideoBanner)
        assert.equal(banner.length, 1)
        let result = banner.find('.event-details-page__promo-video-banner__event-title')
        assert.equal(result.length, 0)
        result = banner.find('.event-details-page__promo-video-banner__speaker-date')
        assert.equal(result.length, 1)
      })
    })
    describe('no speaker defined', () => {
      let wrapper
      const props = { title, dateText, location, media, promoUrl }
      before(() => {
        wrapper = mountWrapper(<PromoVideoBanner
          {...props}
          location={{ pathname: '/events/billy-carson-chronicles-of-the-annunaki' }}
        />, EVENTDETAILS)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <PromoVideoBanner> without speaker text', () => {
        const banner = wrapper.find(PromoVideoBanner)
        assert.equal(banner.length, 1)
        let result = banner.find('.event-details-page__promo-video-banner__event-title')
        assert.equal(result.length, 1)
        result = banner.find('.event-details-page__promo-video-banner__speaker-date')
        assert.equal(result.length, 1)
        assert.equal(result.text(), 'April 24, 2020')
      })
    })
  })
  describe('Event details page', () => {
    describe('Billy Carson\'s event', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<EventDetailsPage
          location={{ pathname: '/events/billy-carson-chronicles-of-the-annunaki' }}
        />, EVENTDETAILS)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Banner> with correct props', () => {
        const banner = wrapper.find(Banner)
        assert.equal(banner.length, 1)
        let result = banner.find('.title')
        assert.equal(result.length, 1)
        result = banner.find('.speaker')
        assert.equal(result.length, 1)
      })
    })
    describe('details without a speaker', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<EventDetailsPage
          location={{ pathname: '/events/billy-carson-chronicles-of-the-annunaki' }}
        />, { ...EVENTDETAILS, speakerIds: [] })
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Banner> with correct props', () => {
        const banner = wrapper.find(Banner)
        assert.equal(banner.length, 1)
        let result = banner.find('.title')
        assert.equal(result.length, 1)
        result = banner.find('.speaker')
        assert.equal(result.length, 0)
      })
    })
    describe('details with two speakers', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<EventDetailsPage
          location={{ pathname: '/events/billy-carson-chronicles-of-the-annunaki' }}
        />, { ...EVENTDETAILS, speakerIds: ['a', 'b'] })
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Banner> with correct props', () => {
        const banner = wrapper.find(Banner)
        assert.equal(banner.length, 1)
        let result = banner.find('.title')
        assert.equal(result.length, 1)
        result = banner.find('.speaker')
        assert.equal(result.length, 0)
      })
    })
  })
})
