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
import { TYPE_CONTENT_VIDEO } from 'services/content-type'
import DetailJumbotron from '../DetailJumbotron/DetailJumbotron'

const PATHNAME = '/video/reverse-exploration-part-2'

const detailJumbotronData = {
  detail: {
    data: {
      heroImage: {
        large: 'https://brooklyn-stage-f7ydas.gaia.com/v1/image-render/c08da486-7ac8-483d-889f-3f6d721b258a/5216_Reverse_Exploration_part_2_clean_16x9.jpg',
      },
      seriesTitle: '',
      type: {
        content: 'video',
      },
    },
  },
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createDetailJumbotronState())
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

function createDetailJumbotronState () {
  return {
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    jumbotron: fromJS(detailJumbotronData),
  }
}

describe('DetailJumbotron', () => {
  describe('initial DetailJumbotron mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<DetailJumbotron type={TYPE_CONTENT_VIDEO} />)
    })
    after(() => { wrapper.unmount() })
    it('Should render div with className=detail-jumbotron', () => {
      const result = wrapper.exists('.detail-jumbotron')
      assert.isTrue(result, 'DetailJumbotron does not exist')
    })
    it('Should render Jumbotron title div', () => {
      const result = wrapper.exists('.detail-jumbotron__title')
      assert.isTrue(result, 'Jumbotron title does not exist')
    })
    it('Should render Jumbotron Hero Image', () => {
      const result = wrapper.exists('.hero-image__image')
      assert.isTrue(result, 'Jumbotron Image does not exist')
    })
  })
})
