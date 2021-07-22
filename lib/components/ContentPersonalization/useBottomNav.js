import { useState, useMemo } from 'react'

export const SECTION_FAVORITES = 'favorites'
export const SECTION_TOPICS = 'topics'

export default function useBottomNav (
  selectedTopics = [],
  favoriteTopic = null,
  onTopics,
  onFavorites,
  onStart,
  onFinish,
  finishCTA,
  nextCTA,
) {
  const sections = useMemo(() => [SECTION_TOPICS, SECTION_FAVORITES], [])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  const displayCta = useMemo(() => {
    const currentSection = sections[currentSectionIndex]
    if (currentSection === SECTION_TOPICS) {
      if (selectedTopics.length > 1) return nextCTA
      if (selectedTopics.length === 1) return finishCTA
    }
    if (currentSection === SECTION_FAVORITES && favoriteTopic !== null) return finishCTA
    return false
  }, [selectedTopics, favoriteTopic, currentSectionIndex])

  const showInfoLabel = useMemo(() => {
    return sections[currentSectionIndex] === SECTION_TOPICS && selectedTopics.length === 1
  }, [selectedTopics, currentSectionIndex])

  const finalFavoriteTopic = useMemo(() => {
    return selectedTopics.length === 1 ? selectedTopics[0] : favoriteTopic
  }, [selectedTopics, favoriteTopic])

  const handleForwardNavigation = () => {
    const nextSection = currentSectionIndex + 1
    if (nextSection > sections.length - 1 || selectedTopics.length === 1) {
      onFinish(selectedTopics, finalFavoriteTopic)
    } else {
      setCurrentSectionIndex(nextSection)
      const currentSection = sections[nextSection]
      callSectionHandler(currentSection)
    }
  }

  const handleBackwardNavigation = () => {
    const nextSection = currentSectionIndex - 1
    if (nextSection < 0) {
      onStart(selectedTopics, finalFavoriteTopic)
    } else {
      setCurrentSectionIndex(nextSection)
      const currentSection = sections[nextSection]
      callSectionHandler(currentSection)
    }
  }

  const callSectionHandler = (currentSection) => {
    if (currentSection === SECTION_TOPICS) onTopics()
    else if (currentSection === SECTION_FAVORITES) onFavorites()
  }

  return {
    section: sections[currentSectionIndex],
    handleForwardNavigation,
    handleBackwardNavigation,
    displayCta,
    showInfoLabel,
  }
}
