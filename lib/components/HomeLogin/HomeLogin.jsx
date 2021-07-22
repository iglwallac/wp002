import PropTypes from 'prop-types'
import React from 'react'
import { partial as _partial } from 'lodash'
import Button from 'components/Button'
import { TYPE_LOGIN } from 'services/dialog'

function onClickLogin (e, setOverlayDialogVisible, dialogName) {
  e.preventDefault()
  setOverlayDialogVisible(dialogName)
}

function HomeLogin (props) {
  return (
    <div className="home-login">
      <div className="home-login__logo" />
      <div className="home-login__title">Gaia is Transforming</div>
      <div className="home-login__sep" />
      <div className="home-login__description">
        <p className="home-login__description-item">
          The new Gaia.com features lightning fast video delivery, personalized
          recommendations and improved navigation. Additional improvements to
          the site will roll out continuously over the next months.
        </p>
        <p className="home-login__description-item">
          As you explore the new site, please share your thoughts using the
          feedback widget at the bottom of the screen or email us at
          betafeedback@gaia.com. For more information visit our{' '}
          <a href="http://www.gaia.com/contact#gaia-beta">FAQs</a>. We look
          forward to evolving together.
        </p>
        <p className="home-login__description-item">
          Log in below to experience the new Gaia.com.
        </p>
      </div>
      <div className="home-login__cta">
        <Button
          buttonClass={[
            'button--primary',
            'button--stacked',
            'home-login__login-btn',
          ]}
          text={'Log In'}
          onClick={_partial(
            onClickLogin,
            _partial.placeholder,
            props.setOverlayDialogVisible,
            TYPE_LOGIN,
          )}
        />
      </div>
    </div>
  )
}

HomeLogin.propTypes = {
  setOverlayDialogVisible: PropTypes.func.isRequired,
}

export default HomeLogin
