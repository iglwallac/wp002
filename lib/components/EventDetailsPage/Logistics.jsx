import React from 'react'
import Button from 'components/Button'
import ImageTitleText from './ImageTitleText'

const Logistics = ({ title, staticText }) => {
  return (
    <div
      style={{
        backgroundImage: 'url(https://brooklyn.gaia.com/v1/image-render/2128f745-28d2-47fc-8633-e2b437449101/test)',
        backgroundPosition: 'right',
        backgroundSize: 'cover',
      }}
    >
      <div className="logistics">
        <div className="title">{title}</div>
        <div className="image-title-text-group">
          <ImageTitleText
            title={staticText.getIn(['data', 'aboutBoulder'])}
            media="https://brooklyn.gaia.com/v1/image-render/2b857503-6006-46e2-94a3-865efcb9405c/test"
          >{staticText.getIn(['data', 'aboutBoulderText'])}</ImageTitleText>
          <ImageTitleText
            title={staticText.getIn(['data', 'thingsToDo'])}
            media="https://brooklyn.gaia.com/v1/image-render/50c06cc9-0952-49f4-9a82-d905691d12f8/test"
          >{staticText.getIn(['data', 'thingsToDoText'])}</ImageTitleText>
          <ImageTitleText
            title={staticText.getIn(['data', 'whereToStay'])}
            media="https://brooklyn.gaia.com/v1/image-render/cfb84c9e-496b-40f2-884c-ba108c6c6d2f/test"
          >{staticText.getIn(['data', 'whereToStayText'])}</ImageTitleText>
        </div>
        <div className="buttonContainer">
          <Button
            buttonClass={['button--imagery']}
            text={staticText.getIn(['data', 'moreInfo'])}
            url="https://www.boulderdowntown.com/"
            target="_blank"
          />
        </div>
      </div>
    </div>
  )
}

export default Logistics
