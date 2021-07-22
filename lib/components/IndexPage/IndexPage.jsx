import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_MANUAL,
} from 'components/Page/connect'
import { getBoundActions } from 'actions'
import { getSeo } from 'services/url'
import MemberHomeV2 from 'components/MemberHome.v2'
import Home from 'components/Home'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'

function updateSeo (props) {
  // @TODO replace with connectedPage HOC
  const { page, auth, location, setPageSeo } = props
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

class IndexPage extends Component {
  componentDidMount () {
    updateSeo(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const { auth } = this.props
    const { auth: nextAuth } = nextProps
    if (process.env.BROWSER && !auth.equals(nextAuth)) {
      updateSeo(nextProps)
    }
  }

  render () {
    const props = this.props
    const { auth, location, history } = props

    if (auth.get('jwt')) {
      return (
        <TestarossaSwitch>
          <TestarossaCase campaign="ME-3043" variation={[1]} unwrap>
            {(campaign, variation, subject) => (
              <MemberHomeV2
                location={props.location}
                history={props.history}
                subject={subject}
                campaign={campaign}
                variation={variation}
              />
            )}
          </TestarossaCase>
          <TestarossaDefault unwrap>
            <MemberHomeV2
              location={props.location}
              history={props.history}
            />
          </TestarossaDefault>
        </TestarossaSwitch>
      )
    }
    return <Home history={history} location={location} />
  }
}

IndexPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  setPageSeo: PropTypes.func.isRequired,
}

IndexPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      page: state.page,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
      }
    },
  ),
  connectPage({ seoType: PAGE_SEO_TYPE_MANUAL }),
)(IndexPage)
