import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _first from 'lodash/first'
import ToolTip from 'components/ToolTip'
import { Button, TYPES as BUTTON_TYPES, SIZES as BUTTON_SIZES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'
import { FEATURE_NAME_WATCH_HISTORY_TOOLTIP } from 'services/feature-tracking/constants'
import { isMemberCustomizationToolTipEligible } from 'services/feature-tracking'

class WatchHistoryEditTooltip extends React.Component {
  constructor (props) {
    super(props)
    this.toolTipEligible =
    isMemberCustomizationToolTipEligible(props.featureTracking, props.userStore,
      FEATURE_NAME_WATCH_HISTORY_TOOLTIP)
    this.state = {
      tooltipHidden: false,
    }
  }

  onClick = () => {
    this.setState({ tooltipHidden: true })
  }

  render () {
    const { props, state, onClick } = this
    const { staticText, classNames } = props

    if (state.tooltipHidden || !this.toolTipEligible) return null

    const baseClassName = _first(classNames, 'watch-history-edit-tooltip')
    return (
      <ToolTip
        visible
        className={classNames}
        arrowClassName={['tool-tip']}
        featureName={FEATURE_NAME_WATCH_HISTORY_TOOLTIP}
      >
        <Button
          className={`${baseClassName}__close`}
          icon={ICON_TYPES.CLOSE}
          onClick={() => { onClick() }}
          size={BUTTON_SIZES.DEFAULT}
          type={BUTTON_TYPES.ICON}
        />
        <p className={`${baseClassName}__title`}>
          {staticText.get('tooltipHeader')}
        </p>
        <p className={`${baseClassName}__text`}>
          {staticText.get('tooltipBody')}
        </p>
      </ToolTip>
    )
  }
}

WatchHistoryEditTooltip.defaultProps = {
  campaign: {},
  subject: {},
  variables: {},
}
WatchHistoryEditTooltip.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connectRedux(
  state => ({
    staticText: state.staticText.getIn(['data', 'watchHistoryEditTooltip', 'data']),
    featureTracking: state.featureTracking,
    userStore: state.user,
  }),
)(WatchHistoryEditTooltip)
