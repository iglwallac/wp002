/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-filename-extension */
import { createStore as reduxCreateStore } from 'redux'
import PropTypes from 'prop-types'
import { fromJS } from 'immutable'
import Button from 'components/Button'
import Link from 'components/Link'
import React from 'react'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import _ from 'lodash'
import { createHistory } from 'services/resolver'
import LiveVideoPlayer from 'components/LiveVideoPlayer'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import LiveAccessSchedule, { ScheduleItem } from 'components/LiveAccessSchedule/LiveAccessSchedule'
import Chat from 'components/EventsPage/Chat'
import ChatInput from 'components/EventsPage/Chat/ChatInput'
import ChatCTA from 'components/EventsPage/Chat/ChatCTA'
import { UPGRADE_NOW_URL, JOIN_NOW_URL, LIVE_ACCESS_SUBSCRIPTION_CODE } from 'services/live-access-events/constants'
import EmailCapture from './EmailCapture'
import PreviewDone from './PreviewDone'
import LivePage from './LivePage'
import LiveExperience from './LiveExperience'
import LiveExperienceVideo from './LiveExperienceVideo'
import OnDemandRibbon from './OnDemandRibbon'
import Countdown from './Countdown'
import LiveExperienceControlBar from './LiveExperienceControlBar'
import enStaticText from './lang_en.json'
import liveData from './test/livedata.json'

const sessionList = fromJS(liveData.eventDetails.en.data.event.tracks[0].schedule)
const COUNTDOWN_2_DAYS = 2 * 24 * 60 * 600 * 1000
const COUNTDOWN_5_HOURS = 5 * 60 * 600 * 1000

function mountWrapper (component, state) {
  const store = reduxCreateStore(
    rootReducer,
    createLiveEventState(state))
  return mount(component, {
    context: {
      store,
      history: createHistory('/live'),
    },
    childContextTypes: {
      store: () => { },
      history: PropTypes.object,
    },
  })
}

function createLiveEventState ({ hasSeriesUrl, subscriptions,
  username, isFree, timenow, live, countdown } = {}) {
  const liveAccessEvents = _.cloneDeep(liveData)
  if (isFree !== undefined) {
    liveAccessEvents.sessionDetails['7e85bc8f-4730-4c1e-84bb-cc56a12d2b37'].en.data.session.isFree = isFree
  }
  if (hasSeriesUrl !== undefined) {
    liveAccessEvents.eventDetails.en.data.event.seriesUrl = hasSeriesUrl ? 'something' : null
  }
  if (countdown !== undefined) {
    liveAccessEvents.eventDetails.en.data.countdown = countdown
  }
  return {
    staticText: fromJS({
      data: {
        livePage: { data: enStaticText },
      },
    }),
    resolver: fromJS({ path: 'live', query: { timenow, live } }),
    liveAccessEvents: fromJS(liveAccessEvents),
    auth: fromJS({ subscriptions, username }),
  }
}

