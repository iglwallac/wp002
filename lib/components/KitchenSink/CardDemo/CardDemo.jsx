import React from 'react'
import { Tabs, Tab } from 'components/Tabs'
import { STATES, CONTROLS, Card } from 'components/Card'
import Button from 'components/Button'
import { H4 } from 'components/Heading'

const CardDemo = () => (
  <div className="card-demo">
    <Tabs>
      <Tab label="Card">
        <div className="card-demo__card">
          <Card>
            <H4>Non Editable Card</H4>
            This is a card that is not editable. Notice the drop shadow and breakpoints.
          </Card>
        </div>
        <div className="card-demo__card">
          <Card
            editable
            state={STATES.EDITING}
          >
            {(editState, toggleState) => (
              editState === STATES.DISPLAY
                ? (<div>
                  This is the display view.
                </div>)
                : (<div className="card-demo__padding">
                  <H4>Expanded Card</H4>
                  This is an expanded card. With the card&#39;s &quot;toggle&quot; function, you
                  can close the card from the parent component.
                  <Button
                    buttonClass={['button--default',
                      'card-demo__cancel-btn']}
                    text="Cancel"
                    onClick={toggleState}
                  />
                </div>)
            )}
          </Card>
        </div>
        <div className="card-demo__card">
          <Card
            editable
            editControl={CONTROLS.UPDATE}
            displayControl={CONTROLS.DONE}
          >
            {editState => (
              editState === STATES.EDITING
                ? (<div>This is the edit view.</div>)
                : (<div>
                  <H4>Non Default Type Card</H4>
                  This is the display view of a card with an editControl prop of &quot;update&quot;.
                  Notice that this has changed the default &quot;Edit&quot; text in the card header.
                  Edit is the default if no type prop is passed. &quot;Change&quot; and
                  &quot;Update&quot; are other options. This card also has an alternative
                  displayControl prop that changes the default text from &quot;Cancel&quot; to
                  &quot;Done&quot;.
                </div>)
            )}
          </Card>
        </div>
        <div className="card-demo__card">
          <Card
            editable
            transparent
            editControl={CONTROLS.ICON_EDIT}
            displayControl={CONTROLS.ICON_DONE}
          >
            {editState => (
              editState === STATES.EDITING
                ? (<div>This is the edit view.</div>)
                : (<div>
                  <H4>Transparent Editable Card</H4>
                  This is the display view of a transparent card with an editControl prop of
                  &quot;icon&quot;. Notice that this has changed the default &quot;Edit&quot;
                  text in the card header. The edit mode toggle can be triggered by clicking
                  anywhere in the card body.
                </div>)
            )}
          </Card>
        </div>
      </Tab>
    </Tabs>
  </div>
)

export default CardDemo
