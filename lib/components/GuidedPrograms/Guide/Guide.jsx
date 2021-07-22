import React from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { List, Map } from 'immutable'
import compose from 'recompose/compose'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import UserAvatar from 'components/UserAvatar'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { get as getConfig } from 'config'
import HeroImage from 'components/HeroImage'
import EmailCapture from 'components/EmailCapture'
import Link, { TARGET_BLANK } from 'components/Link'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import CommentsLoader from 'components/CommentsLoader'
import { H3, H2, HEADING_TYPES } from 'components/Heading'
import _isNil from 'lodash/isNil'
import { createUpstreamContext, SCREEN_TYPE_GUIDES, CONTEXT_TYPE_GUIDES } from 'services/upstream-context'
import GuideDays from './GuideDays'
import Accordion from './Accordion'

const config = getConfig()
const GUIDE_CONST = 'guide'

const getNumberedDaysCount = (guideDaysList, guideDays) => {
  return guideDaysList.map(e => e.get('contentId'))
    .map(contentId => guideDays.get(contentId))
    .filter(e => e && e.get('dayNumber'))
    .size
}

const getNumberedDaysVideosCount = (guideDaysList, guideDays) => {
  return guideDaysList.map(e => e.get('contentId'))
    .map(contentId => guideDays.get(contentId))
    .filter(e => e && e.get('dayNumber'))
    .reduce((accumulator, guideDay) => {
      return guideDay.get('guideDayVideos').size + accumulator
    }, 0)
}

