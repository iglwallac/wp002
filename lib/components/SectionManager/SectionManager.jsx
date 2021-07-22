import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import {
  TYPE_PLACEMENT,
  TYPE_CONTINUE_WATCHING,
  TYPE_RECOMMENDED_CONTENT,
  TYPE_RECENTLY_ADDED,
  TYPE_PLAYLIST,
  TYPE_FEATURED_VIDEOS,
  TYPE_EXPLORE_BY_TOPIC,
  TYPE_MY_SERIES,
  TYPE_RECOMMENDED_SERIES,
  TYPE_CONTENT_LIST,
  TYPE_SERIES_FOLLOWING,
  // TYPE_RECOMMENDED_PRACTICES,
  // TYPE_PRACTICE_PICKER,
} from 'services/pm-section'
import SectionPlacement from 'components/SectionPlacement'
import SectionContinueWatching from 'components/SectionContinueWatching'
import SectionExploreByTopic from 'components/SectionExploreByTopic'
import SectionPlayList from 'components/SectionPlaylist'
import SectionRecommendedContent from 'components/SectionRecommendedContent'
import SectionRecentlyAdded from 'components/SectionRecentlyAdded'
import SectionMySeries from 'components/SectionMySeries'
import SectionFeaturedVideos from 'components/SectionFeaturedVideos'
import SectionRecommendedSeries from 'components/SectionRecommendedSeries'
import SectionContentList from 'components/SectionContentList'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
// import SectionRecommendedPractices from 'components/SectionRecommendedPractices'

// import SectionPracticePicker from '../SectionPracticePicker'

const RenderSection = (props) => {
  const {
    location,
    language,
    shelfOpened,
    setShelfOpen,
    index,
    history,
    clearOpenShelfIndex,
    type,
    id,
    removeRowHandler,
    removed,
    addBackHandler,
  } = props

  const handleOpenShelf = (openShelf, item) => {
    const contentId = item.get('contentId')
    const contentType = item.get('contentType')
    openShelf(contentId, contentType)
    setShelfOpen()
  }

  if (type === TYPE_PLACEMENT) {
    return (
      <SectionPlacement
        sectionId={id}
        sectionIndex={index}
        location={location}
        language={language}
        history={history}
      />
    )
  }
  if (type === TYPE_CONTINUE_WATCHING) {
    return (
      <SectionContinueWatching
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  // if (type === TYPE_RECOMMENDED_PRACTICES) {
  //   return (
  //     <SectionRecommendedPractices
  //       sectionIndex={index}
  //       sectionId={id}
  //       location={location}
  //       shelfOpened={shelfOpened}
  //       handleOpenShelf={handleOpenShelf}
  //       clearOpenShelfIndex={clearOpenShelfIndex}
  //     />
  //   )
  // }
  if (type === TYPE_RECOMMENDED_CONTENT) {
    return (
      <SectionRecommendedContent
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  if (type === TYPE_CONTENT_LIST) {
    return (
      <SectionContentList
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
        removeRowHandler={removeRowHandler}
        removed={removed}
        addBackHandler={addBackHandler}
      />
    )
  }
  if (type === TYPE_RECENTLY_ADDED) {
    return (
      <SectionRecentlyAdded
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  if (type === TYPE_PLAYLIST) {
    return (
      <SectionPlayList
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  if (type === TYPE_FEATURED_VIDEOS) {
    return (
      <SectionFeaturedVideos
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  if (type === TYPE_EXPLORE_BY_TOPIC) {
    return (
      <SectionExploreByTopic
        sectionId={id}
        sectionIndex={index}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  if (type === TYPE_MY_SERIES) {
    return (
      <SectionMySeries
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  if (type === TYPE_SERIES_FOLLOWING) {
    // this wrapper is only needed for the tooltip impresseions
    return (
      <TestarossaSwitch>
        <TestarossaCase campaign="ME-3043" variation={[1]}>
          {(campaign, variation, subject) => (
            <SectionMySeries
              sectionIndex={index}
              sectionId={id}
              location={location}
              shelfOpened={shelfOpened}
              handleOpenShelf={handleOpenShelf}
              clearOpenShelfIndex={clearOpenShelfIndex}
              subject={subject}
              campaign={campaign}
              variation={variation}
              following
              type={type}
            />
          )}
        </TestarossaCase>
        <TestarossaDefault unwrap>
          {null}
        </TestarossaDefault>
      </TestarossaSwitch>
    )
  }
  if (type === TYPE_RECOMMENDED_SERIES) {
    return (
      <SectionRecommendedSeries
        sectionIndex={index}
        sectionId={id}
        location={location}
        shelfOpened={shelfOpened}
        handleOpenShelf={handleOpenShelf}
        clearOpenShelfIndex={clearOpenShelfIndex}
      />
    )
  }
  // if (type === TYPE_PRACTICE_PICKER) {
  //   return (
  //     <SectionPracticePicker
  //       sectionId={id}
  //       sectionIndex={index}
  //       location={location}
  //     />
  //   )
  // }

  return null
}

export default compose(
  connectRedux(
    (state, props) => {
      const { id } = props
      const section = state.pmSection.getIn([id, 'data'])
      const type = section && section.get('type')
      return {
        type,
      }
    },
  ),
)(RenderSection)
