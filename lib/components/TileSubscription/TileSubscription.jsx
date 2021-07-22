import PropTypes from 'prop-types'
import { Map, List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import React, { useMemo, useState, useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import isNumber from 'lodash/isNumber'
import { H4 } from 'components/Heading'
import Link from 'components/Link'

function TileSubscription ({
  subscriberCount,
  asListItem,
  staticText,
  hoverable,
  onClick,
  title,
  desc,
  tags,
  hero,
  url,
}) {
  // local state for mouseover/mouseout
  const [hovering, setHover] = useState(false)

  // event listener for mouse enter
  const onMouseEnter = useCallback(() => {
    setHover(true)
  }, [])

  // event listener for mouse leave
  const onMouseLeave = useCallback(() => {
    setHover(false)
  }, [])

  // caching root element props
  const rootProps = useMemo(() => ({
    className: 'tile-subscription',
  }), [hero])
  const heroClass = 'tile-subscription__hero'
  const variables = useMemo(() => ({
    heroStyle: hero ? { backgroundImage: `url(${hero})` } : null,
    heroClass: title && !hero ? `${heroClass} no-avatar` : heroClass,
  }), [hero])

  const tagName = asListItem ? 'li' : 'div'
  const tagsLeft = tags.size - 3

  const tagsChildren = (
    <ul className="tile-subscription__tag-list">
      {tags.slice(0, 3).map(tag => (
        <li key={tag.get('id')} className="tile-subscription__tag-item">
          <span className="tile-subscription__tag">
            {tag.get('label')}
          </span>
        </li>
      ))}
      {tagsLeft > 0 ? (
        <li key={0} className="tile-subscription__tag-item">
          <span className="tile-subscription__tag">
            {tagsLeft} {staticText.getIn(['data', 'more'])}
          </span>
        </li>
      ) : null}
    </ul>
  )

  const children = (
    <React.Fragment>
      {url ? (
        <Link
          onMouseEnter={hoverable ? onMouseEnter : null}
          onMouseLeave={hoverable ? onMouseLeave : null}
          className="tile-subscription__link"
          onClick={onClick}
          to={url}
        />
      ) : null}
      <div className="tile-subscription__body">
        <div className="tile-subscription__hero-wrapper">
          <div
            className={variables.heroClass}
            style={variables.heroStyle}
            role="presentation"
          />
        </div>
        <div className="tile-subscription__meta">
          <H4 className="tile-subscription__title" as="h5">
            {title}
          </H4>
          {tagsChildren}
        </div>
      </div>
      {hovering ? (
        <div className="tile-subscription__hover">
          <div className="tile-subscription__hero-wrapper">
            <div
              className={variables.heroClass}
              style={variables.heroStyle}
              role="presentation"
            />
          </div>
          <div className="tile-subscription__meta">
            <H4 className="tile-subscription__title" as="h5">
              {title}
            </H4>
            <p className="tile-subscription__tagline">{desc}</p>
            {isNumber(subscriberCount) ? (
              <aside className="tile-subscription__subscribers">
                {subscriberCount} {subscriberCount === 1
                  ? staticText.getIn(['data', 'follower'])
                  : staticText.getIn(['data', 'followers'])}
              </aside>
            ) : null}
            {tagsChildren}
          </div>
        </div>
      ) : null}
    </React.Fragment>
  )
  return React.createElement(tagName, rootProps, children)
}

TileSubscription.defaultProps = {
  subscriberCount: null,
  asListItem: false,
  onClick: () => {},
  staticText: Map(),
  hoverable: false,
  tags: List(),
  title: '',
  desc: '',
  hero: '',
  url: '',
}

TileSubscription.propTypes = {
  staticText: ImmutablePropTypes.map,
  subscriberCount: PropTypes.number,
  tags: ImmutablePropTypes.list,
  asListItem: PropTypes.bool,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.string,
  hero: PropTypes.string,
  desc: PropTypes.string,
  url: PropTypes.string,
}

export default connectRedux(
  state => ({
    staticText: state.staticText.getIn(['data', 'tileSubscription'], Map()),
  }),
)(TileSubscription)
