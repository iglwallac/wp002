import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _forEach from 'lodash/forEach'
import _partial from 'lodash/partial'
import _get from 'lodash/get'
import _findIndex from 'lodash/findIndex'
import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import _isUndefined from 'lodash/isUndefined'
import { get as getConfig } from 'config'
import { log as logError } from 'log/error'
import {
  add as smfAdd,
  update as smfUpdate,
} from 'services/video-analytics'

export const PLUGIN_NAME = 'SmfAnalytics'

const config = getConfig()
const MAX_EVENT_SIZE = 1500 // more than this is rediculous-would be thrown out (payload too large)

// Define a container object and defaults for SMF Player methods and properties.
const SmfAnalytics = {
  uid: null,
  trackingData: null,
  anonymousUuid: null,
  unloadListener: null,
  mediaIsOpening: false,
  preEvents: [],
  events: [],
  nid: null,
  extraNid: null,
  stId: null,
  stVAUuid: null,
  stToken: null,
  lastPollInterval: null,
  pollInterval: 6000,
  histogramResolution: 30000,
  lastSeekPosition: null,
  lastSeekUpd: 0,
  beaconInterval: 60000,
  position: 0,
  eventInterval: 180000,
  lastPosition: null,
  lastPositionUpd: 0,
  lastEventUpd: 0,
  errorCode: null,
  errorMsg: null,
}

SmfAnalytics.init = function smfAnalyticsInit (
  uid,
  jwt,
  nid,
  extraNid,
  mediaUrl,
  mediaLang,
  nodeInfoDefault,
  nodeInfoPreview,
  nodeInfoFeature,
  externalPlayEvent,
  playbackSpeedUsed,
  pictureInPictureToggled,
  anonymousUuid,
) {
  SmfAnalytics.reset()
  SmfAnalytics.nid = nid
  SmfAnalytics.jwt = jwt
  SmfAnalytics.extraNid = extraNid
  SmfAnalytics.mediaUrl = mediaUrl
  SmfAnalytics.uid = uid
  SmfAnalytics.trackingData = { nodeInfo: {} }
  SmfAnalytics.trackingData.nodeInfo['node' + nodeInfoDefault.nodeId] = nodeInfoDefault
  SmfAnalytics.trackingData.nodeInfo['node' + nodeInfoPreview.nodeId] = nodeInfoPreview
  SmfAnalytics.trackingData.nodeInfo['node' + nodeInfoFeature.nodeId] = nodeInfoFeature
  SmfAnalytics.preEvents.push(createEvent('EmbedPlayer'))
  SmfAnalytics.externalPlayEvent = externalPlayEvent
  SmfAnalytics.playbackSpeedUsed = playbackSpeedUsed
  SmfAnalytics.pictureInPictureToggled = pictureInPictureToggled
  SmfAnalytics.anonymousUuid = anonymousUuid
  SmfAnalytics.mediaLang = mediaLang
}

SmfAnalytics.reset = function smfAnalyticsReset () {
  SmfAnalytics.events = []
  SmfAnalytics.preEvents = []
  SmfAnalytics.mediaIsOpening = false
  SmfAnalytics.stId = null
  SmfAnalytics.stVAUuid = null
  SmfAnalytics.stToken = null
  SmfAnalytics.lastPosition = null
  SmfAnalytics.lastSeekPosition = null
  SmfAnalytics.lastSeekUpd = 0
  SmfAnalytics.sleepCount = 0
  SmfAnalytics.seekCount = 0
  SmfAnalytics.timecodeHistory = []
  SmfAnalytics.timerJitter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  SmfAnalytics.timerJitter2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  SmfAnalytics.pollJitter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  SmfAnalytics.pollJitter2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  SmfAnalytics.errorCode = null
  SmfAnalytics.errorMsg = null
}

