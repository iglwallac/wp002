import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ReactAvatarEditor from 'react-avatar-editor'
import ImageCompression from 'browser-image-compression'
import Dropzone from 'react-dropzone'
import Icon from 'components/Icon'
import Button from 'components/Button'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { H2 } from 'components/Heading'

const AVATAR_IMAGE_SIZE = 28

class AvatarUpload extends Component {
  state = {
    image: null,
    allowZoomOut: false,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
    borderRadius: 100,
    preview: null,
    resizeError: null,
  }

  componentWillReceiveProps (nextProps) {
    const { user, setOverlayDialogVisible } = nextProps
    const previousProfileImagesSuccess = this.props.user.getIn(['userProfileImages', 'success'])
    const nextProfileImagesSuccess = user.getIn(['userProfileImages', 'success'])
    // Automatically close the dialog when the image is saved successfully
    if (nextProfileImagesSuccess !== previousProfileImagesSuccess) {
      setOverlayDialogVisible(null, false)
    }
  }

  componentWillUnmount () {
    const { clearUserProfileData } = this.props
    clearUserProfileData()
  }

  onClickUploadError = () => {
    this.setState({ uploadError: false })
  }

  onClickClose = (e) => {
    const { setOverlayDialogVisible } = this.props
    e.preventDefault()
    setOverlayDialogVisible(null, false)
  }

  onClickChooseFile = (e) => {
    e.preventDefault()
    if (this.fileUpload) {
      this.fileUpload.click()
    }
  }

  setEditorRef = (editor) => {
    if (editor) {
      this.editor = editor
    }
  }

  setChooseFileRef = (fileUpload) => {
    if (fileUpload) {
      this.fileUpload = fileUpload
    }
  }

  handleSave = async () => {
    try {
      if (!this.editor) {
        return
      }
      const { updateUserProfileImages, auth } = this.props
      const profile = this.editor.getImageScaledToCanvas().toDataURL()
      const rect = this.editor.getCroppingRect()
      // get the cropped/sized version of the image
      const formattedProfileImage = await ImageCompression.getFilefromDataUrl(profile)
      const avatarImage =
        await ImageCompression(formattedProfileImage, {
          maxWidthOrHeight: AVATAR_IMAGE_SIZE,
        })
      const fileReader = new FileReader()
      fileReader.onload = (fileEvent) => {
        const avatar = fileEvent.target.result
        // send images to the api
        updateUserProfileImages({ profile, avatar, auth })
      }
      fileReader.readAsDataURL(avatarImage)
      // This is where we can pass the data for the image
      this.setState({
        preview: {
          img: profile,
          rect,
          scale: this.state.scale,
          width: this.state.width,
          height: this.state.height,
          borderRadius: this.state.borderRadius,
        },
      })
    } catch (e) {
      this.setState({ resizeError: e })
    }
  }

  handleNewImage = (e) => {
    const FileSize = e.target.files[0].size / 1024 / 1024 // in MB
    if (FileSize > 2) {
      this.setState({ uploadError: true })
    } else {
      this.setState({ image: e.target.files[0] })
    }
  }

  handlePositionChange = (position) => {
    this.setState({ position })
  }

  handleDrop = (acceptedFiles) => {
    const FileSize = acceptedFiles[0].size / 1024 / 1024 // in MB
    if (FileSize > 2) {
      this.setState({ uploadError: true })
    } else {
      this.setState({ image: acceptedFiles[0] })
    }
  }

  handleScale = (e) => {
    const scale = parseFloat(e.target.value)
    this.setState({ scale })
  }

  logCallback = () => {
    return null
  }

