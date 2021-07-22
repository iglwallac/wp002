import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import { compose } from 'recompose'
import {
  FILTER_SET_YOGA,
  FILTER_SET_FITNESS,
  FILTER_SET_ORIGINAL,
  FILTER_SET_CONSCIOUS,
  FILTER_SET_FILM,
} from 'services/filter-set'
import {
  DEFAULT_PATH_YOGA,
  DEFAULT_PATH_FITNESS,
  DEFAULT_PATH_ORIGINAL,
  DEFAULT_PATH_CONSCIOUS,
} from 'services/url/constants'
import _partial from 'lodash/partial'
import { historyRedirect } from 'services/navigation'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import Button from 'components/Button'
import { connect as staticTextConnect } from 'components/StaticText/connect'

function onClickClearFilters (props) {
  const {
    selectedFilterSet,
    location,
    history,
    setFilterSetExpanded,
    auth,
    user = Map(),
  } = props
  setFilterSetExpanded(false)
  const language = user.getIn(['data', 'language'])
  historyRedirect({
    history,
    url: getDefaultPath(selectedFilterSet, location),
    auth,
    language,
  })
}

function getDefaultPath (selectedFilterSet, location) {
  switch (selectedFilterSet) {
    case FILTER_SET_YOGA:
      return DEFAULT_PATH_YOGA
    case FILTER_SET_FITNESS:
      return DEFAULT_PATH_FITNESS
    case FILTER_SET_ORIGINAL:
      return DEFAULT_PATH_ORIGINAL
    case FILTER_SET_CONSCIOUS:
      return DEFAULT_PATH_CONSCIOUS
    default:
      return location.pathname
  }
}

function FilterNoResults (props) {
  const { selectedFilterSet, staticText } = props
  if (!selectedFilterSet) {
    return null
  }
  return (
    <div className="filter-no-results">
      <Sherpa
        type={TYPE_SMALL_BLUE}
        className={['filter-no-results__sherpa']}
      />
      <div className="filter-no-results__message">
        {staticText.getIn(['data', 'noResults'], null)}
      </div>
      { selectedFilterSet === FILTER_SET_FILM ?
        null :
        <Button
          text={staticText.getIn(['data', 'clearAllFilters'], null)}
          buttonClass={[
            'button--secondary',
            'button-stacked',
            'filter-no-results__clear-button',
          ]}
          onClick={_partial(onClickClearFilters, props)}
        />
      }
    </div>
  )
}

FilterNoResults.props = {
  user: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  selectedFilterSet: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  setFilterSetExpanded: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      user: state.user,
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setFilterSetExpanded: actions.filterSet.setFilterSetExpanded,
      }
    },
  ),
  staticTextConnect({ storeKey: 'filterNoResults' }),
)(FilterNoResults)
