import React from 'react'
import { List } from 'immutable'
import { compose } from 'recompose'
import { getPrimary } from 'services/languages'
import Link, { TARGET_BLANK } from 'components/Link'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { EN, ES, DE, FR } from 'services/languages/constants'
import { connect as connectStaticText } from 'components/StaticText/connect'

function InviteFriend8kGrid (props) {
  const { staticText, user, userReferrals } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const filmsShowsClasses = staticText.getIn(['data', 'filmsShowsClasses'])
  const tileData = userReferrals.getIn(['inviteFriendTiles', 'data'], List())

  const getClassName = (name) => {
    const baseClassName = 'invite-friend-grid'
    const classes = []
    if (name) {
      classes.push(`${baseClassName}__image--${name}-${userLanguage}`)
    }
    classes.push(`${baseClassName}__image`)
    return classes.join(' ')
  }

  const renderImage = (tile) => {
    const className = 'invite-friend-grid__image'
    const img = tile.get('img', '') || ''
    const name = tile.get('name', '')
    const type = tile.get('type')
    const style = img ? {
      backgroundImage: `url(${img})`,
    } : {}

    if (type === 'lp') {
      return (
        <div
          className={`${className} invite-friend-grid__image--${name}-${userLanguage}`}
          role="presentation"
        />
      )
    }
    return (
      <div
        className={`${className} invite-friend-grid__image--${name}-${userLanguage}`}
        role="presentation"
        style={style}
      />
    )
  }

  const render8kGridTiles = () => {
    if (tileData) {
      return tileData.map((tile, index) => {
        const name = tile.get('name', '')
        const url = tile.get('url', '')
        const position = index

        if (!url) {
          return (
            <div key={`${name}-${position}`} className={getClassName(name)}>
              <div className="invite-friend-grid__placeholder-wrapper">
                <div className="invite-friend-grid__placeholder" />
              </div>
            </div>
          )
        }

        return (
          <div key={`${name}-${position}`} className="invite-friend-grid__link-container" >
            <Link
              key={name}
              target={TARGET_BLANK}
              to={url}
              className={'invite-friend-grid__link'}
            >{renderImage(tile)}
            </Link>
          </div>
        )
      })
    }
    return null
  }

  const renderHeaderText = () => {
    if (userLanguage === EN) {
      return `${staticText.getIn(['data', 'englsihTitles'])} ${filmsShowsClasses}`
    } else if (userLanguage === ES) {
      return `${staticText.getIn(['data', 'spanishTitles'])} ${filmsShowsClasses}`
    } else if (userLanguage === DE) {
      return `${staticText.getIn(['data', 'germanTitles'])} ${filmsShowsClasses}`
    } else if (userLanguage === FR) {
      return `${staticText.getIn(['data', 'frenchTitles'])} ${filmsShowsClasses}`
    }
    return null
  }

  return (
    <div className="invite-friend-grid">
      <div className="invite-friend-grid__text-container">
        <div className="invite-friend-grid__header">
          { renderHeaderText() }
        </div>
        <div className="invite-friend-grid__message">
          <div className="invite-friend-grid__subheading">
            { staticText.getIn(['data', 'eachWeek']) }
          </div>
          <div className="invite-friend-grid__description">
            { staticText.getIn(['data', 'exploreVideos']) }
          </div>
        </div>
      </div>
      <div className="invite-friend-grid__media">
        { render8kGridTiles(userReferrals) }
      </div>
    </div>
  )
}

InviteFriend8kGrid.propTypes = {
  user: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  userReferrals: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'inviteFriend8kGrid' }),
  connectRedux(
    state => ({
      user: state.user,
      userReferrals: state.userReferrals,
    }),
  ),
)(InviteFriend8kGrid)
