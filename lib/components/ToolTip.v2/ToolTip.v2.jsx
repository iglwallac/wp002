import React from 'react'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { List } from 'immutable'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES } from 'components/Button.v2'
import { TOOLTIP_IMPRESSION_EVENT, TOOLTIP_CLOSE_EVENT } from 'services/event-tracking'
import { deactivateSubject } from 'services/testarossa'
import _isNil from 'lodash/isNil'

class ToolTip extends React.Component {
  constructor (props) {
    super(props)
    const { steps = List() } = props

    this.state = {
      activeStep: 0,
      totalSteps: steps.size,
      impressedSteps: [],
    }
  }

  componentDidMount = () => {
    this.sendGaTooltipImpressionEvent(0)
  }

  componentDidUpdate = (prevProps) => {
    const { callStartActionsAndFunctions, callEndActionsAndFunctions, props, state } = this
    const { steps } = props
    const stepNum = state.activeStep
    if (prevProps.steps !== steps) {
      callEndActionsAndFunctions(prevProps.steps, stepNum)
    } else if (stepNum > 0) {
      callEndActionsAndFunctions(steps, stepNum - 1)
    }
    callStartActionsAndFunctions(stepNum)
  }

  componentWillUnmount = () => {
    const { props } = this
    const { campaign, setActiveArrow } = props
    if (!_isNil(campaign)) {
      // Testarossa impression counting. Site tour tooltip is presented only once.
      deactivateSubject({ campaign })
    }
    setActiveArrow('')
  }

  onToolTipClose = () => {
    const { props, state } = this
    const { steps, closeTooltip } = props
    const { activeStep } = state
    this.callEndActionsAndFunctions(steps, activeStep)
    closeTooltip()
    this.sendGaToolTipCloseEvent()
  }

  onNext = () => {
    const { state } = this
    const { impressedSteps } = this.state
    const nextStep = state.activeStep + 1
    this.sendGaTooltipImpressionEvent(nextStep)
    this.setState({ activeStep: nextStep, impressedSteps: [...impressedSteps, nextStep] })
  }

  onStartOver = () => {
    const { steps } = this.props
    this.callEndActionsAndFunctions(steps, steps.length - 1)
    this.setState({ activeStep: 0 })
  }

  sendGaToolTipCloseEvent = () => {
    const { setDefaultGaEvent } = this.props
    const { activeStep } = this.state
    const eventData = TOOLTIP_CLOSE_EVENT
      .set('eventLabel', `Step ${activeStep + 1}`)

    setDefaultGaEvent(eventData)
  }

  sendGaTooltipImpressionEvent = (step) => {
    const { setDefaultGaEvent } = this.props
    const { impressedSteps } = this.state
    if (!impressedSteps.includes(step)) {
      const eventData = TOOLTIP_IMPRESSION_EVENT
        .set('eventLabel', `Step ${step + 1}`)

      setDefaultGaEvent(eventData)
    }
  }

  callStartActionsAndFunctions = (stepNum) => {
    const { dispatch, steps, setActiveArrow } = this.props
    const startActions = steps.getIn([stepNum, 'startActions'])
    const startFunctions = steps.getIn([stepNum, 'startFunctions'])
    const activeArrow = steps.getIn([stepNum, 'activeArrow'])
    if (startActions) {
      startActions.forEach(action => dispatch(action))
    }
    if (startFunctions) {
      startFunctions.forEach((f) => {
        if (typeof f === 'function') {
          f()
        }
      })
    }
    setActiveArrow(activeArrow)
  }

  callEndActionsAndFunctions = (steps, stepNum) => {
    const { props } = this
    const { setActiveArrow, dispatch } = props
    const endActions = steps.getIn([stepNum, 'endActions'])
    const endFunctions = steps.getIn([stepNum, 'endFunctions'])

    if (endActions) {
      endActions.forEach(action => dispatch(action))
    }
    if (endFunctions) {
      endFunctions.forEach((f) => {
        if (typeof f === 'function') {
          f()
        }
      })
    }
    setActiveArrow('')
  }

  renderSteps = () => {
    const { state, props, onToolTipClose, onStartOver } = this
    const { steps } = props
    const { activeStep, totalSteps } = state

    const titleText = steps.getIn([activeStep, 'title'], '')
    const bodyText = steps.getIn([activeStep, 'body'], '')
    return (
      <div>
        <div className="tool-tip-v2__progress">{activeStep + 1} of {totalSteps} </div>
        <Icon
          className="tool-tip-v2__close-icon"
          type={ICON_TYPES.CLOSE}
          onClick={onToolTipClose}
        />
        <div className="arrow-up" />
        <div className="tool-tip-v2__title">
          {titleText}
        </div>
        <div className="tool-tip-v2__body">
          {bodyText}
        </div>
        {activeStep + 1 < totalSteps && activeStep !== 0 ?
          <div className="tool-tip-v2__next">
            <Icon
              className="tool-tip-v2__next-chevron"
              type={ICON_TYPES.CHEVRON_RIGHT}
              onClick={() => this.onNext()}
            />
            <Button
              className="tool-tip-v2__next-button"
              onClick={() => this.onNext()}
            >
              Next
            </Button>
          </div>
          :
          null
        }
        {activeStep + 1 < totalSteps && activeStep === 0 ?
          <Button
            inverted
            type={TYPES.SECONDARY}
            onClick={() => this.onNext()}
            className="tool-tip-v2__show-button"
          >
            Show Me How
            <Icon
              className="tool-tip-v2__show-icon"
              type={ICON_TYPES.CHEVRON_RIGHT}
              onClick={() => this.onNext()}
            />
          </Button>
          : null
        }
        {activeStep + 1 === totalSteps ?
          <div className="tool-tip-v2__done-container">
            <Button
              className="tool-tip-v2__restart-button"
              onClick={onStartOver}
            >
              Start Over
            </Button>
            <Button
              inverted
              type={TYPES.SECONDARY}
              className="tool-tip-v2__done-button"
              onClick={onToolTipClose}
            >
              Done
            </Button>
          </div>
          : null
        }
      </div>
    )
  }

  render () {
    const { steps, children } = this.props

    return (
      <div className="tool-tip-v2">
        {steps ?
          this.renderSteps() :
          children
        }
      </div>
    )
  }
}


ToolTip.propTypes = {
  steps: ImmutablePropTypes.list,
  closeTooltip: PropTypes.func.isRequired,
}

export default connectRedux(
  (state, props) => {
    return {
      steps: state.app.getIn(['viewport', 'width']) > 1154 ? props.desktopSteps : props.mobileSteps,
    }
  },
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setActiveArrow: actions.tour.setActiveArrow,
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      dispatch,
    }
  },
)(ToolTip)
