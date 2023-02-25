import { DEG_90 } from './consts.mjs'
import { Instance, Model } from './models.mjs'

const ROOM_SIZE = 16
const FLOOR = 1
// const WALL = 1

/**
 * Room holds the floor plan of a room
 *
 * @class Room
 */
export class Room {
  /** @type {number[][]} */
  cells = []
  /** @type {number} */

  /**
   * Creates an instance of Room.
   *
   * @param {number} width - Width of room in tiles
   * @param {number} height - Height of room in tiles
   */
  constructor(width, height) {
    this.width = width
    this.height = height

    this.cells = new Array(ROOM_SIZE)

    for (let x = 0; x < ROOM_SIZE; x++) {
      this.cells[x] = new Array(ROOM_SIZE)
      for (let y = 0; y < ROOM_SIZE; y++) {
        this.cells[x][y] = 0
      }
    }

    for (let x = 0; x < width; x++) {
      this.cells[x] = new Array(ROOM_SIZE)
      for (let y = 0; y < height; y++) {
        this.cells[x][y] = FLOOR
      }
    }
    console.log(this.cells)

    this.cells[4][0] = FLOOR
    this.cells[3][0] = FLOOR
    this.cells[2][3] = FLOOR
    this.cells[2][4] = FLOOR

    this.cells[2][5] = FLOOR
    this.cells[1][5] = FLOOR
    this.cells[0][5] = FLOOR
    this.cells[3][5] = FLOOR
    this.cells[2][6] = FLOOR
    this.cells[1][6] = FLOOR
    this.cells[0][6] = FLOOR
    this.cells[3][6] = FLOOR
    this.cells[2][7] = FLOOR
    this.cells[1][7] = FLOOR
    this.cells[0][7] = FLOOR
    this.cells[3][7] = FLOOR
  }

  /**
   * Creates instances of the models needed to render the room
   * @param {Map<string, Model>} models
   * @returns {Instance[]}
   */
  buildInstances(models) {
    /** @type {Instance[]} */
    const instances = []

    // add all the floor tiles from the room
    for (let x = 0; x < ROOM_SIZE; x++) {
      for (let y = 0; y < ROOM_SIZE; y++) {
        if (this.cells[x][y] === FLOOR) {
          const floorInstance = new Instance(models['floor'], [x * 16, -9, y * 16])
          floorInstance.rotateX(DEG_90)
          instances.push(floorInstance)
        }
      }
    }

    // add all the walls from the room
    for (let x = 0; x < ROOM_SIZE; x++) {
      for (let y = 0; y < ROOM_SIZE; y++) {
        if (this.cells[x][y] === FLOOR) {
          if (x === 0 || this.cells[x - 1][y] !== FLOOR) {
            const wallInstance = new Instance(models['block'], [(x - 1) * 16 + 6, 0, y * 16])
            const wallInstanceTop = new Instance(models['block'], [(x - 1) * 16 + 6, 16, y * 16])
            wallInstance.rotateY(DEG_90)
            wallInstanceTop.rotateY(DEG_90)
            wallInstance.scale = [1, 1, 0.5]
            wallInstanceTop.scale = [1, 1, 0.5]

            instances.push(wallInstance, wallInstanceTop)
          }

          if (y === 0 || this.cells[x][y - 1] !== FLOOR) {
            const wallInstance = new Instance(models['block'], [x * 16, 0, (y - 1) * 16 + 6])
            const wallInstanceTop = new Instance(models['block'], [x * 16, 16, (y - 1) * 16 + 6])
            wallInstance.scale = [0.9999, 1, 0.5]
            wallInstanceTop.scale = [0.9999, 1, 0.5]

            instances.push(wallInstance, wallInstanceTop)
          }
        }
      }
    }

    return instances
  }
}
