/* eslint-disable react/jsx-filename-extension */
import { createStore as reduxCreateStore } from 'redux'
import PropTypes from 'prop-types'
import { fromJS } from 'immutable'
import Button from 'components/Button'
import React from 'react'
import { assert } from 'chai'
import rootReducer from 'reducers'
import { mount } from 'enzyme'
import { createHistory } from 'services/resolver'
import SpotlightLiveAccess, { Countdown, StreamingNow } from 'components/SpotlightLiveAccess'
import langEn from './lang_en.json'

const enStaticText = fromJS({ data: langEn })
const data = fromJS({
  title: 'Dr. Joe Dispenza',
  subTitle: 'Live from GaiaSphere',
  description: 'Dr. Dispenza addresses the neuroscience of personal transformation by blending quantum physics with the science of the mind-body connection to help you understand what is truly possible in your life.',
  countdown: 100000,
})

function mountWrapper (component, state) {
  const store = reduxCreateStore(
    rootReducer,
    {
      staticText: fromJS({
        data: {
          spotlightLiveAccess: { data: langEn },
        },
      }),
      spotlightLiveAccess: fromJS(state),
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

describe('SpotlightLiveAccess', () => {
  describe('StreamingNow', () => {
    const wrapper = mountWrapper(<StreamingNow staticText={enStaticText} />)
    after(() => { wrapper.unmount() })
    it('Should render div with className=spotlight-live-access__streaming-now', () => {
      const result = wrapper.find('.spotlight-live-access__streaming-now')
      assert.equal(result.html(), `<div class="spotlight-live-access__streaming-now"><span class="dot"></span> ${enStaticText.getIn(['data', 'streamingNow'])}</div>`, "output didn't match")
    })
  })
  describe('SpotlightLiveAccess', () => {
    describe('with countdown: 100000', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<SpotlightLiveAccess data={data} />)
      })
      after(() => { wrapper.unmount() })
      it('Should render a <Countdown> with countDown=100000', () => {
        const result = wrapper.find(Countdown)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.countDown, 100000)
      })
      it('Should not render a <StreamingNow>', () => {
        const result = wrapper.find(StreamingNow)
        assert.equal(result.length, 0)
      })
      it('Should render a <Button> with text=moreInfo', () => {
        const result = wrapper.find(Button)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.text, enStaticText.getIn(['data', 'moreInfo']))
      })
    })
    describe('with countdown: 0', () => {
      let wrapper
      before(() => {
        wrapper = mountWrapper(<SpotlightLiveAccess data={data.set('countdown', 0)} />)
      })
      after(() => { wrapper.unmount() })
      it('Should not render a <Countdown>', () => {
        const result = wrapper.find(Countdown)
        assert.equal(result.length, 0)
      })
      it('Should render a <StreamingNow>', () => {
        const result = wrapper.find(StreamingNow)
        assert.equal(result.length, 1)
      })
      it('Should render a <Button> with text=watchNow', () => {
        const result = wrapper.find(Button)
        assert.equal(result.length, 1)
        const props = result.props()
        assert.equal(props.text, enStaticText.getIn(['data', 'watchNow']))
      })
    })
  })
})
