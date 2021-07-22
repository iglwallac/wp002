import { Map, List, fromJS } from 'immutable'
import React, { PureComponent } from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import _toLower from 'lodash/toLower'
import Link from 'components/Link'
import Tile from 'components/Tile'
import Jumbotron from 'components/JumbotronSubcategory'
import { getSeo } from 'services/url'
import { Row, VIEWPORT_ELEMENT, ROW_TYPE_TILE } from 'components/Row'
import { Tabs, Tab } from 'components/Tabs'
import { H2, H6 } from 'components/Heading'
import {
  SCREEN_TYPE_YOGA_TEACHERS,
  CONTEXT_TYPE_TEACHER_MODAL,
  createUpstreamContext,
} from 'services/upstream-context'
import teachersJSON from './teachers.json'

function noop () {}

function getTeachers () {
  const { teachers = [] } = teachersJSON
  return fromJS(teachers)
}

function teacherClassName (teacher) {
  const name = teacher.get('name', '')
  return teacher.get('className')
    || _toLower((name || '').split(' ')[0])
}

function addBodyClass (modalIsOpen) {
  const { document = {} } = global
  const { body } = document
  if (body && body.classList) {
    if (modalIsOpen) {
      body.classList.add('modal-is-open')
    } else {
      body.classList.remove('modal-is-open')
    }
  }
}

function renderVideo (video, props) {
  if (video) {
    const { auth } = props
    const upstreamContext = createUpstreamContext({
      screenType: SCREEN_TYPE_YOGA_TEACHERS,
      contextType: CONTEXT_TYPE_TEACHER_MODAL,
      video,
    })
    const id = video.get('id')
    if (id && id > 0) {
      return (
        <Tile
          key={video.get('nid')}
          tileClass="tile--row-item"
          auth={auth}
          tileData={video}
          showMoreInfo={false}
          upstreamContext={upstreamContext}
          single
        />
      )
    }
  }
  return (
    <div className="tile-placeholder">
      <div className="tile-placeholder__hero" />
      <div className="tile-placeholder__text" />
      <div className="tile-placeholder__text" />
    </div>
  )
}

function updateSeo (props) {
  // @TODO replace with connectedPage HOC
  const { auth, location, page, setPageSeo } = props
  const path = location.pathname + String(location.search)
  if (page.get('path') === path) {
    return
  }
  const seo = getSeo({
    pathname: location.pathname,
    loggedIn: !!auth.get('jwt'),
  })
  setPageSeo({
    title: seo.title,
    description: seo.description,
    noFollow: seo.noFollow,
    noIndex: seo.noIndex,
    location,
  })
}

// function renderTrailer (mediaId) {
//   if (mediaId) {
//     return (
//       <div className="yt__trailer">
//         <AnonymousPlayer experimentId={79} mediaId={mediaId} />
//       </div>
//     )
//   }
//   return null
// }

class YogaTeachersPage extends PureComponent {
  //
  constructor (props) {
    super(props)
    this.state = {
      filter: '',
      modalIsOpen: false,
      modalTeacherIndex: null,
    }
  }

  componentDidMount () {
    const { state, props } = this
    const { modalIsOpen } = state
    addBodyClass(modalIsOpen)
    updateSeo(props)
  }

  componentDidUpdate () {
    const { state } = this
    const { modalIsOpen } = state
    addBodyClass(modalIsOpen)
  }

  componentWillUnmount () {
    const { props } = this
    const { clearNodes } = props
    clearNodes({ view: 'yt' })
    addBodyClass(false)
  }

  getVideos (index) {
    const { props } = this
    const { getNodes, videos } = props
    const teachers = getTeachers()
    const teacher = teachers.get(index, Map())
    const key = teacher.get('name', '')
    const nids = teacher.get('videos', List())
    const teacherVideos = videos.get(key, null)
    if (teacherVideos === null && nids && nids.size) {
      getNodes({
        view: 'yt',
        ids: nids.toJS(),
        asTile: true,
        key,
      })
    }
  }

  closeModal = (e) => {
    e.preventDefault()
    this.setState(() => ({
      modalIsOpen: false,
      modalTeacherIndex: null,
    }))
  }

  handlePracticesEntityClick = () => {
    this.setState({
      filter: '',
    })
  }

  depropigate = (e) => {
    e.stopPropagation()
  }

  viewTeacher = (index, element, e) => {
    e.preventDefault()
    const teachers = getTeachers()
    const teacher = teachers.get(index)
    if (teacher) {
      this.getVideos(index)
      this.setState({
        modalIsOpen: true,
        modalTeacherIndex: index,
      })
    }
  }

