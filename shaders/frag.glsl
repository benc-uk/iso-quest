precision highp float;

varying vec3 v_lighting;
varying vec2 v_texCoord;

uniform vec3 u_diffuse;

void main(void) {
  gl_FragColor = vec4(u_diffuse, 1.0) * vec4(v_lighting, 1.0);
}
