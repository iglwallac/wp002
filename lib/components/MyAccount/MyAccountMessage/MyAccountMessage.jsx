import PropTypes from 'prop-types'
import React from 'react'
import Link from 'components/Link'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import _isArray from 'lodash/isArray'
import Icon from 'components/Icon'

export const MESSAGE_TYPE_RENEW = 'renew'
export const MESSAGE_TYPE_CHANGE = 'change'
export const MESSAGE_TYPE_REACTIVATE = 'reactivate'
export const MESSAGE_TYPE_ERROR = 'error'
export const MESSAGE_TYPE_UPDATE = 'update'
export const MESSAGE_TYPE_PROMO = 'promo'
export const MESSAGE_TYPE_TRIAL_ENDING = 'trialEnding'
export const MESSAGE_TYPE_TRIAL_UPGRADE = 'trialUpgrade'

function getClassName (classString, type) {
  const className = ['my-account-message']
  const typeClass = `${className}__${classString}--${type}`
  const baseClass = `${className}__${classString}`
  const combinedClass = [typeClass, baseClass]

  if (classString === undefined) {
    return className
  }
  return combinedClass.join(' ')
}


const MyAccountMessage = (props) => {
  const { type, message, message1, message2, url, urlText } = props
  const verifyArray = _isArray(message)

  if (type === MESSAGE_TYPE_REACTIVATE) {
    return (
      <div className={getClassName()}>
        <div className={getClassName('message', type)}>
          <div className={getClassName('body', type)}>
            <div className={getClassName('description1', type)}>
              { verifyArray ? message[0] : null }
            </div>
            <div className={getClassName('description2', type)}>
              { verifyArray ? message[1] : null }
            </div>
          </div>
          <div className={getClassName('link-container', type)}>
            <Link to={url} className={getClassName('link', type)} >{urlText}</Link>
            <Icon
              iconClass={[
                'my-account-message__arrow-right--teal',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  } else if (type === MESSAGE_TYPE_UPDATE) {
    return (
      <div className={getClassName()}>
        <div className={getClassName('message', type)}>
          <div className={getClassName('body', type)}>
            <div className={getClassName('description', type)}>
              <Icon
                iconClass={[
                  'my-account-message__icon-alert',
                ]}
              />
              <p className={getClassName('update-description1', type)}>
                { message1 || null } <br />
              </p>
              <p className={getClassName('update-description2', type)}>
                { message2 || null } <br />
              </p>
            </div>
          </div>
          <div className={getClassName('link-container', type)}>
            <Link to={url} className={getClassName('link', type)}>{ urlText }</Link>
            <Icon
              iconClass={[
                'my-account-message__arrow-right',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  } else if (type === MESSAGE_TYPE_ERROR) {
    return (
      <div className={getClassName()}>
        <div className={getClassName('message', type)}>
          <div className={getClassName('body', type)}>
            <div className={getClassName('error-description1', type)}>
              <Icon
                iconClass={[
                  'my-account-message__icon-alert',
                ]}
              />
              { message1 || null } <br />
            </div>
            <p className={getClassName('error-description2', type)}>
              { message2 || null } <br />
            </p>
          </div>
          <div className={getClassName('link-container', type)}>
            <Link
              to="#payment-info"
              className={getClassName('link', type)}
            >
              { urlText }
            </Link>
            <Icon
              iconClass={[
                'my-account-message__arrow-right',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  } else if (type === MESSAGE_TYPE_CHANGE) {
    return (
      <div className={getClassName()}>
        <div className={getClassName('message', type)}>
          <div className={getClassName('body', type)}>
            <p className={getClassName('change-description1', type)}>
              { message[0] || null } <br />
            </p>
            <p className={getClassName('change-description2', type)}>
              { message[1] || null } <br />
            </p>
          </div>
          <div className={getClassName('link-container', type)}>
            <Link to={url} className={getClassName('link', type)}>{ urlText }</Link>
            <Icon
              iconClass={[
                'my-account-message__arrow-right--teal',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  } else if (type === MESSAGE_TYPE_TRIAL_UPGRADE) {
    return (
      <div className={getClassName()}>
        <div className={getClassName('message', type)}>
          <div className={getClassName('body', type)}>
            <p className={getClassName('trial-description', type)}>
              { message || null } <br />
            </p>
          </div>
          <div className={getClassName('link-container', type)}>
            <Link to={url} className={getClassName('link', type)}>{ urlText }</Link>
            <Icon
              iconClass={[
                'my-account-message__arrow-right--teal',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  } else if (type === MESSAGE_TYPE_TRIAL_ENDING) {
    return (
      <div className={getClassName()}>
        <div className={getClassName('message', type)}>
          <div className={getClassName('body', type)}>
            <p className={getClassName('trial-ending-description', type)}>
              <Icon
                iconClass={[
                  'my-account-message__icon-alert--red',
                ]}
              />
              { message || null } <br />
            </p>
          </div>
          <div className={getClassName('link-container', type)}>
            <Link to={url} className={getClassName('link', type)}>{ urlText }</Link>
            <Icon
              iconClass={[
                'my-account-message__arrow-right--teal',
                'icon--right',
                'icon--action',
              ]}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={getClassName()}>
      <div className={getClassName('message', type)}>
        <div className={getClassName('body', type)}>
          <div className={getClassName('description', type)}>
            { message } <br />
          </div>
        </div>
        <div className={getClassName('link-container', type)}>
          <Link to={url} className={getClassName('link', type)}>{ urlText }</Link>
          <Icon
            iconClass={[
              'my-account-message__arrow-right--teal',
              'icon--right',
              'icon--action',
            ]}
          />
        </div>
      </div>
    </div>
  )
}

MyAccountMessage.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  message1: PropTypes.string,
  message2: PropTypes.string,
  url: PropTypes.string,
  urlText: PropTypes.string,
}

export default compose(
  connectRedux(
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      }
    },
  ),
)(MyAccountMessage)
