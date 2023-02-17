import { fetchShaders, fetchFile, setOverlay, parseModel } from './utils.mjs'
import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'

const FAR_CLIP = 140
const AA_ENABLED = false
const ISO_SCALE = 13
const RAD_45 = Math.PI / 4
const RAD_30 = Math.PI / 6
let ASPECT
let time = 0.0
const models = {}
const instances = []
let retroMode = false

//
// Start here :D
//
window.onload = async () => {
  const gl = document.querySelector('canvas').getContext('webgl2', { antialias: AA_ENABLED })
  ASPECT = gl.canvas.clientWidth / gl.canvas.clientHeight

  // Add event listener for retro mode
  document.addEventListener('keydown', (event) => {
    const keyName = event.key
    if (keyName === 'r') {
      retroMode = !retroMode

      // get canvas element
      const canvas = document.querySelector('canvas')
      if (retroMode) {
        canvas.style.imageRendering = 'pixelated'
        canvas.style.width = '1024px'
        canvas.style.height = '768px'
        canvas.width = 1024 / 6
        canvas.height = 768 / 6
        gl.ant
      } else {
        canvas.style.imageRendering = 'auto'
        canvas.width = 1024
        canvas.height = 768
      }

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      ASPECT = gl.canvas.clientWidth / gl.canvas.clientHeight
    }
  })

  // If we don't have a GL context, give up now
  if (!true) {
    setOverlay('Unable to initialize WebGL. Your browser or machine may not support it!')
    return
  }

  // Load shaders from external files
  const { vertex, fragment } = await fetchShaders('./shaders/vert.glsl', './shaders/frag.glsl')

  // Placeholder for creating model
  models['sword'] = await parseModel('sword', gl)

  instances.push({ position: [0, 0, 0], model: models['sword'] })
  instances.push({ position: [6.5, 0, 0], model: models['sword'] })
  instances.push({ position: [5, 0, -8], model: models['sword'] })
  instances.push({ position: [-9, 0, -2], model: models['sword'] })

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
    u_lightWorldPos: [-4, 5, 30],
    u_lightColor: [1.0, 1.0, 1.0],
    u_lightAmbient: [0.2, 0.2, 0.2],
  }

  const camera = mat4.create()
  mat4.targetTo(camera, [10, 8, 10], [0, 0, 0], [0, 1, 0])
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

    for (let instance of instances) {
      const model = instance.model

      const uniforms = {
        ...worldUniforms,
      }

      for (let part of model.parts) {
        // Get the material for this part and populate the uniforms
        for (let [key, value] of Object.entries(model.materials[part.materialName])) {
          uniforms[`u_${key}`] = value
        }

        renderPart(part, gl, programInfo, uniforms, view, instance.position)
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
function renderPart(part, gl, programInfo, uniforms, view, pos) {
  // An isometric projection
  const projection = mat4.ortho(mat4.create(), -ASPECT * ISO_SCALE, ASPECT * ISO_SCALE, -ISO_SCALE, ISO_SCALE, -4, FAR_CLIP)
  const viewProjection = mat4.multiply(mat4.create(), projection, view)

  // Move object into the world
  const world = mat4.create()
  mat4.translate(world, world, pos)
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
