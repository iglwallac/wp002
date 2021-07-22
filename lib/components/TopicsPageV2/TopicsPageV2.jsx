import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Jumbotron from 'components/JumbotronSubcategory'
import { connect as connectPage } from 'components/Page/connect'
import { getBoundActions } from 'actions'
import { Map, List } from 'immutable'
import Link from 'components/Link'
import {
  SCREEN_TYPE_CENTERS,
} from 'services/upstream-context'
import { H3 } from 'components/Heading'

function noop () { }

const eventData = Map({
  event: 'customEvent',
  eventName: 'Topic Clicked',
  eventCategory: 'topics',
  eventAction: 'Click',
})

const Topic = (props) => {
  const { termData } = props
  const name = termData.get('name')
  const path = termData.get('path')
  const tid = termData.get('tid')
  const trackingData = eventData
    .set('eventLabel', name)
    .set('tid', tid)
  if (!path) return null
  return (
    <li key={name}>
      <Link
        to={path}
        className="topcics-v2__topic"
        eventData={trackingData}
      >
        {name}
      </Link>
    </li>
  )
}

const TopicHOC = compose(
  connectRedux(
    (state, ownProps) => {
      const { contentId } = ownProps
      const language = state.user.getIn(['data', 'language', 0], 'en')
      return {
        termData: state.term.getIn([contentId, language, 'data']) || Map(),
      }
    },
  ),
)(Topic)

const TopicsSection = (props) => {
  const { sectionStore, sectionId } = props
  const data = sectionStore.getIn([sectionId, 'data', 'data', 'tabs', 0])
  if (data) {
    const label = data.get('tabLabel')
    const tabContent = data.get('tabContent')
    return (
      <div className="topics-v2__category-wrapper">
        <H3 className="topics-v2__category">
          {label}
        </H3>
        <ul className="topics-v2__category-container">
          {tabContent.map(content => (<TopicHOC contentId={content.get('contentId')} key={content.get('contentId')} />))}
        </ul>
      </div>
    )
  }
  return null
}

const TopicsPageV2 = (props) => {
  const { staticText, auth, sectionIds, sectionStore, getPmScreen, language } = props
  useEffect(() => {
    getPmScreen(SCREEN_TYPE_CENTERS, language)
  }, [language])

  return (
    <div className="topics-v2">
      <Jumbotron
        auth={auth}
        description={staticText.getIn(['data', 'subTitle'])}
        title={staticText.getIn(['data', 'topics'])}
        setOverlayDialogVisible={noop}
        staticText={Map()}
        heroImage={Map()}
      />
      <div className="topics-v2__wrapper">
        {sectionIds.map(sectionId => (
          <TopicsSection sectionId={sectionId} sectionStore={sectionStore} key={sectionId} />
        ))}
      </div>
    </div>
  )
}

TopicsPageV2.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

TopicsPageV2.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectPage({ storeBranch: 'topics' }),
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const screenStore = state.pmScreen.getIn([SCREEN_TYPE_CENTERS, language]) || Map()
      const sectionIds = screenStore.getIn(['data', 'sectionIds']) || List()
      return {
        staticText: state.staticText,
        sectionStore: state.pmSection,
        language,
        sectionIds,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getPmScreen: actions.pmScreen.getPmScreen,
      }
    },
  ),
  connectStaticText({ storeKey: 'topics' }),
)(TopicsPageV2)

