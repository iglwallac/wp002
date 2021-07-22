import React from 'react'
import { List } from 'immutable'
import { Tabs, Tab } from 'components/Tabs'
import SliderBar from 'components/SliderBar/SliderBar'

class SliderBarDemo extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      activeTab: 0,
    }
  }

  handleOnClick = (e, index, item) => {
    // eslint-disable-next-line no-console
    console.log(e, index, item)
    this.setState({ activeTab: index })
  }

  handleOnScroll = () => {
    // eslint-disable-next-line no-console
    console.log('scrolled')
    // useful for event tracking
  }

  render () {
    const {
      handleOnClick,
      handleOnScroll,
    } = this

    const sliderItems = List([
      {
        label: 'Label',
        value: 'Value',
      },
      {
        label: 'Hello World',
        value: 'HW',
      },
      {
        label: 'A Really Long Label Title',
        value: 'A',
      },
      {
        label: 'Home',
        value: 'B',
      },
      {
        label: 'Yoga',
        value: 'C',
      },
      {
        label: 'Meditiation',
        value: 'D',
      },
      {
        label: 'Series',
        value: 'E',
      },
      {
        label: 'Docs & Films',
        value: 'F',
      },
      {
        label: 'Topics',
        value: 'G',
      },
      {
        label: 'New Videos',
        value: 'H',
      },
      {
        label: 'Events',
        value: 'I',
      },
      {
        label: 'Articles',
        value: 'J',
      },
      {
        label: 'Alternative Healing',
        value: 'K',
      },
      {
        label: 'Transformation',
        value: 'L',
      },
      {
        label: 'Seeking Truth',
        value: 'M',
      },
    ])

    return (
      <div className="slider-demo">
        <Tabs>
          <Tab label="SliderMenu">
            <article className="slider-demo">
              <div className="slider-inline">
                <SliderBar className="demo-slider" items={sliderItems} onclick={handleOnClick} onscroll={handleOnScroll} initValue={'HW'} />
              </div>
            </article>
          </Tab>
        </Tabs>
      </div>
    )
  }
}

export default SliderBarDemo
