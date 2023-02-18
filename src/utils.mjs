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
    throw new Error(`File fetch failed: ${resp.statusText}`)
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

//
// Helper to load a combined model from OBJ and MTL files
//
export async function parseModel(name, gl) {
  // Returned model object
  const model = {
    parts: [],
    materials: {},
  }

  const objFile = await fetchFile(`${OBJ_PATH}${name}.obj`)
  const { matLibNames, geometries } = new parseOBJ(objFile)

  // We assume that the OBJ file has a SINGLE material library
  // This is a good assumption for nearly all files I've seen
  if (matLibNames && matLibNames.length > 0) {
    try {
      const mtlFile = await fetchFile(`${OBJ_PATH}${matLibNames[0]}`)
      model.materials = parseMTL(mtlFile)
    } catch (err) {
      console.warn(`Unable to load material library ${matLibNames[0]}`)
    }
  }

  // Fall back default material, some blueish color
  model.materials['__default'] = {
    diffuse: [0.2, 0.5, 0.97],
  }

  for (const g of geometries) {
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, g.data)
    model.parts.push({ bufferInfo, materialName: g.material })
  }

  return model
}

//
// Helper to convert material properties to a format that WebGL can use
//
export function applyMaterial(programInfo, material) {
  if (!material) return

  const uniforms = {}

  uniforms.u_matDiffuse = material.diffuse ? material.diffuse : null
  uniforms.u_matSpecular = material.specular ? material.specular : null
  uniforms.u_matShininess = material.shininess ? material.shininess : null
  uniforms.u_matAmbient = material.ambient ? material.emissive : null

  twgl.setUniforms(programInfo, uniforms)
}
