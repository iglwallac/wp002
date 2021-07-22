import React from 'react'

const Benefits = ({ staticText }) => {
  return (
    <div className="live-access-page__benefits__rectangle">
      <div className="live-access-page__benefits__icon-text-container">
        <div className="live-access-page__benefits__icon-container">
          <svg className="live-access-page__benefits__webinar-icon" />
        </div>
        <div className="live-access-page__benefits__text"> {staticText.getIn(['data', 'webinar'])} </div>
      </div>
      <div className="live-access-page__benefits__icon-text-container">
        <div className="live-access-page__benefits__icon-container">
          <svg className="live-access-page__benefits__engagement-icon" />
        </div>
        <div className="live-access-page__benefits__text"> {staticText.getIn(['data', 'engagement'])} </div>
      </div>
      <div className="live-access-page__benefits__icon-text-container">
        <div className="live-access-page__benefits__icon-container">
          <svg className="live-access-page__benefits__archive-icon" />
        </div>
        <div className="live-access-page__benefits__text"> {staticText.getIn(['data', 'archive'])} </div>
      </div>
      <div className="live-access-page__benefits__icon-text-container">
        <div className="live-access-page__benefits__icon-container">
          <svg className="live-access-page__benefits__languages-icon" />
        </div>
        <div className="live-access-page__benefits__text"> {staticText.getIn(['data', 'languages'])} </div>
      </div>
    </div>
  )
}

export default Benefits
