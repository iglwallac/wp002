import React from 'react'

export const MAIN_CHAT_URL = 'main_chat_111'
export const TECHNICAL_CHAT_URL = 'technical_chat'

const ChatHeader = ({ staticText, onToggle, isMain }) => {
  if (isMain) {
    return (
      <div className="chat__header chat__header--main-chat">
        <div className="chat__header__chat-live">
          {staticText.getIn(['data', 'chatLive'])}
        </div>
        <a href="" className="chat__header__need-help" onClick={onToggle} >
          {staticText.getIn(['data', 'needHelp'])}
        </a>
      </div>
    )
  }
  return (
    <div className="chat__header chat__header--technical-chat" >
      <a href="" onClick={onToggle} >
        <svg className="chat__header__back" />
      </a>
      {staticText.getIn(['data', 'helpCenter'])}

    </div>
  )
}

export default ChatHeader
