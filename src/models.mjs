import { fetchFile } from './utils.mjs'
import { parseOBJ } from './obj-parser.mjs'
import { parseMTL } from './mtl-parser.mjs'
import * as twgl from '../lib/twgl/dist/4.x/twgl-full.module.js'

const OBJ_PATH = './objects/'

/**
 * Holds a 3D model, as a list of parts, each with a material
 * Plus a set of materials, each with a set of properties
 *
 * @class Model
 */
export class Model {
  /** @type {string} */
  name = ''
  /** @type {Part[]} */
  parts = []
  /** @type {Object<string, Material>} */
  materials = {}

  // Private members
  /** @type {WebGL2RenderingContext} */
  #gl

  /**
   * @param {string} name - The name of the model without extension
   * @param {WebGL2RenderingContext} gl - WebGL2 context
   */
  constructor(name, gl) {
    this.name = name
    this.#gl = gl
  }

  /**
   * @returns {Promise<void>}
   * @description Parses the OBJ file and loads the material library
   */
  async parse() {
    const objFile = await fetchFile(`${OBJ_PATH}${this.name}.obj`)
    const { matLibNames, geometries } = parseOBJ(objFile)

    // We assume that the OBJ file has a SINGLE material library
    // This is a good assumption for nearly all files I've seen
    if (matLibNames && matLibNames.length > 0) {
      try {
        const mtlFile = await fetchFile(`${OBJ_PATH}${matLibNames[0]}`)
        const materialsRawList = parseMTL(mtlFile)
        for (const [matName, matRaw] of Object.entries(materialsRawList)) {
          this.materials[matName] = new Material(matRaw)
        }
      } catch (err) {
        console.warn(`Unable to load material library ${matLibNames[0]}`)
      }
    }

    // Fall back default material, some blueish color
    this.materials['__default'] = new Material({
      diffuse: [0.2, 0.5, 0.97],
    })

    for (const g of geometries) {
      const bufferInfo = twgl.createBufferInfoFromArrays(this.#gl, g.data)
      this.parts.push(new Part(bufferInfo, g.material))
    }
  }
}

/**
 * Holds part of a model, as the WebGL buffers needed to render it
 * Plus the material name associated with this part
 *
 * @class Part
 */
class Part {
  /** @type {any} */
  bufferInfo

  /** @type {string} */
  materialName

  /**
   * @param {twgl.BufferInfo} bufferInfo
   * @param {string} materialName
   */
  constructor(bufferInfo, materialName) {
    this.bufferInfo = bufferInfo
    this.materialName = materialName
  }
}

/**
 * Encapsulates a material, as a set of properties
 *
 * @class Material
 */
export class Material {
  #UNIFORM_PREFIX = 'u_mat'

  /** @type {[number, number, number]} */
  diffuse
  /** @type {[number, number, number]} */
  specular
  /** @type {number} */
  shininess
  /** @type {[number, number, number]} */
  ambient
  /** @type {[number, number, number]} */
  emissive

  /** @param {object} matRaw - Raw object returned from parseMTL */
  constructor(matRaw) {
    this.diffuse = matRaw.kd
    this.specular = matRaw.ks
    this.shininess = matRaw.ns
    this.ambient = matRaw.ka
    this.emissive = matRaw.ke
  }

  /**
   * Applies the material to the given program as a set of uniforms
   * Each uniform is prefixed with `u_mat`, e.g. `u_matDiffuse`
   *
   * @param {any} programInfo
   */
  apply(programInfo) {
    const uniforms = {}

    for (const [propName, propValue] of Object.entries(this)) {
      if (propValue) {
        uniforms[`${this.#UNIFORM_PREFIX}${propName[0].toUpperCase()}${propName.slice(1)}`] = propValue
      }
    }

    twgl.setUniforms(programInfo, uniforms)
  }
}

/**
 * An instance of a model, with a position etc
 *
 * @class Instance
 */
export class Instance {
  /** @type {[number, number, number]} */
  position = [0, 0, 0]

  /** @type {Model} */
  model

  /** @type {[number, number, number]} */
  scale = [1, 1, 1]

  /** @type {[number, number, number]} */
  rotate = [0, 0, 0]

  /** @type {boolean} */
  transparent = false

  /**
   * @param {[number, number, number]} position
   * @param {Model} model
   */
  constructor(model, position) {
    this.position = position
    this.model = model
  }

  rotateY(angle) {
    this.rotate[1] += angle
  }

  rotateX(angle) {
    this.rotate[0] += angle
  }

  rotateZ(angle) {
    this.rotate[2] += angle
  }
}
