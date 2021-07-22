
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { fromJS, List, Map } from 'immutable'
import Link from 'components/Link'
import Icon from 'components/Icon'
import {
  GIFT_STEP_ONE,
  GIFT_STEP_TWO,
  GIFT_STEP_THREE,
  GIFT_STEP_FOUR,
  GIFT_STEP_FIVE,
} from 'services/gift'
import {
  URL_GIFT_SELECT,
  URL_GIFT_THEME,
  URL_GIFT_RECIPIENT,
  URL_GIFT_PREVIEW,
  URL_GIFT_PAYMENT,
} from 'services/url/constants'

function getStepData (staticText = Map()) {
  const stepData = [
    {
      number: GIFT_STEP_ONE,
      url: URL_GIFT_SELECT,
      text: staticText.getIn(['data', 'gift'], ''),
    },
    {
      number: GIFT_STEP_TWO,
      url: URL_GIFT_THEME,
      text: staticText.getIn(['data', 'theme'], ''),
    },
    {
      number: GIFT_STEP_THREE,
      url: URL_GIFT_RECIPIENT,
      text: staticText.getIn(['data', 'recipient'], ''),
    },
    {
      number: GIFT_STEP_FOUR,
      url: URL_GIFT_PREVIEW,
      text: staticText.getIn(['data', 'preview'], ''),
    },
    {
      number: GIFT_STEP_FIVE,
      url: URL_GIFT_PAYMENT,
      text: staticText.getIn(['data', 'payment'], ''),
    },
  ]

  return fromJS(stepData)
}

function getBackArrowUrl (stepNumber) {
  const data = getStepData()

  return data.getIn([stepNumber - 2, 'url'])
}

function getProgressItemClassName (className, active, complete) {
  const itemClass = [className]

  if (active) {
    itemClass.push(`${className}--active`)
  }

  if (complete && !active) {
    itemClass.push(`${className}--complete`)
  }

  return itemClass.join(' ')
}

function renderProgressLine (step, complete) {
  if (step === GIFT_STEP_FIVE) {
    return null
  }
  const baseClassName = 'gift-progress-meter__line'
  const className = [baseClassName]

  if (complete) {
    className.push(`${baseClassName}--complete`)
  }

  return (
    <div className={className.join(' ')} />
  )
}

function renderProgressItems (props) {
  const { staticText, gift } = props
  const data = getStepData(staticText)
  const stepActive = gift.getIn(['step', 'active'])
  const stepComplete = gift.getIn(['step', 'complete'], List())

  return data.map((item) => {
    const stepNumber = item.get('number')
    const stepUrl = item.get('url')
    const stepText = item.get('text')
    const complete = stepComplete.size > 0 ? stepComplete.find((step) => {
      return step === stepNumber
    }) : false
    const isActive = stepActive === stepNumber
    const isComplete = !!complete

    return (
      <li key={`step-${stepNumber}`} className={getProgressItemClassName('gift-progress-meter__item', isActive, isComplete)}>
        {
          isActive || isComplete ?
            <Link
              className={getProgressItemClassName('gift-progress-meter__item-content', isActive, isComplete)}
              to={stepUrl}
            >
              {renderProgressLine(stepNumber, isComplete)}
              <span className={getProgressItemClassName('gift-progress-meter__number', isActive, isComplete)}>
                {stepNumber}
              </span>
              <span className={getProgressItemClassName('gift-progress-meter__text', isActive, isComplete)}>
                {stepText}
              </span>
            </Link>
            :
            <div className="gift-progress-meter__item-content">
              {renderProgressLine(stepNumber, isComplete)}
              <span className={getProgressItemClassName('gift-progress-meter__number', isActive, isComplete)}>
                {stepNumber}
              </span>
              <span className={getProgressItemClassName('gift-progress-meter__text', isActive, isComplete)}>
                {stepText}
              </span>
            </div>
        }
      </li>
    )
  })
}

function renderBackArrow (props) {
  const { gift } = props
  const activeStep = gift.getIn(['step', 'active'])

  if (activeStep === GIFT_STEP_ONE) {
    return (
      <div className="gift-progress-meter__left-arrow">
        <Icon iconClass={['icon--left', 'gift-progress-meter__left-icon']} />
      </div>
    )
  }

  return (
    <Link
      className="gift-progress-meter__left-arrow"
      to={getBackArrowUrl(activeStep)}
    >
      <Icon iconClass={['icon--left', 'gift-progress-meter__left-icon', 'gift-progress-meter__left-icon--link']} />
    </Link>
  )
}

function GiftProgressMeter (props) {
  const { gift } = props

  if (!gift.getIn(['step', 'active'])) {
    return null
  }

  return (
    <div className="gift-progress-meter">
      {renderBackArrow(props)}
      <ul className="gift-progress-meter__list">
        {renderProgressItems(props)}
      </ul>
    </div>
  )
}

GiftProgressMeter.propTypes = {
  gift: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      gift: state.gift,
    }),
  ),
  connectStaticText({ storeKey: 'giftProgressMeter' }),
)(GiftProgressMeter)
