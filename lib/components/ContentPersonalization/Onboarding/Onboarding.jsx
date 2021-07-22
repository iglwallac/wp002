/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react'

import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'

import { SECTION_FAVORITES } from 'components/ContentPersonalization/useBottomNav'
import { ERROR_TYPE_500 } from 'components/ErrorPage/types'
import ContentPersonalization from 'components/ContentPersonalization/ContentPersonalization'
import LaunchPage from 'components/ContentPersonalization/OnboardingLaunchPage'
import FinalPage from 'components/ContentPersonalization/OnboardingFinalPage'
import OnboardingBottomNav from 'components/ContentPersonalization/OnboardingBottomNav'
import OnboardingHeader from 'components/ContentPersonalization/OnboardingHeader'
import ErrorPage from 'components/ErrorPage'

import useOnboarding, {
  PAGE_LAUNCH,
  PAGE_CONTENT_PERSONALIZATION,
  PAGE_FINAL,
} from './useOnboarding'

function Onboarding ({
  auth,
  copy,
  error,
  history,
  language,
  topics,
  getOnboardingChoices,
  postV14OnboardingData,
  setDefaultGaEvent,
  isNewUser = true,
  location,
}) {
  const {
    contentPersonalizationSection,
    currentStep,
    favoriteTopic,
    onLaunch,
    onSkip,
    onContentPersonalizationFavorites,
    onContentPersonalizationTopics,
    onFinishContentPersonalization,
    onSelectedTopicsChange,
    onStartContentPersonalization,
    section,
    selectedTopics,
    showSteps,
    totalSteps,
  } = useOnboarding({ isNewUser,
    history,
    postV14OnboardingData,
    setDefaultGaEvent,
    auth,
    defaultTopic: topics.find(x => x.get('iconKey') === 'growth'),
  })

  useEffect(() => {
    if (!auth.get('jwt')) {
      history.push('/')
    }
    getOnboardingChoices(language)
  }, [])

  if (!copy) {
    return null
  }

  if (error) {
    return <ErrorPage location={location} code={ERROR_TYPE_500} />
  }

  return (
    <div className="onboarding">
      {section === PAGE_LAUNCH ? (
        <LaunchPage
          title={copy.get('introTitleNew')}
          subtitle={copy.get('introSubtitleNew')}
          paragraph1={copy.get('introParagraph1')}
          paragraph2={copy.get('introParagraph2')}
          onLaunch={onLaunch}
          letsGoText={copy.get('introLetsGo')}
          skipCTA={copy.get('skipCTA')}
          onSkip={onSkip}
        />
      ) : section === PAGE_CONTENT_PERSONALIZATION ? (
        <React.Fragment>
          <OnboardingHeader
            title={
              contentPersonalizationSection === SECTION_FAVORITES
                ? copy.get('favoriteTitle')
                : copy.get('topicsTitle')
            }
            description={
              contentPersonalizationSection === SECTION_FAVORITES
                ? copy.get('favoriteDesc')
                : copy.get('topicsDesc')
            }
            stepsLabel={showSteps ? `STEP ${currentStep} of ${totalSteps}` : ''}
          />
          <ContentPersonalization
            topics={topics.toJS()}
            initialSelectedTopics={selectedTopics}
            initialFavoriteTopic={favoriteTopic}
            nav={OnboardingBottomNav}
            onStart={onStartContentPersonalization}
            onFinish={onFinishContentPersonalization}
            finishCTA={isNewUser ? copy.get('topicsNext') : copy.get('topicsStartWatching')}
            nextCTA={isNewUser ? copy.get('topicsSelectFavorite') : copy.get('topicsNext')}
            onSelectedTopicsChange={onSelectedTopicsChange}
            onTopics={onContentPersonalizationTopics}
            onFavorites={onContentPersonalizationFavorites}
            backText={copy.get('back')}
            selectMoreText={copy.get('topicsNextHint')}
          />
        </React.Fragment>
      ) : section === PAGE_FINAL ? (
        <FinalPage
          title={copy.get('finalTitle')}
          description={copy.get('finalParagraph')}
          mediaId={copy.get('onBoardingMediaId')}
          history={history}
          finalText={copy.get('topicsStartWatching')}
          recommenderReady
        />
      ) : null}
    </div>
  )
}

export default compose(
  connectRedux(
    (state) => {
      return {
        auth: state.auth,
        copy: state.onboarding.getIn(['v14Data', 'screenCopy', 0]),
        error: state.onboarding.get('error'),
        language: state.user.getIn(['data', 'language', 0]),
        topics: state.onboarding.getIn(['v14Data', 'interests'], Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        postV14OnboardingData: actions.onboarding.postV14OnboardingData,
        getOnboardingChoices: actions.onboarding.getV14OnboardingChoices,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(Onboarding)

