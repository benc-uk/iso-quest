import { Model } from './models.mjs'
import { DEG_90 } from './consts.mjs'
// eslint-disable-next-line no-unused-vars
import { Instance } from './models.mjs'
import { Room } from './room.mjs'

/**
 * Temporary scene builder
 * @param {WebGL2RenderingContext} gl
 * @returns {Promise<Instance[]>}
 */
export async function buildScene(gl) {
  /** @type {Map<string, Model>} */
  const models = new Map()
  /** @type {Instance[]} */
  const instances = []

  const r = new Room(3, 3)

  // Create scene
  addModel('floor', models, gl)
  addModel('block', models, gl)
  addModel('table', models, gl)
  addModel('chest', models, gl)

  instances.push(...r.buildInstances(models))

  // instances.push({ position: [-16, -1.5, 32], model: models['chest'], scale: [0.8, 0.8, 0.8] })
  // instances.push({ position: [-48, -1.5, 16], model: models['chest'], scale: [0.8, 0.8, 0.8], rotate: [0, DEG_90, 0] })

  return instances
}

function addModel(name, models, gl) {
  models[name] = new Model(name, gl)
  return models[name].parse()
}
