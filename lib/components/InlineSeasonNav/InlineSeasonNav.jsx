import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { compose } from 'recompose'
import Link from 'components/Link'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import { H2, HEADING_TYPES } from 'components/Heading'

const ACTIVE_SEASON_NUMBER = 'inline-season-nav__season-number--active'

class InlineSeasonNav extends PureComponent {
  renderSeason = (season) => {
    const { props } = this
    const {
      element,
      currentSeason,
      onClickSeasonLink,
    } = props

    const isActive = season === currentSeason
    const activeSeasonNumberClass = `${isActive ? ACTIVE_SEASON_NUMBER : ''}`

    return (
      <span
        key={`season-number-${season}`}
        className={`inline-season-nav__season-number ${activeSeasonNumberClass}`}
      >
        <Link
          to={URL_JAVASCRIPT_VOID}
          data-season={season}
          data-element={element}
          onClick={onClickSeasonLink}
          className="inline-season-nav__season-number--link"
        >
          { season }
        </Link>
      </span>
    )
  }

  render () {
    const {
      props,
      renderSeason,
    } = this
    const {
      seasons,
      staticText,
    } = props

    if (seasons.size === 0) {
      return null
    }

    return (
      <div className="inline-season-nav">
        <H2 as={HEADING_TYPES.H6} className="inline-season-nav__header">{staticText.getIn(['data', 'seasons'])}</H2>
        <div className="inline-season-nav__body">
          {
            seasons.map((item) => {
              const season = item.get('value')
              return renderSeason(season)
            })
          }
        </div>
      </div>
    )
  }
}

InlineSeasonNav.propTypes = {
  seasons: ImmutablePropTypes.list.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  element: PropTypes.string.isRequired,
  currentSeason: PropTypes.number.isRequired,
  onClickSeasonLink: PropTypes.func.isRequired,
}


export default compose(
  connectStaticText({
    storeKey: 'detailSeries',
    propName: 'staticText',
  }),
)(InlineSeasonNav)
