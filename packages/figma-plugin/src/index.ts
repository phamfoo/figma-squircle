import { getSvgPath } from 'figma-squircle'

for (const node of figma.currentPage.selection) {
  if (node.type === 'RECTANGLE') {
    const {
      width,
      height,
      x,
      y,
      cornerSmoothing,
      topLeftRadius,
      topRightRadius,
      bottomLeftRadius,
      bottomRightRadius,
      fills,
    } = node

    let fillColor = '#000000'
    if (typeof fills === 'object' && fills.length > 0) {
      const fill = fills[0]

      if (fill.type === 'SOLID') {
        const colorRGB = fill.color
        fillColor = rgbToHex(colorRGB)
      }
    }

    const squirclePath = getSvgPath({
      width,
      height,
      cornerSmoothing,
      topLeftCornerRadius: topLeftRadius,
      topRightCornerRadius: topRightRadius,
      bottomLeftCornerRadius: bottomLeftRadius,
      bottomRightCornerRadius: bottomRightRadius,
      preserveSmoothing: true,
    })

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <path d="${squirclePath}" fill="${fillColor}" />
      </svg>`

    const svgFrameNode = figma.createNodeFromSvg(svg)
    const vectorNode = svgFrameNode.children[0]
    vectorNode.x = x + width * 1.25
    vectorNode.y = y

    const parentNode = node.parent ?? figma.currentPage
    parentNode.appendChild(vectorNode)
    svgFrameNode.remove()
  } else {
    figma.notify('Please select a rectangle')
  }
}

// This function converts Figma RGB to hex
function rgbToHex(colorRGB: RGB) {
  return (
    '#' +
    [colorRGB.r, colorRGB.g, colorRGB.b]
      .map((c) => {
        const hex = Math.floor(c * 255).toString(16)
        return hex.length == 1 ? '0' + hex : hex
      })
      .join('')
  )
}

figma.closePlugin()

export {}
