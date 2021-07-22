import React, { Component } from 'react'
import compose from 'recompose/compose'
import { parse } from 'date-fns'
import { connect as connectStaticText } from 'components/StaticText/connect'

class LivePageTimer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      accessClicked: false,
      startDate: props.startDate,
      total: Date.now(),
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  componentDidMount () {
    this.timerInterval = requestAnimationFrame(this.timer)
  }

  componentDidUpdate () {
    const { total } = this.state
    if (total === 0) {
      cancelAnimationFrame(this.timerInterval)
    }
  }

  componentWillUnmount () {
    cancelAnimationFrame(this.timerInterval)
  }

  leftPad = (time) => {
    return time < 10 && time >= 0 ? `0${time}` : time
  }

  timer = () => {
    const { startDate } = this.state
    const total = parse(startDate) - Date.now()
    const seconds = this.leftPad(Math.max(0, Math.floor((total / 1000) % 60)))
    const minutes = this.leftPad(Math.max(0, Math.floor((total / 1000 / 60) % 60)))
    const hours = this.leftPad(Math.max(0, Math.floor((total / (1000 * 60 * 60)) % 24)))
    const days = Math.max(0, Math.floor(total / (1000 * 60 * 60 * 24)))

    this.setState({
      total,
      days,
      hours,
      minutes,
      seconds,
    }, () => {
      if (total > 0) {
        this.timerInterval = requestAnimationFrame(this.timer)
      }
    })
  }

  render () {
    const { state } = this
    const { hours, minutes, seconds } = state

    return (
      <div className="live-page-timer__countdown-text">
        <div className="live-page-timer__countdown-item">
          <span className="live-page-timer__countdown-time">{hours}:</span>
        </div>
        <div className="live-page-timer__countdown-item">
          <span className="live-page-timer__countdown-time">{minutes}:</span>
        </div>
        <div className="live-page-timer__countdown-item">
          <span className="live-page-timer__countdown-time">{seconds}</span>
        </div>
      </div>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'eventsPage' }),
)(LivePageTimer)
