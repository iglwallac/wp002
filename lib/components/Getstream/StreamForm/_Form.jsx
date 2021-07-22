import React from 'react'
import PropTypes from 'prop-types'
import { CommentBox, FileUpload, FILE_TYPES } from 'components/FormInput.v2'
import { selectActivityPhotos, selectRenderableActivityOGs } from 'services/getstream/selectors'
import { ACTIVITY_VERBS } from 'services/getstream/activity'
import { REACTION_KINDS } from 'services/getstream/reaction'
import { Button, SIZES, TYPES } from 'components/Button.v2'
import OpenGraph from 'components/Getstream/OpenGraph'
import Thumbnail from 'components/Getstream/Thumbnail'
import Avatar from 'components/Getstream/Avatar'
import { ICON_TYPES } from 'components/Icon.v2'
import { If } from 'components/Conditionals'
import FormsyForm from 'formsy-react'
import toLower from 'lodash/toLower'

export default class ActivityForm
  extends React.Component {
  //
  constructor (props) {
    super(props)
    this.FILE_TYPES = [
      FILE_TYPES.JPEG,
      FILE_TYPES.JPG,
      FILE_TYPES.PNG,
    ]
  }

  componentWillUnmount () {
    const { props } = this
    const { uniqueId, deleteDraft } = props
    deleteDraft(uniqueId)
  }

  onAddPhotos = (photos) => {
    const { props } = this
    const {
      targetFeeds,
      updateDraft,
      photoUpload,
      activityId,
      uniqueId,
      verb,
      kind,
    } = props
    updateDraft(uniqueId, {
      targetFeeds,
      photoUpload,
      activityId,
      photos,
      verb,
      kind,
    })
  }

  onComment = (text) => {
    const { props } = this
    const {
      targetFeeds,
      updateDraft,
      activityId,
      openGraph,
      uniqueId,
      verb,
      kind,
    } = props
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.clearTimer()
      updateDraft(uniqueId, {
        targetFeeds,
        activityId,
        openGraph,
        verb,
        kind,
        text,
      })
    }, 300)
  }

  onDeletePhoto = (attachmentId, src) => {
    const { props } = this
    const { deleteDraftAttachment, uniqueId } = props
    deleteDraftAttachment(uniqueId, {
      path: 'images',
      attachmentId,
      src,
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
    const { props } = this
    const {
      deleteDraftOpenGraph,
      photoUpload,
      streamAuth,
      uniqueId,
      onSubmit,
      draft,
      label,
      kind,
      verb,
    } = props

    const avatar = streamAuth.getIn(['data', 'profileImage'], '')
    const processing = draft.get('processing', false)
    const photos = selectActivityPhotos(draft)
    const ogs = selectRenderableActivityOGs(draft)

    const creatable = !!draft.get('object')
    const disabled = processing || !creatable

    let className = 'streamform'

    if (processing) {
      className += ' streamform--processing'
    }

    if (verb) {
      className += ` streamform--${toLower(verb)}`
    }

    if (kind) {
      className += ` streamform--${toLower(kind)}`
    }

    let lbl = 'Share your thoughts...'

    if (label) {
      lbl = label
    }

    return (
      <div className={className}>
        <FormsyForm onValidSubmit={onSubmit} ref={this.ref}>
          <Avatar
            className="streamform__avatar"
            image={avatar}
            circle
          />
          <div className="streamform__main">
            <CommentBox
              label={lbl}
              className="streamform__commentbox"
              value={draft.get('text') || ''}
              onChange={this.onComment}
              name={`${uniqueId}-text`}
            />
            <div className="streamform__actions">
              <If condition={photoUpload}>
                {() => (
                  <FileUpload
                    className="streamform__upload"
                    currentFileCount={photos.size}
                    onChange={this.onAddPhotos}
                    icon={ICON_TYPES.CAMERA}
                    name={`${uniqueId}-images`}
                    accepts={this.FILE_TYPES}
                    disabled={processing}
                    label="Post Photos"
                    fileLimit={10}
                    value=""
                    multiple
                  />
                )}
              </If>
              <Button
                className="streamform__submit"
                type={TYPES.PRIMARY}
                size={SIZES.XSMALL}
                disabled={disabled}
                submit
              >Post</Button>
            </div>
          </div>
          <div className="streamform__attachments">
            <If condition={photos.size > 0}>
              {() => (
                <ul className="streamform__photos">
                  {photos.map(photo => (
                    <Thumbnail
                      onRemove={this.onDeletePhoto}
                      error={photo.get('error')}
                      name={photo.get('name')}
                      processing={processing}
                      src={photo.get('src')}
                      key={photo.get('id')}
                      id={photo.get('id')}
                      tag="li"
                    />
                  ))}
                </ul>
              )}
            </If>
            <If condition={ogs.size > 0}>
              {() => (
                <ul className="streamform__ogs">
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

ActivityForm.defaultProps = {
  photoUpload: false,
  openGraph: false,
}

ActivityForm.propTypes = {
  deleteDraftOpenGraph: PropTypes.func.isRequired,
  deleteDraftAttachment: PropTypes.func.isRequired,
  targetFeeds: PropTypes.arrayOf(PropTypes.string),
  deleteDraft: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,
  uniqueId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  photoUpload: PropTypes.bool,
  openGraph: PropTypes.bool,
  activityId: PropTypes.string,
  draft: PropTypes.object,
  verb: PropTypes.oneOf([
    ACTIVITY_VERBS.POST,
  ]),
  kind: PropTypes.oneOf([
    REACTION_KINDS.COMMENT,
    REACTION_KINDS.LIKE,
  ]),
}
