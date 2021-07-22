import React from 'react'
import { Tabs, Tab } from 'components/Tabs'
import SocialButton, { SOCIAL_BUTTON_TYPES, SOCIAL_BUTTON_SIZES } from 'components/SocialButton'

const CardDemo = () => (
  <div className="social-button-demo">
    <Tabs>
      <Tab label="Social Buttons">
        <div className="social-button-demo__container">
          <ul className="social-button-demo__row">
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.FACEBOOK}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.TWITTER}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.INSTAGRAM}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.YOUTUBE}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.LARGE}
                type={SOCIAL_BUTTON_TYPES.PINTEREST}
              />
            </li>
          </ul>
        </div>
        <div className="social-button-demo__container">
          <ul className="social-button-demo__row">
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.MEDIUM}
                type={SOCIAL_BUTTON_TYPES.FACEBOOK}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.MEDIUM}
                type={SOCIAL_BUTTON_TYPES.TWITTER}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.MEDIUM}
                type={SOCIAL_BUTTON_TYPES.INSTAGRAM}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.MEDIUM}
                type={SOCIAL_BUTTON_TYPES.YOUTUBE}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.MEDIUM}
                type={SOCIAL_BUTTON_TYPES.PINTEREST}
              />
            </li>
          </ul>
        </div>
        <div className="social-button-demo__container">
          <ul className="social-button-demo__row">
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.SMALL}
                type={SOCIAL_BUTTON_TYPES.FACEBOOK}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.SMALL}
                type={SOCIAL_BUTTON_TYPES.TWITTER}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.SMALL}
                type={SOCIAL_BUTTON_TYPES.INSTAGRAM}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.SMALL}
                type={SOCIAL_BUTTON_TYPES.YOUTUBE}
              />
            </li>
            <li>
              <SocialButton
                size={SOCIAL_BUTTON_SIZES.SMALL}
                type={SOCIAL_BUTTON_TYPES.PINTEREST}
              />
            </li>
          </ul>
        </div>
      </Tab>
    </Tabs>
  </div>
)

export default CardDemo