SmfAnalytics.stAdd = function smfAnalyticsStAdd (type, nid, extraNid) {
  if (_isUndefined(nid) || nid === null) {
    SmfAnalytics.reset()
    return
  }
  // Flush events before resetting if not empty.
  if (SmfAnalytics.events.length > 0) {
    SmfAnalytics.finalStUpd({ cleanup: true })
  }
  // Save pre events to be used as initial events.
  const events = _cloneDeep(SmfAnalytics.preEvents)
  // Reset internal tracking variables.
  SmfAnalytics.reset()
  // Add pre events to the beginning of events then clear pre-events.
  SmfAnalytics.events = events
  const smfData = {
    location: document ? _get(document, 'location.href', '') : '',
    anonymousUuid: SmfAnalytics.anonymousUuid,
    viewerId: SmfAnalytics.uid,
    language: SmfAnalytics.mediaLang,
    type,
  }
  if (!_isUndefined(extraNid) && extraNid !== null) {
    smfData.extraNid = extraNid
  }
  const vaData = smfData // make copy for VA
  smfAdd({ id: nid, data: vaData, auth: SmfAnalytics.jwt })
    .then(function onSuccessSmfAddVA (data) {
      // Check for success.
      if (data.status == 1) {
        SmfAnalytics.stId = _get(data, 'row.id')
        SmfAnalytics.stToken = _get(data, 'token')
        SmfAnalytics.stVAUuid = _get(data, 'row.uuid')
        // Cleanup the session when the page is unloaded.
        SmfAnalytics.setUnloadListener()
        SmfAnalytics.initPositionBeacon()

        if (typeof SmfAnalytics.externalPlayEvent === 'function') {
          SmfAnalytics.externalPlayEvent(SmfAnalytics.stId)
        }
      }
    })
}

SmfAnalytics.stUpd = function smfAnalyticsStUpd (data) {
  const stVAIdValid = _isString(SmfAnalytics.stVAUuid) && SmfAnalytics.stVAUuid.length > 31
  const stIdValid = _isNumber(SmfAnalytics.stId) && SmfAnalytics.stId > 0
  const stTokenValid = _isString(SmfAnalytics.stToken) && SmfAnalytics.stToken.length === 32
  if (stVAIdValid && stTokenValid) {
    try {
      const sendData = { JSON: JSON.stringify(data) }
      smfUpdate({
        stId: SmfAnalytics.stVAUuid,
        stToken: SmfAnalytics.stToken,
        data: sendData,
        auth: SmfAnalytics.jwt
      })
        .then(function onStUpdSuccessVA (res) {
          // Stop sending data if beacon set...server detected bad data.
          if (res.stopBeacon) {
            // Used to set SmfAnalytics.stopBeacon
            SmfAnalytics.stopPositionBeacon()
          }
        })
    }
    catch (e) {
      logError('Unable to stringify data for StUpd for service=VA')
    }
  }
  SmfAnalytics.updatePositionTracking(data.position)
}

SmfAnalytics.createStData = function smfAnalyticsCreateStData (inData, getExtended, now) {
  if (_isUndefined(inData)) {
    inData = {}
  }
  if (_isUndefined(now)) {
    now = getCurrentTimeStamp()
  }

  const addData = {
    lastPlayState: SmfAnalytics.events.slice(-1)[0].name,
    position: SmfAnalytics.lastPosition
  }
  if (!_isUndefined(SmfAnalytics.anonymousUuid)) {
    addData.anonymousUuid = SmfAnalytics.anonymousUuid
  }
  if (!_isUndefined(SmfAnalytics.errorCode) && SmfAnalytics.errorCode !== null) {
    addData.irdetoCode = SmfAnalytics.errorCode
  }
  if (!_isUndefined(SmfAnalytics.errorMsg) && SmfAnalytics.errorMsg !== null) {
    addData.irdetoMsg = SmfAnalytics.errorMsg
  }

  const outData = _assign(_cloneDeep(inData), addData)
  if (getExtended) {
    SmfAnalytics.addExtendedData(outData, now)
  }
  return outData
}

SmfAnalytics.onWindowUnload = function smfAnalyticsOnWindowUnload () {
  SmfAnalytics.finalStUpd({ cleanup: true })
}

