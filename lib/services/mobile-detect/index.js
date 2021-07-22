
function mobileDetect (window) {
  const mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(window.navigator.userAgent))
  if (mobile) {
    return true
  }
  return false
}

export default mobileDetect
