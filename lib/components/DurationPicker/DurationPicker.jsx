
import React from 'react'
import PropTypes from 'prop-types'

const BROWSER = process.env.BROWSER

class DurationPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      duration: 0,
    }
  }

  componentDidMount () {
    const { props } = this

    if (BROWSER) {
      // eslint-disable-next-line global-require
      const CircularSlider = require('./CircularSlider.jsx')
      // Borrowed from this repo: https://github.com/MougLee/circular-slider  but required modification for our use case
      const options = {
        container: 'slider',
        max: 60,
        min: 0,
        step: 5,
        radius: 100,
        valueChange: ((val) => {
          let step
          switch (val) {
            case 25:
              step = 4 // 20 min
              break

            case 35:
              step = 6 // 30 min
              break

            case 40:
            case 50:
              step = 9 // 45 min
              break

            case 55:
              step = 12 // 60 min
              break

            default:
              // only update the duration value on our tick marks
              this.setState({ duration: val })
              props.onChange(val)
              break
          }
          if (this.timeout) {
            window.clearTimeout(this.timeout)
          }
          if (step) {
            this.timeout = window.setTimeout(() => {
              slider.stepNo = step
              this.setState({ duration: val })
              props.onChange(val)
            }, 500)
          }
        }),
      }
      const slider = new CircularSlider(options)
    }
  }

  render () {
    const { state } = this
    const { duration } = state

    return (
      <div className="duration-picker">
        <svg className="duration-bg" viewBox="-200 -200 400 400" >
          <circle cx="0" cy="0" r="90" />
          <g className="marks">
            <line x1="90" y1="0" x2="110" y2="0" />
            <line x1="90" y1="0" x2="110" y2="0" />
            <line x1="90" y1="0" x2="110" y2="0" />
            <line x1="90" y1="0" x2="110" y2="0" />
            <line x1="90" y1="0" x2="110" y2="0" />
            <line x1="90" y1="0" x2="110" y2="0" />
            <line x1="90" y1="0" x2="110" y2="0" />
          </g>
          <g className="times">
            <text x="56" y="-100">5</text>
            <text x="99" y="-54">10</text>
            <text x="115" y="4">15</text>
            <text x="99" y="62">20</text>
            <text x="-7" y="125">30</text>
            <text x="-130" y="4">45</text>
            <text x="-9" y="-115">60+</text>
          </g>
        </svg>
        <div id="slider" />
        <div className="duration-time">
          <span className="duration-time--label">{ duration }</span>
          <br />
          min
        </div>
      </div>
    )
  }
}

DurationPicker.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default DurationPicker
