import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { get as getConfig } from 'config'
import { get as _get } from 'lodash'
import { List } from 'immutable'
import Button from 'components/Button'
import { TARGET_BLANK } from 'components/Link'
import { ROLE_EDITOR } from 'services/auth-access'

export const BUTTON_ADMIN_ALIGN_RIGHT_BOTTOM = 'right-bottom'

function getCmsPath (cmsUrl, id) {
  return `${cmsUrl}node/${id}/edit`
}

function getNewCmsPath (cmsUrl, contentId, contentType) {
  return `${cmsUrl}content?contentId=${contentId}&contentType=${contentType}&redirectToDetail`
}

function hasEditorRole (auth) {
  const roles = auth.get('roles', List())

  return roles.includes(ROLE_EDITOR)
}

function getButtonClass ({ align }) {
  const alignClass = `button-admin--${align}`
  return ['button-admin', alignClass]
}

function ButtonAdmin (props) {
  const { auth, id, type } = props
  if (!hasEditorRole(auth)) {
    return null
  }

  const config = getConfig()
  const adminAppCMSEnabled = _get(config, ['features', 'adminAppCMSEnabled'])
  const cmsUrl = adminAppCMSEnabled ? _get(config, 'adminAppUrl', '') : _get(config, 'adminCmsUrl', '')
  const url = adminAppCMSEnabled ? getNewCmsPath(cmsUrl, id, type) : getCmsPath(cmsUrl, id)
  const buttonClass = getButtonClass(props)

  return (
    <Button
      url={url}
      target={TARGET_BLANK}
      text=""
      iconClass={['icon--edit', 'icon--small']}
      buttonClass={buttonClass}
    />
  )
}

ButtonAdmin.propTypes = {
  align: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
}

export default ButtonAdmin
