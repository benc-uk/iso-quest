import { DEG_90 } from './consts.mjs'
import { Instance, Model } from './models.mjs'

const ROOM_SIZE = 16
const FLOOR = 1
const WALL = 0
const EXIT = 2

/**
 * Zone holds the playing area & tiles the player is currently in
 */
export class Zone {
  /**  @type {Tile[][]} */
  tiles = []

  /**
   * Creates an instance of Zone.
   *
   * @param {number} width - Width of room in tiles
   * @param {number} height - Height of room in tiles
   */
  constructor(width, height) {
    this.width = width
    this.height = height

    this.tiles = new Array(ROOM_SIZE)

    for (let x = 0; x < ROOM_SIZE; x++) {
      this.tiles[x] = new Array(ROOM_SIZE)
      for (let y = 0; y < ROOM_SIZE; y++) {
        this.tiles[x][y] = new Tile(x, y)
      }
    }

    for (let x = 1; x < width + 1; x++) {
      for (let y = 1; y < height + 1; y++) {
        this.tiles[x][y].impassable = false
        this.tiles[x][y].wall = false
      }
    }
  }

  /**
   * Creates instances of the models needed to render the room
   *
   * @param {Map<string, Model>} models - Model cache
   * @returns {Instance[]} - List of instances that make up the room
   */
  buildInstances(models) {
    /** @type {Instance[]} */
    const instances = []

    // add all the floor tiles from the room
    for (let x = 0; x < ROOM_SIZE; x++) {
      for (let y = 0; y < ROOM_SIZE; y++) {
        if (!this.tiles[x][y].wall) {
          const floorInstance = new Instance(models['floor'], [x * 16, -9, y * 16])
          floorInstance.rotateX(DEG_90)
          instances.push(floorInstance)
        }
      }
    }

    // add all the walls from the room
    for (let x = 0; x < ROOM_SIZE; x++) {
      for (let y = 0; y < ROOM_SIZE; y++) {
        if (this.tiles[x][y].isExit()) {
          const doorInstance = new Instance(models['door'], [x * 16 + 8, 0, y * 16])
          const wallInstanceTop = new Instance(models['block'], [x * 16 + 6, 16, y * 16])
          wallInstanceTop.scale = [1, 1, 0.5]
          wallInstanceTop.rotateY(DEG_90)
          doorInstance.rotateY(DEG_90)
          instances.push(doorInstance, wallInstanceTop)
        }

        if (!this.tiles[x][y].wall && !this.tiles[x][y].isExit()) {
          if (x === 0 || this.tiles[x - 1][y].wall) {
            const wallInstance = new Instance(models['block'], [(x - 1) * 16 + 6, 0, y * 16])
            const wallInstanceTop = new Instance(models['block'], [(x - 1) * 16 + 6, 16, y * 16])
            wallInstance.rotateY(DEG_90)
            wallInstanceTop.rotateY(DEG_90)
            wallInstance.scale = [1, 1, 0.5]
            wallInstanceTop.scale = [1, 1, 0.5]
            instances.push(wallInstance, wallInstanceTop)
          }

          if (y === 0 || this.tiles[x][y - 1].wall) {
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

/**
 * Tile holds the data for a single tile in the room
 */
export class Tile {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.impassable = true
    this.exit = null
    this.wall = true
  }

  floor() {
    this.wall = false
    this.impassable = false
  }

  isExit() {
    return this.exit !== null
  }

  setExit(targetZone, targetX, targetY) {
    this.exit = new Exit(targetZone, targetX, targetY)
    this.wall = false
  }
}

/**
 * Exit represents a door between two zones
 */
export class Exit {
  constructor(targetZone, targetX, targetY) {
    this.targetZone = targetZone
    this.targetX = targetX
    this.targetY = targetY
  }
}
