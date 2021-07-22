export const GEO_AVAILABILITY_ALLOWED_IN = 'allowedIn'
export const GEO_AVAILABILITY_BLOCKED_IN = 'blockedIn'
export const GEO_AVAILABILITY_WORLDWIDE = 'worldwide'

export function getGeoAvailabilityCode (availabilityInt) {
  switch (availabilityInt) {
    case 1:
      return GEO_AVAILABILITY_ALLOWED_IN
    case 2:
      return GEO_AVAILABILITY_BLOCKED_IN
    case 3:
      return GEO_AVAILABILITY_WORLDWIDE
    default:
      return GEO_AVAILABILITY_WORLDWIDE
  }
}
