import { parseModel } from './utils.mjs'
import { DEG_90 } from './consts.mjs'

export async function buildScene(gl) {
  const models = {}
  const instances = []

  // Create scene
  models['block'] = await parseModel('block', gl)
  models['floor'] = await parseModel('floor', gl)
  models['chest'] = await parseModel('chest', gl)
  models['table'] = await parseModel('table', gl)

  instances.push({ position: [0, 0, 6], model: models['block'], scale: [1, 1, 0.5] })
  instances.push({ position: [-16, 0, 6], model: models['block'], scale: [1, 1, 0.5] })
  // instances.push({ position: [-32, 0, 6], model: models['block'], scale: [1, 1, 0.5] })
  instances.push({ position: [-48, 0, 6], model: models['block'], scale: [1, 1, 0.5] })
  instances.push({ position: [16, 0, 6], model: models['block'], scale: [1, 1, 0.5] })
  instances.push({ position: [32, 0, 6], model: models['block'], scale: [1, 1, 0.5] })

  instances.push({ position: [-64 + 6, 0, 16], model: models['block'], scale: [1, 1, 0.5], rotate: [0, DEG_90, 0] })
  instances.push({ position: [-64 + 6, 0, 32], model: models['block'], scale: [1, 1, 0.5], rotate: [0, DEG_90, 0] })
  instances.push({ position: [-48 + 6, 0, -0.01], model: models['block'], scale: [1, 1, 0.5], rotate: [0, DEG_90, 0] })
  instances.push({ position: [-48 + 6, 0, -16], model: models['block'], scale: [1, 1, 0.5], rotate: [0, DEG_90, 0] })

  instances.push({ position: [0, -9, 16], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [16, -9, 16], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [32, -9, 16], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [-16, -9, 16], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [-32, -9, 16], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [-48, -9, 16], model: models['floor'], rotate: [DEG_90, 0, 0] })

  instances.push({ position: [0, -9, 32], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [16, -9, 32], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [32, -9, 32], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [-16, -9, 32], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [-32, -9, 32], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [-48, -9, 32], model: models['floor'], rotate: [DEG_90, 0, 0] })

  instances.push({ position: [-32, -9, 0], model: models['floor'], rotate: [DEG_90, 0, 0] })
  instances.push({ position: [-32, -9, -16], model: models['floor'], rotate: [DEG_90, 0, 0] })

  instances.push({ position: [16, -1, 32], model: models['table'], rotate: [DEG_90, 0, 0] })

  instances.push({ position: [-16, -1.5, 32], model: models['chest'], scale: [0.8, 0.8, 0.8] })
  instances.push({ position: [-48, -1.5, 16], model: models['chest'], scale: [0.8, 0.8, 0.8], rotate: [0, DEG_90, 0] })

  return instances
}
