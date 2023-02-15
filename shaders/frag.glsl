precision highp float;

varying vec3 v_lighting;
varying vec2 v_texCoord;

uniform sampler2D u_texture;

void main(void) {
  vec4 diffuseColor = texture2D(u_texture, v_texCoord);

  gl_FragColor = diffuseColor * vec4(v_lighting, 1.0);
}
