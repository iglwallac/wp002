import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { getPrimary } from 'services/languages'
import { DE, FR } from 'services/languages/constants'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import Button from 'components/Button'
import AvatarUpload from 'components/AvatarUpload'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { H2 } from 'components/Heading'
import { List } from 'immutable'

const DELETE_STATE = 'delete'
const DEFAULT_STATE = 'default'
const UPLOAD_STATE = 'update '

function getAvatarStyle (image) {
  const style = {}
  if (image) {
    style.backgroundImage = `url(${image})`
  }
  return style
}

function getBtnContainerCls (primaryLang) {
  const cls = ['dialog-update-profile-image__button-container']
  if (primaryLang === FR || primaryLang === DE) {
    cls.push('dialog-update-profile-image__button-container--lang')
  }
  return cls.join(' ')
}

const renderDefault = (props, onClickUpload, onClickDelete) => {
  const { staticText, user } = props
  const avatarImage = user.getIn(['data', 'profile', 'picture', 'hdtv_190x266'])
  const primaryLang = getPrimary(user.getIn(['data', 'language'], List()))
  return (
    <div className="dialog-update-profile-image">
      <H2 className="dialog-update-profile-image__title" fixed>{staticText.getIn(['data', 'title'])}</H2>
      <div className="dialog-update-profile-image__avatar" style={getAvatarStyle(avatarImage)} />
      <div className={getBtnContainerCls(primaryLang)}>
        <Button
          onClick={avatarImage ? onClickDelete : null}
          text={staticText.getIn(['data', 'delete'])}
          buttonClass={['dialog-update-profile-image__button button--secondary', 'button--stacked']}
        />
        <Button
          onClick={onClickUpload}
          text={staticText.getIn(['data', 'upload'])}
          buttonClass={['dialog-update-profile-image__button button--primary', 'button--stacked']}
        />
      </div>
    </div>
  )
}

const renderDelete = (props, onClickDefault) => {
  const { staticText, auth, user, deleteUserProfileImages } = props
  const processing = user.get('userProfileImagesProcessing')
  const primaryLang = getPrimary(user.getIn(['data', 'language'], List()))

  return (
    <div className="dialog-update-profile-image">
      {
        processing ?
          <div className="dialog-update-profile-image__processing">
            <Sherpa className={['dialog-update-profile-image__sherpa']} type={TYPE_SMALL_BLUE} />
            <div className="dialog-update-profile-image__processing-text">
              {`${staticText.getIn(['data', 'deletingImage'])}...`}
            </div>
          </div>
          : null
      }
      <H2 className="dialog-update-profile-image__title dialog-update-profile-image__title--delete" fixed>
        {staticText.getIn(['data', 'sure'])}
      </H2>
      <div className={getBtnContainerCls(primaryLang)}>
        <Button
          text={staticText.getIn(['data', 'delete'])}
          buttonClass={['dialog-update-profile-image__button button--secondary', 'button--stacked']}
          onClick={() => deleteUserProfileImages({ auth })}
        />
        <Button
          onClick={onClickDefault}
          text={staticText.getIn(['data', 'cancel'])}
          buttonClass={['dialog-update-profile-image__button button--primary', 'button--stacked']}
        />
      </div>
    </div>
  )
}

const renderUpload = () => {
  return (
    <div className="dialog-update-profile-image">
      <AvatarUpload />
    </div>
  )
}

class DialogUpdateProfileImage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      show: DEFAULT_STATE,
    }
  }

  componentWillReceiveProps (nextProps) {
    const { user, setOverlayDialogVisible } = nextProps
    const previousProfileImagesDeleteSuccess =
      this.props.user.getIn(['deleteUserProfileImages', 'success'])
    const nextProfileImagesDeleteSuccess =
      user.getIn(['deleteUserProfileImages', 'success'])
      // Automatically close the dialog when the image is saved successfully
    if (nextProfileImagesDeleteSuccess !== previousProfileImagesDeleteSuccess) {
      setOverlayDialogVisible(null, false)
    }
  }

  componentWillUnmount () {
    const { clearUserProfileData } = this.props
    clearUserProfileData()
  }

  onClickDefault = () => {
    this.setState(() => ({ show: DEFAULT_STATE }))
  }

  onClickUpload = () => {
    this.setState(() => ({ show: UPLOAD_STATE }))
  }

  onClickDelete = () => {
    this.setState(() => ({ show: DELETE_STATE }))
  }

  render () {
    const { props } = this
    if (this.state.show === DEFAULT_STATE) {
      return renderDefault(props, this.onClickUpload, this.onClickDelete)
    } else if (this.state.show === UPLOAD_STATE) {
      return renderUpload(props)
    } else if (this.state.show === DELETE_STATE) {
      return renderDelete(props, this.onClickDefault)
    }
    return null
  }
}

DialogUpdateProfileImage.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  deleteUserProfileImages: PropTypes.func.isRequired,
  clearUserProfileData: PropTypes.func.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'dialogUpdateProfileImage' }),
  connectRedux(
    state => ({
      user: state.user,
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        deleteUserProfileImages: actions.user.deleteUserProfileImages,
        clearUserProfileData: actions.user.clearUserProfileData,
      }
    },
  ),
)(DialogUpdateProfileImage)
