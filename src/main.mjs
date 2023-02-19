// ===== main.mjs ==========================================================
// Core engine loop
// Ben Coleman, 2023
// ===============================================================================

import { fetchShaders, setOverlay, applyMaterial } from './utils.mjs'
import { buildScene } from './scene.mjs'
import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'
import * as vec3 from '../lib/gl-matrix/esm/vec3.js'
import { createSprite } from './sprtites.mjs'

const FAR_CLIP = 300
const AA_ENABLED = false
const ISO_SCALE = 50
const LIGHT_COLOUR = [0.907, 0.682, 0.392]

const camOffset = vec3.fromValues(-24, 0, 16)
let camHeight = 0
let camAngle = 0
let lightX = 32
let retroMode = false

//
// Start here :D
//
window.onload = async () => {
  setOverlay(
    'WebGL Isometric Game Engine<br><br>Move camera: WASD<br>Camera height: Z,X<br>Camera angle: Q,E<br>Move light: 1,2<br>Toggle retro mode: R'
  )

  const gl = document.querySelector('canvas').getContext('webgl2', { antialias: AA_ENABLED })
  const ASPECT = gl.canvas.clientWidth / gl.canvas.clientHeight

  // If we don't have a GL context, give up now
  if (!gl) {
    setOverlay('Unable to initialize WebGL. Your browser or machine may not support it!')
    return
  }

  // Add event listener for retro mode
  document.addEventListener('keydown', (event) => {
    const keyCode = event.code
    if (keyCode === 'KeyA') {
      camOffset[0] -= 3
    }

    if (keyCode === 'KeyD') {
      camOffset[0] += 3
    }

    if (keyCode === 'KeyW') {
      camOffset[2] -= 3
    }

    if (keyCode === 'KeyS') {
      camOffset[2] += 3
    }

    if (keyCode === 'KeyQ') {
      camAngle -= 0.06
    }

    if (keyCode === 'KeyE') {
      camAngle += 0.06
    }

    if (keyCode === 'Digit1') {
      lightX -= 1
    }

    if (keyCode === 'Digit2') {
      lightX += 1
    }

    if (keyCode === 'KeyZ') {
      camHeight -= 0.5
    }

    if (keyCode === 'KeyX') {
      camHeight += 0.5
    }

    if (keyCode === 'KeyR') {
      retroMode = !retroMode
      if (retroMode) {
        gl.canvas.classList.add('retro')
        gl.canvas.width = 1200 / 6
        gl.canvas.height = 900 / 6
      } else {
        gl.canvas.classList.remove('retro')
        gl.canvas.width = 1200
        gl.canvas.height = 900
      }
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }
  })

  // Use TWLG to set up the shaders and programs
  // We have two programs and two pairs of shaders, one for 3D elements (models) and one for sprites
  let modelProg, spriteProg
  try {
    // Note, we load shaders from external files, that's how I like to work
    const { vertex: modelVert, fragment: modelFrag } = await fetchShaders('shaders/vert.glsl', 'shaders/frag.glsl')
    modelProg = twgl.createProgramInfo(gl, [modelVert, modelFrag])

    const { vertex: spriteVert, fragment: spriteFrag } = await fetchShaders('shaders/sprite-vert.glsl', 'shaders/sprite-frag.glsl')
    spriteProg = twgl.createProgramInfo(gl, [spriteVert, spriteFrag])

    console.log('🎨 Loaded all shaders, GL is ready')
  } catch (err) {
    console.error(err)
    setOverlay(err.message)
    return // Give up here!
  }

  const scene = await buildScene(gl)

  const worldUniforms = {
    u_worldInverseTranspose: mat4.create(),
    u_worldViewProjection: mat4.create(),

    // Move light somewhere in the world
    u_lightWorldPos: [-8, 16, 32],
    u_lightColor: LIGHT_COLOUR,
    u_lightAmbient: [0.1, 0.1, 0.1],
  }

  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)

  const s = createSprite(gl)

  // Draw the scene repeatedly every frame
  async function render(_now) {
    // Handle camera movement & rotation
    const camTarget = vec3.fromValues(0, 0, 0)
    const camPos = vec3.fromValues(10, 8 + camHeight, 10)
    vec3.rotateY(camPos, camPos, camTarget, camAngle)
    vec3.add(camPos, camPos, camOffset)
    vec3.add(camTarget, camTarget, camOffset)

    const camera = mat4.targetTo(mat4.create(), camPos, camTarget, [0, 1, 0])
    const view = mat4.invert(mat4.create(), camera)
    worldUniforms.u_viewInverse = camera // Add the view inverse to the uniforms, we need it for shading

    // Move the light
    worldUniforms.u_lightWorldPos[0] = lightX

    // An isometric projection
    const projection = mat4.ortho(mat4.create(), -ASPECT * ISO_SCALE, ASPECT * ISO_SCALE, -ISO_SCALE, ISO_SCALE, -FAR_CLIP, FAR_CLIP)
    const viewProjection = mat4.multiply(mat4.create(), projection, view)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(modelProg.program)
    for (const instance of scene) {
      renderInstance(instance, gl, modelProg, worldUniforms, viewProjection)
    }

    gl.useProgram(spriteProg.program)
    renderSprite(s, gl, spriteProg, view, projection)

    requestAnimationFrame(render)
  }

  // Start the render loop first time
  requestAnimationFrame(render)
}

