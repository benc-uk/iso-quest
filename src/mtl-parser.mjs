// ===== mtl-parser.mjs ==========================================================
// A simple MTL parser
// Taken from https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
// Ben Coleman, 2023
// ===============================================================================

export function parseMTL(text) {
  const materials = {}
  let material

  const keywords = {
    newmtl(parts, unparsedArgs) {
      material = {}
      materials[unparsedArgs] = material
    },

    Ns(parts) {
      material.ns = parseFloat(parts[0])
    },
    Ka(parts) {
      material.ka = parts.map(parseFloat)
    },
    Kd(parts) {
      material.kd = parts.map(parseFloat)
    },
    Ks(parts) {
      material.ks = parts.map(parseFloat)
    },
    Ke(parts) {
      material.ke = parts.map(parseFloat)
    },
    Ni(parts) {
      material.ni = parseFloat(parts[0])
    },
    d(parts) {
      material.d = parseFloat(parts[0])
    },
    illum(parts) {
      material.illum = parseInt(parts[0])
    },
  }

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
      console.warn('unhandled keyword:', keyword)
      continue
    }

    handler(parts, unparsedArgs)
  }

  return materials
}
