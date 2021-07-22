import React from 'react'
import SliderBarDemo from 'components/KitchenSink/SliderBarDemo'
import BreakpointDemo from 'components/KitchenSink/BreakpointDemo'
import ExpandableDemo from 'components/KitchenSink/ExpandableDemo/ExpandableDemo'
import SocialButtonDemo from 'components/KitchenSink/SocialButtonDemo'
import HeadingDemo from 'components/KitchenSink/HeadingDemo'
// import StyleDemo from 'components/KitchenSink/StyleDemo'
import ButtonDemo from 'components/KitchenSink/ButtonDemo'
import CardDemo from 'components/KitchenSink/CardDemo'
import IconDemo from 'components/KitchenSink/IconDemo'
import FeedbackBoxDemo from 'components/KitchenSink/FeedbackBoxDemo/FeedbackBoxDemo'
import ContentPersonalizationDemo from 'components/KitchenSink/ContentPersonalizationDemo'

function KitchenSink () {
  return (
    <div className="kitchen-sink">
      <HeadingDemo />
      <ButtonDemo />
      <IconDemo />
      <SliderBarDemo />
      <CardDemo />
      <BreakpointDemo />
      <SocialButtonDemo />
      <ExpandableDemo />
      <FeedbackBoxDemo />
      <ContentPersonalizationDemo />
      {/* <StyleDemo /> */}
    </div>
  )
}

export default KitchenSink
