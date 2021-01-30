attribute vec4 a_position;
attribute mat4 matrix;
uniform mat4 projection;

void main() {
  gl_Position = projection * matrix * a_position;
}