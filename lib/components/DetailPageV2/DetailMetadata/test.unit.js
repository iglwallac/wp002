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
import DetailMetadata from 'components/DetailPageV2/DetailMetadata'

const PATHNAME = '/video/michio-kaku-string-field-theory-and-multiverse'

const detailMetadata = {
  detail: {
    data: {
      runtime: 2382,
      episode: 1,
      year: 'June 2005',
      guest: 'Michio Kaku',
    },
  },
}

function mountWrapper (component, options = {}) {
  const { history = createHistory(PATHNAME) } = options
  const store = reduxCreateStore(
    rootReducer,
    createDetailMetadataState())
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

function createDetailMetadataState () {
  return {
    resolver: Map({
      path: PATHNAME,
      location: createLocation({ pathname: PATHNAME }),
    }),
    jumbotron: fromJS(detailMetadata),
  }
}

describe('DetailMetadata', () => {
  describe('initial DetailMetadata mount', () => {
    let wrapper
    before(() => {
      wrapper = mountWrapper(<DetailMetadata />)
    })
    after(() => { wrapper.unmount() })
    it('Should render DetailMetadata component with className detail-metadata', () => {
      const result = wrapper.exists('.detail-metadata')
      assert.isTrue(result, 'DetailMetadata does not exist')
    })
    it('Should render container div inside DetailMetadata ', () => {
      const result = wrapper.exists('.detail-metadata__container')
      assert.isTrue(result, 'DetailMetadata container does not exist')
    })
    it('Should render meta', () => {
      const result = wrapper.find('.detail-metadata__label')
      assert.exists(result, 'DetailMetadata meta duration exist')
    })
  })
})
