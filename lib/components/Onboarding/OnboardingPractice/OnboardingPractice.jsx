import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { Map } from 'immutable'
import OnboardingTitleGradient from '../OnboardingTitleGradient'
import OnboardingProgressBar from '../OnboardingProgressBar'

const renderOptions = (props) => {
  const {
    topic,
    fitnessStyle,
    meditationFocus,
    yogaFocus,
    yogaLevel,
    setOptions,
    screenNumber,
  } = props

  let options = Map()
  if (topic === 'yoga') options = yogaLevel
  if (topic === 'yoga' && screenNumber === 3) options = yogaFocus
  if (topic === 'meditation') options = meditationFocus
  if (topic === 'fitness') options = fitnessStyle
  if (!options.size) return null

  return (
    options.map((option) => {
      const description = option.get('description')
      return (
        <li className="onboarding-practice__list-item" key={option.get('tid')}>
          <button onClick={() => setOptions(option, topic)} value={option}>
            <p className="onboarding-practice__list-item-title">
              { option.get('title') }
            </p>
            <p className="onboarding-practice__list-item-description">
              { description }
            </p>
          </button>
        </li>
      )
    })
  )
}

const getQuestion = (props, topic, screenNumber) => {
  const { copy } = props

  if (topic === 'meditation' || (topic === 'yoga' && screenNumber === 3)) {
    return copy.get('practiceFeel')
  }
  if (topic === 'yoga') return copy.get('practiceYoga')
  if (topic === 'fitness') return copy.get('practiceFitness')
  return null
}

const showskip = (topic, screenNumber) => {
  if (
    (topic === 'yoga' && screenNumber === 3) ||
    (topic === 'fitness' && screenNumber === 2) ||
    (topic === 'meditation' && screenNumber === 2)
  ) {
    return true
  }
  return false
}

const Practice = (props) => {
  const {
    copy,
    topic,
    setPage,
    screenNumber,
    progress,
    isFmtv,
  } = props
  return (
    <React.Fragment>
      <OnboardingTitleGradient
        title={getQuestion(props, topic, screenNumber)}
        handleBackClick={() => setPage(false)}
        screenNumber={screenNumber}
        copy={copy}
        isFmtv={isFmtv}
      />
      <div className="onboarding-practice">
        <OnboardingProgressBar percentage={progress} />
        <ul className="onboarding-practice__list">
          { renderOptions(props) }
          { showskip(topic, screenNumber) ?
            <li className="onboarding-practice__list-item" key={'none'}>
              <button onClick={() => setPage(true)}>
                <p className="onboarding-practice__list-item-title onboarding-practice__list-item-title--skip">
                  {copy.get('practiceNotSure')}
                </p>
                <p className="onboarding-practice__list-item-description" />
              </button>
            </li>
            : null
          }
        </ul>
      </div>
    </React.Fragment>
  )
}

export default compose(
  connectRedux(
    (state) => {
      const fitnessStyle = state.onboarding.getIn(['v5Data', 'fitness-style'], Map())
      const meditationFocus = state.onboarding.getIn(['v5Data', 'meditation-focus'], Map())
      // TODO: get duration for fitness and meditation
      const yogaDuration = state.onboarding.getIn(['v5Data', 'yoga-duration'], Map())
      const yogaFocus = state.onboarding.getIn(['v5Data', 'yoga-focus'], Map())
      const yogaLevel = state.onboarding.getIn(['v5Data', 'yoga-level'], Map())

      return {
        fitnessStyle,
        meditationFocus,
        yogaDuration,
        yogaFocus,
        yogaLevel,
      }
    },
    null,
  ),
)(Practice)

