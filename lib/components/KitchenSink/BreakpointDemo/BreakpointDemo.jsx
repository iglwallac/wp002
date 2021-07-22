import React from 'react'
import { Tabs, Tab } from 'components/Tabs'
import { H4 } from 'components/Heading'

const BreakpointDemo = () => (
  <div className="breakpoint-demo">
    <Tabs>
      <Tab label="Breakpoints">
        <div className="breakpoint-demo__inner">
          <div className="breakpoint-demo__none">
            <H4>Breakpoint (none: 0-480)</H4>
            This is the range from no breakpoint (0px) up to our smallest breakpoint (480px).
          </div>
          <div className="breakpoint-demo__small">
            <H4>Breakpoint (small: 480-768)</H4>
            This is the range from our small breakpoint (480px) up to our medium breakpoint
            (768px).
          </div>
          <div className="breakpoint-demo__medium">
            <H4>Breakpoint (medium: 769-944)</H4>
            This is the range from our medium breakpoint (480px) up to our large breakpoint
            (944px).
          </div>
          <div className="breakpoint-demo__large">
            <H4>Breakpoint (large: 944-1440)</H4>
            This is the range from our large breakpoint (944px) up to our widescreen breakpoint
            (1440px).
          </div>
          <div className="breakpoint-demo__widescreen">
            <H4>Breakpoint (widescreen: 1440+)</H4>
            This is the range from our widescreen breakpoint (1440px) and beyond.
          </div>
        </div>
      </Tab>
      <Tab label="More Info">
        <div className="breakpoint-demo__inner">
          <H4>Breakpoints</H4>
          We are now only using *four* breakpoints. Please do not use the old breakpoints
          in the legacy variables file (use the new variables.v2 file).
        </div>
      </Tab>
    </Tabs>
  </div>
)

export default BreakpointDemo