SmfAnalytics.setUnloadListener = function smfAnalyticsSetUnloadListener () {
  if (window && !SmfAnalytics.unloadListener) {
    window.addEventListener('beforeunload', SmfAnalytics.onWindowUnload)
    SmfAnalytics.unloadListener = true
  }
}

SmfAnalytics.unsetUnloadListener = function smfAnalyticsUnsetUnloadListener () {
  if (SmfAnalytics.unloadListener) {
    window.removeEventListener('beforeunload', SmfAnalytics.onWindowUnload)
    SmfAnalytics.unloadListener = null
  }
}

SmfAnalytics.addExtendedData = function smfAnalyticsAddExtendedData (data, now) {
  if (_isUndefined(now)) {
    now = getCurrentTimeStamp()
  }

  _assign(data, {
    sleepCount: SmfAnalytics.sleepCount,
    seekCount: SmfAnalytics.seekCount,
    histogram: {
      timecodeHistory: SmfAnalytics.timecodeHistory,
      histogramInterval: SmfAnalytics.pollInterval,
      histogramResolution: SmfAnalytics.histogramResolution,
    },
    timerJitter: SmfAnalytics.timerJitter,
    timerJitter2: SmfAnalytics.timerJitter2,
    pollJitter: SmfAnalytics.pollJitter,
    pollJitter2: SmfAnalytics.pollJitter2,
    lastEventUpd: now,
    events: SmfAnalytics.events,
  })
}

SmfAnalytics.finalStUpd = function smfAnalyticsFinalStUpd (data) {
  const now = getCurrentTimeStamp()
  SmfAnalytics.lastPosition = SmfAnalytics.position
  SmfAnalytics.lastPositionUpd = now
  SmfAnalytics.stUpd(SmfAnalytics.createStData(data, true, now))
}

SmfAnalytics.initPositionBeacon = function smfAnalyticsInitPositionBeacon (pollInterval) {
  SmfAnalytics.clearPositionTimeout()
  pollInterval = pollInterval || SmfAnalytics.pollInterval / 2
  // Fudge these a little so we don't miss them by a few ms.
  const beaconInterval = SmfAnalytics.beaconInterval - 200
  const eventInterval = SmfAnalytics.eventInterval - 200
  if (!_isUndefined(SmfAnalytics.stId) && !_isUndefined(SmfAnalytics.stToken)) {
    SmfAnalytics.timerId = setTimeout(_partial(SmfAnalytics.timerCallback, pollInterval, beaconInterval, eventInterval), pollInterval)
  }
}

