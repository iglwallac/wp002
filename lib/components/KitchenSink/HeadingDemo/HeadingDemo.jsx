import React from 'react'
import { H1, H2, H3, H4, H5, H6, HEADING_TYPES } from 'components/Heading'
import { Tabs, Tab } from 'components/Tabs'

const HeadingDemo = () => (
  <div className="heading-demo">
    <Tabs>
      <Tab label="Heading Styles">
        <article className="heading-demo__inner">
          <div className="heading-demo__background--light">
            <H1>This is an H1</H1>
            <H2>This is an H2</H2>
            <H3>This is an H3</H3>
            <H4>This is an H4</H4>
            <H5>This is an H5</H5>
            <H6>This is an H6</H6>
            <div className="heading-demo__background--medium ">
              <H3>Headings using the property &quot;as&quot;</H3>
              <H3 as={HEADING_TYPES.H5}>This is an H3 that looks like an H5</H3>
              <H3 as={HEADING_TYPES.H5_FR}>This H3 changes to a H5 for Fr only</H3>
              <H4 as={[HEADING_TYPES.H2_DESKTOP, HEADING_TYPES.H6_MOBILE]}>This H4 is a H2
            on desktop and H6 on mobile</H4>
              <p>Note: for more information on the Heading component,
              please click on <strong>More Info</strong> tab above ***</p>
            </div>
            <div className="heading-demo__background--dark">
              <H3 inverted as="h2">This is an inverted H3 as an H2</H3>
            </div>
          </div>
        </article>
      </Tab>
      <Tab label="More Info">
        <article className="heading-demo__inner heading-demo__more-info">
          <p>
            Using the Heading component standardizes heading sizes at desired breakpoints.
          </p>
          <p>
            The &quot;as&quot; property allows for styling any header to look like another.
            This is for reconciling design with accessibility/assistive technology (AT) and
            SEO (search engine optimization).
          </p>
          <H3>How to use</H3>
          <p>All Headings components have the following values that can be passed through
            the &quot;as&quot; property by prefixing it with <strong>HEADING_TYPES</strong></p>
          <p>Headings available are: <strong> H1, H2, H3, H4, H5, H6</strong></p>
          <div className="heading-demo__inner heading-demo__example">
            <H4>Available Values</H4>
            <ul>
              <li><p><strong>HEADING_TYPES.H* </strong>
                (Default sizes Desktop and Mobile)</p></li>
              <li><p><strong>HEADING_TYPES.H*_DESKTOP</strong> - ( Desktop size only)</p></li>
              <li><p><strong>HEADING_TYPES.H*_MOBILE</strong> - (Breakpoint size only)</p></li>
              <li><p><strong>HEADING_TYPES.H*_DE </strong>- (Size only applies on DE lang)</p></li>
              <li><p><strong>HEADING_TYPES.H*_ES</strong> - (Size only applies on DE lang)</p></li>
              <li><p><strong>HEADING_TYPES.H*_FR </strong>- (Size only applies on DE lang)</p></li>
            </ul>
          </div>
          <div className="heading-demo__inner heading-demo__example">
            <H4>Passing Single Value</H4>
            <p>The Heading component gives you and option of passing a single
              value to get desired behavior listed above. You can implement this by
              passing the variable this way:
            </p>
            <p className="heading-demo__example--code">
              &lt;H2 as=&#123;HEADING_TYPES.H4&#125;&gt;
              This is a H2 set as a H4 &lt;/H2&gt;
            </p>
            <p>
              <strong>Displays as:</strong>
            </p>
            <H2 as={[HEADING_TYPES.H4]}>
              <em>This is a H2 set as a H4</em>
            </H2>
          </div>

          <div className="heading-demo__inner heading-demo__example">
            <H4>Passing Multiple Values:</H4>
            <p className="heading-demo__example--code">&lt;H4 as=&#123;[HEADING_TYPES.H2_DESKTOP,
              HEADING_TYPES.H3_MOBILE]&#125;&gt;
            This H4 is a H2 on desktop and H3 on mobile &lt;/H4&gt;
            </p>
            <p>
              <strong>Displays as:</strong>
            </p>
            <H2 as={[HEADING_TYPES.H4_DESKTOP, HEADING_TYPES.H6_MOBILE]}>
              <em>This H2 is a H4 on desktop and H6 on mobile</em>
            </H2>
          </div>

          <div className="heading-demo__inner heading-demo__example">
            <H3>I18N</H3>
            <p>The Heading component gives you the option of defaulting a
               heading size in International languages.
               By passing these <strong>H*_DE H*_ES H*_FR</strong>. Headings will only
     respond when user is in that language config.
            </p>
            <p className="heading-demo__example--code">
              &lt;H4 as=&#123;[HEADING_TYPES.H5_DE,
              HEADING_TYPES.H4_ES, HEADING_TYPES.H6_FR]&#125;&gt;
              This H4 is an H5 in DE, a H4 in ES, and H6 in FR
              &lt;/H4&gt;
            </p>
            <p>
              <strong>Displays as:</strong>
            </p>
            <H4 as={[HEADING_TYPES.H5_DE,
              HEADING_TYPES.H4_ES, HEADING_TYPES.H6_FR]}
            >
              This H4 is an H5 in DE, a H4 in ES, and H6 in FR </H4>
            <p>
              Note: Go to the language selection and observe how the sizes change
              based on what language you select
            </p>
          </div>
        </article>
      </Tab>
    </Tabs>
  </div >
)

export default HeadingDemo
