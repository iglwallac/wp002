import React from 'react'
import PropTypes from 'prop-types'

const BELL_TYPES = {
  STROKE_HEAVY: 'STROKE_HEAVY',
  STROKE_LIGHT: 'STROKE_LIGHT',
  FILL: 'FILL',
}

const TITLE = 'Notification Alert Bell'
const DESC = 'Gaia Notification alert bell icon.'

function lightBell (props) {
  const { fill, size } = props
  return (
    <svg
      className="notifications__bell"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 29"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{TITLE}</title>
      <desc>{DESC}</desc>
      <g id="FINAL" stroke="none" strokeWidth="1" fill={fill} fillRule="evenodd">
        <g id="1.8.0_xl_Series-Shelf" transform="translate(-813.000000, -1403.000000)" fill={fill} fillRule="nonzero">
          <path d="M834.257143,1428.37143 L815.742857,1428.37143 L813,1428.37143 L813,1427 L815.742857,1424.94286 L815.742857,1415.34286 L815.766108,1415.34286 C816.072842,1410.83567 819.379843,1407.18752 823.628571,1406.53319 L823.628571,1404.37143 C823.628571,1403.61401 824.242581,1403 825,1403 C825.757419,1403 826.371429,1403.61401 826.371429,1404.37143 L826.371429,1406.53319 C830.620157,1407.18752 833.927158,1410.83567 834.233892,1415.34286 L834.257143,1415.34286 L834.257143,1424.94286 L837,1427 L837,1428.37143 L834.257143,1428.37143 Z M817.141277,1415.34286 L817.114286,1415.34286 L817.114286,1427 L832.885714,1427 L832.885714,1415.34286 L832.858723,1415.34286 C832.524795,1411.11918 829.133865,1407.8 825,1407.8 C820.866135,1407.8 817.475205,1411.11918 817.141277,1415.34286 Z M822.942857,1429.74286 L827.057143,1429.74286 C827.057143,1430.89555 826.137114,1431.82818 825,1431.82818 C823.862886,1431.82818 822.942857,1430.89555 822.942857,1429.74286 Z" id="Combined-Shape" />
        </g>
      </g>
    </svg>
  )
}

function heavyBell (props) {
  const { fill, size } = props
  return (
    <svg
      className="notifications__bell"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 28"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{TITLE}</title>
      <desc>{DESC}</desc>
      <g id="FINAL" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="1.0.0_xl_Notifications-Dropdown" transform="translate(-1010.000000, -16.000000)" fill={fill} fillRule="nonzero">
          <g id="Group-3" transform="translate(1007.000000, 15.000000)">
            <g id="outline-notification_important-24px">
              <g id="Outline" transform="translate(3.750000, 1.250000)">
                <g id="Group">
                  <path d="M8.7625,25.0125 C8.7625,26.3875 9.875,27.5 11.25,27.5 C12.625,27.5 13.7375,26.3875 13.7375,25.0125 L8.7625,25.0125 Z" id="Shape" />
                  <path d="M11.25,6.25 C14.7,6.25 17.5,9.05 17.5,12.5 L17.5,21.25 L5,21.25 L5,12.5 C5,9.05 7.8,6.25 11.25,6.25 Z M11.25,0.625 C10.2125,0.625 9.375,1.4625 9.375,2.5 L9.375,3.9625 C5.45,4.8125 2.5,8.3125 2.5,12.5 L2.5,20 L0,22.5 L0,23.75 L22.5,23.75 L22.5,22.5 L20,20 L20,12.5 C20,8.3125 17.05,4.8125 13.125,3.9625 L13.125,2.5 C13.125,1.4625 12.2875,0.625 11.25,0.625 Z" id="Shape" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

const NotificationsBell = React.memo((props) => {
  const { type } = props
  switch (type) {
    case BELL_TYPES.STROKE_HEAVY:
      return heavyBell(props)
    case BELL_TYPES.STROKE_LIGHT:
      return lightBell(props)
    default:
      return null
  }
})

NotificationsBell.propTypes = {
  fill: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
}

export default {
  NotificationsBell,
  BELL_TYPES,
}
