import React, { useEffect } from 'react'

import { connect as connectRedux } from 'react-redux'
import { List } from 'immutable'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'

import EspHeader from 'components/ContentPersonalization/EspHeader'
import EspBottomNav from 'components/ContentPersonalization/EspBottomNav'
import ContentPersonalization from 'components/ContentPersonalization/ContentPersonalization'

import useContentPersonalizationEdit from './useContentPersonalizationEdit'

function ContentPersonalizationEdit ({
  auth,
  copy,
  history,
  language,
  topics,
  selectedTopics,
  getUserOnboardingData,
  getOnboardingChoices,
  postV14OnboardingData,
  setDefaultGaEvent,
  v14DataSelectedChoicesEditCompleted,
  setV14SelectedChoicesClear,
}) {
  useEffect(() => {
    if (!auth.get('jwt')) {
      history.push('/')
    }
    getOnboardingChoices(language)
    getUserOnboardingData(language, auth)
  }, [])

  const {
    initialData,
    showCancel,
    onFinish,
    onContentPersonalizationTopics,
    onContentPersonalizationFavorites,
  } = useContentPersonalizationEdit(
    topics,
    selectedTopics,
    postV14OnboardingData,
    auth,
    history,
    setDefaultGaEvent,
    v14DataSelectedChoicesEditCompleted,
    setV14SelectedChoicesClear,
  )

  if (!copy) {
    return null
  }

  return (
    <div className="content-personalization-edit">
      <EspHeader
        title={copy.get('topicsTitle')}
        description={copy.get('topicsDesc')}
        backText="Back to Settings & Preferences"
      />
      <ContentPersonalization
        topics={topics}
        initialSelectedTopics={initialData.topics}
        initialFavoriteTopic={initialData.favorite}
        nav={EspBottomNav}
        onStart={() => {}}
        onFinish={onFinish}
        finishCTA="Save Changes"
        nextCTA={copy.get('topicsNext')}
        onSelectedTopicsChange={() => {}}
        onTopics={onContentPersonalizationTopics}
        onFavorites={onContentPersonalizationFavorites}
        backText={showCancel && 'Cancel'}
        selectMoreText={copy.get('topicsNextHint')}
        alphabetizeTopics
      />
    </div>
  )
}

export default compose(
  connectRedux(
    (state) => {
      const _topics = state.onboarding.getIn(['v14Data', 'interests'], List())
      const onboardingVersion = state.onboarding.getIn(['userSelection', 'result', 'onboardVersion'])
      const _selectedTopics = onboardingVersion === '1.4'
        ? state.onboarding.getIn(['userSelection', 'result', 'terms'], List())
        : List()

      return {
        auth: state.auth,
        copy: state.onboarding.getIn(['v14Data', 'screenCopy', 0]),
        language: state.user.getIn(['data', 'language', 0]),
        topics: _topics.toJS(),
        selectedTopics: _selectedTopics.toJS(),
        v14DataSelectedChoicesEditCompleted: state.onboarding.getIn(
          ['v14DataSelectedChoicesEditCompleted'], false,
        ),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getOnboardingChoices: actions.onboarding.getV14OnboardingChoices,
        getUserOnboardingData: actions.onboarding.getUserOnboardingData,
        postV14OnboardingData: actions.onboarding.postV14OnboardingData,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
        setV14SelectedChoicesClear: actions.onboarding.setV14SelectedChoicesClear,
      }
    },
  ),
)(ContentPersonalizationEdit)
