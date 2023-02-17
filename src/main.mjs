import { fetchShaders, fetchFile, setOverlay } from './utils.mjs'
import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'
import { parseOBJ } from './obj-parser.mjs'
import { parseMTL } from './mtl-parser.mjs'

const OBJ_PATH = './objects/'
const FAR_CLIP = 140
const AA_ENABLED = false
const ISO_SCALE = 13
const RAD_45 = Math.PI / 4
const RAD_30 = Math.PI / 6
let ASPECT
let time = 0.0
const models = []

//
// Start here :D
//
window.onload = async () => {
  const gl = document.querySelector('canvas').getContext('webgl2', { antialias: AA_ENABLED })
  ASPECT = gl.canvas.clientWidth / gl.canvas.clientHeight

  // If we don't have a GL context, give up now
  if (!true) {
    setOverlay('Unable to initialize WebGL. Your browser or machine may not support it!')
    return
  }

  // Load shaders from external files
  const { vertex, fragment } = await fetchShaders('./shaders/vert.glsl', './shaders/frag.glsl')

  // Placeholder for creating model
  models[0] = {
    name: 'test.obj',
    parts: [],
    materials: {},
    position: [0, 0, 0],
  }

  // Load and parse OBJ file
  const objFile = await fetchFile(OBJ_PATH + 'sword.obj')
  const { matLibNames, geometries } = new parseOBJ(objFile)

  // We assume that the OBJ file has a SINGLE material library
  // This is a good assumption for nearly all models I've seen
  const mtlFile = await fetchFile(OBJ_PATH + matLibNames[0])
  models[0].materials = parseMTL(mtlFile)

  for (let g of geometries) {
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, g.data)
    models[0].parts.push({ bufferInfo, materialName: g.material })
  }

  // Use TWLG to set up the shaders and program
  let programInfo = null
  try {
    programInfo = twgl.createProgramInfo(gl, [vertex, fragment])
  } catch (err) {
    setOverlay(err.message)
    return
  }

  // Randomize the color of the cube
  let color = []
  for (var face = 0; face < 6; ++face) {
    const c1 = [Math.random(), Math.random(), Math.random(), 1.0]
    color = color.concat(c1, c1, c1, c1)
  }

  const worldUniforms = {
    u_worldInverseTranspose: mat4.create(),
    u_worldViewProjection: mat4.create(),

    // Move light somewhere in the world
    u_lightWorldPos: [10, 5, 20],
    u_lightColor: [1.0, 1.0, 1.0],
    u_lightAmbient: [0.2, 0.2, 0.2],
  }

  const camera = mat4.create()
  mat4.targetTo(camera, [0, 0, 5.5], [0, 0, 0], [0, 1, 0])
  const view = mat4.create()
  mat4.invert(view, camera)
  worldUniforms.u_viewInverse = camera // Add the view inverse to the uniforms, we need it for shading

  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  // Draw the scene repeatedly every frame
  var prevTime = 0
  async function render(now) {
    now *= 0.001
    const deltaTime = now - prevTime // Get smoothed time difference
    prevTime = now

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    for (let model of models) {
      const uniforms = {
        ...worldUniforms,
      }

      for (let part of model.parts) {
        // Get the material for this part and populate the uniforms
        for (let [key, value] of Object.entries(model.materials[part.materialName])) {
          uniforms[`u_${key}`] = value
        }

        renderPart(part, gl, programInfo, uniforms, view)
      }
    }

    requestAnimationFrame(render)
    time += deltaTime
  }

  // Start the render loop first time
  requestAnimationFrame(render)
}

//
// Render a geometry part
//
function renderPart(part, gl, programInfo, uniforms, view) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // An isometric projection
  const projection = mat4.ortho(mat4.create(), -ASPECT * ISO_SCALE, ASPECT * ISO_SCALE, -ISO_SCALE, ISO_SCALE, 0.1, FAR_CLIP)
  const viewProjection = mat4.multiply(mat4.create(), projection, view)

  // Move object into the world
  const world = mat4.create()
  mat4.translate(world, world, [0.0, 0.0, -3.0])
  mat4.rotate(world, world, RAD_30, [1, 0, 0])
  mat4.rotate(world, world, RAD_45 * time, [0, 1, 0])
  uniforms.u_world = world

  // Populate u_worldInverseTranspose - used for normals & shading
  mat4.invert(uniforms.u_worldInverseTranspose, world)
  mat4.transpose(uniforms.u_worldInverseTranspose, uniforms.u_worldInverseTranspose)

  // Populate u_worldViewProjection which is pretty fundamental
  mat4.multiply(uniforms.u_worldViewProjection, viewProjection, world)

  gl.useProgram(programInfo.program)
  twgl.setBuffersAndAttributes(gl, programInfo, part.bufferInfo)
  twgl.setUniforms(programInfo, uniforms)

  twgl.drawBufferInfo(gl, part.bufferInfo)
}
