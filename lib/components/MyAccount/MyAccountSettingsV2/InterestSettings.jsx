import React, { useEffect } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import { List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Expandable from 'components/Expandable/Expandable'
import TopicTile from 'components/ContentPersonalization/TopicTile'
import TopicTileGrid from 'components/ContentPersonalization/TopicTileGrid'
import Button from 'components/Button'

import {
  SETTINGS_AND_PREFERENCES_EVENT,
  EVENT_LABEL_INTERESTS,
} from 'services/event-tracking'

const InterestSettings = (props) => {
  const {
    auth,
    staticText,
    getOnboardingChoices,
    userLanguage,
    topics,
    getUserOnboardingData,
    selectedTopics,
    setDefaultGaEvent,
  } = props

  useEffect(() => {
    getOnboardingChoices(userLanguage)
    getUserOnboardingData(userLanguage, auth)
  }, [])

  const sortedTopics = topics.sort((a, b) => {
    if (a.get('title') < b.get('title')) return -1
    if (a.get('title') > b.get('title')) return 1
    return 0
  })

  const onClick = () => {
    setDefaultGaEvent(SETTINGS_AND_PREFERENCES_EVENT.set(
      'eventLabel', `${EVENT_LABEL_INTERESTS} | Edit Selections`),
    )
  }

  return (
    <Expandable
      variant="setting"
      header={staticText.getIn(['data', 'interestsSettingsTitle'])}
      description={staticText.getIn(['data', 'interestsSettingsHeader'])}
    >
      <Button
        buttonClass={['button--primary']}
        iconClass={['icon-v2', 'icon-v2--pencil', 'icon--left']}
        text={staticText.getIn(['data', 'editSelections'])}
        url={'/account/settings/interests'}
        onClick={onClick}
      />
      { sortedTopics.size > 0 ?
        <TopicTileGrid>
          {sortedTopics.toJS().map((topic) => {
            const selected = selectedTopics.find(x => x.get('tid') === topic.tid)
            const checkbox = (selected && (selected.get('weight') === 1) ? TopicTile.CheckboxHeart : TopicTile.CheckboxCheckMark)
            return (<TopicTile
              key={topic.tid}
              id={topic.tid}
              title={topic.title}
              iconKey={topic.iconKey}
              description={topic.description}
              checkbox={checkbox}
              onClick={() => {}}
              selected={selectedTopics.map(x => x.get('tid')).includes(topic.tid)}
            />)
          })}
        </TopicTileGrid>
        : <div />
      }
    </Expandable>
  )
}

InterestSettings.propTypes = {
  topics: ImmutablePropTypes.list,
}

export default compose(
  connectStaticText({ storeKey: 'myAccountSettingsV2' }),
  connectRedux(
    (state) => {
      const onboardingVersion = state.onboarding.getIn(['userSelection', 'result', 'onboardVersion'])

      return {
        auth: state.auth,
        topics: state.onboarding.getIn(['v14Data', 'interests'], List()),
        userLanguage: state.user.getIn(['data', 'language', 0]),
        selectedTopics: onboardingVersion === '1.4'
          ? state.onboarding.getIn(['userSelection', 'result', 'terms'], List())
          : List(),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getOnboardingChoices: actions.onboarding.getV14OnboardingChoices,
        getUserOnboardingData: actions.onboarding.getUserOnboardingData,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
      }
    },
  ),
)(InterestSettings)
