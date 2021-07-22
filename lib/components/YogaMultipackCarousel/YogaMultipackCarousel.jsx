import React from 'react'
import Slider from 'react-slick'
import YogaMultipackTile from 'components/YogaMultipackTile'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import Icon from 'components/Icon'

const renderSlides = (props) => {
  const {
    placementContent,
    auth,
    setInPlaylist,
  } = props
  const titles = placementContent.getIn(['data', 'titles'])
  return (
    titles.map((title) => {
      const backgroundStyle = title.getIn(['hero_image_withtext', 'hero_1440x400'])
      return (
        <div key={title.get('nid')}>
          <div className="yoga-3-pack-carousel__background">
            <img className="yoga-3-pack-carousel__background--image" src={backgroundStyle} alt="test" />
          </div>
          <div className="yoga-3-pack__mask" />
          <div key={title.get('nid')} className="yoga-3-pack-carousel__item--container">
            <YogaMultipackTile
              tile={title}
              placement="right"
              auth={auth}
              setInPlaylist={setInPlaylist}
            />
          </div>
        </div>
      )
    })
  )
}

const Right = (props) => {
  return (
    <div onClick={props.onClick}>
      <Icon iconClass={['icon--right', 'slick-next']} />
    </div>
  )
}
const Left = (props) => {
  return (
    <div onClick={props.onClick}>
      <Icon iconClass={['icon--left', 'slick-prev']} />
    </div>
  )
}

class Carousel extends React.Component {
  componentDidMount () { }
  render () {
    const settings = {
      dots: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      nextArrow: <Right {...this.props} />,
      prevArrow: <Left {...this.props} />,
      className: 'yoga-3-pack-carousel',
    }
    return (
      <div className="yoga-3-pack-carousel">
        <Slider {...settings} >
          { renderSlides(this.props) }
        </Slider>
      </div>
    )
  }
}

YogaMultipackTile.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  placementContent: ImmutablePropTypes.map,
  setInPlaylist: PropTypes.func.isRequired,
}

export default Carousel
