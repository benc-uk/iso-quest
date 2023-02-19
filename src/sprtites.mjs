import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'

const SIZE = 14

export function createSprite(gl) {
  const spriteTransform = mat4.create()
  mat4.rotateX(spriteTransform, spriteTransform, Math.PI / 2)
  const buffers = twgl.primitives.createPlaneBufferInfo(gl, SIZE, SIZE, 2, 2, spriteTransform)

  // load the texture
  const texture = twgl.createTexture(gl, {
    src: 'sprites/dwarf_1.png',
    mag: gl.NEAREST,
    min: gl.NEAREST,
    wrap: gl.CLAMP_TO_EDGE,
  })

  return {
    name: 'knight',
    buffers,
    texture,
    position: [0, 0, 0],
  }
}
