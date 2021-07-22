import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_MANUAL,
} from 'components/Page/connect'
import Loading, { LOADING_ICON_BLUE_DARK_BG_WHITE } from 'components/Loading'
import { connect as staticTextConnect } from 'components/StaticText/connect'
import {
  ERROR_TYPE_404,
  ERROR_TYPE_403,
  ERROR_TYPE_503,
  ERROR_TYPE_500,
} from './types'

function updateSeo (props) {
  const { code, location, page, staticText, setPageSeo } = props
  const path = `${location.pathname}${location.search} `
  if (page.get('path') === path) {
    return
  }
  setPageSeo({
    title: getSeoTitle(staticText, code),
    description: '',
    noFollow: false,
    noIndex: true,
    location,
  })
}

function getSeoTitle (staticText, code) {
  switch (code) {
    case ERROR_TYPE_404:
      return staticText.getIn(['data', 'notFound'])
    case ERROR_TYPE_403:
      return staticText.getIn(['data', 'permissionDenied'])
    case ERROR_TYPE_503:
      return staticText.getIn(['data', 'gatewayError'])
    case ERROR_TYPE_500:
      return staticText.getIn(['data', 'serverError'])
    default:
      return staticText.getIn(['data', 'error'])
  }
}

function getMessageByCode (staticText, code) {
  switch (code) {
    case ERROR_TYPE_404:
      return staticText.getIn(['data', '404error'])
    case ERROR_TYPE_403:
      return staticText.getIn(['data', '403error'])
    case ERROR_TYPE_503:
      return staticText.getIn(['data', '503error'])
    case ERROR_TYPE_500:
      return staticText.getIn(['data', '500error'])
    default:
      return staticText.getIn(['data', 'defaultError'])
  }
}

class ErrorPage extends PureComponent {
  componentDidMount () {
    updateSeo(this.props)
  }

  render () {
    const { code, staticText } = this.props
    return (
      <article className="error-page">
        <div className="error-page__content">
          <div className="error-page__background-text">{code}</div>
          <div className="error-page__message">
            <div className="error-page__message__loading">
              <Loading visible icon={LOADING_ICON_BLUE_DARK_BG_WHITE} />
            </div>
            <p className="error-page__message__text">
              {getMessageByCode(staticText, code)}
            </p>
          </div>
          <div className="error-page__labyrinth" />
        </div>
      </article>
    )
  }
}

ErrorPage.propTypes = {
  location: PropTypes.object.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  setPageSeo: PropTypes.func.isRequired,
  code: PropTypes.number.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

ErrorPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      page: state.page,
      resolver: state.resolver,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
      }
    },
  ),
  staticTextConnect({ storeKey: 'errorPage' }),
  connectPage({ seoType: PAGE_SEO_TYPE_MANUAL }),
)(ErrorPage)