SmfAnalytics.timerCallback = function smfAnalyticsTimerCallback (pollInterval, beaconInterval, eventInterval) {
  SmfAnalytics.lastPollInterval = pollInterval
  const now = getCurrentTimeStamp()
  // Need this for BC player errors or when the player doesn't load.
  const position = SmfAnalytics.position || 0
  // Detect seeks and time warps.
  if (!_isUndefined(SmfAnalytics.lastSeekPosition) && SmfAnalytics.lastSeekUpd > 0) {
    // Difference in time since timer timeout.
    const timerSeekDiff = now - SmfAnalytics.lastSeekUpd
    // Difference in player position since timer timeout.
    const playerSeekDiff = position * 1000 - SmfAnalytics.lastSeekPosition
    // The difference between time and player position is how far they seeked.
    const seekMs = playerSeekDiff - timerSeekDiff
    const pollWindow = SmfAnalytics.pollInterval * 2 // The largest pollInterval we expect.

    const timerJitterBin = getJitterBin(timerSeekDiff - pollInterval)
    const timerJitterBin2 = getJitterBin2(timerSeekDiff - pollInterval)
    SmfAnalytics.timerJitter[timerJitterBin]++
    SmfAnalytics.timerJitter2[timerJitterBin2]++

    // Detect time warps backward greater than 400 ms or forward greater than pollInterval + 40 seconds.
    if (timerSeekDiff < -400 || timerSeekDiff > pollInterval + 40000) {
      SmfAnalytics.sleepCount++

      // Search for an event after lastSeekUpd poll window.
      let i
      for (i = 0; i < SmfAnalytics.events.length; i++) {
        if (SmfAnalytics.events[i].timestamp > SmfAnalytics.lastSeekUpd + pollWindow) {
          break
        }
      }
      // We want the previous event.
      i -= 1
      // And if that event was within the same pool window as lastSeekUpd, assume this was the real sleep timestamp.
      let sleepTimestamp = SmfAnalytics.lastSeekUpd
      if (SmfAnalytics.events[i].timestamp > SmfAnalytics.lastSeekUpd && SmfAnalytics.events[i].timestamp - SmfAnalytics.lastSeekUpd < pollWindow) {
        sleepTimestamp = SmfAnalytics.events[i].timestamp
      }
      // Splice in a new sleeping event after the found event.
      SmfAnalytics.events.splice(i + 1, 0, createEvent('Sleeping', sleepTimestamp, { timeWarp: 1 }))

      // Continue search for an event within the current poll window.
      // i is set in the previous for loop
      for (i; i < SmfAnalytics.events.length; i++) {
        if (SmfAnalytics.events[i].timestamp > now || now - SmfAnalytics.events[i].timestamp < pollWindow) {
          break
        }
      }

      // Splice in a playing event before the found event, but not if it was also playing.
      if (i >= SmfAnalytics.events.length || SmfAnalytics.events[i].name != 'Playing') {
        SmfAnalytics.events.splice(i + 1, 0, createEvent('Playing', now, { timeWarp: 1 }))
      }
    }
    // Detect seeks greater than 1500 ms in either direction.
    else if (seekMs < -1500 || seekMs > 1500) {
      SmfAnalytics.seekCount++
    }
  }
  SmfAnalytics.lastSeekPosition = position * 1000
  SmfAnalytics.lastSeekUpd = now

  // Increment a timecode histogram bin.
  const bin = Math.floor((position * 1000) / SmfAnalytics.histogramResolution)
  if (_isUndefined(SmfAnalytics.timecodeHistory[bin])) {
    SmfAnalytics.timecodeHistory[bin] = 1
  }
  else {
    SmfAnalytics.timecodeHistory[bin]++
  }

  // Call stUpd() if beaconInterval has been reached.
  if (!_isUndefined(beaconInterval) && (now - SmfAnalytics.lastPositionUpd) > beaconInterval) {
    SmfAnalytics.lastPosition = SmfAnalytics.position
    SmfAnalytics.lastPositionUpd = now
    const data = SmfAnalytics.createStData({}, false, now)

    // Send events and histrogram data if eventInterval has been reached.
    // @todo Add SmfAnalytics.lastEventUpd to resetEvents()? Does not send extended data
    //    on the first st update.
    if (!_isUndefined(eventInterval) && (now - SmfAnalytics.lastEventUpd) > eventInterval) {
      SmfAnalytics.addExtendedData(data)
      SmfAnalytics.lastEventUpd = now
    }

    SmfAnalytics.stUpd(data)
  }

  // The next poll interval is specified to land within histrogram bin boundries (a sort of PLL).
  const nextPollInterval = Math.round(SmfAnalytics.pollInterval * 1.5 - ((position * 1000) % SmfAnalytics.pollInterval))

  // Store poll interval jitter stats.
  const jitterBin = getJitterBin(nextPollInterval - SmfAnalytics.pollInterval)
  const jitterBin2 = getJitterBin2(nextPollInterval - SmfAnalytics.pollInterval)
  SmfAnalytics.pollJitter[jitterBin]++
  SmfAnalytics.pollJitter2[jitterBin2]++
  SmfAnalytics.timerId = setTimeout(_partial(SmfAnalytics.timerCallback, nextPollInterval, beaconInterval, eventInterval), nextPollInterval)
}

