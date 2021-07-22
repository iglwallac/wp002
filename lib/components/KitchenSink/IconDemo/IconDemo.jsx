import React from 'react'
import Icon from 'components/Icon'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { Tabs, Tab } from 'components/Tabs'

const IconDemo = () => (
  <div className="icon-demo">
    <Tabs>
      <Tab label="Legacy Icons">
        <article className="icon-demo icon-demo__inner">
          <Icon iconClass={['icon--pagination-first']} />
          <Icon iconClass={['icon--pagination-left']} />
          <Icon iconClass={['icon--pagination-right']} />
          <Icon iconClass={['icon--pagination-last']} />
          <Icon iconClass={['icon--edit']} />
          <Icon iconClass={['icon--radio-active']} />
          <Icon iconClass={['icon--radio-inactive']} />
          <Icon iconClass={['icon--facebook']} />
          <Icon iconClass={['icon--instagram']} />
          <Icon iconClass={['icon--pinterest']} />
          <Icon iconClass={['icon--twitter']} />
          <Icon iconClass={['icon--youtube']} />
          <Icon iconClass={['icon--article']} />
          <Icon iconClass={['icon--guide']} />
          <Icon iconClass={['icon--audio']} />
          <Icon iconClass={['icon--sub']} />
          <Icon iconClass={['icon--cc']} />
          <Icon iconClass={['icon--recommend']} />
          <Icon iconClass={['icon--dots']} />
          <Icon iconClass={['icon--volume-slider']} />
          <Icon iconClass={['icon--add']} />
          <Icon iconClass={['icon--addtoplaylist']} />
          <Icon iconClass={['icon--removefromplaylist']} />
          <Icon iconClass={['icon--preview']} />
          <Icon iconClass={['icon--airplay']} />
          <Icon iconClass={['icon--closeplaylist']} />
          <Icon iconClass={['icon--closeplaylist-outline']} />
          <Icon iconClass={['icon--comment-heart']} />
          <Icon iconClass={['icon--comment']} />
          <Icon iconClass={['icon--episodes']} />
          <Icon iconClass={['icon--settings']} />
          <Icon iconClass={['icon--star']} />
          <Icon iconClass={['icon--heart-fill']} />
          <Icon iconClass={['icon--heart']} />
          <Icon iconClass={['icon--heart-x']} />
          <Icon iconClass={['icon--collapse']} />
          <Icon iconClass={['icon--openplaylist']} />
          <Icon iconClass={['icon--openplaylist-outline']} />
          <Icon iconClass={['icon--subtract']} />
          <Icon iconClass={['icon--check']} />
          <Icon iconClass={['icon--check-active']} />
          <Icon iconClass={['icon--close']} />
          <Icon iconClass={['icon--right']} />
          <Icon iconClass={['icon--up']} />
          <Icon iconClass={['icon--info']} />
          <Icon iconClass={['icon--menu']} />
          <Icon iconClass={['icon--pause-fill']} />
          <Icon iconClass={['icon--pause-outline']} />
          <Icon iconClass={['icon--logout']} />
          <Icon iconClass={['icon--login']} />
          <Icon iconClass={['icon--download']} />
          <Icon iconClass={['icon--search']} />
          <Icon iconClass={['icon--expand']} />
          <Icon iconClass={['icon--left']} />
          <Icon iconClass={['icon--down']} />
          <Icon iconClass={['icon--play-fill']} />
          <Icon iconClass={['icon--play-outline']} />
          <Icon iconClass={['icon--refresh']} />
          <Icon iconClass={['icon--rewind10']} />
          <Icon iconClass={['icon--share']} />
          <Icon iconClass={['icon--volume-full']} />
          <Icon iconClass={['icon--volume-low']} />
          <Icon iconClass={['icon--volume-null']} />
        </article>
      </Tab>
      <Tab label="V2 Icons">
        <article className="icon-demo icon-demo__inner icon-demo__V2">
          <IconV2 type={ICON_TYPES.AIRPLAY} />
          <IconV2 type={ICON_TYPES.ALERT} />
          <IconV2 type={ICON_TYPES.ALERT_OUTLINE} />
          <IconV2 type={ICON_TYPES.ARROW_DOWN} />
          <IconV2 type={ICON_TYPES.ARROW_DOWN_OUTLINE} />
          <IconV2 type={ICON_TYPES.ARROW_UP} />
          <IconV2 type={ICON_TYPES.ARROW_UP_OUTLINE} />
          <IconV2 type={ICON_TYPES.ARTICLE} />
          <IconV2 type={ICON_TYPES.BELL} />
          <IconV2 type={ICON_TYPES.BELL_OFF} />
          <IconV2 type={ICON_TYPES.BODY} />
          <IconV2 type={ICON_TYPES.BROWSE} />
          <IconV2 type={ICON_TYPES.CAMERA} />
          <IconV2 type={ICON_TYPES.CHECK} />
          <IconV2 type={ICON_TYPES.CHECKBOX_CHECKED} />
          <IconV2 type={ICON_TYPES.CHEVRON_DOWN} />
          <IconV2 type={ICON_TYPES.CHEVRON_LEFT} />
          <IconV2 type={ICON_TYPES.CHEVRON_RIGHT} />
          <IconV2 type={ICON_TYPES.CHEVRON_UP} />
          <IconV2 type={ICON_TYPES.CLOCK} />
          <IconV2 type={ICON_TYPES.CLOSE} />
          <IconV2 type={ICON_TYPES.CLOSE_2} />
          <IconV2 type={ICON_TYPES.COLLAPSE} />
          <IconV2 type={ICON_TYPES.COMMENT} />
          <IconV2 type={ICON_TYPES.COMMENT_OUTLINE} />
          <IconV2 type={ICON_TYPES.CONSCIOUSNESS} />
          <IconV2 type={ICON_TYPES.COPY} />
          <IconV2 type={ICON_TYPES.DELETE} />
          <IconV2 type={ICON_TYPES.DOWNLOAD} />
          <IconV2 type={ICON_TYPES.ELLIPSIS} />
          <IconV2 type={ICON_TYPES.EMBED} />
          <IconV2 type={ICON_TYPES.EMAIL} />
          <IconV2 type={ICON_TYPES.EPISODES} />
          <IconV2 type={ICON_TYPES.EXPAND} />
          <IconV2 type={ICON_TYPES.EYE} />
          <IconV2 type={ICON_TYPES.FLAG} />
          <IconV2 type={ICON_TYPES.FRIENDS} />
          <IconV2 type={ICON_TYPES.GROWTH} />
          <IconV2 type={ICON_TYPES.GUIDE} />
          <IconV2 type={ICON_TYPES.HEADPHONES} />
          <IconV2 type={ICON_TYPES.HEALING} />
          <IconV2 type={ICON_TYPES.HEART} />
          <IconV2 type={ICON_TYPES.HEART_OFF} />
          <IconV2 type={ICON_TYPES.HEART_FILL} />
          <IconV2 type={ICON_TYPES.HEART_OUTLINE} />
          <IconV2 type={ICON_TYPES.HIDE} />
          <IconV2 type={ICON_TYPES.HIDE_2} />
          <IconV2 type={ICON_TYPES.HOME} />
          <IconV2 type={ICON_TYPES.HOURGLASS} />
          <IconV2 type={ICON_TYPES.INFO} />
          <IconV2 type={ICON_TYPES.LIBRARY} />
          <IconV2 type={ICON_TYPES.LINK} />
          <IconV2 type={ICON_TYPES.LOGIN} />
          <IconV2 type={ICON_TYPES.LOGOUT} />
          <IconV2 type={ICON_TYPES.MEDICINE} />
          <IconV2 type={ICON_TYPES.MENU} />
          <IconV2 type={ICON_TYPES.METAPHYSICS} />
          <IconV2 type={ICON_TYPES.MIC} />
          <IconV2 type={ICON_TYPES.MIND} />
          <IconV2 type={ICON_TYPES.MINUS} />
          <IconV2 type={ICON_TYPES.ORIGINS} />
          <IconV2 type={ICON_TYPES.PDF} />
          <IconV2 type={ICON_TYPES.PENCIL} />
          <IconV2 type={ICON_TYPES.PHONE} />
          <IconV2 type={ICON_TYPES.PLAY} />
          <IconV2 type={ICON_TYPES.PLAY_CIRCLE} />
          <IconV2 type={ICON_TYPES.PLUS} />
          <IconV2 type={ICON_TYPES.PREVIEW} />
          <IconV2 type={ICON_TYPES.RECOMMEND} />
          <IconV2 type={ICON_TYPES.RENAME} />
          <IconV2 type={ICON_TYPES.SCHEDULE} />
          <IconV2 type={ICON_TYPES.SEARCH} />
          <IconV2 type={ICON_TYPES.SECRETS} />
          <IconV2 type={ICON_TYPES.SHARE} />
          <IconV2 type={ICON_TYPES.FACEBOOK} />
          <IconV2 type={ICON_TYPES.INSTAGRAM} />
          <IconV2 type={ICON_TYPES.PINTEREST} />
          <IconV2 type={ICON_TYPES.REDDIT} />
          <IconV2 type={ICON_TYPES.TWITTER} />
          <IconV2 type={ICON_TYPES.YOUTUBE} />
          <IconV2 type={ICON_TYPES.SPIRIT} />
          <IconV2 type={ICON_TYPES.TV} />
          <IconV2 type={ICON_TYPES.UNEXPLAINED} />
          <IconV2 type={ICON_TYPES.YOGA} />
          <IconV2 type={ICON_TYPES.PRINTER} />
          <IconV2 type={ICON_TYPES.CIRCULAR_ADD} />
          <IconV2 type={ICON_TYPES.CIRCULAR_BELL_OFF} />
          <IconV2 type={ICON_TYPES.CIRCULAR_CHECK} />
          <IconV2 type={ICON_TYPES.CIRCULAR_CHEVRON_LEFT} />
          <IconV2 type={ICON_TYPES.CIRCULAR_CHEVRON_RIGHT} />
          <IconV2 type={ICON_TYPES.CIRCULAR_COMMENTS} />
          <IconV2 type={ICON_TYPES.CIRCULAR_DETAILS} />
          <IconV2 type={ICON_TYPES.CIRCULAR_ERROR} />
          <IconV2 type={ICON_TYPES.CIRCULAR_EXPAND} />
          <IconV2 type={ICON_TYPES.CIRCULAR_MINIMIZE} />
          <IconV2 type={ICON_TYPES.CIRCULAR_FOLLOW_BELL} />
          <IconV2 type={ICON_TYPES.CIRCULAR_PLAY} />
          <IconV2 type={ICON_TYPES.CIRCULAR_PREVIEW} />
          <IconV2 type={ICON_TYPES.CIRCULAR_REMOVE} />
          <IconV2 type={ICON_TYPES.CIRCULAR_SERIES} />
          <IconV2 type={ICON_TYPES.CIRCULAR_SHARE} />
          <IconV2 type={ICON_TYPES.CLOCK_FILL} />
          <IconV2 type={ICON_TYPES.STAR_FILL} />
        </article>
      </Tab>
      <Tab label="More Info">
        <article className="icon-demo icon-demo__inner icon-demo__more-info">
          <p>
            We are transitioning to the new V2 version of Icons. Please discontinue using the
            &quot;gaia-icons&quot; font and gaia-icon-variables.scss in lib/theme/web-app. Our
            new icon font is called &quot;Icons&quot;. We no longer add icons to
            gaia-icon-variables.scss, instead we add them to lib/theme/mixins/_icons.scss.
          </p>
          <p>
            To add new icons to the Icons font:
          </p>
          <ol>
            <li className="icon-demo__li">
              To preserve the unicodes of our exisiting icons you must first upload lib &rarr;
              theme &rarr; web-app &rarr; fonts &rarr; Icons &rarr; selection.json to the
              https://icomoon.io app.  Begin by navigating to
              <a href="https://icomoon.io/app">https://icomoon.io/app</a>,
              then click the &quot;Import Icons&quot; button (top left in purple), and
              then choose <pre>lib/theme/web-app/fonts/Icons/selection.json</pre>
            </li>
            <li className="icon-demo__li">
              <div className="icon-demo__img icon-demo__img--import" />
              Click the hamburger menu to the right side of your imported icon set and choose
              &quot;Import to Set&quot;. Then select the SVG files you intend to upload from your
              computer.
            </li>
            <li className="icon-demo__li">
              <div className="icon-demo__img icon-demo__img--pencil" />
              Use the edit tool (it looks like a pencil) to name the icons appropriately.
            </li>
            <li className="icon-demo__li">
              <div className="icon-demo__img icon-demo__img--rearrange" />
              Using the hamburger menu on the right side once again, select
              &quot;Rearrange Icons&quot; and sort them by name (alphabetically).
            </li>
            <li className="icon-demo__li">
              <div className="icon-demo__img icon-demo__img--desaturate" />
              While in edit mode, use the color tool to desaturate your icons if that option is
              available. It looks like a droplet (if you do not see that option then your icon is
              already desaturated). Note: If the downloaded svg file is missing icon names,
              it might be because you need to remove colors.
            </li>
            <li className="icon-demo__li">
              <div className="icon-demo__img icon-demo__img--select" />
              Using the selection tool, make sure your entire set is selected (will appear
              highlighted yellow), and then use the bottom &quot;Generate Font&quot; button to
              download the updated Icons font.
            </li>
            <li className="icon-demo__li">
              Keep the &quot;Generate Font&quot; page open because you will need to reference the
              hex id when adding icon to the mixin/_icons.scss file.
            </li>
            <li className="icon-demo__li">
              Remove all folders and files from the downloaded &quot;Icons&quot; folder except for
              the &quot;fonts&quot; folder, &quot;selection.json&quot; and &quot;style.css&quot;.
              If you skip this step your build will have linter errors.
            </li>
            <li className="icon-demo__li">
              Replace the old &quot;Icons&quot; folder with your new one.
            </li>
            <li className="icon-demo__li">
              Add your new icons to the mixins, Icon.v2, Icon.v2 css, and the kitchen sink
              icons demo: theme/mixins/_icons.scss, Icon.v2/Icon.jsx,
              lib/components/Icon.v2/_Icon.scss,
              IconDemo/IconDemo.jsx. Be careful if overwriting icons with the same name.
            </li>
            <li className="icon-demo__li">
              <div className="icon-demo__img icon-demo__img--check" />
              Caution: There have been cases of unicodes being overwritten which causes existing
              icons to render incorrectly. <b>Please take the time to check that the icons
              appear to be rendering correctly by hovering over each icon in the v2 icon tab of
              the kitchen sink with the inspector and checking the classname.</b> If there are
              unicode issues you will need to update the icons mixins file to reflect the new codes.
              This is tedious and there may be a better way - if you improve this process please
              update the instructions here.
            </li>
          </ol>
          <p>
            Alternatively you may add a new SVG file to lib &rarr; theme &rarr; web-app &rarr; svg.
            This may be preferred if you expect the SVG will not be used much more than once and
            does not need to be included in the Icon font for future reuse.
          </p>
        </article>
      </Tab>
    </Tabs>
  </div>
)

export default IconDemo
