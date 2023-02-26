import { DEG_90 } from './consts.mjs'
import { Model } from './models.mjs'
import { Instance } from './models.mjs'
import { Room } from './room.mjs'

/**
 * Temporary scene builder
 *
 * @returns {Promise<Instance[]>} - List of scene instances
 */
export async function buildScene() {
  /** @type {Map<string, Model>} */
  const models = new Map()
  /** @type {Instance[]} */
  const instances = []

  const r = new Room(3, 3)

  // Create scene
  addModel('floor', models)
  addModel('block', models)
  addModel('table', models)
  addModel('chest', models)

  instances.push(...r.buildInstances(models))

  // { position: [-16, -1.5, 32], model: models['chest'], scale: [0.8, 0.8, 0.8] }
  const chest1 = new Instance(models['chest'], [16, -1.5, 0])
  chest1.scale = [0.8, 0.8, 0.8]
  instances.push(chest1)
  const chest2 = new Instance(models['chest'], [0, -1.5, 96 + 16])
  chest2.scale = [0.8, 0.8, 0.8]
  chest2.rotateY(DEG_90)
  instances.push(chest2)

  const table1 = new Instance(models['table'], [0, -3, 80])
  table1.scale = [1.4, 1.4, 0.7]
  table1.rotateX(DEG_90)
  instances.push(table1)

  // instances.push({ position: [-48, -1.5, 16], model: models['chest'], scale: [0.8, 0.8, 0.8], rotate: [0, DEG_90, 0] })

  return instances
}

/**
 * Helper function to add a model to the cache
 *
 * @param {string} name - Name of the model
 * @param {Map<string, Model>} models - Model cache
 */
function addModel(name, models) {
  models[name] = new Model(name)
  models[name].parse()
}
