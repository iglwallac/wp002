import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import Button from 'components/Button'
import { Map } from 'immutable'
import DurationPicker from 'components/DurationPicker'
import OnboardingTitleGradient from '../OnboardingTitleGradient'
import OnboardingProgressBar from '../OnboardingProgressBar'

const handleSubmit = (setPage) => {
  setPage(true)
}

// eslint-disable-next-line react/prefer-stateless-function
class Duration extends React.Component {
  handleDurationChange = (duration) => {
    this.props.setDuration(duration)
  }

  render () {
    const { props, handleDurationChange } = this
    const {
      copy,
      setPage,
      progress,
      screenNumber,
      isFmtv,
    } = props

    return (
      <React.Fragment>
        <OnboardingTitleGradient
          title={copy.get('duration')}
          handleBackClick={() => setPage(false)}
          screenNumber={screenNumber}
          copy={copy}
          duration
          isFmtv={isFmtv}
        />
        <div className="onboarding-duration">
          <OnboardingProgressBar percentage={progress} />
          <div className="onboarding-duration__picker-container">
            <DurationPicker onChange={handleDurationChange} />
          </div>
          <div className="onboarding-duration__button-container">
            <Button
              buttonClass={['onboarding-duration__button']}
              text={copy.get('done')}
              onClick={() => handleSubmit(setPage)}
            />
          </div>
        </div>


      </React.Fragment>
    )
  }
}

export default compose(
  connectRedux(
    (state) => {
      const topics = state.onboarding.getIn(['v5Data', 'rank-interests'], Map())
      return {
        topics,
      }
    },
    null,
  ),
)(Duration)

