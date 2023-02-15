precision highp float;

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

uniform vec3 u_lightWorldPos;
uniform vec3 u_lightColor;
uniform vec3 u_lightAmbient;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

// varying to pass to fragment shader
varying vec3 v_lighting;
varying vec2 v_texCoord;

void main() {
  v_texCoord = texcoord;

  // Standard diffuse directional lighting, move this to frag shader
  vec3 lightVector = normalize(u_lightWorldPos);
  vec4 normalWorld = u_worldInverseTranspose * vec4(normal, 1.0);
  float intensity = clamp(dot(normalWorld.xyz, lightVector), 0.0, 1.0);

  v_lighting = u_lightAmbient + (u_lightColor * intensity);
  gl_Position = u_worldViewProjection * position;
}