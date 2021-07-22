import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { Map } from 'immutable'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { compose } from 'recompose'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_MANUAL,
} from 'components/Page/connect'
import { getBoundActions } from 'actions'
import { historyRedirect } from 'services/navigation'
import ResetPassword from 'components/ResetPassword'

function redirectHome (props) {
  const { auth, history, user = Map() } = props
  // Go to the homepage
  const language = user.getIn(['data', 'language'])
  historyRedirect({ history, url: '/', auth, language })
}


class ResetPage extends PureComponent {
  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }

    const { auth, resetPassword } = nextProps
    const nextAuthToken = auth.get('jwt')
    const previousAuthToken = this.props.auth.get('jwt')
    const resetPasswordSuccess = resetPassword.getIn(['data', 'success'])

    // if the user logs in and has already reset their password, redirect to home
    if (nextAuthToken && nextAuthToken !== previousAuthToken && resetPasswordSuccess) {
      redirectHome(nextProps)
    }
  }

  render () {
    const props = this.props
    const {
      auth,
      serverTime,
      location,
      resetPassword,
      getServerTimeData,
      doResetPassword,
      resetResetPassword,
      setOverlayDialogVisible,
    } = props

    return (
      <div className="reset-wrapper">
        <ResetPassword
          auth={auth}
          uid={_parseInt(_get(location, ['query', 'uid'], -1))}
          serverTime={serverTime}
          expiry={_parseInt(_get(location, ['query', 'expiry'], 0))}
          token={_get(location, ['query', 'token'], '')}
          resetPassword={resetPassword}
          getServerTimeData={getServerTimeData}
          doResetPassword={doResetPassword}
          resetResetPassword={resetResetPassword}
          setOverlayDialogVisible={setOverlayDialogVisible}
        />
      </div>
    )
  }
}

ResetPage.propTypes = {
  history: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  serverTime: ImmutablePropTypes.map.isRequired,
  resetPassword: ImmutablePropTypes.map.isRequired,
  getServerTimeData: PropTypes.func.isRequired,
  doResetPassword: PropTypes.func.isRequired,
  resetResetPassword: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setPageSeo: PropTypes.func.isRequired,
}

ResetPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      page: state.page,
      user: state.user,
      serverTime: state.serverTime,
      resetPassword: state.resetPassword,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getServerTimeData: actions.serverTime.getServerTimeData,
        doResetPassword: actions.resetPassword.doResetPassword,
        resetResetPassword: actions.resetPassword.resetResetPassword,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setPageSeo: actions.page.setPageSeo,
      }
    },
  ),
  connectPage({ seoType: PAGE_SEO_TYPE_MANUAL }),
)(ResetPage)
