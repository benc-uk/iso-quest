import { DEG_90 } from './consts.mjs'
import { Model } from './models.mjs'
import { Instance } from './models.mjs'
import { Zone } from './zone.mjs'

/**
 * Temporary scene builder
 *
 * @returns {Promise<Instance[]>} - List of scene instances
 * @param {Zone} zone - Zone to build
 */
export async function buildScene(zone) {
  /** @type {Map<string, Model>} */
  const models = new Map()
  /** @type {Instance[]} */
  const instances = []

  // Create scene
  addModel('floor', models)
  addModel('block', models)
  addModel('table', models)
  addModel('chest', models)
  addModel('door', models)
  console.log(models)

  instances.push(...zone.buildInstances(models))

  const chest1 = new Instance(models['chest'], [64, -1.5, 16])
  chest1.scale = [0.8, 0.8, 0.8]
  instances.push(chest1)
  const chest2 = new Instance(models['chest'], [0, -1.5, 96 + 32])
  chest2.scale = [0.8, 0.8, 0.8]
  chest2.rotateY(DEG_90)
  instances.push(chest2)

  const table1 = new Instance(models['table'], [0, -3, 96])
  table1.scale = [1.4, 1.4, 0.7]
  table1.rotateX(DEG_90)
  instances.push(table1)

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
