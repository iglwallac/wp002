import React from 'react'

const ProgressBar = (props) => {
  return (
    <div className="onboarding-progress-bar">
      <Filler percentage={props.percentage * 100} />
    </div>
  )
}

const Filler = (props) => {
  return <div className="filler" style={{ width: `${props.percentage}%` }} />
}


export default ProgressBar

