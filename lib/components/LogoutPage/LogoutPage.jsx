import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { compose } from 'recompose'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'

class LogoutPage extends PureComponent {
  componentDidMount () {
    this.handleLogout()
  }

  async handleLogout () {
    const { auth, doAuthLogout } = this.props
    await doAuthLogout(auth.get('jwt'))
  }

  render () {
    const { staticText } = this.props
    return (
      <div className="logout">
        <div className="logout__content">
          <Sherpa type={TYPE_SMALL_WHITE} className={['logout__sherpa']} />
          <p className="logout__message">
            {staticText.getIn(['data', 'pleaseWait'])}
          </p>
        </div>
      </div>
    )
  }
}

LogoutPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  doAuthLogout: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

LogoutPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      staticText: state.staticText.getIn(['data', 'logoutPage']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        doAuthLogout: actions.auth.doAuthLogout,
      }
    },
  ),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(LogoutPage)
