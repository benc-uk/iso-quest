// ===== utils.mjs ===============================================================
// A collection of helper functions, most were replaced with twgl
// Ben Coleman, 2023
// ===============================================================================

import { parseOBJ } from './obj-parser.mjs'
import { parseMTL } from './mtl-parser.mjs'
import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'

const OBJ_PATH = './objects/'

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

// Helper to load a model from OBJ and MTL files
export async function parseModel(name, gl) {
  // Returned model object
  const model = {
    parts: [],
    materials: {},
  }

  const objFile = await fetchFile(`${OBJ_PATH}${name}.obj`)
  const { matLibNames, geometries } = new parseOBJ(objFile)

  // We assume that the OBJ file has a SINGLE material library
  // This is a good assumption for nearly all models I've seen
  const mtlFile = await fetchFile(`${OBJ_PATH}${matLibNames[0]}`)
  model.materials = parseMTL(mtlFile)

  for (let g of geometries) {
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, g.data)
    model.parts.push({ bufferInfo, materialName: g.material })
  }

  return model
}
