import React from 'react'
import PropTypes from 'prop-types'
import smoothscroll from 'smoothscroll-polyfill'
import _includes from 'lodash/includes'

const BROWSER = process.env.BROWSER
if (BROWSER) {
  // Needed for IE to support scrolling
  smoothscroll.polyfill()
}

class SliderBar extends React.Component {
  //
  constructor (props) {
    super(props)
    this.sliderChildRefs = []
    const { items } = props

    const initIndex = Math.max(items.findIndex(item => item.value === props.initValue), 0)

    this.state = {
      activeTab: initIndex,
      showRightArrow: false,
      showLeftArrow: false,
      internalOpenShelfIndex: 0,
      hoverActive: null,
      sliderSet: false,
    }
  }

  componentDidMount () {
    global.addEventListener('resize', this.handleWindowResize, false)
  }

  componentWillUnmount () {
    if (this._setSliderTimeout1) {
      clearTimeout(this._setSliderTimeout1)
      this._setSliderTimeout1 = undefined
    }

    if (this._setSliderTimeout2) {
      clearTimeout(this._setSliderTimeout2)
      this._setSliderTimeout2 = undefined
    }
    global.removeEventListener('resize', this.handleWindowResize)
  }

  setInitComplete = () => {
    this.setState({ barInit: true })
  }

  setSliderChildRefs = (ref) => {
    if (_includes(this.sliderChildRefs, ref)) {
      return
    }
    this.sliderChildRefs.push(ref)
  }

  setSliderLinePosition = (ref) => {
    const sliderRef = this.sliderRef
    if (!ref || !sliderRef) {
      return
    }

    // Set the active class now, so safari correctly computes the below values
    sliderRef.classList.add('active')

    if (this._setSliderTimeout1) {
      clearTimeout(this._setSliderTimeout1)
      this._setSliderTimeout1 = undefined
    }

    this._setSliderTimeout1 = window.setTimeout(() => {
      this._setSliderTimeout1 = undefined
      if (!ref || !sliderRef) {
        return
      }

      const left = ref.offsetLeft
      const width = ref.offsetWidth
      const height = ref.offsetHeight - 4

      sliderRef.style.top = `${height}px`
      sliderRef.style.left = `${left}px`
      sliderRef.style.width = `${width}px`

      sliderRef.classList.add('moving')
      this.setState({ sliderSet: true })

      if (this._setSliderTimeout2) {
        clearTimeout(this._setSliderTimeout2)
        this._setSliderTimeout2 = undefined
      }

      this._setSliderTimeout2 = setTimeout(() => {
        this._setSliderTimeout2 = undefined
        if (!sliderRef) {
          return
        }
        sliderRef.classList.remove('moving')
      }, 500) // set this timeout to the transition duration
    }, 10)
  }

  setSliderListRef = (ref) => {
    this.sliderListRef = ref
    this.calculateArrows()
  }
  setSliderWrapperRef = (ref) => {
    this.sliderWrapperRef = ref
    this.calculateArrows()
  }
  setSliderRef = (ref) => {
    this.sliderRef = ref
    const {
      state,
      sliderChildRefs,
      setSliderLinePosition,
    } = this

    if (state.sliderSet === false && sliderChildRefs.length !== 0) {
      setSliderLinePosition(sliderChildRefs[state.activeTab])
    }
  }

  handleOnClick = (e, index, item) => {
    if (typeof this.props.onclick === 'function') {
      this.props.onclick(e, index, item)
    }
    this.setState({ activeTab: index })
    this.setSliderLinePosition(this.sliderChildRefs[index])
  }

  scrollRight = () => {
    if (typeof this.props.onscroll === 'function') {
      this.props.onscroll()
    }
    const listRef = this.sliderListRef
    if (!listRef) {
      return
    }
    const scrollDistance = listRef.scrollLeft + 250
    const sliderWidth = listRef.offsetWidth

    listRef.scroll({
      top: 0,
      left: scrollDistance,
      behavior: 'smooth',
    })

    this.setState({
      scrollDistance,
      showLeftArrow: true,
    })

    if ((scrollDistance + sliderWidth) >= listRef.scrollWidth) {
      this.setState({ showRightArrow: false })
    }
  }

  scrollLeft = () => {
    if (typeof this.props.onscroll === 'function') {
      this.props.onscroll()
    }
    const ref = this.sliderListRef
    if (!ref) {
      return
    }
    const scroll = ref.scrollLeft - 250

    ref.scroll({
      top: 0,
      left: scroll,
      behavior: 'smooth',
    })

    this.setState({ showRightArrow: true })

    if (scroll <= 0) {
      this.setState({ showLeftArrow: false })
    }
  }

  calculateArrows = () => {
    if (!this.sliderListRef) {
      return
    }
    if (!this.sliderWrapperRef) {
      return
    }
    const wrapperWidth = this.sliderWrapperRef.offsetWidth
    const sliderScrollWidth = this.sliderListRef.scrollWidth

    if (sliderScrollWidth >= wrapperWidth) {
      this.setState({ showRightArrow: true })
      return
    }

    this.setState({ showRightArrow: false, showLeftArrow: false })
  }

  handleWindowResize = () => {
    const {
      state,
      sliderChildRefs,
      setSliderLinePosition,
      calculateArrows,
    } = this
    setSliderLinePosition(sliderChildRefs[state.activeTab])
    calculateArrows()
  }

  render () {
    const {
      props,
      state,
      scrollLeft,
      scrollRight,
      handleOnClick,
      setSliderChildRefs,
    } = this
    const { activeTab, showLeftArrow, showRightArrow } = state
    const { items, className } = props

    return (
      <nav className={`slider-bar__wrapper ${className}--wrapper`} ref={this.setSliderWrapperRef}>
        { showLeftArrow ?
          <span className="slider-bar__prev" onClick={scrollLeft} /> :
          null
        }
        <ul className="slider-bar" ref={this.setSliderListRef}>
          {items.map((item, index) => {
            const activeClass = activeTab === index ? 'active' : ''
            return (
              <li className={`slider-bar__item ${className}-item`} key={`slide-${item.value}`}>
                <button
                  className={`slider-bar__button ${activeClass} ${className}__button`}
                  onClick={(e) => { handleOnClick(e, index, item) }}
                  ref={setSliderChildRefs}
                >
                  {item.label}
                </button>
              </li>
            )
          })}
          <li className={`slider-bar__slider ${className}__slider`} ref={this.setSliderRef} />
        </ul>
        { showRightArrow ?
          <span className="slider-bar__next" onClick={scrollRight} /> :
          null
        }
      </nav>
    )
  }
}

SliderBar.propTypes = {
  className: PropTypes.string,
  onclick: PropTypes.func,
  onscroll: PropTypes.func,
  items: PropTypes.object,
  initValue: PropTypes.string,
}

export default React.memo(SliderBar)
