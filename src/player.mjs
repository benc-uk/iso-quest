import { Sprite } from './sprites.mjs'

export class Player {
  /** @type {Sprite} */
  sprite

  /** @type {[number, number, number]} */
  position

  constructor() {
    this.sprite = new Sprite('dwarf_1')
    this.position = [0, 0, 0]
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setPosition(x, y, z) {
    this.position = [x, y, z]
    this.sprite.position = [x, y, z]
  }
}
