/* eslint-disable max-len */
import React from 'react'

import { Tabs, Tab } from 'components/Tabs'

import EspBottomNav from 'components/ContentPersonalization/EspBottomNav'
import EspHeader from 'components/ContentPersonalization/EspHeader'

function ContentPersonalizationDemo () {
  return (
    <div className="content-personalization-demo">
      <Tabs>
        <Tab label="Content Personalization">
          <div className="content-personalization-demo__container">
            <EspBottomNav
              ctaLabel="Save"
              showCancel
              showInfoLabel={false}
              onNext={() => {}}
              onCancel={() => {}}
              selectMoreText="Select more interests or"
            />
            <EspHeader
              title="Select Topics"
              description="Select 1 to 10 of topics below to get started. Click on topics to select them, click again to deselect."
              backText="Back to Settings & Preferences"
              onBack={() => {}}
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}

export default ContentPersonalizationDemo
