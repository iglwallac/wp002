import { useState, useEffect, useMemo } from 'react'

import { SECTION_TOPICS, SECTION_FAVORITES } from 'components/ContentPersonalization/useBottomNav'

import {
  SETTINGS_AND_PREFERENCES_EVENT,
  EVENT_ACTION_SELECT,
  EVENT_ACTION_DESELECT,
  EVENT_ACTION_FAVORITE,
  EVENT_ACTION_UNFAVORITE,
  EVENT_LABEL_INTERESTS,
} from 'services/event-tracking'

function useContentPersonalizationEdit (
  topics,
  initialSelectedTopics,
  postV14OnboardingData,
  auth,
  history,
  setDefaultGaEvent,
  v14DataSelectedChoicesEditCompleted,
  setV14SelectedChoicesClear,
) {
  const [
    contentPersonalizationSection,
    setContentPersonalizationSection,
  ] = useState(SECTION_TOPICS)

  const initialData = useMemo(() => {
    return {
      topics: initialSelectedTopics.map((selected) => {
        return topics.find(topic => topic.tid === selected.tid)
      }),
      favorite: initialSelectedTopics
        .filter(selected => selected.weight === 1)
        .map(selected => topics.find(topic => topic.tid === selected.tid))[0],
    }
  }, [topics, initialSelectedTopics])

  useEffect(() => {
    if (v14DataSelectedChoicesEditCompleted) {
      history.push('/account/settings')
      setV14SelectedChoicesClear()
    }
  }, [v14DataSelectedChoicesEditCompleted])

  const onFinish = (_selectedTopics, _favoriteTopic) => {
    const favoriteTopic = _selectedTopics.length === 1 ? _selectedTopics[0] : _favoriteTopic
    postV14OnboardingData({
      auth,
      terms: _selectedTopics.map((topic) => {
        return {
          tid: topic.tid,
          vid: topic.vid,
          weight: topic.tid === favoriteTopic.tid ? 1 : 0.5,
        }
      }),
    })

    setDefaultGaEvent(SETTINGS_AND_PREFERENCES_EVENT
      .merge({
        eventLabel: `${EVENT_LABEL_INTERESTS} | ${_selectedTopics.map(x => `${x.title} | ${x.tid}`).join(' , ')}`,
        eventAction: EVENT_ACTION_SELECT,
        eventValue: _selectedTopics.length,
      }),
    )

    const initialSelectedTopicsMapped = initialSelectedTopics.map(
      t => topics.find(st => st.tid === t.tid),
    )
    const diff = initialSelectedTopicsMapped
      .filter((st) => {
        return !_selectedTopics.find(t => t.tid === st.tid)
      })


    if (diff.length > 0) {
      setDefaultGaEvent(SETTINGS_AND_PREFERENCES_EVENT
        .merge({
          eventLabel: `${EVENT_LABEL_INTERESTS} | ${diff.map(x => `${x.title} | ${x.tid}`).join(' , ')}`,
          eventAction: EVENT_ACTION_DESELECT,
          eventValue: diff.length,
        }),
      )
    }

    setDefaultGaEvent(SETTINGS_AND_PREFERENCES_EVENT
      .merge({
        eventLabel: `${EVENT_LABEL_INTERESTS} | [${favoriteTopic.title} | ${favoriteTopic.tid}]`,
        eventAction: EVENT_ACTION_FAVORITE,
      }),
    )

    const initialFav = initialSelectedTopics.find(t => t.weight === 1)
    if (initialFav && initialFav.tid !== favoriteTopic.tid) {
      const initialFavData = initialSelectedTopicsMapped.find(t => t.tid === initialFav.tid)
      setDefaultGaEvent(SETTINGS_AND_PREFERENCES_EVENT
        .merge({
          eventLabel: `${EVENT_LABEL_INTERESTS} | [${initialFavData.title} | ${initialFavData.tid}]`,
          eventAction: EVENT_ACTION_UNFAVORITE,
        }),
      )
    }
  }

  const onContentPersonalizationTopics = () => {
    setContentPersonalizationSection(SECTION_TOPICS)
  }

  const onContentPersonalizationFavorites = () => {
    setContentPersonalizationSection(SECTION_FAVORITES)
  }

  const showCancel = useMemo(() => {
    return contentPersonalizationSection === SECTION_FAVORITES
  }, [contentPersonalizationSection])

  return {
    initialData,
    showCancel,
    onFinish,
    onContentPersonalizationTopics,
    onContentPersonalizationFavorites,
  }
}

export default useContentPersonalizationEdit
