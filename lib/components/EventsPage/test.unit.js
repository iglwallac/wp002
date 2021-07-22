/* eslint-disable react/jsx-filename-extension */
import { createStore as reduxCreateStore } from 'redux'
import PropTypes from 'prop-types'
import { fromJS } from 'immutable'
import Link from 'components/Link'
import React from 'react'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import _ from 'lodash'
import { createHistory } from 'services/resolver'
import LiveVideoPlayer from 'components/LiveVideoPlayer'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import EventsPage from './EventsPage'
import Chat from './Chat'
import LiveAccessSchedule, { ScheduleItem } from '../LiveAccessSchedule/LiveAccessSchedule'
import LivePageTimer from './LivePageTimer'
import EventList, { EventItemHOC } from './EventList'
import enStaticText from './lang_en.json'
import fiveHoursBeforeLiveData from './test/5hoursbeforelive.json'

const sessionList = fromJS(fiveHoursBeforeLiveData.eventDetails.en.data.event.tracks[0].schedule)

function mountWrapper (component, state) {
  const store = reduxCreateStore(
    rootReducer,
    createLiveEventState(state))
  return mount(component, {
    context: {
      store,
      history: createHistory('/events'),
    },
    childContextTypes: {
      store: () => { },
      history: PropTypes.object,
    },
  })
}


function createLiveEventState ({ hasSeriesUrl, subscriptions,
  username, isFree, timenow, live } = {}) {
  const liveAccessEvents = _.cloneDeep(fiveHoursBeforeLiveData)
  if (isFree !== undefined) {
    liveAccessEvents.sessionDetails['7e85bc8f-4730-4c1e-84bb-cc56a12d2b37'].en.data.session.isFree = isFree
  }
  if (hasSeriesUrl !== undefined) {
    liveAccessEvents.eventDetails.en.data.event.seriesUrl = hasSeriesUrl ? 'something' : null
  }
  return {
    staticText: fromJS({
      data: {
        eventsPage: { data: enStaticText },
      },
    }),
    resolver: fromJS({ path: 'events', query: { timenow, live } }),
    liveAccessEvents: fromJS(liveAccessEvents),
    auth: fromJS({ subscriptions, username }),
  }
}

