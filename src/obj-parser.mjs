let objPositions = [[0, 0, 0]]
let objTexcoords = [[0, 0]]
let objNormals = [[0, 0, 0]]

// same order as `f` indices
let objVertexData = [objPositions, objTexcoords, objNormals]

// same order as `f` indices
let webglVertexData = [
  [], // positions
  [], // texcoords
  [], // normals
]

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
    const numTriangles = parts.length - 2
    for (let tri = 0; tri < numTriangles; ++tri) {
      addVertex(parts[0])
      addVertex(parts[tri + 1])
      addVertex(parts[tri + 2])
    }
  },
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

export function parseOBJ(text) {
  // objPositions = [[0, 0, 0]]
  // objTexcoords = [[0, 0]]
  // objNormals = [[0, 0, 0]]

  // // same order as `f` indices
  // objVertexData = [objPositions, objTexcoords, objNormals]

  // // same order as `f` indices
  // webglVertexData = [
  //   [], // positions
  //   [], // texcoords
  //   [], // normals
  // ]

  const keywordRE = /(\w*)(?: )*(.*)/
  const lines = text.split('\n')

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

  return {
    position: webglVertexData[0],
    texcoord: webglVertexData[1],
    normal: webglVertexData[2],
  }
}
