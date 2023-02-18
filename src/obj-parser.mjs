// ===== obj-parser.mjs ==========================================================
// A simple OBJ parser, works well, but FAR from comprehensive
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-obj-loader.html
// Ben Coleman, 2023
// ===============================================================================

const keywordRE = /(\w*)(?: )*(.*)/

export function parseOBJ(text) {
  const lines = text.split('\n')

  const objPositions = [[0, 0, 0]]
  const objTexcoords = [[0, 0]]
  const objNormals = [[0, 0, 0]]

  // same order as `f` indices
  const objVertexData = [objPositions, objTexcoords, objNormals]

  // same order as `f` indices
  let webglVertexData = [
    [], // positions
    [], // texcoords
    [], // normals
  ]

  const geometries = []
  let geometry = null
  let material = '__default'
  const materialLibs = []

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat))
    },

    vn(parts) {
      objNormals.push(parts.map(parseFloat))
    },

    vt(parts) {
      objTexcoords.push(parts.map(parseFloat))
    },

    f(parts) {
      setGeometry()
      const numTriangles = parts.length - 2
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0])
        addVertex(parts[tri + 1])
        addVertex(parts[tri + 2])
      }
    },

    usemtl(_, unparsedArgs) {
      material = unparsedArgs
      newGeometry()
    },

    mtllib(_, unparsedArgs) {
      materialLibs.push(unparsedArgs)
    },

    // Not used, but suppress warnings
    s(_, blah) {},
    o(_, blah) {},
  }

  function addVertex(vert) {
    const ptn = vert.split('/')

    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return
      }

      const objIndex = parseInt(objIndexStr)
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length)

      webglVertexData[i].push(...objVertexData[i][index])
    })
  }

  function newGeometry() {
    // If there is an existing geometry and it's not empty then start a new one.
    if (geometry && geometry.data.position.length) {
      geometry = undefined
    }
  }

  function setGeometry() {
    if (!geometry) {
      const position = []
      const texcoord = []
      const normal = []

      webglVertexData = [position, texcoord, normal]

      geometry = {
        material,
        data: {
          position,
          texcoord,
          normal,
        },
      }

      geometries.push(geometry)
    }
  }

  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim()
    if (line === '' || line.startsWith('#')) {
      continue
    }

    const m = keywordRE.exec(line)
    if (!m) {
      continue
    }

    const [, keyword, unparsedArgs] = m
    const parts = line.split(/\s+/).slice(1)

    const handler = keywords[keyword]
    if (!handler) {
      console.warn('unhandled keyword:', keyword, 'at line', lineNo + 1)
      continue
    }

    handler(parts, unparsedArgs)
  }

  // Return pair of array of geometry & array of material library names
  return {
    matLibNames: materialLibs,
    geometries: geometries,
  }
}
