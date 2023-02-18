//
// This is pure documentation, not used by the code.
//

interface Model {
  name: string;
  parts: Array<Part>;
  materials: Map<string, Material>;
}

interface Part {
  bufferInfo: any;  // GLBufferInfo
  material: string;
}

type Material {
  diffuse?: [number, number, number];
  shininess?: number;
  ambient?: [number, number, number];
  specular?: [number, number, number];
  emission?: [number, number, number];
  opticalDensity?: number;
  opacity?: number;
  illum?: number;
}

type Instance {
  model: Model;
  position: [number, number, number];
}