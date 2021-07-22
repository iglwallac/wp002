import React from 'react'
import _get from 'lodash/get'
import Tile from 'components/Tile'
import Link from 'components/Link'
import toLower from 'lodash/toLower'
import compose from 'recompose/compose'
import kebabCase from 'lodash/kebabCase'
import { getBoundActions } from 'actions'
import { Map, List, fromJS } from 'immutable'
import { getPrimary } from 'services/languages'
import EmailCapture from 'components/EmailCapture'
import { H3, H4 } from 'components/Heading'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import { connect as connectRedux } from 'react-redux'
import { historyRedirect } from 'services/navigation'
import PlanGridV2 from 'components/PlanGrid.v2/PlanGridV2'
import PlanPriceExplained from 'components/PlanPriceExplained'
import Row, { STYLES } from 'components/Row.v2'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import Jumbotron from 'components/JumbotronSubcategory'
import {
  createUpstreamContext,
  SCREEN_TYPE_YOGA_HOME,
} from 'services/upstream-context'
import {
  YOGA_HOME_TEACHER_CLICKED,
  YOGA_HOME_PILL_CLICKED,
  YOGA_HOME_LINK_CLICKED,
  YOGA_HOME_ARTICLE_CLICKED,
} from 'services/event-tracking'
import articlesJSON from './articles.json'

const upstreamContext = createUpstreamContext({
  screenType: SCREEN_TYPE_YOGA_HOME,
  contextType: SCREEN_TYPE_YOGA_HOME,
})

function noop () {}

const CONTENT_LIST_DISPLAY_MODE_LEGACY1 = {
  teaser: true,
  heroLabel: true,
  hideArrows: true,
  maxItemsInView: 4,
  playlistButton: true,
}

const CONTENT_LIST_DISPLAY_MODE_LEGACY2 = {
  teaser: true,
  hideArrows: true,
  maxItemsInView: 4,
  playlistButton: true,
}

const CONTENT_LIST_DISPLAY_MODE_LEGACY3 = {
  moreInfo: true,
}

const CONTENT_LIST_DISPLAY_MODE_LEGACY4 = {
}

const CONTENT_LIST_DISPLAY_MODE_LEGACY5 = {
  playlistButton: true,
}

const CONTENT_LIST_DEFAULT_DISPLAY_MODE = CONTENT_LIST_DISPLAY_MODE_LEGACY5

function getRenderRowOptions (displayMode) {
  switch (displayMode) {
    case 'legacy-row1':
      return CONTENT_LIST_DISPLAY_MODE_LEGACY1
    case 'legacy-row2':
      return CONTENT_LIST_DISPLAY_MODE_LEGACY2
    case 'legacy-row3':
      return CONTENT_LIST_DISPLAY_MODE_LEGACY3
    case 'legacy-row4':
      return CONTENT_LIST_DISPLAY_MODE_LEGACY4
    case 'legacy-row5':
      return CONTENT_LIST_DISPLAY_MODE_LEGACY5
    default:
      return CONTENT_LIST_DEFAULT_DISPLAY_MODE
  }
}

function onClickMoreInfo (options) {
  historyRedirect(options)
}

function getArticleData () {
  return fromJS(articlesJSON)
}

function legacyRenderEmailCapture (props, testClass) {
  const { emailSignup, doEmailSignup } = props
  return (
    <div className="yoga-home__email-signup-form">
      <EmailCapture
        formName="MY_RI-95_WebApp_My_Yoga_Home_Testarossa_Campaign"
        success={emailSignup.get('success')}
        siteSegment={Map()}
        className={['footer-email-capture__email-capture', testClass]}
        onFormSubmit={doEmailSignup}
      />
    </div>
  )
}

class YogaHome extends React.PureComponent {
  //
  constructor (props) {
    super(props)
    const { user } = props
    const language = user.getIn(['data', 'language', 0], 'en')
    props.getPmScreen('yoga-home', language)
    this.state = {
      activeTabs: Map(),
    }
  }