class Guide extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { features } = config
    const {
      getGuide,
      history,
      guideId,
      language,
      isGuide,
    } = this.props

    if (!features.guidesEnabled) {
      history.push('/')
    }

    if (isGuide) {
      getGuide(guideId, language, true)
    }
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const {
      comments,
      guide,
      guideId,
      getGuide,
      jwt,
      language,
      refreshComments,
      setCommentsVisible,
      isGuide,
      getPmList,
    } = props

    const {
      language: prevLanguage,
      isGuide: prevIsGuide,
      guide: prevGuide,
    } = prevProps

    if ((prevLanguage !== language || prevIsGuide !== isGuide) && isGuide) {
      getGuide(guideId, language, true)
    }

    if (prevGuide !== guide) {
      refreshComments({
        contentId: guideId,
        commentsId: comments.getIn(['data', 'id']),
        metadata: guide.toJS(),
        jwt,
      })
      setCommentsVisible(true)
    }

    if (!_isNil(guide.get('peopleListId')) && guide.get('peopleListId') !== prevGuide.get('peopleListId')) {
      getPmList(guide.get('peopleListId'))
    }
  }

  componentWillUnmount () {
    this.props.setCommentsVisible(false)
  }

  onClickMaterialsDownload = ({ title, assetId }) => {
    const { props } = this
    const {
      app,
      page,
      auth,
      location,
      setEventDownloadClicked,
    } = props
    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_GUIDES,
      contextType: CONTEXT_TYPE_GUIDES,
      title,
      assetId,
    })
    setEventDownloadClicked({
      app,
      page,
      auth,
      location,
      upstreamContext,
    })
    return false
  }

  renderBanner = () => {
    const { props } = this
    const { heroImage } = props

    return (
      <div className="guide__hero-banner-container">
        { heroImage &&
          <HeroImage
            className={['guide__background-hero']}
            hasOverlay={false}
            smallUrl={heroImage.get('hero_320x200')}
            mediumSmallUrl={heroImage.get('hero_570x200')}
            mediumUrl={heroImage.get('hero_820x400')}
            largeUrl={heroImage.get('hero_1070x400')}
          />
        }
      </div>
    )
  }

  renderComments = () => {
    const { staticText } = this.props
    return (
      <div className="guide__section--inner">
        <Accordion label={
          <H2 className="guide__section-title">{staticText.getIn(['data', 'comments'])}</H2>
        }
        >
          <CommentsLoader />
        </Accordion>
      </div>
    )
  }

  renderDetails = () => {
    const {
      staticText,
    } = this.props
    return (
      <div className="guide__section">
        <div className="guide__section--inner">
          <Accordion label={
            <H2 className="guide__section-title guide__course-details">{staticText.getIn(['data', 'courseDetails'])}</H2>
          }
          >
            <GuideDays staticText={staticText} />
          </Accordion>
        </div>
      </div>
    )
  }

  renderMaterials = (materials) => {
    return (materials ?
      <div className="guide__materials-container">
        {materials.map((item) => {
          return (item ?
            <div className="guide__materials-item" key={item.get('originalFileName')} >
              <Icon type={ICON_TYPES.PDF} />
              <span className="guide__materials-item__title">
                {item.get('originalFileName').split('.')[0]}
              </span>
              <Link
                className="embed-pdf__link"
                to={item.get('url')}
                target={TARGET_BLANK}
                onClick={() => {
                  this.onClickMaterialsDownload({
                    title: item.get('originalFileName').split('.')[0],
                    assetId: item.get('uuid'),
                  })
                }}
              >
                <Icon type={ICON_TYPES.DOWNLOAD} />
              </Link>
            </div>
            : null
          )
        })}
      </div>
      :
      null
    )
  }

  renderSignup = () => {
    const { emailSignup, doEmailSignup, siteSegment } = this.props
    return (
      <div className="guide__email-signup">
        <EmailCapture
          formName="guide__email-signup-form"
          success={emailSignup.get('success')}
          siteSegment={siteSegment}
          className={['footer-email-capture__email-capture', 'guide__email-signup']}
          onFormSubmit={doEmailSignup}
          withTitle
          backgroundGradient
        />
      </div>
    )
  }

  renderOverView = () => {
    const {
      assets,
      guideDescription,
      directionsLabel,
      directionsDescription,
      assetsLabel,
      assetsDescription,
      staticText,
      guideMaterials,
      language,
    } = this.props


    const materials = guideMaterials && guideMaterials.map((id) => {
      return assets.getIn([id, language, 'data'])
    })

    return (
      <div className="guide__header-container">
        <div className="guide__section guide__overview-section">
          <div className="guide__section--inner guide__overview-section-inner">
            <Accordion
              label={
                <H3 className="guide__section-title guide__overview-title">{staticText.getIn(['data', 'overview'])}</H3>
              }
              initiallyExpanded
            >
              <p className="guide__description guide__overview-text">{guideDescription}</p>
            </Accordion>
          </div>
        </div>
        <div className="guide__header-inner--right">
          <div className="guide__section guide__how-to-section">
            <div className="guide__section--inner guide__how-to-section-inner">
              <Accordion label={
                <H3 as={HEADING_TYPES.H5} className="guide__section-title">
                  {directionsLabel}
                </H3>
              }
              >
                <p className="guide__description">{directionsDescription}</p>
              </Accordion>
            </div>
          </div>
          <div className="guide__section">
            <div className="guide__section--inner guide__materials">
              <Accordion label={
                <H3 as={HEADING_TYPES.H5} className="guide__section-title">
                  {assetsLabel}
                </H3>
              }
              >
                <p className="guide__description">{assetsDescription}</p>
                {this.renderMaterials(materials)}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderTitleSection = () => {
    const {
      guideTitle,
      displayType,
      staticText,
      guideDaysList,
      guideDaysData,
      language,
    } = this.props

    const guideDays = guideDaysData.map(e => e.getIn([language, 'data']))
    const videoCount = getNumberedDaysVideosCount(guideDaysList, guideDays)
    const dayCount = getNumberedDaysCount(guideDaysList, guideDays)

    return (
      <div className="guide__section--inner">
        <H3 as={HEADING_TYPES.H4} className="guide__label">{staticText.getIn(['data', 'guidedProgram'])}</H3>
        <H2 className="guide__title">{guideTitle}</H2>
        <div className="guide__count-container">
          <p className="guide__day-count">{dayCount} {staticText.getIn(['data', `${displayType}-plural`])}</p>
          <p className="guide__video-count">{videoCount} {staticText.getIn(['data', 'videos'])}</p>
        </div>
      </div>
    )
  }

  renderPlanGrid = () => {
    const { jwt, staticText, history } = this.props

    if (jwt) return null
    return (
      <div className="guide__section">
        <div className="guide__section--inner">
          <Accordion label={
            <H3 className="guide__section-title">
              {staticText.getIn(['data', 'becomeAMember'])}
            </H3>
          }
          >
            <PlanGridV2 history={history} />
          </Accordion>
        </div>
      </div>
    )
  }

  renderTeachers = () => {
    const {
      staticText,
      guideTeachers,
    } = this.props
    return (guideTeachers ?
      <div className="guide__section">
        <div className="guide__section--inner">
          <Accordion label={
            <H2 className="guide__section-title guide__teachers-title">
              {staticText.getIn(['data', 'meetYourTeachers'])}
            </H2>
          }
          >
            {
              guideTeachers.map((teacher) => {
                return (
                  <div className="guide__teacher" key={teacher.get('name')}>
                    <UserAvatar
                      path={teacher.get('imageUrl')}
                    />
                    <p className="guide__teacher-name">{teacher.get('name')}</p>
                    <p className="guide__teacher-description">{teacher.get('description')}</p>
                  </div>
                )
              })
            }
          </Accordion>
        </div>
      </div>
      :
      null)
  }

  render () {
    return (
      <div className="guide">
        { this.renderBanner() }
        { this.renderTitleSection() }
        { this.renderOverView() }
        { this.renderDetails() }
        { this.renderTeachers() }
        { this.renderSignup() }
        { this.renderComments() }
        { this.renderPlanGrid() }
      </div>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'guidesPage' }),
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const jwt = state.auth.get('jwt')
      const guideId = state.resolver.getIn(['data', 'id'])
      const isGuide = state.resolver.getIn(['data', 'content_type']) === GUIDE_CONST
      const guide = state.guides.getIn([guideId, language, 'data'], Map())
      const guideMaterials = guide.get('guideMaterials')
      const guideDaysList = state.guides.getIn([guideId, language, 'data', 'guideDays'], List([]))
      const peopleListId = guide.get('peopleListId')
      return {
        language,
        jwt,
        isGuide,
        guideMaterials,
        guideId,
        guide,
        assets: state.assets,
        emailSignup: state.emailSignup,
        guideDescription: state.guides.getIn([guideId, language, 'data', 'fields', 'body', 0, 'value'], ''),
        guideTeachers: peopleListId && state.pmList.getIn([peopleListId, 'data', 'listItems']),
        guideDaysList,
        guideDaysData: state.guideDays,
        guideTitle: state.guides.getIn([guideId, language, 'data', 'title'], ''),
        siteSegment: state.guides.getIn([guideId, language, 'data', 'siteSegment'], Map()),
        comments: state.comments,
        displayType: state.guides.getIn([guideId, language, 'data', 'display_type'], ''),
        directionsLabel: guide.get('directionsLabel', ''),
        directionsDescription: guide.get('directionsDescription', ''),
        assetsLabel: guide.get('assetsLabel', ''),
        assetsDescription: guide.get('assetsDescription', ''),
        heroImage: guide.get('hero_image'),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getGuide: actions.guides.getGuide,
        doEmailSignup: actions.emailSignup.doEmailSignup,
        setCommentsVisible: actions.comments.setCommentsVisible,
        refreshComments: actions.comments.refreshComments,
        getPmList: actions.pmList.getPmList,
      }
    },
  ),
)(Guide)
