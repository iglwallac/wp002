import { useMemo, useState } from 'react'

import { SECTION_TOPICS, SECTION_FAVORITES } from 'components/ContentPersonalization/useBottomNav'
import { ONBOARDING_CLICK_EVENT, EVENT_LABEL_SKIP,
  EVENT_LABEL_INTERESTS,
  EVENT_LABEL_LETS_GO,
  ONBOARDING_FAVORITE_EVENT,
  ONBOARDING_SELECT_EVENT } from 'services/event-tracking'

export const PAGE_LAUNCH = 'lauch'
export const PAGE_CONTENT_PERSONALIZATION = 'content-personalization'
export const PAGE_FINAL = 'final'

function useOnboarding ({ isNewUser, history, postV14OnboardingData,
  setDefaultGaEvent, auth, defaultTopic }) {
  const [selectedTopics, setSelectedTopics] = useState([])
  const [favoriteTopic, setFavoriteTopic] = useState(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [
    contentPersonalizationSection,
    setContentPersonalizationSection,
  ] = useState(SECTION_TOPICS)

  const showSteps = useMemo(() => {
    return selectedTopics.length > 0
  }, [selectedTopics])

  const sections = useMemo(() => {
    const pages = [
      PAGE_LAUNCH,
      PAGE_CONTENT_PERSONALIZATION,
    ]

    if (isNewUser) {
      pages.push(PAGE_FINAL)
    }

    return pages
  }, [isNewUser])

  const currentStep = useMemo(() => {
    return 1 + (contentPersonalizationSection === SECTION_FAVORITES ? 2 : 1)
  }, [contentPersonalizationSection])

  const totalSteps = useMemo(() => {
    return (sections.length - 1) + (selectedTopics.length > 1 ? 2 : 1)
  }, [selectedTopics, sections])

  const nextPage = () => {
    const index = currentSectionIndex + 1 > sections.length - 1
      ? sections.length - 1
      : currentSectionIndex + 1
    setCurrentSectionIndex(index)
  }

  const onLaunch = () => {
    nextPage()
    setDefaultGaEvent(ONBOARDING_CLICK_EVENT.set('eventLabel', EVENT_LABEL_LETS_GO))
  }

  const onSkip = () => {
    postV14OnboardingData({
      auth,
      terms: [
        {
          tid: defaultTopic.get('tid'),
          vid: defaultTopic.get('vid'),
          weight: 1,
        },
      ],
    })
    setDefaultGaEvent(ONBOARDING_CLICK_EVENT.set('eventLabel', EVENT_LABEL_SKIP))
  }

  const prevPage = () => {
    const index = currentSectionIndex - 1 < 0 ? 0 : currentSectionIndex - 1
    setCurrentSectionIndex(index)
  }

  const onFinishContentPersonalization = (_selectedTopics, _favoriteTopic) => {
    setSelectedTopics(_selectedTopics)
    setFavoriteTopic(_favoriteTopic)

    postV14OnboardingData({
      auth,
      terms: _selectedTopics.map((topic) => {
        return {
          tid: topic.tid,
          vid: topic.vid,
          weight: topic.tid === _favoriteTopic.tid ? 1 : 0.5,
        }
      }),
    })

    setDefaultGaEvent(ONBOARDING_FAVORITE_EVENT.set('eventLabel', `${EVENT_LABEL_INTERESTS} | ${_favoriteTopic.title} | ${_favoriteTopic.tid}`))
    const eventLabel = `${EVENT_LABEL_INTERESTS} | ${_selectedTopics.map(topic =>
      `${topic.title} | ${topic.tid}`).join(' , ')}`
    setDefaultGaEvent(ONBOARDING_SELECT_EVENT.set('eventLabel', eventLabel).set('eventValue', _selectedTopics.length))
    if (isNewUser) {
      nextPage()
    } else {
      history.push('/')
    }
  }

  const onStartContentPersonalization = (_selectedTopics, _favoriteTopic) => {
    setSelectedTopics(_selectedTopics)
    setFavoriteTopic(_favoriteTopic)

    prevPage()
  }

  const onSelectedTopicsChange = (_selectedTopics) => {
    setSelectedTopics(_selectedTopics)
  }

  const onContentPersonalizationTopics = () => {
    setContentPersonalizationSection(SECTION_TOPICS)
  }

  const onContentPersonalizationFavorites = () => {
    setContentPersonalizationSection(SECTION_FAVORITES)
  }

  return {
    contentPersonalizationSection,
    currentStep,
    favoriteTopic,
    nextPage,
    onLaunch,
    onSkip,
    onContentPersonalizationFavorites,
    onContentPersonalizationTopics,
    onFinishContentPersonalization,
    onSelectedTopicsChange,
    onStartContentPersonalization,
    prevPage,
    section: sections[currentSectionIndex],
    selectedTopics,
    showSteps,
    totalSteps,
  }
}

export default useOnboarding
