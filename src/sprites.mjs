import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'
import * as mat4 from '../lib/gl-matrix/esm/mat4.js'

const SIZE = 14

/**
 * @class Sprite
 */
export class Sprite {
  /** @type {string} */
  name = ''
  /** @type {twgl.BufferInfo} */
  buffers
  /** @type {WebGLTexture} */
  texture
  /** @type {[number, number, number]} */
  position = [0, 0, 0]

  constructor(gl, name) {
    const spriteTransform = mat4.create()
    mat4.rotateX(spriteTransform, spriteTransform, Math.PI / 2)
    this.buffers = twgl.primitives.createPlaneBufferInfo(gl, SIZE, SIZE, 2, 2, spriteTransform)

    this.texture = twgl.createTexture(gl, {
      src: `sprites/${name}.png`,
      mag: gl.NEAREST,
      min: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE,
    })

    this.name = name
    this.position = [0, 0, 0]
  }
}