  componentDidMount () {
    const { props } = this
    const { setUpstreamContext } = props
    setUpstreamContext(upstreamContext)
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { user } = props
    const { user: prevUser } = prevProps
    const nextLanguage = user.getIn(['data', 'language', 0], 'en')
    const prevLanguage = prevUser.getIn(['data', 'language', 0], 'en')

    if (prevLanguage !== nextLanguage) {
      props.getPmScreen('yoga-home', nextLanguage)
    }
  }

  // eslint-disable-next-line no-unused-vars
  setYogaHomeEvent = (data) => {
    // save for GA events
  }

  legacyRenderArticle = (articleKey) => {
    const articleData = getArticleData()
    const articles = articleData.get('articles')
    const article = articles.find(a => a.get('id') === articleKey)
    const data = {
      eventName: YOGA_HOME_ARTICLE_CLICKED,
      attributes: {
        title: article.get('title'),
        itemIndex: article.get('index'),
      },
    }

    if (article) {
      const id = article.get('id', '')
      const className = toLower(id)
      return (
        <div key={name} className="yoga-home__article">
          <Link
            className={`yoga-home__article-img yoga-home__article-img--${className}`}
            to={article.get('url', '')}
            onClick={() => this.setYogaHomeEvent(data)}
          />
          <Link className="yoga-home__article-desc" to={article.get('url', '')} onClick={() => this.setYogaHomeEvent(data)}>
            {article.get('title')}
          </Link>
        </div>
      )
    }
    return null
  }

  signUpButton = (auth) => {
    if (auth.get('jwt')) {
      return null
    }
    const { props } = this
    const { staticText } = props
    const text = staticText.getIn(['data', 'signUpToStartPracticing'])
    const buttonClassName = [
      'yoga-home__btn-signup-btn',
      'button--primary',
      'button--small',
      'button--last',
    ]
    return (
      <div className="yoga-home__btn-signup">
        <ButtonSignUp
          text={text}
          buttonClass={buttonClassName}
          type={BUTTON_SIGN_UP_TYPE_BUTTON}
          scrollToTop
        />
      </div>
    )
  }

  emailSignup = () => {
    const { props } = this
    const { auth, staticText } = props
    if (auth.get('jwt')) {
      return null
    }
    return (
      <div className="yoga-home__email-signup">
        <div className="yoga-home__email-signup-title">
          {staticText.getIn(['data', 'signUpForFreeVideos'])}
        </div>
        {legacyRenderEmailCapture(props)}
      </div>
    )
  }

  pricePlanExplained = (auth, plans) => {
    if (auth.get('jwt')) {
      return null
    }
    return plans && plans.getIn(['data', 'plans'])
      ? <PlanPriceExplained planData={plans} />
      : null
  }

  checkoutPicker = (auth, props) => {
    const { history } = props

    if (auth.get('jwt')) {
      return null
    }

    return (
      <div className="yoga-home__checkout-picker">
        <PlanGridV2 history={history} />
      </div>
    )
  }

  changeTab = (e, sectionId, index, listId, label, adminTitle, headerLabel) => {
    e.preventDefault()
    const data = {
      eventName: YOGA_HOME_PILL_CLICKED,
      attributes: {
        sectionId,
        listId,
        index,
        label,
        adminTitle,
        headerLabel,
      },
    }

    this.setYogaHomeEvent(data)
    this.setState(() => {
      const activeTabs = this.state.activeTabs
      return {
        activeTabs: activeTabs.set(sectionId, index),
      }
    })
  }

