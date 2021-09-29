import { Flock, Boid } from 'wasm-boids';
// import { memory } from 'wasm-boids/wasm_boids_bg';
import vertexShaderSource from './shaders/simple-vertex.glsl';
import fragmentShaderSource from './shaders/simple-fragment.glsl';

import fps from './fps'

let gl, canvas, ext;
// const fixedDelta = 1/60.0;

const shapeScale = 15;
const numVertices = 6;
const boidCount = 500;

const maxSpeed = 2.0; // 2.0
const maxForce = 0.03; // 0.03
const desiredSeparation = 30.0; // 25
const neighborDistance =  60.0; // 50

let positionLoc, matrixLoc, projectionLoc;
let program;
let positionBuffer, matrixBuffer;
const matrices = [];
const matrixData = new Float32Array(boidCount * 16);

let flock;

let resizeHandle = null;
let resizeDebounce = 500;


const title = document.getElementById("title");
title.textContent = `RUST WASM BOIDS. Boid-count: ${boidCount}`;

const positions = [
  0,  0.5,
  0.4, -0.5,
  0, -0.35,
  0,  0.5,
  0, -0.35,
  -0.4, -0.5,
].map(x => x * shapeScale);

const init = () => {
  canvas = document.getElementById('boids-canvas');
  gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('webgl not available');
    return false; 
  }

  ext = gl.getExtension('ANGLE_instanced_arrays');
  if (!ext) {
    console.error('ANGLE_instanced_arrays not available');
    return false;
  }

  resize();
  
  program = webglUtils.createProgramFromSources(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  positionLoc = gl.getAttribLocation(program, 'a_position');
  matrixLoc = gl.getAttribLocation(program, 'matrix');
  projectionLoc = gl.getUniformLocation(program, 'projection');

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  // setup matrixes, one per instance
  // make a typed array with one view per matrix
  for (let i = 0; i < boidCount; ++i) {
    const byteOffsetToMatrix = i * 16 * 4;
    const numFloatsForView = 16;
    matrices.push(new Float32Array(
        matrixData.buffer,
        byteOffsetToMatrix,
        numFloatsForView));
  }

  matrixBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);

  flock = Flock.new(
    gl.canvas.width,
    gl.canvas.height,
    boidCount,
    shapeScale * 0.5,
    maxSpeed,
    maxForce,
    desiredSeparation,
    neighborDistance,
  );
  
  return true;
}

const update = (time) => {
  fps.render();
  
  flock.tick();
  render(time);
  requestAnimationFrame(update);
}

const render = (time) => {
  const boids = flock.boid_array();

  gl.clearColor(75/255.0, 68/255.0, 83/255.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  var projectionMatrix = m4.orthographic(0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight, -1, 1);
  gl.uniformMatrix4fv(projectionLoc, false,  projectionMatrix);

  gl.enableVertexAttribArray(positionLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  // update all the matrices
  matrices.forEach((mat, i) => {
    m4.translation(boids[i].get_x(), boids[i].get_y(), 0, mat);
    m4.zRotate(mat, boids[i].get_angle(), mat);
  });

  // upload the new matrix data
  gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);

  // set all 4 attributes for matrix
  const bytesPerMatrix = 4 * 16;
  for (let i = 0; i < 4; ++i) {
    const loc = matrixLoc + i;
    gl.enableVertexAttribArray(loc);
    // note the stride and offset
    const offset = i * 16;  // 4 floats per row, 4 bytes per float
    gl.vertexAttribPointer(
        loc,              // location
        4,                // size (num values to pull from buffer per iteration)
        gl.FLOAT,         // type of data in buffer
        false,            // normalize
        bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
        offset,           // offset in buffer
    );
    // this line says this attribute only changes for each 1 instance
    ext.vertexAttribDivisorANGLE(loc, 1);
  }

  ext.drawArraysInstancedANGLE(
    gl.TRIANGLES,
    0,             // offset
    numVertices,   // num vertices per instance
    boidCount,  // num instances
  );
}

const resize = () => {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  if(flock) {
    flock.set_size(gl.canvas.width, gl.canvas.height);
  }
}

if(init()) {
  resize();
  requestAnimationFrame(update);

  window.onresize = (event) => {
    clearTimeout(resizeHandle);
    resizeHandle = setTimeout(resize, resizeDebounce);
  };
}