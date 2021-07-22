export default function updateRoute (location) {
  if (global.document) {
    document.documentElement.setAttribute('data-route', location.pathname)
  }
}