  pillTabs = (section = Map(), activeTabIndex, headerLabel) => {
    const { changeTab, props } = this
    const { pmList } = props
    const sectionId = section.get('id')
    const sectionContent = section.getIn(['data', 'content'], List())
    const adminTitle = section.get('adminTitle')
    return sectionContent.size > 1
      ? (
        <ul className="yoga-home__pilltabs">
          {sectionContent.map((tab, index) => {
            const listId = tab.get('listId')
            const label = tab.get('label')
            // Don't render tab if list data is missing
            if (!pmList.hasIn([listId, 'data'])) {
              return null
            }
            const activeClass = activeTabIndex === index ? ' active' : ''
            return (
              <li key={`pilltab-${kebabCase(label)}`}>
                <button
                  onClick={e => changeTab(
                    e,
                    sectionId,
                    index,
                    listId,
                    label,
                    adminTitle,
                    headerLabel,
                  )}
                  className={`yoga-home__pilltab-btn${activeClass}`}
                  label={`View videos related to ${label}`}
                >
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null
  }

  legacyRenderLink = (auth, options) => {
    const {
      text,
      url,
      anon,
      member,
      classes = List(),
    } = options

    const baseClass = 'yoga-home__view-more-link'
    const className = classes.size ? classes.push(baseClass).join(' ') : baseClass
    const link = <div className="yoga-home__link-wrapper"><Link className={className} to={url}>{text}</Link></div>

    if (auth.get('jwt') && member) {
      return link
    }

    if (anon) {
      return link
    }

    return null
  }


  renderSimpleLink = (options) => {
    const {
      text,
      url,
      classes = List(),
      id,
      adminTitle,
    } = options

    const data = {
      eventName: YOGA_HOME_LINK_CLICKED,
      attributes: {
        sectionId: id,
        text,
        adminTitle,
        headerLabel: text,
      },
    }

    const baseClass = 'yoga-home__view-more-link'
    const className = classes.size ? classes.push(baseClass).join(' ') : baseClass
    return (
      <div className="yoga-home__link-wrapper">
        <Link
          className={className}
          to={url}
          onClick={() => this.setYogaHomeEvent(data)}
        >
          {text}
        </Link>
      </div>
    )
  }

  renderButtonLink = (options) => {
    const {
      text,
      classes = List(),
    } = options
    const buttonClassName = [
      'yoga-home__button-link-button',
      'button--primary',
      'button--small',
      'button--last',
    ]
    if (classes.size) {
      buttonClassName.push(...classes)
    }
    return (
      <div className="yoga-home__button-link">
        <ButtonSignUp
          text={text}
          buttonClass={buttonClassName}
          type={BUTTON_SIGN_UP_TYPE_BUTTON}
          scrollToTop
        />
      </div>
    )
  }

  renderHeaderSection = (section) => {
    const { props } = this
    const { auth } = props
    const imageUrl = section.getIn(['data', 'imageUrl'])

    return (
      <Jumbotron
        auth={auth}
        description={section.getIn(['data', 'description'], '')}
        title={section.getIn(['data', 'title'], '')}
        setOverlayDialogVisible={noop}
        staticText={Map()}
        heroImage={Map({
          large: imageUrl,
          medium: imageUrl,
          mediumSmall: imageUrl,
          small: imageUrl,
        })}
      />
    )
  }

  renderLinkSection = (section) => {
    const {
      renderSimpleLink,
      renderButtonLink,
    } = this
    const linkText = section.getIn(['data', 'linkText'])
    const linkUrl = section.getIn(['data', 'linkUrl'])
    const displayMode = section.getIn(['data', 'displayMode'])
    const adminTitle = section.get('adminTitle')
    const id = section.get('id')
    if (!linkText || !linkUrl) {
      return null
    }

    if (displayMode === 'button') {
      return renderButtonLink({ text: linkText, url: linkUrl, id })
    }

    return renderSimpleLink({ text: linkText, url: linkUrl, id, adminTitle })
  }

  renderContentList = (section) => {
    const { props, state, renderRow, renderTile, pillTabs } = this
    const { pmList } = props
    const sectionId = section.get('id')
    const activeTabs = _get(state, 'activeTabs', Map())
    const activeTabIndex = activeTabs.get(sectionId, 0)
    const headerLabel = section.getIn(['data', 'header', 'label'], '')
    // const footerLabel = section.getIn(['data', 'footer', 'label'], '')
    const listId = section.getIn(['data', 'content', activeTabIndex, 'listId'])
    const listLabel = section.getIn(['data', 'content', activeTabIndex, 'label'])
    const adminTitle = section.get('adminTitle')
    const contentList = pmList.getIn([listId, 'data'], Map())
    let listItems = contentList.get('listItems', List())
    listItems = listItems.map((item, index) => {
      return item.set('index', index)
        .set('sectionId', sectionId)
        .set('listId', listId)
        .set('listLabel', listLabel)
        .set('adminTitle', adminTitle)
        .set('headerLabel', headerLabel)
    })
    const displayMode = section.getIn(['data', 'displayMode'])
    const renderRowOptions = getRenderRowOptions(displayMode)
    const classNames = ['yoga-home__content-list', 'yoga-home__row--overstretch']
    if (displayMode) {
      classNames.push(`yoga-home__content-list-${displayMode}`)
    }
    return (
      <div className="yoga-home__wrapper">
        <div className={classNames.join(' ')}>
          <H4 className="yoga-home__section-title">
            <span>
              {headerLabel}
            </span>
          </H4>
          {pillTabs(section, activeTabIndex, headerLabel)}
          {renderRow(listItems, renderTile, renderRowOptions)}
          {/* TODO: render footer link from section footer data
          renderSimpleLink({
            text: footerLabel,
            url: '/yoga/practices',
            anon: false,
            member: true,
          })
          */}
        </div>
      </div>
    )
  }

  renderPeopleList = (section) => {
    const { props, state, renderRow, renderTeacher, pillTabs } = this
    const { pmList } = props
    const sectionId = section.get('id')
    const activeTabs = _get(state, 'activeTabs', Map())
    const activeTabIndex = activeTabs.get(sectionId, 0)
    const headerLabel = section.getIn(['data', 'header', 'label'], '')
    // const footerLabel = section.getIn(['data', 'footer', 'label'], '')
    const listId = section.getIn(['data', 'content', activeTabIndex, 'listId'])
    const contentList = pmList.getIn([listId, 'data'], Map())
    const displayMode = section.getIn(['data', 'displayMode'])
    const renderRowOptions = getRenderRowOptions(displayMode)
    const adminTitle = section.get('adminTitle')
    let listItems = contentList.get('listItems', List())
    listItems = listItems.map((item, index) => {
      return item
        .set('index', index)
        .set('sectionId', sectionId)
        .set('listId', listId)
        .set('adminTitle', adminTitle)
        .set('headerLabel', headerLabel)
    })

    const classNames = ['yoga-home__people-list', 'yoga-home__row--overstretch']
    if (displayMode) {
      classNames.push(`yoga-home__people-list-${displayMode}`)
    }

    return (
      <div className="yoga-home__wrapper">
        <div className={classNames.join(' ')}>
          <H4 className="yoga-home__section-title">
            <span>{headerLabel}</span>
          </H4>
          {pillTabs(section, activeTabIndex, headerLabel)}
          { renderRow(listItems, renderTeacher, renderRowOptions) }
          {/* TODO: render footer link from section footer data
          renderSimpleLink({
            text: footerLabel,
            url: '/yoga/teachers',
            anon: false,
            member: true,
          })
          //TODO: add tracking event for footer
          */}
        </div>
      </div>
    )
  }

  renderTile = (item = Map(), renderOptions) => {
    const { props } = this
    const {
      series = Map(),
      videos = Map(),
      auth,
      user,
      history,
    } = props

    const userLanguage = getPrimary(user.getIn(['data', 'language'], 'en'))
    const {
      playlistButton = false,
      heroLabel = false,
      teaser = false,
    } = renderOptions

    let node = Map()
    const itemId = item ? item.get('id') : null
    let itemIndex
    let listId
    let listLabel
    let sectionId
    let headerLabel
    if (itemId && itemId > 0) {
      itemIndex = item.get('index')
      listId = item.get('listId')
      listLabel = item.get('listLabel')
      sectionId = item.get('sectionId')
      headerLabel = item.get('headerLabel')
      if (item.get('type') === 'video') {
        node = videos.getIn([Number(itemId), userLanguage, 'data'], Map())
      }
      if (item.get('type') === 'series') {
        node = series.getIn([Number(itemId), userLanguage, 'data'], Map())
      }
    }

    if (node && node.get('id') > 0) {
      const url = node.get('url')
      const tileData = node.setIn(['reason', 'source'], SCREEN_TYPE_YOGA_HOME)
        .setIn(['reason', 'sectionId'], sectionId)
        .setIn(['reason', 'listId'], listId)
        .setIn(['reason', 'listLabel'], listLabel)
        .setIn(['reason', 'itemIndex'], itemIndex)
        .setIn(['reason', 'headerLabel'], headerLabel)
      return (
        <Tile
          heroLabel={heroLabel ? node.get('heroLabel') : null}
          onClickMoreInfo={() => onClickMoreInfo({ url, history, auth, userLanguage })}
          addToPlaylist={playlistButton}
          tileClass="tile--row-item"
          showMoreInfo={false}
          key={itemId}
          showTeaser={teaser}
          tileData={tileData}
          auth={auth}
          upstreamContext={upstreamContext}
          single
        />
      )
    }

    return (
      <div className="tile-placeholder">
        <div className="tile-placeholder__hero" />
        <div className="tile-placeholder__text" />
        <div className="tile-placeholder__text" />
      </div>
    )
  }

  renderTeacher = (teacher = Map(), renderOptions) => {
    const { setYogaHomeEvent } = this
    if (!teacher) {
      return null
    }
    const { someOption } = renderOptions
    const name = teacher.get('name', '')
    const imageUrl = teacher.get('imageUrl')
    const linkUrl = teacher.get('linkUrl')
    const stylesText = teacher.get('description')
    const index = teacher.get('index')
    const sectionId = teacher.get('sectionId')
    const listId = teacher.get('listId')
    const adminTitle = teacher.get('adminTitle')
    const headerLabel = teacher.get('headerLabel')
    const data = {
      eventName: YOGA_HOME_TEACHER_CLICKED,
      attributes: {
        sectionId,
        listId,
        index,
        adminTitle,
        teacherName: name,
        headerLabel,
      },
    }

    const classNames = ['yoga-home__teacher']
    if (someOption) {
      classNames.push(`yoga-home__teacher-${someOption}`)
    }
    return (
      <div key={name} className={classNames.join(' ')}>
        <Link
          className="yoga-home__teacher__avatar"
          to={linkUrl}
          onClick={() => setYogaHomeEvent(data)}
        >
          <span className="yoga-home__teacher__avatar-inner" />
          <div>
            <img
              className="yoga-home__teacher__avatar-img"
              alt="Teacher"
              src={imageUrl}
            /></div>
        </Link>
        <H3>
          <Link to={linkUrl} onClick={() => setYogaHomeEvent(data)}>
            {name}
          </Link>
        </H3>
        <H4>{stylesText}</H4>
      </div>
    )
  }

  renderRow = (items = List(), renderer, options = {}) => {
    const { props, setYogaHomeEvent } = this
    const { auth } = props
    const handleRowEvent = (eventName) => {
      const sectionId = items.getIn([0, 'sectionId'])
      const listId = items.getIn([0, 'listId'])
      const adminTitle = items.getIn([0, 'adminTitle'])
      const data = {
        eventName,
        attributes: {
          sectionId,
          listId,
          adminTitle,
        },
      }

      setYogaHomeEvent(data)
    }

    return (
      <Row
        items={items}
        auth={auth}
        setRowEvent={handleRowEvent}
        createAccessor={() => null}
        style={STYLES.S12234}
        disableHover
      >{item => renderer(item, options)}
      </Row>
    )
  }

  renderLegacyRow = (items = List(), renderer, options = {}) => {
    const { props } = this
    const { auth } = props
    return (
      <Row
        items={items}
        auth={auth}
        createAccessor={() => null}
        style={STYLES.S12234}
        disableHover
      >{item => renderer(item, options, props)}
      </Row>
    )
  }

  renderLegacyArticlesRow = () => {
    const { props, renderLegacyRow, legacyRenderLink } = this
    const { auth, user } = props
    const userLanguage = getPrimary(user.getIn(['data', 'language'], 'en'))
    const articleData = getArticleData()
    const articleKeys = articleData.get('articleKeys', List())

    if (userLanguage !== 'en') {
      return null
    }

    return (
      <div className="yoga-home__wrapper">
        <div className="yoga-home__articles yoga-home__row--overstretch">
          <H4 className="yoga-home__section-title">
            <span>
              {articleData.get('rowTitle', '')}
            </span>
          </H4>
          {renderLegacyRow(articleKeys, this.legacyRenderArticle, {
            maxItemsInView: 4,
          })}
          {legacyRenderLink(auth, {
            text: 'See More Yoga Poses',
            url: 'https://www.gaia.com/articles/yoga-poses',
            anon: true,
            member: true,
            classes: List(['yoga-home__view-more-link__articles']),
          })}
        </div>
      </div>
    )
  }

  renderPlanSelection = () => {
    const {
      props,
      checkoutPicker,
      pricePlanExplained,
    } = this
    const { auth, plans } = props

    return (
      <div>
        {pricePlanExplained(auth, plans)}
        {checkoutPicker(auth, props)}
      </div>
    )
  }

  renderSection = (sectionId) => {
    const {
      props,
      renderHeaderSection,
      renderContentList,
      renderPeopleList,
      renderLinkSection,
      emailSignup,
      renderLegacyArticlesRow,
      renderPlanSelection,
    } = this
    const { pmSection } = props
    const section = pmSection.getIn([sectionId, 'data'], Map())
    const type = section.get('type')

    if (type === 'header') {
      return renderHeaderSection(section)
    }

    if (type === 'content-list') {
      return renderContentList(section)
    }

    if (type === 'people-list') {
      return renderPeopleList(section)
    }

    if (type === 'link') {
      return renderLinkSection(section)
    }

    if (type === 'email-signup') {
      return emailSignup()
    }

    if (type === 'article-list') {
      return renderLegacyArticlesRow()
    }

    if (type === 'plan-selection') {
      return renderPlanSelection()
    }

    return null
  }

  renderSections = (sectionIds) => {
    const { renderSection } = this
    return sectionIds.map((sectionId) => {
      const rendered = renderSection(sectionId)

      if (!rendered) {
        return null
      }

      return (
        <div key={sectionId}>{rendered}</div>
      )
    })
  }

  render () {
    const {
      props,
      renderSections,
    } = this
    const { pmScreen, user } = props
    const userLanguage = getPrimary(user.getIn(['data', 'language'], 'en'))
    const sectionIds = pmScreen.getIn(['yoga-home', userLanguage, 'data', 'sectionIds'], List())
    return (
      <div className="yoga-home">
        {
          renderSections(sectionIds)
        }
      </div>
    )
  }
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
      plans: state.plans,
      pmScreen: state.pmScreen,
      pmSection: state.pmSection,
      pmList: state.pmList,
      series: state.series,
      videos: state.videos,
      emailSignup: state.emailSignup,
      upstreamContext: state.upstreamContext.get('data', Map()),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        doEmailSignup: actions.emailSignup.doEmailSignup,
        getPmScreen: actions.pmScreen.getPmScreen,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
      }
    },
  ),
  connectStaticText({ storeKey: 'yogaHomePage' }),
)(YogaHome)
