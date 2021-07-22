import { CommentBox, FileUpload, FILE_TYPES } from 'components/FormInput.v2'
import { Button, SIZES, TYPES as BUTTON_TYPES } from 'components/Button.v2'
import * as selectors from 'services/community/selectors'
import { connect as connectRedux } from 'react-redux'
import { ICON_TYPES } from 'components/Icon.v2'
import { If } from 'components/Conditionals'
import UniqueId from 'components/UniqueId'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import FormsyForm from 'formsy-react'
import toLower from 'lodash/toLower'
import PropTypes from 'prop-types'
import { List } from 'immutable'
import React from 'react'

import OpenGraph from '../OpenGraph'
import Thumbnail from '../Thumbnail'
import Avatar from '../Avatar'


export const TYPES = {
  COMMENT: 'COMMENT',
  POST: 'POST',
}

function getButtonText (type) {
  return type === TYPES.POST ? 'Post' : 'Reply'
}
class CommunityForm extends React.Component {
  //
  constructor (props) {
    super(props)
    this.FILE_TYPES = [
      FILE_TYPES.JPEG,
      FILE_TYPES.JPG,
      FILE_TYPES.PNG,
    ]
    this.state = {
      valid: false,
    }
  }

  componentWillUnmount () {
    const { props } = this
    const { uniqueId, deleteDraft } = props
    deleteDraft(uniqueId)
  }

  onSubmit = () => {
    const { props } = this
    const {
      toggleExpandComments,
      expandedComments,
      addActivity,
      uniqueId,
      feedId,
      draft,
    } = props

    if (draft.get('parent')) {
      addActivity({
        draftId: uniqueId,
        feedId,
      })
      if (!expandedComments && toggleExpandComments) toggleExpandComments()
    }
  }

  onInvalid = () => {
    this.setState(() => ({ valid: false }))
  }

  onValid = () => {
    this.setState(() => ({ valid: true }))
  }

  onAddPhotos = (photos) => {
    const { props } = this
    const {
      photoUpload,
      updateDraft,
      uniqueId,
      parent,
      type,
    } = props
    updateDraft(uniqueId, {
      photoUpload,
      parent,
      photos,
      type,
    })
  }

  onComment = (value) => {
    const { props } = this
    const {
      updateDraft,
      openGraph,
      uniqueId,
      parent,
      type,
    } = props
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.clearTimer()
      updateDraft(uniqueId, {
        openGraph,
        parent,
        value,
        type,
      })
    }, 200)
  }

  onDeletePhoto = (attachmentId) => {
    const { props } = this
    const { deleteDraftAttachment, uniqueId } = props
    deleteDraftAttachment(uniqueId, {
      path: 'images',
      attachmentId,
    })
  }

  componentDidCatch () {
    this.clearTimer()
  }

  clearTimer () {
    clearTimeout(this.timer)
    this.timer = null
  }

  render () {
    const { props, state } = this
    const {
      deleteDraftOpenGraph,
      photoUpload,
      uniqueId,
      draft,
      label,
      type,
      user,
    } = props

    const { valid } = state

    const avatar = user.getIn(['data', 'profile', 'picture', 'hdtv_190x266'])
    const processing = draft.get('processing', false)
    const ogs = selectors.selectRenderableDraftOpengraphs(draft)
    const photos = selectors.selectDraftImages(draft)
    const parent = draft.get('parent', '')

    const empty = !draft.get('value', '')
      && !draft.getIn(['attachments', 'files'], List()).size
      && !draft.getIn(['attachments', 'images'], List()).size
      && !draft.getIn(['attachments', 'opengraph'], List()).size

    const disabled = processing || !parent || !valid || empty

    let className = 'communityform'

    if (processing) {
      className += ' communityform--processing'
    }

    if (type) {
      className += ` communityform--${toLower(type)}`
    }

    let lbl = 'Share your thoughts...'

    if (label) {
      lbl = label
    }

    return (
      <div className={className}>
        <FormsyForm
          onValidSubmit={this.onSubmit}
          onInvalid={this.onInvalid}
          onValid={this.onValid}
          ref={this.ref}
        >
          <Avatar
            className="communityform__avatar"
            image={avatar}
            circle
          />
          <div className="communityform__main">
            <CommentBox
              validationErrors={{
                maxLength: '3,000 character limit exceeded',
              }}
              className="communityform__commentbox"
              value={draft.get('value') || ''}
              validations="maxLength:3000"
              onChange={this.onComment}
              name={`${uniqueId}-text`}
              label={lbl}
            />
            <div className="communityform__actions">
              <If condition={photoUpload}>
                {() => (
                  <FileUpload
                    className="communityform__upload"
                    currentFileCount={photos.size}
                    onChange={this.onAddPhotos}
                    name={`${uniqueId}-images`}
                    accepts={this.FILE_TYPES}
                    icon={ICON_TYPES.CAMERA}
                    disabled={processing}
                    label="Post Photos"
                    fileLimit={10}
                    multiple
                    value=""
                  />
                )}
              </If>
              <Button
                className="communityform__submit"
                type={BUTTON_TYPES.PRIMARY}
                size={SIZES.XSMALL}
                disabled={disabled}
                submit
              >
                {getButtonText(type)}
              </Button>
            </div>
          </div>
          <div className="communityform__attachments">
            <If condition={photos.size > 0}>
              {() => (
                <ul className="communityform__photos">
                  {photos.map((photo) => {
                    return (
                      <Thumbnail
                        onRemove={this.onDeletePhoto}
                        name={photo.get('filename')}
                        src={photo.get('fileData')}
                        error={photo.get('error')}
                        key={photo.get('id')}
                        id={photo.get('id')}
                        tag="li"
                      />
                    )
                  })
                  }
                </ul>
              )}
            </If>
            <If condition={ogs.size > 0}>
              {() => (
                <ul className="communityform__ogs">
                  {ogs.map((og) => {
                    const id = og.get('id')
                    const image = og.getIn(['image', 'image'])
                      || og.getIn(['image', 'url'])
                    return (
                      <OpenGraph
                        onRemove={() => deleteDraftOpenGraph(uniqueId, id)}
                        description={og.get('description')}
                        verified={og.get('verified')}
                        title={og.get('title')}
                        url={og.get('source')}
                        image={image}
                        key={id}
                        preview
                      />
                    )
                  })}
                </ul>
              )}
            </If>
          </div>
        </FormsyForm>
      </div>
    )
  }
}

export default compose(
  UniqueId('draft'),
  connectRedux(
    ({ community, user }, { uniqueId: draftId }) => ({
      draft: selectors.selectDraft(community, draftId),
      user,
    }),
    (dispatch) => {
      const { community } = getBoundActions(dispatch)
      return {
        deleteDraftAttachment: community.deleteDraftAttachment,
        deleteDraftOpenGraph: community.deleteDraftOpenGraph,
        updateDraft: community.updateDraft,
        deleteDraft: community.deleteDraft,
        addActivity: community.addActivity,
      }
    },
  ),
)(CommunityForm)

CommunityForm.defaultProps = {
  photoUpload: false,
  openGraph: false,
}

CommunityForm.propTypes = {
  deleteDraftOpenGraph: PropTypes.func.isRequired,
  deleteDraftAttachment: PropTypes.func.isRequired,
  deleteDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  uniqueId: PropTypes.string.isRequired,
  toggleExpandComments: PropTypes.func,
  expandedComments: PropTypes.bool,
  photoUpload: PropTypes.bool,
  openGraph: PropTypes.bool,
  parent: PropTypes.string,
  draft: PropTypes.object,
  type: PropTypes.string,
}
