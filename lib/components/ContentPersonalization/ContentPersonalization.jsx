/* eslint-disable no-nested-ternary */
import React from 'react'

import { ICON_TYPES } from 'components/Icon.v2'

import TopicTile from './TopicTile'
import TopicTileGrid from './TopicTileGrid'

import useContentPersonalization from './useContentPersonalization'
import useBottomNav, { SECTION_TOPICS, SECTION_FAVORITES } from './useBottomNav'

export default function ContentPersonalization ({
  topics,
  initialSelectedTopics = [],
  initialFavoriteTopic = null,
  nav: BottomNav,
  onStart,
  onFinish,
  onTopics = () => {},
  onFavorites = () => {},
  onSelectedTopicsChange = () => {},
  finishCTA,
  nextCTA,
  backText,
  selectMoreText,
  alphabetizeTopics = false,
}) {
  const {
    toggleTopic,
    isTopicSelected,
    selectedTopics,
    toggleFavorite,
    isFavoriteSelected,
    favoriteTopic,
  } = useContentPersonalization(
    topics,
    initialSelectedTopics,
    initialFavoriteTopic,
    alphabetizeTopics,
    onSelectedTopicsChange,
  )

  const {
    section,
    displayCta,
    handleForwardNavigation,
    handleBackwardNavigation,
    showInfoLabel,
  } = useBottomNav(
    selectedTopics,
    favoriteTopic,
    onTopics,
    onFavorites,
    onStart,
    onFinish,
    finishCTA,
    nextCTA,
  )

  return (
    <div className="content-personalization">
      {section === SECTION_TOPICS ? (
        <TopicTileGrid>
          {topics.map(topic => (
            <TopicTile
              key={topic.tid}
              id={topic.tid}
              title={topic.title}
              iconKey={topic.iconKey}
              description={topic.description}
              checkbox={TopicTile.CheckboxCheckMark}
              selected={isTopicSelected(topic.tid)}
              onClick={toggleTopic}
            />
          ))}
        </TopicTileGrid>
      ) : section === SECTION_FAVORITES ? (
        <TopicTileGrid>
          {selectedTopics.map(topic => (
            <TopicTile
              key={topic.tid}
              id={topic.tid}
              title={topic.title}
              iconKey={topic.iconKey}
              description={topic.description}
              checkbox={TopicTile.CheckboxHeart}
              selected={isFavoriteSelected(topic.tid)}
              highlighted
              onClick={toggleFavorite}
            />
          ))}
        </TopicTileGrid>
      ) : null}

      <BottomNav
        ctaLabel={displayCta}
        showInfoLabel={showInfoLabel}
        ctaIconType={ICON_TYPES.CHEVRON_RIGHT}
        onPrev={handleBackwardNavigation}
        onNext={handleForwardNavigation}
        backText={backText}
        selectMoreText={selectMoreText}
      />
    </div>
  )
}
