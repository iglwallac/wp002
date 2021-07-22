import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { fromJS } from 'immutable'
import Filter from 'components/Filter'

function getDefaultSeason (seasonNumber, seasons) {
  return seasons.find(season => season.get('value') === seasonNumber)
}

function renderElement (props) {
  const { staticText } = props
  const seasons = props.seasonNums.map(seasonNumber => fromJS({
    name: `${staticText.getIn(['data', 'season'])} ${seasonNumber}`,
    value: seasonNumber,
  }))
  const defaultOption = getDefaultSeason(props.defaultSeason, seasons)
  const className = ['filter-season']
    .concat(props.className ? props.className : [])
    .join(' ')
  const filterClassName = ['filter-season__filter'].concat(
    props.filterClassName ? props.filterClassName : [],
  )
  return (
    <div className={className}>
      <Filter
        className={filterClassName}
        label=""
        onChange={props.onSeasonChange}
        defaultOption={defaultOption}
        options={seasons}
      />
    </div>
  )
}

class FilterSeason extends Component {
  render () {
    const props = this.props
    return renderElement(props)
  }
}

FilterSeason.propTypes = {
  seasonNums: ImmutablePropTypes.list.isRequired,
  defaultSeason: PropTypes.number,
  className: PropTypes.array,
  filterClassName: PropTypes.array,
}

const connectedFilterSeason = connectStaticText({ storeKey: 'filterSeason' })(
  FilterSeason,
)

export default connectedFilterSeason