SmfAnalytics.startPositionBeacon = function smfAnalyticsStartPositionBeacon () {
  SmfAnalytics.initPositionBeacon(SmfAnalytics.lastPollInterval)
}

SmfAnalytics.stopPositionBeacon = function smfAnalyticsStopPositionBeacon () {
  SmfAnalytics.clearPositionTimeout()
}

SmfAnalytics.clearPositionTimeout = function smfAnalyticsClearPositionTimeout () {
  // Clear any existing timer before starting a new one.
  if (!_isUndefined(SmfAnalytics.timerId)) {
    clearTimeout(SmfAnalytics.timerId)
    SmfAnalytics.timerId = null
    delete SmfAnalytics.timerId
  }
}

SmfAnalytics.updatePositionTracking = function smfAnalyticsUpdatePositionTracking (position) {
  if (position && position > 0) {
    const nodeInfo = SmfAnalytics.trackingData.nodeInfo['node' + SmfAnalytics.nid]
    nodeInfo.resumePosition = position
  }
}

SmfAnalytics.setPosition = function smfAnalyticsSetPosition (position) {
  SmfAnalytics.position = position
}

SmfAnalytics.playerReady = function smfAnalyticsPlayerReady () {
  SmfAnalytics.preEvents.push(createEvent('PlayerReady'))
  // Fake the player position because we're making VJS events fit into SMF player framework.
  SmfAnalytics.lastPosition = 0
}

SmfAnalytics.opening = function smfAnalyticsOpening () {
  // The opening event is the start of new media. All events from this point forward need to be
  // stored as preEvents so they don't interfere with events from the last media title. stAdd
  // moves preEvents to events before sending the stats add.
  // Opening always goes to preEvents.
  SmfAnalytics.preEvents.push(createEvent('Opening'))
  SmfAnalytics.mediaIsOpening = true
}

SmfAnalytics.startSession = function smfAnalyticsStartSession () {
  // stAdd() sets SmfAnalytics.mediaIsOpening false.
  SmfAnalytics.stAdd('vjs4-webapp', SmfAnalytics.nid, SmfAnalytics.extraNid)
}

SmfAnalytics.pushEvent = function smfAnalyticsPushEvent (eventName, additionProps) {
  // Add event to proper events array.
  const stack = SmfAnalytics.preEvents.length > 0 && SmfAnalytics.mediaIsOpening ? SmfAnalytics.preEvents : SmfAnalytics.events
  if (stack.length < MAX_EVENT_SIZE) {
    stack.push(createEvent(eventName, null, additionProps))
  }
}

SmfAnalytics.stopped = function smfAnalyticsStopped () {
  SmfAnalytics.pushEvent('Stopped')
  SmfAnalytics.stopPositionBeacon()
  SmfAnalytics.finalStUpd()
}

SmfAnalytics.playing = function smfAnalyticsPlaying () {
  SmfAnalytics.pushEvent('Playing')
  // Send status updates to server.
  SmfAnalytics.startPositionBeacon()
}

SmfAnalytics.paused = function smfAnalyticsPaused () {
  SmfAnalytics.pushEvent('Paused')
  // Stop sending status updates.
  SmfAnalytics.stopPositionBeacon()
}

SmfAnalytics.texttrackshow = function smfAnalyticsTexttrackshow (kind, lang) {
  SmfAnalytics.pushEvent('ShowTextTrack', {
    kind,
    lang
  })
}

SmfAnalytics.rateChange = function smfAnalyticsRateChange (rate) {
  switch (rate) {
    case 1.0:
      SmfAnalytics.pushEvent('ChangeSpeed1.0x')
      break
    case 1.5:
      SmfAnalytics.pushEvent('ChangeSpeed1.5x')
      break
    case 2.0:
      SmfAnalytics.pushEvent('ChangeSpeed2.0x')
      break
  }
  if (typeof SmfAnalytics.playbackSpeedUsed === 'function') {
    SmfAnalytics.playbackSpeedUsed(SmfAnalytics.stId, rate)
  }
}

