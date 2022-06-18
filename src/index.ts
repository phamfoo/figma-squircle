export interface FigmaSquircleParams {
  cornerRadius?: number
  topLeftCornerRadius?: number
  topRightCornerRadius?: number
  bottomRightCornerRadius?: number
  bottomLeftCornerRadius?: number
  cornerSmoothing: number
  width: number
  height: number
  preserveSmoothing?: boolean
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
  preserveSmoothing = false,
}: FigmaSquircleParams) {
  const defaultPathParams = getPathParamsForCorner({
    width,
    height,
    cornerRadius,
    cornerSmoothing,
    preserveSmoothing,
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
          preserveSmoothing,
        })
      : defaultPathParams

  const topRightPathPathParams =
    topRightCornerRadius !== undefined
      ? getPathParamsForCorner({
          width,
          height,
          cornerRadius: topRightCornerRadius,
          cornerSmoothing,
          preserveSmoothing,
        })
      : defaultPathParams

  const bottomRightPathPathParams =
    bottomRightCornerRadius !== undefined
      ? getPathParamsForCorner({
          width,
          height,
          cornerRadius: bottomRightCornerRadius,
          cornerSmoothing,
          preserveSmoothing,
        })
      : defaultPathParams

  const bottomLeftPathPathParams =
    bottomLeftCornerRadius !== undefined
      ? getPathParamsForCorner({
          width,
          height,
          cornerRadius: bottomLeftCornerRadius,
          cornerSmoothing,
          preserveSmoothing,
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

interface CornerParams {
  cornerRadius: number
  cornerSmoothing: number
  width: number
  height: number
  preserveSmoothing: boolean
}

interface CornerPathParams {
  a: number
  b: number
  c: number
  d: number
  p: number
  cornerRadius: number
  arcSectionLength: number
  width: number
  height: number
}

// The article from figma's blog
// https://www.figma.com/blog/desperately-seeking-squircles/
//
// The original code by MartinRGB
// https://github.com/MartinRGB/Figma_Squircles_Approximation/blob/bf29714aab58c54329f3ca130ffa16d39a2ff08c/js/rounded-corners.js#L64
function getPathParamsForCorner({
  cornerRadius,
  cornerSmoothing,
  width,
  height,
  preserveSmoothing,
}: CornerParams): CornerPathParams {
  const maxRadius = Math.min(width, height) / 2
  cornerRadius = Math.min(cornerRadius, maxRadius)

  // From figure 12.2 in the article
  // p = (1 + cornerSmoothing) * q
  // in this case q = R because theta = 90deg
  let p = (1 + cornerSmoothing) * cornerRadius

  // The maximum amount of pixels we can use for rounding and smoothing is maxRadius
  // When there's not enough space left (p > maxRadius), there are 2 options:
  //
  // 1. What figma's currently doing: limit the smoothing value to make sure p <= maxRadius
  // But what this means is that at some point when cornerRadius is large enough,
  // increasing the smoothing value wouldn't do anything
  //
  // 2. Keep the original smoothing value and use it to calculate the bezier curve normally,
  // then adjust the control points to achieve similar curvature profile
  //
  // preserveSmoothing is a new option I added
  //
  // If preserveSmoothing is on then we'll just keep using the original smoothing value
  // and adjust the bezier curve later
  if (!preserveSmoothing) {
    const maxCornerSmoothing = maxRadius / cornerRadius - 1
    cornerSmoothing = Math.min(cornerSmoothing, maxCornerSmoothing)
    p = Math.min(p, maxRadius)
  }

  // In a normal rounded rectangle (cornerSmoothing = 0), this is 90
  // The larger the smoothing, the smaller the arc
  const arcMeasure = 90 * (1 - cornerSmoothing)
  const arcSectionLength =
    Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2)

  // In the article this is the distance between 2 control points: P3 and P4
  const angleAlpha = (90 - arcMeasure) / 2
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2))

  // a, b, c and d are from figure 11.1 in the article
  const angleBeta = 45 * cornerSmoothing
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta))
  const d = c * Math.tan(toRadians(angleBeta))

  let b = (p - arcSectionLength - c - d) / 3
  let a = 2 * b

  // Adjust the P1 and P2 control points if there's not enough space left
  if (preserveSmoothing && p > maxRadius) {
    const p1ToP3MaxDistance = maxRadius - d - arcSectionLength - c

    // Try to maintain some distance between P1 and P2 so the curve wouldn't look weird
    const minA = p1ToP3MaxDistance / 6
    const maxB = p1ToP3MaxDistance - minA

    b = Math.min(b, maxB)
    a = p1ToP3MaxDistance - b
    p = Math.min(p, maxRadius)
  }

  return {
    a,
    b,
    c,
    d,
    p,
    width,
    height,
    arcSectionLength,
    cornerRadius,
  }
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
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
  arcSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    M ${width - p} 0
    C ${width - (p - a)} 0 ${width - (p - a - b)} 0 ${width -
      (p - a - b - c)} ${d}
    a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} ${arcSectionLength}
    C ${width} ${p - a - b}
        ${width} ${p - a}
        ${width} ${p}`
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
  arcSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    L ${width} ${height - p}
    C ${width} ${height - (p - a)}
      ${width} ${height - (p - a - b)}
      ${width - d} ${height - (p - a - b - c)}
    a ${cornerRadius} ${cornerRadius} 0 0 1 -${arcSectionLength} ${arcSectionLength}
    C ${width - (p - a - b)} ${height}
      ${width - (p - a)} ${height}
      ${width - p} ${height}`
  } else {
    return `L ${width} ${height}
    L ${width / 2} ${height}`
  }
}

function drawBottomLeftPath({
  cornerRadius,
  height,
  a,
  b,
  c,
  d,
  p,
  arcSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    L ${p} ${height}
    C ${p - a} ${height}
      ${p - a - b} ${height}
      ${p - a - b - c} ${height - d}
    a ${cornerRadius} ${cornerRadius} 0 0 1 -${arcSectionLength} -${arcSectionLength}
    C 0 ${height - (p - a - b)}
      0 ${height - (p - a)}
      0 ${height - p}`
  } else {
    return `
    L ${0} ${height}
    L ${0} ${height / 2}`
  }
}

function drawTopLeftPath({
  cornerRadius,
  a,
  b,
  c,
  d,
  p,
  arcSectionLength,
}: CornerPathParams) {
  if (cornerRadius) {
    return `
    L 0 ${p}
    C 0 ${p - a}
      0 ${p - a - b}
      ${d} ${p - a - b - c}
    a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} -${arcSectionLength}
    C ${p - a - b} 0
      ${p - a} 0
      ${p} 0
    Z`
  } else {
    return `L ${0} ${0}
    Z`
  }
}
