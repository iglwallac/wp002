import PropTypes from 'prop-types'
import React from 'react'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Watch, { WATCH_RENDER_TYPE_OVERLAY_LINK } from 'components/Watch'
import Icon from 'components/Icon'
import MoreInfo from 'components/MoreInfo'
import WatchAccess, {
  ACCESS_CHECK_AUTH_FEATURE_GEO,
  ACCESS_FEATURE,
  ACCESS_PREVIEW,
} from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'

function getBackgroundImage (image) {
  const style = {
    backgroundImage: `url(${image})`,
  }
  return style
}

function getClassName (vertical) {
  const className = ['tile-hero']
  if (vertical) {
    className.push('tile-hero--vertical')
  }
  return className.join(' ')
}
function getPlayClass (showMoreInfo, auth) {
  const className = ['tile-hero__play']
  if (showMoreInfo) {
    className.push('tile-hero__play--more-info')
  }
  if (!auth.get('jwt')) {
    className.push('tile-hero__play--anonymous')
  }
  return className.join(' ')
}

function TileHero (props) {
  const {
    auth,
    preview,
    feature,
    image,
    type,
    url,
    className,
    showMoreInfo,
    onClickMoreInfo,
    active,
    heroLabel,
    toolTipComponent,
    hasPlayIcon,
    upstreamContext,
    displayMoreInfoButton,
    itemIndex,
    onClickWatch,
    vertical = false,
    hasOverlay,
    forceAccess,
    asShare,
  } = props
  return (
    <div className={getClassName(vertical)}>
      <Watch
        asShare={asShare}
        className={[`tile-hero__link ${className}`]}
        url={url}
        auth={auth}
        feature={feature}
        preview={preview}
        forceAccess={forceAccess}
        style={getBackgroundImage(image)}
        renderType={WATCH_RENDER_TYPE_OVERLAY_LINK}
        upstreamContext={upstreamContext}
        itemIndex={itemIndex}
        onClickWatch={onClickWatch}
        type={type}
      >
        {hasOverlay && <div className="tile-hero--overlay" />}
        {heroLabel ? <span className="tile-hero__label">{heroLabel}</span> : null}
        {hasPlayIcon && !hasOverlay ? (
          <WatchAccess
            auth={auth}
            preview={preview}
            feature={feature}
            accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
          >
            <WatchAccessAllowed>
              <span role="presentation" className={getPlayClass(showMoreInfo, auth)}>
                <Icon
                  element="play-button"
                  iconClass={['icon--play-fill', 'tile-hero__play-icon']}
                />
              </span>
            </WatchAccessAllowed>
          </WatchAccess>
        ) : null}
      </Watch>
      {showMoreInfo ? (
        <WatchAccess
          auth={auth}
          preview={preview}
          feature={feature}
          accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
        >
          <WatchAccessAllowed>
            {
              displayMoreInfoButton !== false &&
                <MoreInfo
                  onClick={onClickMoreInfo}
                  active={active}
                  showToolTip={!!toolTipComponent}
                  vertical={vertical}
                />
            }
          </WatchAccessAllowed>
        </WatchAccess>
      ) : null}
      {toolTipComponent}
    </div>
  )
}

TileHero.propTypes = {
  asShare: PropTypes.bool,
  className: PropTypes.array,
  image: PropTypes.string.isRequired,
  active: PropTypes.bool,
  url: PropTypes.string.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  hasPlayIcon: PropTypes.bool,
  preview: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  onClickMoreInfo: PropTypes.func,
  showMoreInfo: PropTypes.bool.isRequired,
  toolTipComponent: PropTypes.element,
  onClickWatch: PropTypes.func,
  upstreamContext: ImmutablePropTypes.map,
  heroLabel: PropTypes.string,
  hasOverlay: PropTypes.bool,
  forceAccess: PropTypes.oneOf([
    ACCESS_FEATURE,
    ACCESS_PREVIEW,
  ]),
}

export default compose(pure)(TileHero)
