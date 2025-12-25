const UTM_STORAGE_KEY = '_utm_data'
const REFERER_STORAGE_KEY = '_initial_referer'

export function getTrackingData() {
  const utmData = JSON.parse(localStorage.getItem(UTM_STORAGE_KEY) || '{}')
  const httpReferer = localStorage.getItem(REFERER_STORAGE_KEY) || null
  
  return {
    ...utmData,
    http_referer: httpReferer
  }
}

export function clearTrackingData() {
  localStorage.removeItem(UTM_STORAGE_KEY)
  localStorage.removeItem(REFERER_STORAGE_KEY)
}