//
// Render a model instance
//
function renderInstance(instance, gl, programInfo, uniforms, viewProjection) {
  // World transform moves instance into the world
  const world = mat4.create()
  if (instance.position) mat4.translate(world, world, instance.position)
  if (instance.rotate) {
    mat4.rotate(world, world, instance.rotate[0], [1, 0, 0])
    mat4.rotate(world, world, instance.rotate[1], [0, 1, 0])
    mat4.rotate(world, world, instance.rotate[2], [0, 0, 1])
  }
  if (instance.scale) {
    mat4.scale(world, world, instance.scale)
  }
  uniforms.u_world = world

  // Populate u_worldInverseTranspose - used for normals & shading
  mat4.invert(uniforms.u_worldInverseTranspose, world)
  mat4.transpose(uniforms.u_worldInverseTranspose, uniforms.u_worldInverseTranspose)

  // Populate u_worldViewProjection which is pretty fundamental
  mat4.multiply(uniforms.u_worldViewProjection, viewProjection, world)

  const model = instance.model
  for (const part of model.parts) {
    applyMaterial(programInfo, model.materials[part.materialName])

    twgl.setBuffersAndAttributes(gl, programInfo, part.bufferInfo)
    twgl.setUniforms(programInfo, uniforms)

    twgl.drawBufferInfo(gl, part.bufferInfo)
  }
}

//
// Render a sprite
//
function renderSprite(sprite, gl, programInfo, view, projection) {
  const uniforms = {
    u_texture: sprite.texture,
    u_worldViewProjection: mat4.create(),
    u_world: mat4.create(),
  }

  // Move sprite into the world
  mat4.translate(uniforms.u_world, uniforms.u_world, [16, 0, 20])

  // World view before projection, intermediate step for billboarding
  const worldView = mat4.multiply(mat4.create(), view, uniforms.u_world)

  // For billboarding, we need to remove the translation part of the world view matrix
  worldView[0] = 1.0
  worldView[1] = 0
  worldView[2] = 0
  worldView[8] = 0
  worldView[9] = 0
  worldView[10] = 1.0

  // Populate u_worldViewProjection which is pretty fundamental
  mat4.multiply(uniforms.u_worldViewProjection, projection, worldView)

  twgl.setBuffersAndAttributes(gl, programInfo, sprite.buffers)
  twgl.setUniforms(programInfo, uniforms)
  twgl.drawBufferInfo(gl, sprite.buffers)
}