describe('EventsPage', () => {
  describe('Schedule component', () => {
    describe('before event', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<LiveAccessSchedule
          language="en"
          nowTs={Date.parse('2019-08-16T14:02:00-06:00')}
          sessionList={sessionList}
          buttonUrl="/events/caroline-myss-revolutionizing-spirituality?default=2#event-information"
          buttonText="dummy"
        />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Link> with url=\'/events/caroline-myss-revolutionizing-spirituality?default=2#event-information\'', () => {
        const result = wrapper.find(Link)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.to, '/events/caroline-myss-revolutionizing-spirituality?default=2#event-information')
      })
      it('Should render three <ScheduleItem>', () => {
        const result = wrapper.find(ScheduleItem)
        assert.equal(result.length, 3)
      })
    })
    describe('during event not in session', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<LiveAccessSchedule
          language="en"
          nowTs={Date.parse('2019-08-17T06:02:00-06:00')}
          sessionList={sessionList}
          buttonUrl="/events/caroline-myss-revolutionizing-spirituality?default=2#event-information"
          buttonText="dummy"
        />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Link> with url=\'/events/caroline-myss-revolutionizing-spirituality?default=2#event-information\'', () => {
        const result = wrapper.find(Link)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.to, '/events/caroline-myss-revolutionizing-spirituality?default=2#event-information')
      })
      it('Should render four <ScheduleItem> with no items marked as active', () => {
        const result = wrapper.find(ScheduleItem)
        assert.equal(result.length, 4)
        assert.equal(result.map(x => x.props().isActive).filter(x => x === true).length, 0)
      })
    })
    describe('during event in session', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<LiveAccessSchedule
          language="en"
          nowTs={Date.parse('2019-08-17T08:02:00-06:00')}
          sessionList={sessionList}
          buttonUrl="/events/caroline-myss-revolutionizing-spirituality?default=2#event-information"
          buttonText="dummy"
        />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Link> with url=\'/events/caroline-myss-revolutionizing-spirituality?default=2#event-information\'', () => {
        const result = wrapper.find(Link)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.to, '/events/caroline-myss-revolutionizing-spirituality?default=2#event-information')
      })
      it('Should render five <ScheduleItem> with second item marked as active', () => {
        const result = wrapper.find(ScheduleItem)
        assert.equal(result.length, 5)
        assert.equal(result.map(x => x.props().isActive).filter(x => x === true).length, 1)
        assert.equal(result.map(x => x.props().isActive)[1], true)
      })
    })
    describe('during event matching two sessions', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<LiveAccessSchedule
          language="en"
          nowTs={Date.parse('2019-08-17T12:45:00-06:00')}
          sessionList={sessionList}
          buttonUrl="/events/caroline-myss-revolutionizing-spirituality?default=2#event-information"
          buttonText="dummy"
        />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Link> with url=\'/events/caroline-myss-revolutionizing-spirituality?default=2#event-information\'', () => {
        const result = wrapper.find(Link)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.to, '/events/caroline-myss-revolutionizing-spirituality?default=2#event-information')
      })
      it('Should render six <ScheduleItem> with two items marked as active', () => {
        const result = wrapper.find(ScheduleItem)
        assert.equal(result.length, 6)
        assert.equal(result.map(x => x.props().isActive).filter(x => x === true).length, 2)
      })
    })
    describe('after event', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<LiveAccessSchedule
          language="en"
          nowTs={Date.parse('2019-08-18T17:30:00-06:00')}
          sessionList={sessionList}
          buttonUrl="/events/caroline-myss-revolutionizing-spirituality?default=2#event-information"
          buttonText="dummy"
        />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Link> with url=\'/events/caroline-myss-revolutionizing-spirituality?default=2#event-information\'', () => {
        const result = wrapper.find(Link)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.to, '/events/caroline-myss-revolutionizing-spirituality?default=2#event-information')
      })
      it('Should render one <ScheduleItem>', () => {
        const result = wrapper.find(ScheduleItem)
        assert.equal(result.length, 1)
      })
    })
  })
  describe('EventList', () => {
    describe('No event list', () => {
      it('Should render empty list', () => {
        const wrapper = mountWrapper(<EventList staticText={fromJS({ data: enStaticText })} />)
        const result = wrapper.find('.event-list')
        const eventItems = result.find(EventItemHOC)
        assert.equal(eventItems.length, 0, 'Incorrect # of event items')
      })
    })
    describe('Event list with eleven items', () => {
      const eventsList = fromJS(fiveHoursBeforeLiveData).getIn(['eventsList', 'en', 'data', 'events'])
      const wrapper = mountWrapper(<EventList
        eventsList={eventsList}
        staticText={fromJS({ data: enStaticText })}
      />)
      const eventItems = wrapper.find(EventItemHOC)
      it('Should render eleven EventItemHOC', () => {
        assert.equal(eventItems.length, 11, 'Incorrect # of event items')
      })
      it('Should not render a speaker for event without a speaker', () => {
        const healthyHabbits = eventItems.at(3)
        const speaker = healthyHabbits.render().find('.event-item__speaker')
        const title = healthyHabbits.render().find('.event-item__title')
        assert.equal(title.length, 1)
        assert.equal(speaker.length, 0)
      })
      it('Should not render a speaker for event with more than one speaker', () => {
        const cle = eventItems.at(4)
        const speaker = cle.render().find('.event-item__speaker')
        const title = cle.render().find('.event-item__title')
        assert.equal(title.length, 1)
        assert.equal(speaker.length, 0)
      })
      it('Should not render a title for event without a title', () => {
        const gregg = eventItems.at(5)
        const speaker = gregg.render().find('.event-item__speaker')
        const title = gregg.render().find('.event-item__title')
        assert.equal(title.length, 0)
        assert.equal(speaker.length, 1)
      })
      it('Should render an event thumbnail', () => {
        const gregg = eventItems.at(5)
        const thumbnail = gregg.find('.event-item__thumbnail')
        assert.equal(thumbnail.length, 1)
        assert.isNotNull(thumbnail.props().src)
      })
    })
  })

  describe('EventsPage', () => {
    describe('Time:  Two days before startDate (preEvent)', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<EventsPage />,
          {
            timenow: '2019-08-15T00:00:00.000Z',
          })
      })
      after(() => { wrapper.unmount() })
      it('Should render an EventList for preEvent', () => {
        const result = wrapper.find(EventList)
        assert.equal(result.length, 1, "Didn't find EventList")
      })
      it('Should not render a LivePageTimer', () => {
        const result = wrapper.find(LivePageTimer)
        assert.equal(result.length, 0)
      })
      it('Should not render a Chat', () => {
        const result = wrapper.find(Chat)
        assert.equal(result.length, 0, 'Found a Chat')
      })
      it('Should not render a Schedule', () => {
        const result = wrapper.find(LiveAccessSchedule)
        assert.equal(result.length, 0)
      })
      it('Should not render a LiveVideoPlayer', () => {
        const result = wrapper.find(LiveVideoPlayer)
        assert.equal(result.length, 0)
      })
    })
    describe('Time: After endDate', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<EventsPage />,
          {
            timenow: '2019-08-19T00:01:00.000Z',
          })
      })
      after(() => { wrapper.unmount() })
      it('Should render an EventList', () => {
        const result = wrapper.find(EventList)
        assert.equal(result.length, 1, "Didn't find EventList")
      })
      it('Should not render a LivePageTimer', () => {
        const result = wrapper.find(LivePageTimer)
        assert.equal(result.length, 0)
      })
      it('Should not render a Chat', () => {
        const result = wrapper.find(Chat)
        assert.equal(result.length, 0, 'Found a Chat')
      })
      it('Should not render a Schedule', () => {
        const result = wrapper.find(LiveAccessSchedule)
        assert.equal(result.length, 0)
      })
      it('Should not render a LiveVideoPlayer', () => {
        const result = wrapper.find(LiveVideoPlayer)
        assert.equal(result.length, 0)
      })
    })
    describe('Time: between startDate and endDate and not in a session', () => {
      describe('Anonymous', () => {
        let wrapper
        before(() => {
          wrapper = mountWrapper(<EventsPage />, {
            timenow: '2019-08-17T06:02:00-06:00',
          })
        })
        after(() => { wrapper.unmount() })
        it('Should render EventList', () => {
          const result = wrapper.find(EventList)
          assert.equal(result.length, 1, "Didn't find EventList")
        })
        it('Should not render a Chat', () => {
          const result = wrapper.find(Chat)
          assert.equal(result.length, 0, 'Found a Chat')
        })
        it('Should not render a LivePageTimer', () => {
          const result = wrapper.find(LivePageTimer)
          assert.equal(result.length, 0)
        })
        it('Should render a DropInVideoPlayer', () => {
          const result = wrapper.find(DropInVideoPlayer)
          assert.equal(result.length, 1)
        })
        it('Should not render a Schedule', () => {
          const result = wrapper.find(LiveAccessSchedule)
          assert.equal(result.length, 0)
        })
      })
    })
  })
})
