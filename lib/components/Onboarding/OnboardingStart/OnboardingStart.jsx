import React from 'react'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { H1 } from 'components/Heading'
import Button from 'components/Button'
import { List } from 'immutable'
import _includes from 'lodash/includes'
import {
  LAUNCH_PAGE,
  TOPICS_PAGE,
  PRACTICE_PAGE,
  DURATION_PAGE,
  FINAL_PAGE,
  SCREEN_MAP,
  PRACTICES_ARRAY,
  formatPost,
} from 'services/onboarding'
import GaiaLogo, { TYPE_TEAL } from 'components/GaiaLogo/GaiaLogo'
import Loadable from 'react-loadable'
import { ERROR_TYPE_500 } from 'components/ErrorPage/types'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { deactivateSubject } from 'services/testarossa'
import { ACCOUNT_TYPE_FMTV } from 'services/user-account'
import OnboardingTopics from '../OnboardingTopics'
import OnboardingPractice from '../OnboardingPractice'
import OnboardingDuration from '../OnboardingDuration'
import OnboardingFinal from '../OnboardingFinal'

// for progress bar
const SCREENS_OTHER = 2
const SCREENS_YOGA = 4
const SCREENS_FITNESS_MEDITATION = 3

const LoadableErrorPage = Loadable({
  loader: () => import('components/ErrorPage'),
  loading: () => <Sherpa type={TYPE_LARGE} />,
})

class Onboarding extends React.Component {
  constructor () {
    super()
    this.state = {
      topTopic: null,
      selectedTopics: List(),
      page: LAUNCH_PAGE,
      options: List(),
      screenNumber: 0,
      progress: 0.25,
      duration: 0,
      posted: false,
    }
  }

