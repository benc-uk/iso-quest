// ===== utils.mjs ===============================================================
// A collection of helper functions, most were replaced with twgl
// Ben Coleman, 2022
// ===============================================================================

//
// Load shader sources from external files using fetch, return both sources as strings
//
export async function fetchShaders(vertPath, fragPath) {
  const vsResp = await fetch(vertPath)
  const fsResp = await fetch(fragPath)

  if (!vsResp.ok || !fsResp.ok) {
    throw new Error(`Fetch failed - vertex: ${vsResp.statusText}, fragment: ${fsResp.statusText}`)
  }

  const vsText = await vsResp.text()
  const fsText = await fsResp.text()

  return { vertex: vsText, fragment: fsText }
}

//
// Load stuff from disk as strings
//
export async function fetchFile(path) {
  const resp = await fetch(path)

  if (!resp.ok) {
    throw new Error(`File fetch failed: ${vsResp.statusText}`)
  }

  const text = await resp.text()
  return text
}

//
// Helper to show text on the screen
//
export function setOverlay(message) {
  const overlay = document.getElementById('overlay')
  if (!overlay) return
  overlay.style.display = 'block'
  overlay.innerHTML = message
}

export function hideOverlay() {
  const overlay = document.getElementById('overlay')
  if (!overlay) return
  overlay.style.display = 'none'
}
