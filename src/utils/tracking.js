const UTM_STORAGE_KEY = 'utm_data'
const REFERER_STORAGE_KEY = 'initial_referer'

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ga_client_id'
]

export function parseAndSaveUTM() {
  const params = new URLSearchParams(window.location.search)
  const utmData = {}

  UTM_KEYS.forEach(key => {
    const value = params.get(key)
    if (value) {
      const maxLength = key === 'ga_client_id' ? 50 : 500
      utmData[key] = value.substring(0, maxLength)
    }
  })

  if (Object.keys(utmData).length > 0) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData))
  }
}

export function saveInitialReferer() {
  if (!localStorage.getItem(REFERER_STORAGE_KEY) && document.referrer) {
    const referer = document.referrer.substring(0, 2500)
    localStorage.setItem(REFERER_STORAGE_KEY, referer)
  }
}

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

export function initTracking() {
  saveInitialReferer()
  parseAndSaveUTM()
}
