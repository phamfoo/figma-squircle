export interface FigmaSquircleParams {
  radius: number
  smoothing: number
  width: number
  height: number
}

export function getSvgPath({
  radius,
  smoothing,
  width,
  height,
}: FigmaSquircleParams) {
  radius = Math.min(radius, width / 2, height / 2)

  // Keeping these variable names the same as the original code for now
  // https://github.com/MartinRGB/Figma_Squircles_Approximation/blob/bf29714aab58c54329f3ca130ffa16d39a2ff08c/js/rounded-corners.js#L64
  const shortest_l = Math.min(width, height)

  const p = Math.min(shortest_l / 2, (1 + smoothing) * radius)

  let angle_alpha: number, angle_beta: number
  if (radius > shortest_l / 4) {
    const change_percentage = (radius - shortest_l / 4) / (shortest_l / 4)
    angle_beta = 90 * (1 - smoothing * (1 - change_percentage))
    angle_alpha = 45 * smoothing * (1 - change_percentage)
  } else {
    angle_beta = 90 * (1 - smoothing)
    angle_alpha = 45 * smoothing
  }

  const angle_theta = (90 - angle_beta) / 2

  const d_div_c = Math.tan(toRadians(angle_alpha))
  const h_longest = radius * Math.tan(toRadians(angle_theta / 2))

  const l = Math.sin(toRadians(angle_beta / 2)) * radius * Math.pow(2, 1 / 2)
  const c = h_longest * Math.cos(toRadians(angle_alpha))
  const d = c * d_div_c
  const b = (p - l - (1 + d_div_c) * c) / 3
  const a = 2 * b

  return `
  M ${width / 2} 0
  L ${Math.max(width / 2, width - p)} 0
  C ${width - (p - a)} 0 ${width - (p - a - b)} 0 ${width -
    (p - a - b - c)} ${d}
  a ${radius} ${radius} 0 0 1 ${l} ${l}
  C ${width} ${p - a - b}
      ${width} ${p - a}
      ${width} ${Math.min(height / 2, p)}
  L ${width} ${Math.max(height / 2, height - p)}
  C ${width} ${height - (p - a)}
    ${width} ${height - (p - a - b)}
    ${width - d} ${height - (p - a - b - c)}
  a ${radius} ${radius} 0 0 1 -${l} ${l}
  C ${width - (p - a - b)} ${height}
        ${width - (p - a)} ${height}
        ${Math.max(width / 2, width - p)} ${height}
  L ${Math.min(width / 2, p)} ${height}
  C ${p - a} ${height}
    ${p - a - b} ${height}
    ${p - a - b - c} ${height - d}
  a ${radius} ${radius} 0 0 1 -${l} -${l}
  C 0 ${height - (p - a - b)}
    0 ${height - (p - a)}
    0 ${Math.max(height / 2, height - p)}
  L 0 ${Math.min(height / 2, p)}
  C 0 ${p - a}
    0 ${p - a - b}
    ${d} ${p - a - b - c}
  a ${radius} ${radius} 0 0 1 ${l} -${l}
  C ${p - a - b} 0
    ${p - a} 0
    ${+Math.min(width / 2, p)} 0
  Z
  `.replace(/[\t\s\n]+/g, ' ')
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}
