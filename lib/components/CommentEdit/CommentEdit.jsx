import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import FormButton from 'components/FormButton'
import {
  FORM_BUTTON_TYPE_SUBMIT,
} from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import FormsyForm from 'formsy-react'
import FormTextarea from 'components/FormTextarea'
import { connect } from 'react-redux'

function getClassNameButton (canSubmit) {
  return [
    'comment-edit__button-submit',
    'button--primary',
  ].concat(!canSubmit ? 'comment-edit__button-submit--hidden' : [])
}

function getClassNameTextarea (props, state) {
  const { canSubmit, hasFocus } = state
  const isExpanded = hasFocus || (!hasFocus && canSubmit)
  return ['comment-edit__textarea'].concat(
    isExpanded ? ['comment-edit__textarea--expanded'] : [],
  )
}

class CommentEdit extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      canSubmit: false,
      hasFocus: false,
    }
  }

  onChangeForm = (values) => {
    this.setCanSubmit(values.body !== '')
  }

  onValidSubmit = (model, resetForm) => {
    const { resetState } = this
    const {
      auth,
      data,
      comment,
      parent,
      saveComment,
      onSubmitComplete,
    } = this.props
    const { body } = model

    if (body !== '') {
      resetState()
      if (_isFunction(onSubmitComplete)) {
        onSubmitComplete(model)
      }
      saveComment({
        id: data.get('id') || data.get('nid'),
        auth,
        body,
        comment,
        parent,
      })
      resetForm()
    }
  }

  setHasFocus = (hasFocus) => {
    this.setState(() => ({ hasFocus }))
  }

  setCanSubmit = (canSubmit) => {
    this.setState(() => ({ canSubmit }))
  }

  resetState = () => {
    this.setState(() => ({ canSubmit: false, hasFocus: false }))
  }

  render () {
    const { props, state, onValidSubmit, onChangeForm, setHasFocus } = this
    const {
      className,
      placeholder,
      auth,
      comment,
      commentEditStaticText,
    } = props
    const { canSubmit } = state
    if (!auth.get('jwt')) {
      return null
    }
    return (
      <FormsyForm
        className={['comment-edit'].concat(className || []).join(' ')}
        onValidSubmit={onValidSubmit}
        onChange={onChangeForm}
      >
        <FormTextarea
          name="body"
          defaultValue={comment ? comment.get('comment') : undefined}
          onFocus={_partial(setHasFocus, true)}
          onBlur={_partial(setHasFocus, false)}
          autoResize
          className={getClassNameTextarea(props, state)}
          placeholder={
            placeholder || commentEditStaticText.getIn(['data', 'shareYourThoughts'])
          }
        />
        <FormButton
          type={FORM_BUTTON_TYPE_SUBMIT}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          formButtonClass={getClassNameButton(canSubmit)}
          text={commentEditStaticText.getIn(['data', 'post'])}
        />
      </FormsyForm>
    )
  }
}

CommentEdit.propTypes = {
  comment: ImmutablePropTypes.map,
  parent: ImmutablePropTypes.map,
  placeholder: PropTypes.string,
  data: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  saveComment: PropTypes.func.isRequired,
  onSubmitComplete: PropTypes.func,
  commentEditStaticText: ImmutablePropTypes.map.isRequired,
}

CommentEdit.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(state => ({
  commentEditStaticText: state.staticText.getIn(
    ['data', 'commentEdit'],
    Map(),
  ),
}))(CommentEdit)
