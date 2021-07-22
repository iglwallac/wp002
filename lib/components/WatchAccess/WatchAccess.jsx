import PropTypes from 'prop-types'
import React, { Children as ReactChildren } from 'react'
import { Map, List } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import { getAuthIsLoggedIn } from 'services/auth'
import { isFeatureAllowedWithSubscription } from 'services/subscription'
import {
  GEO_AVAILABILITY_ALLOWED_IN,
  GEO_AVAILABILITY_BLOCKED_IN,
} from 'services/geo-restrictions'
import {
  TYPE_CONTENT_SERIES,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SEGMENTED,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
} from 'services/content-type'
import { get as _get } from 'lodash'

export const ACCESS_PREVIEW = 'ACCESS_PREVIEW'
export const ACCESS_FEATURE = 'ACCESS_FEATURE'
export const ACCESS_CHECK_AUTH_FEATURE_GEO = 'ACCESS_CHECK_AUTH_FEATURE_GEO'

function getGeoAllowed (availability, countries, userCountry) {
  if (availability === GEO_AVAILABILITY_ALLOWED_IN) {
    return countries.includes(userCountry)
  }
  if (availability === GEO_AVAILABILITY_BLOCKED_IN) {
    return !countries.includes(userCountry)
  }
  // This is for worldwide
  return true
}

/**
 * Return true if content is of a type that should not allow playback of any kind.
 */
function disallowAccessByType (type) {
  const disallowedTypes = [
    TYPE_CONTENT_SERIES,
    TYPE_CONTENT_SERIES_YOGA,
    TYPE_CONTENT_SERIES_FITNESS,
    TYPE_CONTENT_SERIES_MEDITATION,
    TYPE_CONTENT_SEGMENTED,
    TYPE_CONTENT_SEGMENTED_YOGA,
    TYPE_CONTENT_SEGMENTED_FITNESS,
    TYPE_CONTENT_SEGMENTED_MEDITATION,
  ]
  return disallowedTypes.includes(type)
}

/**
 * First check if the user has access to a feature, then a preview before they can't watch anything.
 */
function getAccess (props) {
  const { auth, feature, preview, type, forceAccess } = props
  const userCountry = auth.get('country')

  // Check content type
  // e.g. Series type tiles should never allow playback
  if (disallowAccessByType(type)) {
    return false
  }

  // Feature Checks
  const featureHasGeoData =
    feature.getIn(['georestrictions', 'availability']) &&
    feature.getIn(['georestrictions', 'countries'], Map()).size > 0
  let featureGeoAllowed = true
  if (auth.get('jwt') && featureHasGeoData) {
    featureGeoAllowed = getGeoAllowed(
      feature.getIn(['georestrictions', 'availability']),
      feature.getIn(['georestrictions', 'countries']),
      userCountry,
    )
  }

  const featureEntitlementAllowed = isFeatureAllowedWithSubscription(feature, auth)

  // Preview Checks
  // @TODO Change the preview GEO data to use the preview when the data is correct from the API
  // const previewGeoAllowed = getGeoAllowed(preview.getIn(['georestrictions', 'availability']),
  // preview.getIn(['georestrictions', 'countries']), userCountry)
  // Sending the feature GEO data for the preview is intentional
  const previewHasGeoData =
    feature.getIn(['georestrictions', 'availability']) &&
    preview.getIn(['georestrictions', 'countries'], Map()).size > 0
  let previewGeoAllowed = true
  if (auth.get('jwt') && previewHasGeoData) {
    previewGeoAllowed = getGeoAllowed(
      feature.getIn(['georestrictions', 'availability']),
      feature.getIn(['georestrictions', 'countries']),
      userCountry,
    )
  }

  // forceAccess is sending anon users to the preview instead of the details page
  // this is for videos from the portal page

  const previewEntitlmentAllowed = isFeatureAllowedWithSubscription(feature, auth)

  // Figure out what we have access to.
  if (feature.get('id') > 0 && featureGeoAllowed && featureEntitlementAllowed) {
    return ACCESS_FEATURE
  } else if (!getAuthIsLoggedIn(auth) && forceAccess) {
    return forceAccess
  } else if (
    preview.get('id') > 0 &&
    previewGeoAllowed &&
    previewEntitlmentAllowed
  ) {
    return ACCESS_PREVIEW
  }
  return false
}

/**
 * Only checks authenticated access to feature, unathenticated users get full access.
 */
function getAccessAuthFeatureGeo (props) {
  const { auth, feature } = props
  const noGeoData =
    !feature.getIn(['georestrictions', 'availability']) ||
    feature.getIn(['georestrictions', 'countries'], Map()).size === 0
  // If you are anonymous, you have access to all titles
  if (!auth.get('jwt') || noGeoData) {
    return ACCESS_PREVIEW
  }

  const userCountry = auth.get('country')
  const featureHasGeoData = feature.getIn(['georestrictions', 'availability'])
  let featureGeoAllowed = true
  if (auth.get('jwt') && featureHasGeoData) {
    featureGeoAllowed = getGeoAllowed(
      feature.getIn(['georestrictions', 'availability']),
      feature.getIn(['georestrictions', 'countries']),
      userCountry,
    )
  }

  const featureEntitlementAllowed = isFeatureAllowedWithSubscription(feature, auth)

  // If you are anonymous, you have access to all titles
  if (featureGeoAllowed && featureEntitlementAllowed) {
    return ACCESS_FEATURE
  } else if (
    featureGeoAllowed &&
    !featureEntitlementAllowed &&
    auth.get('jwt')
  ) {
    return ACCESS_PREVIEW
  }
  return false
}

function renderChildren (props) {
  const { children, accessCheck } = props

  const access = !accessCheck
    ? getAccess(props)
    : getAccessAuthFeatureGeo(props)
  const knowsTypes = List([WatchAccessDenied, WatchAccessAllowed])
  return ReactChildren.map(children, (child) => {
    if (!knowsTypes.includes(_get(child, 'type'))) {
      return child
    }
    if (_get(child, 'type') === WatchAccessDenied && access === false) {
      return child
    }
    if (_get(child, 'type') === WatchAccessAllowed && access !== false) {
      const childAccess = child.props.access
      if (childAccess && access !== childAccess) {
        return null
      }
      return child
    }
    return null
  })
}

function WatchAccess (props) {
  return <div className="watch-access">{renderChildren(props)}</div>
}

WatchAccess.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  preview: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  accessCheck: PropTypes.string,
  forceAccess: PropTypes.oneOf([
    ACCESS_FEATURE,
    ACCESS_PREVIEW,
  ]),
}

export default React.memo(WatchAccess)
