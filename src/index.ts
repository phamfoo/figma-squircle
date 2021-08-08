export interface FigmaSquircleParams {
  cornerRadius?: number
  topLeftCornerRadius?: number
  topRightCornerRadius?: number
  bottomRightCornerRadius?: number
  bottomLeftCornerRadius?: number
  cornerSmoothing: number
  width: number
  height: number
}

export function getSvgPath({
  cornerRadius = 0,
  topLeftCornerRadius,
  topRightCornerRadius,
  bottomRightCornerRadius,
  bottomLeftCornerRadius,
  cornerSmoothing,
  width,
  height,
}: FigmaSquircleParams) {
  const defaultPathParams = getPathParamsForCorner({
    width,
    height,
    cornerRadius,
    cornerSmoothing,
  })

  // Most of the time, all corners will have the same radius
  // Instead of calculating path params for all 4 corners,
  // we want to use the default path params whenever possible
  const topLeftPathPathParams =
    topLeftCornerRadius !== undefined
      ? getPathParamsForCorner({
          width,
          height,
          cornerRadius: topLeftCornerRadius,
          cornerSmoothing,
        })
      : defaultPathParams

  const topRightPathPathParams =
    topRightCornerRadius !== undefined
      ? getPathParamsForCorner({
          width,
          height,
          cornerRadius: topRightCornerRadius,
          cornerSmoothing,
        })
      : defaultPathParams

  const bottomRightPathPathParams =
    bottomRightCornerRadius !== undefined
      ? getPathParamsForCorner({
          width,
          height,
          cornerRadius: bottomRightCornerRadius,
          cornerSmoothing,
        })
      : defaultPathParams

  const bottomLeftPathPathParams =
    bottomLeftCornerRadius !== undefined
      ? getPathParamsForCorner({
          width,
          height,
          cornerRadius: bottomLeftCornerRadius,
          cornerSmoothing,
        })
      : defaultPathParams

  return `
    ${drawTopRightPath(topRightPathPathParams)}
    ${drawBottomRightPath(bottomRightPathPathParams)}
    ${drawBottomLeftPath(bottomLeftPathPathParams)}
    ${drawTopLeftPath(topLeftPathPathParams)}
  `
    .replace(/[\t\s\n]+/g, ' ')
    .trim()
}

function drawTopRightPath({
  cornerRadius,
  width,
  height,
  a,
  b,
  c,
  d,
  p,
  circularSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    M ${Math.max(width / 2, width - p)} 0
    C ${width - (p - a)} 0 ${width - (p - a - b)} 0 ${width -
      (p - a - b - c)} ${d}
    a ${cornerRadius} ${cornerRadius} 0 0 1 ${circularSectionLength} ${circularSectionLength}
    C ${width} ${p - a - b}
        ${width} ${p - a}
        ${width} ${Math.min(height / 2, p)}`
  } else {
    return `M ${width / 2} 0
    L ${width} ${0}
    L ${width} ${height / 2}`
  }
}

function drawBottomRightPath({
  cornerRadius,
  width,
  height,
  a,
  b,
  c,
  d,
  p,
  circularSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    L ${width} ${Math.max(height / 2, height - p)}
    C ${width} ${height - (p - a)}
      ${width} ${height - (p - a - b)}
      ${width - d} ${height - (p - a - b - c)}
    a ${cornerRadius} ${cornerRadius} 0 0 1 -${circularSectionLength} ${circularSectionLength}
    C ${width - (p - a - b)} ${height}
      ${width - (p - a)} ${height}
      ${Math.max(width / 2, width - p)} ${height}`
  } else {
    return `L ${width} ${height}
    L ${width / 2} ${height}`
  }
}

function drawBottomLeftPath({
  cornerRadius,
  width,
  height,
  a,
  b,
  c,
  d,
  p,
  circularSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    L ${Math.min(width / 2, p)} ${height}
    C ${p - a} ${height}
      ${p - a - b} ${height}
      ${p - a - b - c} ${height - d}
    a ${cornerRadius} ${cornerRadius} 0 0 1 -${circularSectionLength} -${circularSectionLength}
    C 0 ${height - (p - a - b)}
      0 ${height - (p - a)}
      0 ${Math.max(height / 2, height - p)}`
  } else {
    return `
    L ${0} ${height}
    L ${0} ${height / 2}`
  }
}

function drawTopLeftPath({
  cornerRadius,
  width,
  height,
  a,
  b,
  c,
  d,
  p,
  circularSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    L 0 ${Math.min(height / 2, p)}
    C 0 ${p - a}
      0 ${p - a - b}
      ${d} ${p - a - b - c}
    a ${cornerRadius} ${cornerRadius} 0 0 1 ${circularSectionLength} -${circularSectionLength}
    C ${p - a - b} 0
      ${p - a} 0
      ${+Math.min(width / 2, p)} 0
    Z`
  } else {
    return `L ${0} ${0}
    Z`
  }
}

interface CornerParams {
  cornerRadius: number
  cornerSmoothing: number
  width: number
  height: number
}

interface CornerPathParams {
  a: number
  b: number
  c: number
  d: number
  p: number
  cornerRadius: number
  circularSectionLength: number
  width: number
  height: number
}

function getPathParamsForCorner({
  cornerRadius,
  cornerSmoothing,
  width,
  height,
}: CornerParams): CornerPathParams {
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

  return {
    a,
    b,
    c,
    d,
    p,
    width,
    height,
    circularSectionLength,
    cornerRadius,
  }
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}
