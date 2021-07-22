import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { Map } from 'immutable'
import Button from 'components/Button'
import IconV2 from 'components/Icon.v2'
import OnboardingTitleGradient from '../OnboardingTitleGradient'
import OnboardingProgressBar from '../OnboardingProgressBar'

const renderTopics = (props) => {
  const { topics, setTopics, selectedTopics } = props
  if (!topics.size) return null
  return (
    topics.map((topic) => {
      let number = false
      let className = 'onboarding-topics__list-item'
      selectedTopics.map((item, index) => {
        if (item === topic) {
          number = index + 1
          className = 'onboarding-topics__list-item onboarding-topics__list-item--selected'
          return number
        }
        return null
      })
      const title = topic.get('title')
      const iconKey = topic.get('iconKey')

      return (
        <li className={className} key={title}>
          { number ?
            <span onClick={() => setTopics(topic)} className="onboarding-topics__list-item--number">
              { number}
            </span>
            : <span onClick={() => setTopics(topic)}><IconV2 type={iconKey} /></span>
          }
          <button onClick={() => setTopics(topic)} value={topic}>
            { title }
          </button>
        </li>
      )
    })
  )
}

const Topics = (props) => {
  const {
    copy,
    setPage,
    selectedTopics,
    progress,
    screenNumber,
    isFmtv,
  } = props

  return (
    <React.Fragment>
      <OnboardingTitleGradient
        title={copy.get('topicsTitle')}
        description={copy.get('topicsDesc')}
        handleBackClick={() => setPage(false)}
        showDone={selectedTopics.size}
        screenNumber={screenNumber}
        copy={copy}
        isFmtv={isFmtv}
      />
      <div className="onboarding-topics">
        <OnboardingProgressBar percentage={progress} />
        <div className="onboarding-topics__container">
          <ul className="onboarding-topics__list">{ renderTopics(props) }</ul>
        </div>
        { selectedTopics.size ?
          <Button
            buttonClass="onboarding-topics__button"
            text={copy.get('topicsNext')}
            onClick={() => setPage(true)}
          /> : null
        }
      </div>
    </React.Fragment>
  )
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
)(Topics)

