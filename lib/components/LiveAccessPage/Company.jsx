import React from 'react'
import { H2 } from 'components/Heading'

const Company = ({ staticText }) => {
  return (
    <div className="live-access-page__company__rectangle">
      <div className="live-access-page__company__header-container">
        <div>
          <H2 inverted className="live-access-page__company__header-text"> {staticText.getIn(['data', 'money'])} </H2>
        </div>
      </div>
      <div className="live-access-page__company__group">
        <div className="live-access-page__company__container">
          <div className="live-access-page__company__image-container">
            <svg className="live-access-page__company__ad-free-icon" />
          </div>
          <div className="live-access-page__company__text"> {staticText.getIn(['data', 'ad-free'])} </div>
        </div>
        <div className="live-access-page__company__container">
          <div className="live-access-page__company__image-container">
            <svg className="live-access-page__company__speakers-icon" />
          </div>
          <div className="live-access-page__company__text"> {staticText.getIn(['data', 'speakers'])} </div>
        </div>
      </div>
      <div className="live-access-page__company__group">
        <div className="live-access-page__company__container">
          <div className="live-access-page__company__image-container">
            <svg className="live-access-page__company__produce-icon" />
          </div>
          <div className="live-access-page__company__text"> {staticText.getIn(['data', 'produce'])} </div>
        </div>
        <div className="live-access-page__company__container">
          <div className="live-access-page__company__image-container">
            <svg className="live-access-page__company__privacy-icon" />
          </div>
          <div className="live-access-page__company__text"> {staticText.getIn(['data', 'privacy'])} </div>
        </div>
      </div>
    </div>
  )
}

export default Company