describe('LivePageTests', () => {
  describe('Countdown', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<LivePage />,
        {
          countdown: COUNTDOWN_2_DAYS,
        })
    })
    after(() => { wrapper.unmount() })
    it('Should not render LiveExperienceVideo', () => {
      const result = wrapper.exists(LiveExperienceVideo)
      assert.isFalse(result)
    })
    it('Should not render Chat', () => {
      const result = wrapper.exists(Chat)
      assert.isFalse(result)
    })
    it('Should render a Countdown', () => {
      const result = wrapper.exists(Countdown)
      assert.isTrue(result)
    })
  })
  describe('PreviewDone', () => {
    it('Should render a Button with upgrade url for members', () => {
      const wrapper = mountWrapper(<PreviewDone />, {
        subscriptions: [LIVE_ACCESS_SUBSCRIPTION_CODE, 253],
      })
      const result = wrapper.find(Button)
      assert.equal(result.length, 1, "Didn't find a Button")
      const props = result.props()
      assert.equal(props.url, UPGRADE_NOW_URL, 'Button url does not match')
    })
    it('Should render a Button with join url for non members', () => {
      const wrapper = mountWrapper(<PreviewDone />)
      const result = wrapper.find(Button)
      assert.equal(result.length, 1, "Didn't find a Button")
      const props = result.props()
      assert.equal(props.url, JOIN_NOW_URL, 'Button url does not match')
    })
  })
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

  describe('LivePage', () => {
    describe('State: live', () => {
      describe('Member with live Access', () => {
        let wrapper
        before(() => {
          wrapper = mountWrapper(<LivePage testing />,
            {
              subscriptions: [LIVE_ACCESS_SUBSCRIPTION_CODE, 253],
              username: 'test',
              live: 'true',
              timenow: '2019-08-19T00:01:00.000Z',
            })
        })
        after(() => { wrapper.unmount() })
        it('Should render a Chat', () => {
          const result = wrapper.exists(Chat)
          assert.isTrue(result)
        })
        it('Should render a ChatInput', () => {
          const result = wrapper.exists(ChatInput)
          assert.isTrue(result)
        })
        it('Should render a Schedule', () => {
          const result = wrapper.exists(LiveAccessSchedule)
          assert.isTrue(result)
        })
        it('Should not render a ChatCTA', () => {
          const result = wrapper.exists(ChatCTA)
          assert.isFalse(result)
        })
        it('Should render a LiveExperienceControlBar', () => {
          const result = wrapper.exists(LiveExperienceControlBar)
          assert.isTrue(result)
        })
        it('Should render a LiveVideoPlayer', () => {
          const result = wrapper.exists(LiveVideoPlayer)
          assert.isTrue(result)
        })
        it('Should not render a Countdown', () => {
          const result = wrapper.exists(Countdown)
          assert.isFalse(result)
        })
        it('Should not render EmailCapture', () => {
          const result = wrapper.exists(EmailCapture)
          assert.isFalse(result)
        })
        it('Should render OnDemandRibbon', () => {
          const result = wrapper.exists(OnDemandRibbon)
          assert.isTrue(result)
        })
      })
      describe('Member without live access', () => {
        describe('Outside of session(free)', () => {
          let wrapper
          before(() => {
            wrapper = mountWrapper(<LivePage testing />,
              {
                subscriptions: [253],
                live: 'true',
                timenow: '2019-08-16T18:39:50-06:00',
              })
          })
          after(() => { wrapper.unmount() })
          it('Should render a Chat', () => {
            const result = wrapper.exists(Chat)
            assert.isTrue(result)
          })
          it('Should not render a ChatInput', () => {
            const result = wrapper.exists(ChatInput)
            assert.isFalse(result)
          })
          it('Should render a Schedule', () => {
            const result = wrapper.exists(LiveAccessSchedule)
            assert.isTrue(result)
          })
          it.skip('Should render a ChatCTA with a Button with text Upgrade Now', () => {
            const result = wrapper.find(ChatCTA)
            assert.equal(result.length, 1)
            const button = result.find(Button)
            const a = button.find('a')
            assert.equal(a.text(), 'Upgrade Now')
          })
          it('Should render a LiveVideoPlayer', () => {
            const result = wrapper.exists(LiveVideoPlayer)
            assert.isTrue(result)
          })
          it('Should render a LiveExperienceControlBar', () => {
            const result = wrapper.exists(LiveExperienceControlBar)
            assert.isTrue(result)
          })
          it('Should not render a Countdown', () => {
            const result = wrapper.exists(Countdown)
            assert.isFalse(result)
          })
          it('Should not render OnDemandRibbon', () => {
            const result = wrapper.exists(OnDemandRibbon)
            assert.isFalse(result)
          })
          it('Should render EmailCapture', () => {
            const result = wrapper.exists(EmailCapture)
            assert.isTrue(result)
          })
        })
        describe('Session is not free', () => {
          let wrapper
          before(() => {
            wrapper = mountWrapper(<LivePage />,
              {
                subscriptions: [253],
                timenow: '2019-08-17T09:29:50-06:00',
                live: 'true',
              })
          })
          after(() => { wrapper.unmount() })
          it('Should not render a Chat', () => {
            const result = wrapper.exists(Chat)
            assert.isFalse(result)
          })
          it('Should not render a Schedule', () => {
            const result = wrapper.exists(LiveAccessSchedule)
            assert.isFalse(result)
          })
          it('Should not render a LiveVideoPlayer', () => {
            const result = wrapper.exists(LiveVideoPlayer)
            assert.isFalse(result)
          })
          it('Should not render a LiveExperienceControlBar', () => {
            const result = wrapper.exists(LiveExperienceControlBar)
            assert.isFalse(result)
          })
          it('Should not render a Countdown', () => {
            const result = wrapper.exists(Countdown)
            assert.isFalse(result)
          })
          it('Should render EmailCapture', () => {
            const result = wrapper.exists(EmailCapture)
            assert.isTrue(result)
          })
          it('Should render a DropInVideoPlayer', () => {
            const result = wrapper.exists(DropInVideoPlayer)
            assert.isTrue(result)
          })
        })
      })
      describe('Anonymous user', () => {
        describe('Outside of session(free)', () => {
          let wrapper
          before(() => {
            wrapper = mountWrapper(<LivePage />,
              {
                live: 'true',
                timenow: '2019-08-16T18:39:50-06:00',
              })
          })
          after(() => { wrapper.unmount() })
          it('Should render a Chat', () => {
            const result = wrapper.exists(Chat)
            assert.isTrue(result)
          })
          it('Should not render a ChatInput', () => {
            const result = wrapper.exists(ChatInput)
            assert.isFalse(result)
          })
          it('Should render a Schedule', () => {
            const result = wrapper.exists(LiveAccessSchedule)
            assert.isTrue(result)
          })
          it.skip('Should render a ChatCTA with a Button with text Join Now', () => {
            const result = wrapper.find(ChatCTA)
            assert.equal(result.length, 1)
            const button = result.find(Button)
            const a = button.find('a')
            assert.equal(button.text(), 'Join Now')
          })
          it('Should render a LiveVideoPlayer', () => {
            const result = wrapper.exists(LiveVideoPlayer)
            assert.isTrue(result)
          })
          it('Should not render a Countdown', () => {
            const result = wrapper.exists(Countdown)
            assert.isFalse(result)
          })
          it('Should render EmailCapture', () => {
            const result = wrapper.exists(EmailCapture)
            assert.isTrue(result)
          })
        })
        describe('Session is not free', () => {
          let wrapper
          before(() => {
            wrapper = mountWrapper(<LivePage />,
              {
                timenow: '2019-08-17T09:29:50-06:00',
                live: 'true',
              })
          })
          after(() => { wrapper.unmount() })
          it('Should not render a Chat', () => {
            const result = wrapper.exists(Chat)
            assert.isFalse(result)
          })
          it('Should not render a Schedule', () => {
            const result = wrapper.exists(LiveAccessSchedule)
            assert.isFalse(result)
          })
          it('Should not render a LiveVideoPlayer', () => {
            const result = wrapper.exists(LiveVideoPlayer)
            assert.isFalse(result)
          })
          it('Should not render a Countdown', () => {
            const result = wrapper.exists(Countdown)
            assert.isFalse(result)
          })
          it('Should render EmailCapture', () => {
            const result = wrapper.exists(EmailCapture)
            assert.isTrue(result)
          })
          it('Should render a DropInVideoPlayer', () => {
            const result = wrapper.exists(DropInVideoPlayer)
            assert.isTrue(result)
          })
        })
      })
    })
    describe('Time: After endDate', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<LivePage />,
          {
            timenow: '2019-08-19T00:01:00.000Z',
            countdown: COUNTDOWN_2_DAYS,
          })
      })
      after(() => { wrapper.unmount() })
      it('Should render a Countdown', () => {
        const result = wrapper.exists(Countdown)
        assert.isTrue(result)
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
      describe('Member with live Access', () => {
        let wrapper
        before(() => {
          wrapper = mountWrapper(<LivePage />,
            {
              subscriptions: [LIVE_ACCESS_SUBSCRIPTION_CODE, 253],
              username: 'test',
              countdown: COUNTDOWN_5_HOURS,
            })
        })
        after(() => { wrapper.unmount() })
        it('Should render a Countdown', () => {
          const result = wrapper.exists(Countdown)
          assert.isTrue(result)
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
      describe('Anonymous', () => {
        let wrapper
        before(() => {
          wrapper = mountWrapper(<LivePage />, {
            countdown: COUNTDOWN_5_HOURS,
          })
        })
        after(() => { wrapper.unmount() })
        it('Should not render a Chat', () => {
          const result = wrapper.find(Chat)
          assert.equal(result.length, 0, 'Found a Chat')
        })
        it('Should not render a DropInVideoPlayer', () => {
          const result = wrapper.exists(DropInVideoPlayer)
          assert.isFalse(result)
        })
        it('Should not render a Schedule', () => {
          const result = wrapper.find(LiveAccessSchedule)
          assert.equal(result.length, 0)
        })
        it('Should render a Countdown', () => {
          const result = wrapper.exists(Countdown)
          assert.isTrue(result)
        })
        it('Should not render EmailCapture', () => {
          const result = wrapper.exists(EmailCapture)
          assert.isFalse(result)
        })
      })
    })
  })
})
