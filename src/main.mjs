import { fetchShaders, fetchFile, setOverlay } from './utils.mjs'
import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'
import { parseOBJ } from './obj-parser.mjs'

const FAR_CLIP = 140
const AA_ENABLED = false
const ISO_SCALE = 7
const RAD_45 = Math.PI / 4
const RAD_30 = Math.PI / 6
let ASPECT
let time = 0.0

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

  const objFile = await fetchFile('./objects/test.obj')

  const objArrays = new parseOBJ(objFile)

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

  // prettier-ignore
  // const arrays = {
  //   position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
  //   normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
  //   texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
  //   indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
  // };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, objArrays)

  // load a texture from 9.png file
  const tex = twgl.createTexture(gl, {
    src: './textures/9.png',
    minMag: gl.LINEAR,
  })

  const uniforms = {
    u_worldInverseTranspose: mat4.create(),
    u_worldViewProjection: mat4.create(),

    // Move light somewhere in the world
    u_lightWorldPos: [-33, 60, 40],
    u_lightColor: [1, 1, 1],
    u_lightAmbient: [0.2, 0.2, 0.2],
    u_texture: tex,
  }

  const camera = mat4.create()
  mat4.targetTo(camera, [0, 0, 5.5], [0, 0, 0], [0, 1, 0])
  const view = mat4.create()
  mat4.invert(view, camera)
  uniforms.u_viewInverse = camera // Add the view inverse to the uniforms, we need it for shading

  // Draw the scene repeatedly every frame
  var prevTime = 0
  async function render(now) {
    now *= 0.001
    const deltaTime = now - prevTime // Get smoothed time difference
    prevTime = now

    drawScene(gl, programInfo, bufferInfo, uniforms, view, deltaTime)
    requestAnimationFrame(render)
  }

  // Start the render loop first time
  requestAnimationFrame(render)
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, bufferInfo, uniforms, view, deltaTime) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  // An isometric projection
  const projection = mat4.ortho(mat4.create(), -ASPECT * ISO_SCALE, ASPECT * ISO_SCALE, -ISO_SCALE, ISO_SCALE, 0.1, FAR_CLIP)
  const viewProjection = mat4.multiply(mat4.create(), projection, view)

  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

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
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
  twgl.setUniforms(programInfo, uniforms)

  twgl.drawBufferInfo(gl, bufferInfo)

  time += deltaTime
}
