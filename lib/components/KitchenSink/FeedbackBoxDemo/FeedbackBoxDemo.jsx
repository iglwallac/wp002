/* eslint-disable max-len */
import React from 'react'

import { Tabs, Tab } from 'components/Tabs'

import FeedbackBox, { FEEDBACK_BOX_TYPES } from 'components/FeedbackBox'

function FeedbackBoxDemo () {
  return (
    <div className="feedback-box-demo">
      <Tabs>
        <Tab label="Feedback Box">
          <div className="feedback-box-demo__container">
            <FeedbackBox type={FEEDBACK_BOX_TYPES.SUCESS}>
              Your Log In email address has been updated.
            </FeedbackBox>
            <FeedbackBox type={FEEDBACK_BOX_TYPES.ERROR}>
              Error! There was an problem resuming your membership. Please update your payment method.
            </FeedbackBox>
            <FeedbackBox type={FEEDBACK_BOX_TYPES.WARNING}>
              We noticed that your membership has expired. To continue watching videos on Gaia, please renew your subscription here.
            </FeedbackBox>
            <FeedbackBox type={FEEDBACK_BOX_TYPES.INFO}>
              You haven’t removed any content content from your recommendations. Remove content from the Home page.
            </FeedbackBox>
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}

export default FeedbackBoxDemo
