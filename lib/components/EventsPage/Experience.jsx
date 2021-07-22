import React from 'react'
import Button from 'components/Button'

const Experience = ({ title, cost, buttonText, description, handleClick,
  disabled, url, query, backgroundColor, target }) => {
  const button =
    buttonText && <Button
      buttonClass={['button', 'live-events__experience__button', disabled ? 'button--disabled' : 'button--primary']}
      disabled={disabled}
      text={buttonText}
      url={!disabled ? url : undefined}
      query={!disabled ? query : undefined}
      target={target}
      onClick={handleClick}
    />

  return (
    <div className="live-events__experience__background">
      <div
        className="live-events__experience"
        style={{
          backgroundColor,
        }}
      >
        <div className="title-cost-button">
          <div className="live-events__experience-title">
            {title}
          </div>
          <div className="live-events__experience-cost">
            {cost}
          </div>
          {button}
        </div>
        <div
          className="description"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </div>
  )
}

export default Experience
