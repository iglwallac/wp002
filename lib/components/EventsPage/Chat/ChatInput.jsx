import PropTypes from 'prop-types'
import FormsyForm from 'formsy-react'
import React, { useRef, useMemo, useState, useCallback } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { TextInput } from 'components/FormInput.v2'
import { Button, TYPES } from 'components/Button.v2'

export default function ChatInput ({
  sendMessage,
  staticText,
  imageUrl,
}) {
  const form = useRef()
  const [disabled, disable] = useState(true)

  const style = useMemo(() => ({
    backgroundImage: `url(${imageUrl})`,
  }), [imageUrl])

  const onChange = useCallback(({ message }) => {
    disable(!message)
  }, [])

  const onSubmit = useCallback(({ message }) => {
    if (message) {
      sendMessage(message)
      if (form && form.current) {
        form.current.reset()
      }
    }
  }, [])

  return (
    <FormsyForm
      className="chat-input"
      onSubmit={onSubmit}
      onChange={onChange}
      ref={form}
    >
      <div
        className="chat-input__avatar"
        role="presentation"
        style={style}
      />
      <TextInput
        label={staticText.getIn(['data', 'saySomething'])}
        className="chat-input__input"
        autocomplete="off"
        name="message"
        value=""
      />
      <Button
        className="chat-input__submit"
        disabled={disabled}
        type={TYPES.GHOST}
        submit
      >
        <span className="assistive">
          Send Message
        </span>
      </Button>
    </FormsyForm>
  )
}

ChatInput.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  sendMessage: PropTypes.func.isRequired,
  imageUrl: PropTypes.string.isRequired,
}