SmfAnalytics.togglePictureInPicture = function smfAnalyticsTogglePictureInPicture (isToggledOn) {
  // console.log("PICTURE IN PICTURE IS TOGGLED: " + isToggledOn)
  if (isToggledOn) {
    SmfAnalytics.pushEvent('ViewMode', { kind: 'PIPOn' })
  } else {
    SmfAnalytics.pushEvent('ViewMode', { kind: 'PIPOff' })
  }
  if (typeof SmfAnalytics.pictureInPictureToggled === 'function') {
    SmfAnalytics.pictureInPictureToggled(SmfAnalytics.stId, isToggledOn)
  }
}

SmfAnalytics.mediaFailed = function smfAnalyticsMediaFailed (errorCode, errorMessage) {
  // preEvents rather than the events for the previous item.
  const stack = SmfAnalytics.preEvents.length > 0 ? SmfAnalytics.preEvents : SmfAnalytics.events
  // check for first time we have this event (only report ONCE!!!)
  if (_findIndex(stack, { name: 'MediaFailed' }) >= 0) {
    // if we have already reported error, don't keep sending to server!!!
    return
  }
  if (stack.length < MAX_EVENT_SIZE) {
    stack.push(createEvent('MediaFailed'))
  }
  SmfAnalytics.stopPositionBeacon()

  // If stAdd hasn't been called since the last Opening event.
  if (SmfAnalytics.preEvents.length > 0) {
    SmfAnalytics.startSession()
  }

  // Set the Irdeto error code and type (reusing existing fields).
  SmfAnalytics.errorCode = errorCode
  SmfAnalytics.errorMsg = errorMessage

  // Send the final update.
  SmfAnalytics.finalStUpd()
}

// -4000 ms . . . . -400 ms . . . . -40 ms . . . . 0 . . . . 40 ms . . . . 400 ms . . . . 4000 ms
function getJitterBin (jitterOffset) {
  let jitterBin
  if (jitterOffset <= -4) {
    jitterBin = 15 - Math.ceil(5 * Math.log(-jitterOffset / 4) / Math.LN10)
  }
  else if (jitterOffset < 4) {
    jitterBin = 15
  }
  else {
    jitterBin = 15 + Math.ceil(5 * Math.log(jitterOffset / 4) / Math.LN10)
  }
  // Clamp return value to 0 through 30.
  return Math.max(0, Math.min(jitterBin, 30))
}

// -4000 s . . . . 40 s . . . . 400 ms . . . . 0 . . . . 400 ms . . . . 40 s . . . . 4000 s
function getJitterBin2 (jitterOffset) {
  let jitterBin
  if (jitterOffset <= -4) {
    jitterBin = 15 - Math.ceil(2.5 * Math.log(-jitterOffset / 4) / Math.LN10)
  }
  else if (jitterOffset < 4) {
    jitterBin = 15
  }
  else {
    jitterBin = 15 + Math.ceil(2.5 * Math.log(jitterOffset / 4) / Math.LN10)
  }
  // Clamp return value to 0 through 30.
  return Math.max(0, Math.min(jitterBin, 30))
}

function createEvent (name, timestamp, additionProps) {
  return _assign({
    timestamp: timestamp || getCurrentTimeStamp(),
    name
  }, additionProps ? _cloneDeep(additionProps) : {})
}

function getCurrentTimeStamp () {
  return new Date().valueOf()
}

function getPlayerPosition (player) {
  return Math.round(player.currentTime())
}

