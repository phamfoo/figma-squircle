# Figma Squircle

[![Stable Release](https://img.shields.io/npm/v/figma-squircle)](https://npm.im/figma-squircle) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

> Figma-flavored squircles for everyone

## Installation

```sh
yarn add figma-squircle
```

or

```sh
npm install figma-squircle
```

## Usage

```jsx
import { getSvgPath } from 'figma-squircle'

const svgPath = getSvgPath({
  width: 200,
  height: 200,
  radius: 24,
  smoothing: 0.8, // Smoothing ranges from 0 to 1
})

// svgPath can now be used to create SVG elements
function PinkSquircle() {
  return (
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <path d={svgPath} fill="pink" />
    </svg>
  )
}

// Or with the clip-path CSS property
function ProfilePicture() {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        clipPath: `path('${svgPath}')`,
      }}
    >
      ...
    </div>
  )
}
```

## Thanks

- Figma team for publishing [this article](https://www.figma.com/blog/desperately-seeking-squircles/) and [MartinRGB](https://github.com/MartinRGB/Figma_Squircles_Approximation) for [figuring out all the math](https://github.com/MartinRGB/Figma_Squircles_Approximation) behind it.
- [George Francis](https://georgefrancis.dev/) for creating [Squircley](https://squircley.app/), which was my introduction to squircles.
