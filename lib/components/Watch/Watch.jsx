import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _isNumber from 'lodash/isNumber'
import _isFunction from 'lodash/isFunction'
import { Map } from 'immutable'
import Link from 'components/Link'
import Button from 'components/Button'
import WatchAccess, {
  ACCESS_PREVIEW,
  ACCESS_FEATURE,
} from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import { featureIsFree, isFeatureAllowedWithSubscription } from 'services/subscription'
import { getBoundActions } from 'actions'
import {
  upstreamContextOnClick as upstreamContextClick,
  WATCH_BUTTON,
  THUMBNAIL,
} from 'services/upstream-context'

export const WATCH_NODE_TYPE_FEATURE = 'WATCH_NODE_TYPE_FEATURE'
export const WATCH_NODE_TYPE_PREVIEW = 'WATCH_NODE_TYPE_PREVIEW' // UNUSED
export const WATCH_RENDER_TYPE_OVERLAY_LINK = 'WATCH_RENDER_TYPE_OVERLAY_LINK'
export const WATCH_RENDER_TYPE_BUTTON = 'WATCH_RENDER_TYPE_BUTTON'

export function createWatchUrl (auth, feature, preview, url) {
  const previewId = preview.get('id')
  const featureId = feature.get('id')
  const featureOfferingIsFree = featureIsFree(
    feature.getIn(['offerings', 'availability']),
  )
  const jwt = auth.get('jwt')
  if (_isNumber(featureId) && featureId > 0 && (jwt || featureOfferingIsFree)) {
    return `${url + getQuerySeparator(url)}fullplayer=feature`
  }
  if (_isNumber(previewId) && previewId > 0) {
    return `${url + getQuerySeparator(url)}fullplayer=preview`
  }
  return url
}

function getQuerySeparator (url) {
  if (url.indexOf('?') === -1) {
    return '?'
  }
  return '&'
}

function getClassName (inputClassName) {
  return ['watch'].concat(inputClassName || []).join(' ')
}

class Watch extends PureComponent {
  handleClick = (event) => {
    const { props } = this
    const {
      onClickWatch,
      upstreamContext,
      fullContext,
      setUpstreamContext,
    } = props

    const context = fullContext || upstreamContext

    if (_isFunction(upstreamContextClick)) {
      upstreamContextClick(event, { upstreamContext: context, setUpstreamContext })
    }

    if (_isFunction(onClickWatch)) {
      onClickWatch()
    }
  }

  renderAccessAllowedFeatureText = () => {
    const { staticText, feature, auth, text } = this.props
    const featureOfferingIsFree = featureIsFree(feature.getIn(['offerings', 'availability']))
    const userIsEntitled = isFeatureAllowedWithSubscription(feature, auth)
    let watchText = staticText.get('watchNow')

    if (text) {
      watchText = text
    } else if (featureOfferingIsFree && !userIsEntitled) {
      watchText = staticText.get('watchNowForFree')
    }

    return watchText
  }

  renderAccessAllowedFeature = () => {
    const { props, handleClick } = this
    const {
      url,
      className,
      style,
      children,
      renderType,
      buttonClass,
      iconClass,
    } = props
    const query = { fullplayer: 'feature' }

    if (renderType === WATCH_RENDER_TYPE_OVERLAY_LINK) {
      return (
        <Link
          to={url}
          query={query}
          data-element={THUMBNAIL}
          onClick={handleClick}
          className={getClassName(className)}
          style={style}
        >
          {children}
        </Link>
      )
    } else if (renderType === WATCH_RENDER_TYPE_BUTTON) {
      return (
        <Button
          url={url}
          query={query}
          element={WATCH_BUTTON}
          onClick={handleClick}
          text={this.renderAccessAllowedFeatureText()}
          buttonClass={buttonClass}
          iconClass={iconClass}
        />
      )
    }
    return null
  }