  componentDidMount () {
    const {
      getV5OnboardingData,
      language,
      isFmtv,
      auth,
      history,
    } = this.props
    if (!auth.get('jwt')) {
      history.push('/')
    }
    getV5OnboardingData(language, isFmtv)
    deactivateSubject({ campaign: 'WA-10' })
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  setTopics = (topic) => {
    const { selectedTopics } = this.state
    let newTopics

    if (selectedTopics.includes(topic)) {
      newTopics = selectedTopics.filter(item => item !== topic)
    } else if (selectedTopics.size === 3) {
      return null
    } else {
      newTopics = selectedTopics.push(topic)
    }

    const topicType = newTopics.getIn([0, 'type'])
    let totalScreens = SCREENS_OTHER
    if (topicType === 'yoga') totalScreens = SCREENS_YOGA
    if (topicType === 'fitness' || topicType === 'meditation') totalScreens = SCREENS_FITNESS_MEDITATION

    return this.setState({
      selectedTopics: newTopics,
      topTopic: newTopics.get(0),
      totalScreens,
    })
  }

  setPage = (next) => {
    let { screenNumber } = this.state
    const { totalScreens, progress } = this.state

    screenNumber = next ? screenNumber + 1 : screenNumber - 1
    let newProgress = progress

    if (totalScreens) {
      newProgress = screenNumber / totalScreens
    }
    this.setState({
      screenNumber,
      progress: newProgress,
    })
    window.scroll(0, 0)
  }

  setOptions = (option) => {
    const { options, screenNumber } = this.state

    // filter out duplicates from same screen
    const filterdOptions = options.filter(item => item.get('screenNumber') !== screenNumber)
    const newOption = option.set('screenNumber', screenNumber)
    const newOptions = filterdOptions.push(newOption)

    this.setState({ options: newOptions })
    this.setPage(true)
  }

  setDuration = (duration) => {
    this.setState({ duration })
  }

  postData = () => {
    const { props, state } = this
    const { selectedTopics, options, duration } = state
    const { postV5OnboardingData, auth, isFmtv } = props
    const terms = formatPost(selectedTopics, options, duration)
    postV5OnboardingData({ terms, auth, isFmtv })
  }

  renderLaunch = () => {
    const { copy } = this.props

    if (copy === undefined) {
      return null
    }

    return (
      <React.Fragment>
        <div className="onboarding__launch">
          <div className="onboarding__launch__container">
            <div className="onboarding__gradient-bar" />
            <div className="onboarding__launch-gradient">
              <div className="onboarding__logo-container">
                <GaiaLogo
                  type={TYPE_TEAL}
                  className={['onboarding__logo']}
                />
              </div>
              <div className="onboarding__intro-text-wrapper">
                <H1 className="onboarding__intro-title">
                  { copy.get('introTitle') }
                  <br />{copy.get('introSubtitle')}</H1>
                <p className="onboarding__intro-text">{copy.get('introParagraph1')}</p>
                <p className="onboarding__intro-text">{copy.get('introParagraph2')}</p>
              </div>
              <Button
                buttonClass="onboarding__button"
                text={copy.get('introLetsGo')}
                onClick={() => {
                  this.setPage(true)
                  this.setState({ page: TOPICS_PAGE })
                }}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  renderTopics = () => {
    const {
      props,
      state,
      setTopics,
      setPage,
    } = this
    const { selectedTopics, progress, screenNumber } = state

    return (
      <OnboardingTopics
        setTopics={setTopics}
        setPage={setPage}
        selectedTopics={selectedTopics}
        progress={progress}
        screenNumber={screenNumber}
        copy={props.copy}
        isFmtv={props.isFmtv}
      />
    )
  }

  renderPractice = () => {
    const {
      props,
      state,
      setPage,
      setOptions,
    } = this
    const { topTopic, screenNumber, progress } = state
    return (
      <OnboardingPractice
        setPage={setPage}
        topic={topTopic.get('type')}
        setOptions={setOptions}
        screenNumber={screenNumber}
        progress={progress}
        copy={props.copy}
        isFmtv={props.isFmtv}
      />
    )
  }

  renderDuration = () => {
    return (
      <OnboardingDuration
        setPage={this.setPage}
        progress={this.state.progress}
        screenNumber={this.state.screenNumber}
        setDuration={this.setDuration}
        copy={this.props.copy}
        isFmtv={this.props.isFmtv}
      />
    )
  }

  renderFinal = () => {
    const { props, state, postData } = this
    const { posted, topTopic } = state
    const { getRecommenderStatus, recommenderReady, auth, history } = props

    sessionStorage.setItem('whoiswatching', true)

    const type = topTopic.get('type')
    const isPractice = _includes(PRACTICES_ARRAY, type)

    if (!recommenderReady && !this.interval) {
      this.interval = setInterval(() => {
        getRecommenderStatus(auth)
      }, 1000)
    }
    if (recommenderReady) {
      clearInterval(this.interval)
    }

    if (!posted) {
      postData()
      this.setState(() => ({ posted: true }))
    }

    return (
      <OnboardingFinal
        recommenderReady={recommenderReady}
        history={history}
        copy={props.copy}
        isFmtv={props.isFmtv}
        isPractice={isPractice}
      />
    )
  }

  render () {
    const { state, props } = this
    const { topTopic, screenNumber, page } = state
    const { location } = props
    let nextPage = page

    if (props.error) {
      return <LoadableErrorPage location={location} code={ERROR_TYPE_500} />
    }

    if (topTopic) {
      const type = topTopic.get('type')
      nextPage = SCREEN_MAP[type][screenNumber]
    }

    if (screenNumber === 0) {
      nextPage = LAUNCH_PAGE
    }

    return (
      <div className="onboarding">
        { nextPage === LAUNCH_PAGE ? this.renderLaunch() : null }
        { nextPage === TOPICS_PAGE ? this.renderTopics() : null }
        { nextPage === PRACTICE_PAGE ? this.renderPractice() : null }
        { nextPage === DURATION_PAGE ? this.renderDuration() : null }
        { nextPage === FINAL_PAGE ? this.renderFinal() : null }
      </div>
    )
  }
}

export default compose(
  connectRedux(
    (state) => {
      const recommenderReady = state.onboarding.get('recommenderReady')
      const isFmtv = _includes(state.userProfiles.getIn(['data', 0, 'creation_source']), ACCOUNT_TYPE_FMTV)

      return {
        language: state.user.getIn(['data', 'language', 0]),
        auth: state.auth,
        recommenderReady,
        copy: state.onboarding.getIn(['v5Data', 'screenCopy', 0]),
        error: state.onboarding.get('error'),
        isFmtv,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getV5OnboardingData: actions.onboarding.getV5OnboardingData,
        postV5OnboardingData: actions.onboarding.postV5OnboardingData,
        getRecommenderStatus: actions.onboarding.getRecommenderStatus,
      }
    },
  ),
)(Onboarding)