function plugin (options) {
  const player = this
  let isStarted
  let isPlaying
  let isSeeking
  let textTrackLang
  SmfAnalytics.init(
    options.uid,
    options.jwt,
    options.mediaId,
    options.videoId,
    options.mediaUrl,
    options.mediaLang,
    options.nodeInfoDefault,
    options.nodeInfoPreview,
    options.nodeInfoFeature,
    options.externalPlayEvent,
    options.playbackSpeedUsed,
    options.pictureInPictureToggled,
    options.anonymousUuid,
  )

  function loadstartOnce () {
    SmfAnalytics.playerReady()
  }

  function loadstart () {
    if (isPlaying) {
      SmfAnalytics.pushEvent('Stopped')
    }
    isStarted = false
    isPlaying = false
    isSeeking = false
  }

  function play () {
    isPlaying = true
    if (!isStarted) {
      SmfAnalytics.opening()
    }
    if (player.techName === 'Flash') {
      playing()
    }
  }

  // Note: Sometimes this event happens BEFORE playback has actually started.
  // Safari's handling of autoplay is an example.
  function playing () {
    // If we haven't noticed playback started and we did start opening media
    if (!isStarted && SmfAnalytics.mediaIsOpening) {
      isStarted = true
      // Add a new record the first time we get a Playing event after the Opening event.
      if (SmfAnalytics.preEvents.length > 0 && SmfAnalytics.mediaIsOpening) {
        // SmfAnalytics.startSession() calls stAdd() which sets SmfAnalytics.mediaIsOpening false.
        SmfAnalytics.startSession()
      }
    }
    SmfAnalytics.playing()
  }

  function pause () {
    isPlaying = false
    SmfAnalytics.paused()
  }

  function seeking () {
    SmfAnalytics.pushEvent('Seeking')
  }

  function timeupdate () {
    const position = getPlayerPosition(player)
    SmfAnalytics.setPosition(position)
    if (isStarted && isPlaying && position > 0) {
      // Periodically update position for more accurate in-page resumes.
      if (position - SmfAnalytics.lastPosition > 6) {
        SmfAnalytics.lastPosition = position
        // Run event callbacks manually.
        SmfAnalytics.updatePositionTracking(position)
      }
    }
  }

  function ended () {
    isPlaying = false
    SmfAnalytics.stopped()
  }

  function error () {
    let errorMessage
    const mediaError = player.error()
    if (_isString(mediaError.status) || _isNumber(mediaError.status)) {
      errorMessage = mediaError.message + ' (Status ' + mediaError.status + ')'
    }
    else {
      errorMessage = mediaError.message
    }
    SmfAnalytics.mediaFailed(mediaError.code, errorMessage)
  }

  function texttrackchange () {
    _forEach(player.textTracks(), function processTextTrack (t) {
      if (t.mode === 'showing' && textTrackLang !== t.language) {
        textTrackLang = t.language
        SmfAnalytics.texttrackshow(t.kind, t.language)
      }
    })
  }

  function seeked () {
    const position = getPlayerPosition(player)
    if (position > 0) {
      SmfAnalytics.lastPosition = position
      // Run event callbacks manually.
      SmfAnalytics.updatePositionTracking(position)
    }
  }

  function dispose () {
    SmfAnalytics.unsetUnloadListener()
    SmfAnalytics.stopped()
  }

  function ratechange () {
    const playbackRate = player.playbackRate()
    SmfAnalytics.rateChange(playbackRate)
  }

  function enterpictureinpicture () {
    SmfAnalytics.togglePictureInPicture(true)
  }

  function leavepictureinpicture () {
    SmfAnalytics.togglePictureInPicture(false)
  }

  player.ready(function smfAnalyticsOnReady () {
    const player = this
    player.one('loadstart', loadstartOnce)
    player.on('loadstart', loadstart)
    player.on('ended', ended)
    player.on('texttrackchange', texttrackchange)
    player.on('seeked', seeked)
    player.on('play', play)
    player.on('playing', playing)
    player.on('pause', pause)
    player.on('seeking', seeking)
    player.on('timeupdate', timeupdate)
    player.on('error', error)
    player.on('ratechange', ratechange)
    player.on('enterpictureinpicture', enterpictureinpicture)
    player.on('leavepictureinpicture', leavepictureinpicture)
    player.on('dispose', dispose)
  })
}

export function register (videojs = window.videojs) {
  videojs.registerPlugin(PLUGIN_NAME, plugin)
}