  renderAccessAllowedPreview = () => {
    const {
      props,
      handleClick,
    } = this
    const {
      url,
      className,
      style,
      children,
      renderType,
      buttonClass,
      staticText,
      asShare,
    } = props
    const query = { fullplayer: 'preview' }
    if (renderType === WATCH_RENDER_TYPE_OVERLAY_LINK) {
      return (
        <Link
          to={asShare ? '' : url}
          query={asShare ? {} : query}
          onClick={handleClick}
          className={getClassName(className)}
          style={style}
        >
          {children}
        </Link>
      )
    } else if (renderType === WATCH_RENDER_TYPE_BUTTON) {
      return (
        <Button
          to={asShare ? '' : url}
          query={asShare ? {} : query}
          onClick={handleClick}
          text={staticText.get('preview')}
          iconClass={['icon--preview']}
          buttonClass={buttonClass}
        />
      )
    }
    return null
  }

  /**
   * If we have no access attempt to send the visitor to a player page and
   * let the player page messaging sort out what they should do next. If
   * there is no feature or preview send them to a detail page.
   */
  renderAccessDenied = () => {
    const { props, handleClick } = this
    const {
      url,
      className,
      style,
      children,
      renderType,
      buttonClass,
      staticText,
    } = props
    const query = {}

    if (renderType === WATCH_RENDER_TYPE_OVERLAY_LINK) {
      return (
        <Link
          to={url}
          query={query}
          data-element={THUMBNAIL}
          onClick={handleClick}
          className={getClassName(className)}
          style={style}
        >
          {children}
        </Link>
      )
    } else if (renderType === WATCH_RENDER_TYPE_BUTTON) {
      return (
        <Button
          url={url}
          query={query}
          element={WATCH_BUTTON}
          onClick={handleClick}
          text={staticText.get('viewDetails')}
          buttonClass={buttonClass}
        />
      )
    }
    return null
  }

  render () {
    const {
      props,
      renderAccessAllowedFeature,
      renderAccessAllowedPreview,
      renderAccessDenied,
    } = this

    const { auth, preview, feature, type, forceAccess } = props

    return (
      <WatchAccess
        auth={auth}
        preview={preview}
        feature={feature}
        type={type}
        forceAccess={forceAccess}
      >
        <WatchAccessAllowed access={ACCESS_FEATURE}>
          {renderAccessAllowedFeature()}
        </WatchAccessAllowed>
        <WatchAccessAllowed access={ACCESS_PREVIEW}>
          {renderAccessAllowedPreview()}
        </WatchAccessAllowed>
        <WatchAccessDenied>
          {renderAccessDenied()}
        </WatchAccessDenied>
      </WatchAccess>
    )
  }
}

Watch.propTypes = {
  url: PropTypes.string.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  preview: ImmutablePropTypes.map.isRequired,
  style: PropTypes.object,
  className: PropTypes.array,
  renderType: PropTypes.string.isRequired,
  buttonClass: PropTypes.array,
  iconClass: PropTypes.array,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
  onClickWatch: PropTypes.func,
  asShare: PropTypes.bool,
  text: PropTypes.string,
  forceAccess: PropTypes.oneOf([
    ACCESS_FEATURE,
    ACCESS_PREVIEW,
  ]),
}

Watch.defaultProps = {
  upstreamContext: Map(),
}

const MemoizedWatch = React.memo(Watch)
export default connect(
  (state, props) => {
    const { upstreamContext } = props
    let id
    if (upstreamContext) {
      id = upstreamContext.get('videoId') || upstreamContext.get('seriesId', null)
    }
    const reduxContext = state.upstreamContext.get('data')
    let fullContext

    if (upstreamContext && reduxContext && (reduxContext.get('contentId') === id)) {
      const source = reduxContext.get('source')
      fullContext = upstreamContext.merge({
        source,
        score: reduxContext.get('score'),
        videoTasteSegment: reduxContext.get('videoTasteSegment'),
      })
    }

    return {
      fullContext,
      staticText: state.staticText.getIn(['data', 'watch', 'data']),
    }
  },
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setUpstreamContext: actions.upstreamContext.setUpstreamContext,
    }
  },
)(MemoizedWatch)
