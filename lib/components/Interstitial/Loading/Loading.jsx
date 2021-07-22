import React from 'react'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo'

export default function Loading () {
  return (
    <div className="interstitial-loading">
      <Sherpa type={TYPE_LARGE} />
      <GaiaLogo type={TYPE_WHITE} />
    </div>
  )
}
