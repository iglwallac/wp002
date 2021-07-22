import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import TilePlaceholder from 'components/TilePlaceholder'

class TileRowPlaceholder extends PureComponent {
  renderTiles = (num) => {
    const placeholders = []

    for (let i = 0; i < num; i += 1) {
      placeholders.push(
        <article key={`tile-placeholder-${i}`} className="tile tile--gallery ">
          <div className="tile__content">
            <TilePlaceholder />
          </div>
        </article>,
      )
    }
    return placeholders
  }

  render () {
    const { renderTiles, props } = this
    const { numberOfPlaceholders } = props

    return (
      <div className="tile-grid__wrapper tile-grid__wrapper--gallery">
        { renderTiles(numberOfPlaceholders) }
      </div>
    )
  }
}

TileRowPlaceholder.propTypes = {
  numberOfPlaceholders: PropTypes.number.isRequired,
}

export default TileRowPlaceholder
