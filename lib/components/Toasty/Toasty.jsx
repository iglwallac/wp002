import React from 'react'
import { List } from 'immutable'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Toast from './_Toast'

function getRemovableMessages (messages, prevMessages) {
  return prevMessages.filter((prevMessage) => {
    const id = prevMessage.get('id')
    const message = messages.find(m => (
      m.get('id') === id
    ))
    return !message
  })
}

class Toasty extends React.Component {
  //
  static getDerivedStateFromProps (props, state) {
    const { messages: prevMessages } = state
    const { messages } = props
    if (messages !== prevMessages) {
      const removableMessages = getRemovableMessages(messages, prevMessages)
      if (removableMessages.size) {
        return { removableMessages }
      }
      return { messages }
    }
    return null
  }

  constructor (props) {
    super(props)
    const { messages } = props
    this.state = {
      removableMessages: List(),
      messages,
    }
  }

  removedToast = (message) => {
    const { state, props } = this
    const { removeToasty } = props
    const { removableMessages: removables } = state
    const { messages } = props
    const id = message.get('id')

    removeToasty(id)

    if (!removables.size) {
      return
    }

    const updated = removables.filter(m => (
      m.get('id') !== id
    ))

    if (updated.size < 1) {
      this.setState(() => ({
        removableMessages: updated,
        messages,
      }))
      return
    }
    this.setState(() => ({
      removableMessages: updated,
    }))
  }

  render () {
    const { state } = this
    const { messages, removableMessages } = state
    return (
      <section className="toasty">
        {messages.map((m) => {
          const id = m.get('id')
          const forceRemove = !!removableMessages.find(r => (
            r.get('id') === id
          ))
          return (
            <Toast
              remove={this.removedToast}
              forceRemove={forceRemove}
              message={m}
              key={id}
            />
          )
        })}
      </section>
    )
  }
}

Toasty.propTypes = {
  messages: ImmutablePropTypes.list.isRequired,
  removeToasty: PropTypes.func.isRequired,
}

export default connectRedux(
  state => ({
    messages: state.toasty.get('messages', List()),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return { removeToasty: actions.toasty.removeToasty }
  })(Toasty)