  render () {
    const { staticText, user } = this.props
    const { resizeError } = this.state
    const processing = user.get('userProfileImagesProcessing')

    if (this.state.uploadError) {
      return (
        <div className="avatar-upload__error-container">
          <p>{staticText.getIn(['data', 'sorry'])}</p>
          <p>{staticText.getIn(['data', 'pleaseTryAgain'])}</p>
          <Button
            text={staticText.getIn(['data', 'tryAgain'])}
            onClick={() => this.onClickUploadError()}
            buttonClass={['button--primary button--primary-hover avatar-upload__button-try']}
          />
        </div>
      )
    }

    return (
      <div className="avatar-upload">
        {
          processing ?
            <div className="avatar-upload__processing">
              <Sherpa className={['avatar-upload__sherpa']} type={TYPE_SMALL_BLUE} />
              <div className="avatar-upload__processing-text">
                {`${staticText.getIn(['data', 'savingImage'])}...`}
              </div>
            </div>
            : null
        }
        <H2 className="avatar-upload__title" fixed>{staticText.getIn(['data', 'position'])}</H2>
        {
          resizeError ?
            <div className="avatar-upload__error">
              {staticText.getIn(['data', 'resizeError'])}
            </div>
            : null
        }
        <Dropzone
          onDrop={this.handleDrop}
          disableClick
          multiple={false}
          style={{ width: this.state.width, height: this.state.height, marginBottom: '15px' }}
        >
          <div className="avatar-upload__editor">
            <ReactAvatarEditor
              ref={this.setEditorRef}
              scale={parseFloat(this.state.scale)}
              width={this.state.width}
              height={this.state.height}
              position={this.state.position}
              onPositionChange={this.handlePositionChange}
              rotate={parseFloat(this.state.rotate)}
              borderRadius={this.state.borderRadius}
              /* eslint-disable react/jsx-no-bind */
              onLoadFailure={this.logCallback.bind(this, 'onLoadFailed')}
              onLoadSuccess={this.logCallback.bind(this, 'onLoadSuccess')}
              onImageReady={this.logCallback.bind(this, 'onImageReady')}
              onImageLoad={this.logCallback.bind(this, 'onImageLoad')}
              image={this.state.image}
              /* eslint-enable react/jsx-no-bind */
            />
          </div>
        </Dropzone>
        <Button
          buttonClass={['button avatar-upload__inputFile-button button--primary', 'button--stacked']}
          text={staticText.getIn(['data', 'choose'])}
          onClick={e => this.onClickChooseFile(e)}
          scrollToTop={false}
        />
        <p className="avatar-upload__inputFile-sub-label">{staticText.getIn(['data', 'maxSize'])}</p>
        <input
          className="avatar-upload__inputFile"
          name="newImage"
          type="file"
          id="newImage"
          accept="image/*"
          onChange={this.handleNewImage}
          ref={this.setChooseFileRef}
        />
        <div className="avatar-upload__zoom-container">
          <Icon iconClass={['icon--subtract', 'avatar-upload__icon']} />
          <span>
            <input
              name="scale"
              type="range"
              onChange={this.handleScale}
              min={this.state.allowZoomOut ? '0.1' : '1'}
              max="2"
              step="0.01"
              defaultValue="1"
            />
          </span>
          <Icon iconClass={['icon--add', 'avatar-upload__icon', 'avatar-upload__icon--add']} />
        </div>
        {this.state.image && (
          <div className="avatar-upload__buttons-container">
            <Button
              text="cancel"
              onClick={e => this.onClickClose(e)}
              buttonClass={['button--secondary avatar-upload__button-save', 'button--stacked']}
            />
            <Button
              buttonClass={['button--primary avatar-upload__button-save', 'button--stacked']}
              onClick={this.handleSave}
              text={staticText.getIn(['data', 'save'])}
            />
          </div>
        )}
      </div>
    )
  }
}

AvatarUpload.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  updateUserProfileImages: PropTypes.func.isRequired,
  clearUserProfileData: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        updateUserProfileImages: actions.user.updateUserProfileImages,
        clearUserProfileData: actions.user.clearUserProfileData,
      }
    },
  ),
  connectStaticText({ storeKey: 'avatarUpload' }),
)(AvatarUpload)
