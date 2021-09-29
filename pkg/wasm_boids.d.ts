/* tslint:disable */
/* eslint-disable */
/**
*/
export class Boid {
  free(): void;
/**
* @returns {number}
*/
  get_x(): number;
/**
* @returns {number}
*/
  get_y(): number;
/**
* @returns {number}
*/
  get_angle(): number;
}
/**
*/
export class Flock {
  free(): void;
/**
* @param {number} width
* @param {number} height
* @param {number} count
* @param {number} radius
* @param {number} max_speed
* @param {number} max_force
* @param {number} desired_separation
* @param {number} neighbor_distance
* @returns {Flock}
*/
  static new(width: number, height: number, count: number, radius: number, max_speed: number, max_force: number, desired_separation: number, neighbor_distance: number): Flock;
/**
* @returns {Array<any>}
*/
  boid_array(): Array<any>;
/**
*/
  tick(): void;
/**
* @param {number} width
* @param {number} height
*/
  set_size(width: number, height: number): void;
/**
*/
  flock(): void;
/**
*/
  update(): void;
/**
*/
  wrap_around(): void;
}