  renderModalVideos (teacher) {
    const { props } = this
    const {
      auth,
      videos,
    } = props
    const url = teacher.get('url', '')
    const name = teacher.get('name', '')
    const yogaTeacherVideos = videos.get('yt', Map())
    const vids = yogaTeacherVideos.get(name, List())
    return (
      <div className="yt__modal-videos">
        <Row
          type={ROW_TYPE_TILE}
          viewport={VIEWPORT_ELEMENT}
          items={vids}
          auth={auth}
        >{renderVideo}
        </Row>
        <div className="yt__modal-videos-more">
          <Link
            className="button button--primary"
            to={url}
          >
            See More
          </Link>
        </div>
      </div>
    )
  }

  renderModal () {
    const { state, closeModal, depropigate } = this
    const { modalIsOpen, modalTeacherIndex } = state
    const teachers = getTeachers()

    if (modalIsOpen && modalTeacherIndex !== null) {
      const teacher = teachers.get(modalTeacherIndex, Map())
      const bio = { __html: teacher.get('bio', '') }
      const name = teacher.get('name', '')
      const styles = teacher.get('styles', List())
      const className = teacherClassName(teacher)
      // const trailer = teacher.get('bio_video', null)
      /* eslint-disable react/no-danger */
      return (
        <div className="yt__modal" onClick={closeModal}>
          <div role="dialog" aria-modal="true" aria-labelledby="yt__modal-title">
            <div className="yt__modal-inner" onClick={depropigate}>
              <div className="yt__modal-header">
                <H2 id="yt__modal-title" className="yt__modal-title">{name}</H2>
                <ul className="yt__modal-styles">
                  {styles.map((style) => {
                    return (<li key={style}>{style}</li>)
                  }).toJS()}
                </ul>
                <div className={`yt__avatar-img yt__avatar-img--${className}`} />
              </div>
              <Tabs>
                <Tab label="Top Videos">
                  {this.renderModalVideos(teacher)}
                </Tab>
                <Tab label={`About ${name}`}>
                  <p className="yt__modal-bio" dangerouslySetInnerHTML={bio} />
                </Tab>
              </Tabs>
              <Link onClick={closeModal} className="yt__modal-close" to="">
                <span>Close</span>
              </Link>
            </div>
          </div>
        </div>
      )
    }
    /* eslint-enable react/no-danger */
    return null
  }

  renderTeachers () {
    const teachers = getTeachers()
    const { state, viewTeacher } = this
    const { filter = '' } = state
    return (
      <ul className="yt__list">
        {teachers.map((teacher, index) => {
          const styles = teacher.get('styles', List()).toJS()
          if (!filter || styles.indexOf(filter) > -1) {
            const name = teacher.get('name', '')
            const className = teacherClassName(teacher)
            return (
              <li key={name} className="yt__item">
                <Link className="yt__avatar" onClick={e => viewTeacher(index, 'teacher-avatar', e)} to="">
                  <span className="yt__avatar-inner" />
                  <span className={`yt__avatar-img yt__avatar-img--${className}`} />
                </Link>
                <H6>
                  <Link onClick={e => viewTeacher(index, 'teacher-name', e)} to="">
                    {name}
                  </Link>
                </H6>
                <span className="yt__description">{styles.join(', ')}</span>
              </li>
            )
          }
          return null
        }).toJS()}
      </ul>
    )
  }

  render () {
    const { handlePracticesEntityClick, props } = this
    const { auth } = props
    return (
      <div className="yt">
        <Jumbotron
          auth={auth}
          description=""
          title="Yoga Teachers"
          setOverlayDialogVisible={noop}
          staticText={Map()}
          heroImage={Map()}
        />
        {this.renderTeachers()}
        {this.renderModal()}
        <div className="yt__footer">
          <p>Discover more Gaia Teachers on the All Practices page</p>
          <Link
            className="button button--primary"
            to="/yoga/practices"
            onClick={handlePracticesEntityClick}
          >
            View All Practices
          </Link>
        </div>
      </div>
    )
  }
}

export default connectRedux(
  (state) => {
    return {
      user: state.user,
      auth: state.auth,
      page: state.page,
      videos: state.node,
      app: state.app,
    }
  },
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getNodes: actions.node.getNodes,
      clearNodes: actions.node.clearNodes,
      setPageSeo: actions.page.setPageSeo,
      clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
    }
  },
)(YogaTeachersPage)
