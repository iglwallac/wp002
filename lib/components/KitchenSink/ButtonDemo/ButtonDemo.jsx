/* eslint-disable no-console */
import React from 'react'
import Button from 'components/Button'
import { ICON_TYPES } from 'components/Icon.v2'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { Tabs, Tab } from 'components/Tabs'
import { Button as ButtonV2, TYPES, SIZES } from 'components/Button.v2'
import { H5 } from 'components/Heading'

const ButtonDemo = () => (
  <div className="button-demo">
    <Tabs>
      <Tab label="Buttons">
        <article className="button-demo">
          <H5>Inline Buttons</H5>
          <div className="buttons-inline">
            <Button
              text={'Default'}
              buttonClass={['button--default']}
            />
            <Button
              url=""
              text={'Primary'}
              buttonClass={['button--primary']}
            />
            <Button
              text={'Secondary'}
              buttonClass={['button--secondary']}
            />
            <Button
              text={'Tertiary'}
              buttonClass={['button--tertiary']}
            />
            <Button
              text={'Low Contrast'}
              buttonClass={['button--low-contrast']}
            />
            <Button
              text={'Button Disabled'}
              buttonClass={['button--disabled']}
            />
            <Button
              text={'Ghost'}
              buttonClass={['button--ghost', 'button--with-icon']}
              iconClass={['icon--article']}
            />
            <ButtonV2
              type={TYPES.ICON_FILL}
              icon={ICON_TYPES.PLUS}
              size={SIZES.SMALL}
            />
            <ButtonV2
              type={TYPES.ICON_FILL}
              icon={ICON_TYPES.SHARE}
            />
            <ButtonV2
              type={TYPES.ICON_FILL}
              icon={ICON_TYPES.PHONE}
              size={SIZES.LARGE}
            />
          </div>

          <H5>Inverted Buttons</H5>

          <div className="buttons-inline buttons-inverted">
            <ButtonV2 type={TYPES.PRIMARY} inverted>
              Primary inverted
            </ButtonV2>
            <ButtonV2 type={TYPES.SECONDARY} inverted>
              Secondary inverted
            </ButtonV2>
          </div>

          <H5>Stacked Buttons</H5>

          <div className="buttons">
            <Button
              text={'Default'}
              buttonClass={['button--stacked', 'button--default']}
            />
            <Button
              text={'Primary'}
              buttonClass={['button--primary', 'button--stacked']}
            />
            <Button
              text={'Secondary'}
              buttonClass={['button--secondary', 'button--stacked']}
            />
            <Button
              text={'Tertiary'}
              buttonClass={['button--tertiary', 'button--stacked']}
            />
            <Button
              text={'Low Contrast'}
              buttonClass={['button--low-contrast', 'button--stacked']}
            />
            <Button
              text={'Button Disabled'}
              buttonClass={['button--disabled', 'button--stacked']}
            />
            <Button
              text={'Ghost'}
              buttonClass={[
                'button--ghost',
                'button--with-icon',
                'button--stacked',
              ]}
              iconClass={['icon--search']}
            />
          </div>

          <div className="buttons-small">
            <Button
              url=""
              text={'Small Default'}
              buttonClass={[
                'button--small',
                'button--stacked',
                'button--default',
              ]}
            />
            <Button
              text={'Small Primary'}
              buttonClass={[
                'button--primary',
                'button--stacked',
                'button--small',
                'button--stacked',
              ]}
            />
            <Button
              text={'Small Secondary'}
              buttonClass={[
                'button--secondary',
                'button--stacked',
                'button--small',
                'button--stacked',
              ]}
            />
            <Button
              text={'Small Tertiary'}
              buttonClass={[
                'button--tertiary',
                'button--stacked',
                'button--small',
                'button--stacked',
              ]}
            />
            <Button
              text={'Small Low Contrast'}
              buttonClass={[
                'button--low-contrast',
                'button--small',
                'button--stacked',
              ]}
            />
            <Button
              text={'Small Disabled'}
              buttonClass={[
                'button--disabled',
                'button--small',
                'button--stacked',
              ]}
            />
            <Button
              text={'Ghost'}
              buttonClass={[
                'button--small',
                'button--ghost',
                'button--with-icon',
                'button--stacked',
              ]}
              iconClass={['icon--search']}
            />
          </div>

          <div className="buttons-small">
            <Button
              text={'XSmall Default'}
              buttonClass={[
                'button--x-small',
                'button--stacked',
                'button--default',
              ]}
            />
            <Button
              text={'XSmall Primary'}
              buttonClass={[
                'button--primary',
                'button--stacked',
                'button--x-small',
                'button--stacked',
              ]}
            />
            <Button
              text={'XSmall Secondary'}
              buttonClass={[
                'button--secondary',
                'button--stacked',
                'button--x-small',
                'button--stacked',
              ]}
            />
            <Button
              text={'XSmall Tertiary'}
              buttonClass={[
                'button--tertiary',
                'button--stacked',
                'button--x-small',
                'button--stacked',
              ]}
            />
            <Button
              text={'XSmall Low Contrast'}
              buttonClass={[
                'button--low-contrast',
                'button--x-small',
                'button--stacked',
              ]}
            />
            <Button
              text={'Small Disabled'}
              buttonClass={[
                'button--disabled',
                'button--small',
                'button--stacked',
              ]}
            />
            <Button
              text={'Ghost'}
              buttonClass={[
                'button--x-small',
                'button--ghost',
                'button--with-icon',
                'button--stacked',
              ]}
              iconClass={['icon--search']}
            />
          </div>

          <div className="buttons-form">
            <H5>Form Buttons</H5>
            <FormButton
              formButtonClass={['form-button--primary']}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text={'Primary'}
            />
            <FormButton
              formButtonClass={['form-button--secondary']}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text={'Secondary'}
            />
            <FormButton
              formButtonClass={['form-button--tertiary']}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text={'Tertiary'}
            />
            <FormButton
              formButtonClass={['form-button--low-contrast']}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              text={'Low Contrast'}
              type={FORM_BUTTON_TYPE_SUBMIT}
            />
            <FormButton
              formButtonClass={['form-button--ghost']}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text={'Ghost'}
            />
          </div>
        </article>
      </Tab>
    </Tabs>
  </div>
)

export default ButtonDemo
