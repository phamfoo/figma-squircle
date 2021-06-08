export interface FigmaSquircleParams {
  cornerRadius: number
  cornerSmoothing: number
  width: number
  height: number
}

export function getSvgPath({
  cornerRadius,
  cornerSmoothing,
  width,
  height,
}: FigmaSquircleParams) {
  const maxRadius = Math.min(width, height) / 2
  cornerRadius = Math.min(cornerRadius, maxRadius)

  // The article from figma's blog
  // https://www.figma.com/blog/desperately-seeking-squircles/
  //
  // The original code
  // https://github.com/MartinRGB/Figma_Squircles_Approximation/blob/bf29714aab58c54329f3ca130ffa16d39a2ff08c/js/rounded-corners.js#L64

  // 12.2 from the article
  const p = Math.min((1 + cornerSmoothing) * cornerRadius, maxRadius)

  let angleAlpha: number, angleBeta: number

  if (cornerRadius <= maxRadius / 2) {
    angleBeta = 90 * (1 - cornerSmoothing)
    angleAlpha = 45 * cornerSmoothing
  } else {
    // When `cornerRadius` is larger and `maxRadius / 2`,
    // these angles also depend on `cornerRadius` and `maxRadius / 2`
    //
    // I did a few tests in Figma and this code generated similar but not identical results
    // `diffRatio` was called `change_percentage` in the orignal code
    const diffRatio = (cornerRadius - maxRadius / 2) / (maxRadius / 2)

    angleBeta = 90 * (1 - cornerSmoothing * (1 - diffRatio))
    angleAlpha = 45 * cornerSmoothing * (1 - diffRatio)
  }

  const angleTheta = (90 - angleBeta) / 2

  // This was called `h_longest` in the original code
  // In the article this is the distance between 2 control points: P3 and P4
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleTheta / 2))

  // This was called `l` in the original code
  const circularSectionLength =
    Math.sin(toRadians(angleBeta / 2)) * cornerRadius * Math.sqrt(2)

  // a, b, c and d are from 11.1 in the article
  const c = p3ToP4Distance * Math.cos(toRadians(angleAlpha))
  const d = c * Math.tan(toRadians(angleAlpha))
  const b = (p - circularSectionLength - c - d) / 3
  const a = 2 * b

  return `
  M ${Math.max(width / 2, width - p)} 0
  C ${width - (p - a)} 0 ${width - (p - a - b)} 0 ${width -
    (p - a - b - c)} ${d}
  a ${cornerRadius} ${cornerRadius} 0 0 1 ${circularSectionLength} ${circularSectionLength}
  C ${width} ${p - a - b}
      ${width} ${p - a}
      ${width} ${Math.min(height / 2, p)}
  L ${width} ${Math.max(height / 2, height - p)}
  C ${width} ${height - (p - a)}
    ${width} ${height - (p - a - b)}
    ${width - d} ${height - (p - a - b - c)}
  a ${cornerRadius} ${cornerRadius} 0 0 1 -${circularSectionLength} ${circularSectionLength}
  C ${width - (p - a - b)} ${height}
        ${width - (p - a)} ${height}
        ${Math.max(width / 2, width - p)} ${height}
  L ${Math.min(width / 2, p)} ${height}
  C ${p - a} ${height}
    ${p - a - b} ${height}
    ${p - a - b - c} ${height - d}
  a ${cornerRadius} ${cornerRadius} 0 0 1 -${circularSectionLength} -${circularSectionLength}
  C 0 ${height - (p - a - b)}
    0 ${height - (p - a)}
    0 ${Math.max(height / 2, height - p)}
  L 0 ${Math.min(height / 2, p)}
  C 0 ${p - a}
    0 ${p - a - b}
    ${d} ${p - a - b - c}
  a ${cornerRadius} ${cornerRadius} 0 0 1 ${circularSectionLength} -${circularSectionLength}
  C ${p - a - b} 0
    ${p - a} 0
    ${+Math.min(width / 2, p)} 0
  Z
  `
    .replace(/[\t\s\n]+/g, ' ')
    .trim()
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}
