import { Sprite } from './sprites.mjs'

export class Player {
  /** @type {Sprite} */
  sprite

  /** @type {number[]} */
  position

  constructor() {
    this.sprite = new Sprite('dwarf_1')
    this.position = [0, 0, 0]
  }

  /**
   * Set the position of the player
   *
   * @param {number} x - x position
   * @param {number} y - y position
   * @param {number} z - z position
   */
  setPosition(x, y, z) {
    this.position = [x, y, z]
    this.sprite.position = [x, y, z]
  }
}
