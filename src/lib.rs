// https://processing.org/examples/flocking.html

mod utils;

extern crate js_sys;
extern crate web_sys;

use wasm_bindgen::prelude::*;
use vector2d::Vector2D;
use js_sys::Array;
use core::f64::consts::PI;
use std::ops::Add;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

macro_rules! log {
  ( $( $t:tt )* ) => {
      web_sys::console::log_1(&format!( $( $t )* ).into());
  }
}

#[wasm_bindgen]
pub struct Flock {
  width: f64,
  height: f64,
  boids: Vec<Boid>,
  radius: f64,
  max_speed: f64,
  max_force: f64,
  desired_separation: f64,
  neighbor_distance: f64,
}

#[wasm_bindgen]
impl Flock {
  pub fn new(width: f64, height: f64, count: i32, radius: f64, max_speed: f64, max_force: f64, desired_separation: f64, neighbor_distance: f64,) -> Flock {
    utils::set_panic_hook(); 
    log!("Wasm boids v.0.1.0"); 
    let boids = (0..count)
      .map(|_i| {
        Boid::new(Vector2D::new(js_sys::Math::random() * width, js_sys::Math::random() * height))
      })
      .collect();

    Flock {
        width,
        height,
        boids,
        radius,
        max_speed,
        max_force,
        desired_separation,
        neighbor_distance
    }
  }

  pub fn boid_array(&self) -> Array {
    self.boids.iter().copied().map(JsValue::from).collect()
  }

  pub fn tick(&mut self) {
    self.flock();

    self.update();

    self.wrap_around();
  }

  pub fn set_size(&mut self, width: f64, height: f64) {
    self.width = width;
    self.height = height;
  }

  pub fn flock(&mut self) {
    let mut dir: Vector2D<f64>;

    let mut separation: Vector2D<f64>;
    let mut separation_count: i32;
    
    let mut align: Vector2D<f64>;
    let mut align_count: i32;

    let mut cohesion: Vector2D<f64>;
    let mut cohesion_count: i32;
    
    for i in 0..self.boids.len() {
      separation = Vector2D::new(0.0, 0.0);
      separation_count = 0;

      align = Vector2D::new(0.0, 0.0);
      align_count = 0;
      
      cohesion = Vector2D::new(0.0, 0.0);
      cohesion_count = 0;

      //FLOCK
      for n in 0..self.boids.len() {
        if i == n {
          continue;
        }

        let other = self.boids[n];
        dir = self.boids[i].position - other.position;

        // Separate
        if dir.length_squared() < self.desired_separation * self.desired_separation {
          separation = separation + (dir.normalise() / dir.length());
          separation_count = separation_count + 1;
        }

        if dir.length_squared() < self.neighbor_distance * self.neighbor_distance {
          // Align
          align = align + other.velocity;
          align_count = align_count + 1;

          // Cohesion
          cohesion = cohesion + other.position;
          cohesion_count = cohesion_count + 1;
        }
      }

      if separation_count > 0 {
        separation = separation / (separation_count as f64);
      }

      if separation.length_squared() > 0.0 {
        separation = separation.normalise();
        separation = separation * self.max_speed;
        separation = separation - self.boids[i].velocity;
        if separation.length_squared() > self.max_force * self.max_force {
          separation = separation.normalise() * self.max_force;
        }
      }

      if align_count > 0 {
        align = align / (align_count as f64);
      }

      if align.length_squared() > 0.0 {
        align = align.normalise();
        align = align * self.max_speed;
        align = align - self.boids[i].velocity;
        if align.length_squared() > self.max_force * self.max_force {
          align = align.normalise() * self.max_force;
        }
      }

      if cohesion_count > 0 {
        cohesion = cohesion / (cohesion_count as f64);
        
        let mut desired = cohesion - self.boids[i].position;
        desired = desired.normalise() * self.max_speed;

        cohesion = desired - self.boids[i].velocity;
        if cohesion.length_squared() > self.max_force * self.max_force {
          cohesion = cohesion.normalise() * self.max_force; // steer.limit(maxforce);
        }
      }

      // Arbitrarily weight the forces
      separation = separation * 1.5;
      align = align * 1.0;
      cohesion = cohesion * 1.0;

      self.boids[i].acceleration = self.boids[i].acceleration + separation + align + cohesion;
       
    }
  }

  pub fn update(&mut self) {
    for i in 0..self.boids.len() {
      self.boids[i].velocity = self.boids[i].velocity.add(self.boids[i].acceleration);
      if self.boids[i].velocity.length_squared() > self.max_speed * self.max_speed {
        self.boids[i].velocity = self.boids[i].velocity.normalise() * self.max_speed;
      }

      self.boids[i].position = self.boids[i].position.add(self.boids[i].velocity);
      self.boids[i].acceleration.x = 0.0;
      self.boids[i].acceleration.y = 0.0;
    }
  }

  pub fn wrap_around(&mut self) {
    for i in 0..self.boids.len() {
      if self.boids[i].position.x < -self.radius {
        self.boids[i].position.x = self.width + self.radius;
      }
      if self.boids[i].position.y < -self.radius {
        self.boids[i].position.y = self.height + self.radius;
      }
      if self.boids[i].position.x > self.width + self.radius {
        self.boids[i].position.x = -self.radius;
      }
      if self.boids[i].position.y > self.height + self.radius {
        self.boids[i].position.y = -self.radius;
      }
    }
  }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Boid {
  position: Vector2D<f64>,
  velocity: Vector2D<f64>,
  acceleration: Vector2D<f64>,
}

impl Boid {
  pub fn new(position: Vector2D<f64>) -> Boid {
    let angle = js_sys::Math::random() * PI * 2.0;
    Boid {
      position,
      velocity: Vector2D::new(js_sys::Math::cos(angle), js_sys::Math::sin(angle)),
      acceleration: Vector2D::new(0.0, 0.0),
    }
  }
}w

#[wasm_bindgen]
impl Boid {
  pub fn get_x(&self) -> f64 {
    self.position.x
  }

  pub fn get_y(&self) -> f64 {
    self.position.y
  }

  pub fn get_angle(&self) -> f64 {
    self.velocity.angle() - (PI / 2.0)
  }
}