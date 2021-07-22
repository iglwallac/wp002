import _isUndefined from 'lodash/isUndefined'
import React from 'react'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import get from 'lodash/get'
import ToolTip from 'components/ToolTip'
import { Button, TYPES, SIZES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'
import { FEATURE_NAME_END_STATE_AUTOPLAY_TOOLTIP } from 'services/feature-tracking/constants'
import { isMemberCustomizationToolTipEligible } from 'services/feature-tracking'

const BLOCK_CLASSNAME = 'button-toggle'
class ButtonToggle extends React.Component {
  constructor (props) {
    const { campaign, variation } = props
    const campaignId = get(campaign, 'friendlyId')
    const variationId = get(variation, 'friendlyId')

    super(props)
    this.toolTipEligible = campaignId === 'ME-3043' && variationId === 1 &&
      isMemberCustomizationToolTipEligible(props.featureTracking, props.userStore,
        FEATURE_NAME_END_STATE_AUTOPLAY_TOOLTIP)
    this.state = {}
  }

  onClick = () => {
    const {
      onChange,
      setDefaultGaEvent,
      gaEventData,
    } = this.props

    onChange()

    if (gaEventData) {
      setDefaultGaEvent(gaEventData)
    }

    this.setState({ tooltipHidden: true })
  }

  getClassName = (elementName, options = {}) => {
    const { checked, round, small } = options
    const blockElement = elementName ? `${BLOCK_CLASSNAME}__${elementName}` : BLOCK_CLASSNAME
    const classNames = [blockElement]
    if (small) classNames.push(`${blockElement}--small`)
    if (round) classNames.push(`${blockElement}--round`)
    if (!_isUndefined(checked)) {
      classNames.push(checked ? `${blockElement}--state-on` : `${blockElement}--state-off`)
    }
    return classNames.join(' ')
  }

  render () {
    const { props, state, onClick, getClassName } = this
    const { tooltipHidden } = state
    const {
      checked,
      labelTextOn,
      labelTextOff,
      round,
      small,
      staticText,
      showLabel,
    } = props

    const renderLabelTextOn = labelTextOn || staticText.getIn(['data', 'labelOn'])
    const renderLabelTextOff = labelTextOff || staticText.getIn(['data', 'labelOff'])
    return (
      <div className={getClassName(null, { small })}>
        {/* eslint-disable-next-line jsx-a11y/label-has-for */}
        <label className={getClassName('label')}>
          {showLabel && (checked ? renderLabelTextOn : renderLabelTextOff)}
          <input
            className={getClassName('checkbox')}
            type="checkbox"
            checked={checked}
            onChange={onClick}
          />
          <span className={getClassName('toggle-switch')}>
            <span className={getClassName('slider', { checked, round })} />
          </span>
        </label>
        {this.toolTipEligible && !tooltipHidden ?
          <ToolTip
            visible
            className={getClassName('ME-3043-tooltip').split(' ')}
            arrowClassName={[
              'tool-tip__arrow--center-top-white',
            ]}
            featureName={FEATURE_NAME_END_STATE_AUTOPLAY_TOOLTIP}
          >
            <Button
              className={getClassName('ME-3043-tooltip-close')}
              icon={ICON_TYPES.CLOSE}
              onClick={() => this.setState({ tooltipHidden: true })}
              size={SIZES.DEFAULT}
              type={TYPES.ICON}
            />
            <p className={getClassName('ME-3043-tooltip-title')}>
              {staticText.getIn(['data', 'autoplaySettings'])}
            </p>
            <p className={getClassName('ME-3043-tooltip-text')}>
              {staticText.getIn(['data', 'tooltipText'])}
            </p>
          </ToolTip>
          : null
        }
      </div>
    )
  }
}

ButtonToggle.defaultProps = {
  onChange: undefined,
  checked: false,
  round: false,
  small: false,
  gaEventData: null,
}

ButtonToggle.propTypes = {
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  showLabel: PropTypes.bool,
  labelTextOn: PropTypes.string,
  labelTextOff: PropTypes.string,
  round: PropTypes.bool,
  small: PropTypes.bool,
  setDefaultGaEvent: PropTypes.func,
  gaEventData: PropTypes.object,
}

export default connectRedux(
  state => ({
    staticText: state.staticText.getIn(['data', 'buttonToggle']),
    featureTracking: state.featureTracking,
    userStore: state.user,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
    }
  },
)(ButtonToggle)
