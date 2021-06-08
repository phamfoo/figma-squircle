import { forwardRef, HTMLProps, useState, RefObject, ReactElement } from 'react'
import Head from 'next/head'
import {
  SliderProps as ReachSliderProps,
  Slider as ReachSlider,
} from '@reach/slider'
import '@reach/slider/styles.css'
import { Rect } from '@reach/rect'
import { useId } from '@reach/auto-id'
import { saveAs } from 'file-saver'
import copy from 'copy-to-clipboard'
import toast, { Toaster } from 'react-hot-toast'
import { getSvgPath, FigmaSquircleParams } from '../../src'
import GithubCorner from 'react-github-corner'

export default function Home() {
  const [size, setSize] = useState(300)
  const [cornerRadius, setCornerRadius] = useState(48)
  const [cornerSmoothing, setCornerSmoothing] = useState(0.8)

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 md:flex-row">
      <Head>
        <title>Figma Squircle</title>
        <meta
          name="description"
          content="Figma-flavored squircles for everyone"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex items-center justify-center flex-1 relative">
        <Toaster
          toastOptions={{
            duration: 2400,
          }}
          position="top-center"
          containerStyle={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <div
          style={{
            width: size,
            height: size,
            clipPath: `path('${getSvgPath({
              width: size,
              height: size,
              cornerSmoothing,
              cornerRadius,
            })}')`,
          }}
          className="bg-indigo-600"
        />
      </main>

      {/* Sidebar */}
      <div className="flex flex-col justify-between w-full bg-gray-800 md:min-h-screen min-h-1/2 md:w-80">
        <div className="p-8">
          {/* Header */}
          <div className="hidden md:block">
            <div className="flex flex-row items-center justify-center">
              <img
                src="/figma_logo.svg"
                alt="Figma logo"
                height={28}
                width={20}
              />
              <div className="pl-2" />
              <h1 className="text-2xl text-gray-400">Figma Squircle</h1>
            </div>
            <div className="pt-8" />
          </div>

          {/* Controls */}
          <div>
            <Slider
              label="Size"
              value={size}
              onChange={setSize}
              min={200}
              max={400}
              step={1}
            />

            <div className="pt-8 md:pt-12" />

            <Slider
              label="Corner radius"
              value={cornerRadius}
              onChange={setCornerRadius}
              min={10}
              max={100}
              step={1}
            />

            <div className="pt-8 md:pt-12" />

            <Slider
              label="Corner smoothing"
              value={cornerSmoothing}
              onChange={setCornerSmoothing}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>

        <div className="flex flex-row p-8 md:flex-col">
          <div className="flex-1">
            <SolidButton
              onClick={() => {
                const svg = createSVG({
                  width: size,
                  height: size,
                  cornerRadius,
                  cornerSmoothing,
                })

                const blob = new Blob([svg], {
                  type: 'text/plain;charset=utf-8',
                })

                saveAs(blob, 'squircle.svg')
              }}
            >
              Save
            </SolidButton>
          </div>
          <div className="pl-4 md:pt-4" />
          <div className="flex-1">
            <OutlineButton
              onClick={() => {
                const svg = createSVG({
                  width: size,
                  height: size,
                  cornerRadius,
                  cornerSmoothing,
                })

                copy(svg)
                toast.success('Copied to clipboard!')
              }}
            >
              Copy
            </OutlineButton>
          </div>
        </div>
      </div>

      <GithubCorner
        href="https://github.com/tienphaw/figma-squircle"
        direction="left"
        bannerColor="#262626"
      />
    </div>
  )
}

const OutlineButton = forwardRef<
  HTMLButtonElement,
  HTMLProps<HTMLButtonElement>
>((props, buttonRef) => {
  return (
    <SquircleButtonContainer>
      {({ squirclePath: outerSquirclePath, ref }) => {
        return (
          <div
            ref={ref}
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-800"
            style={{ padding: 2, clipPath: `path('${outerSquirclePath}')` }}
          >
            <SquircleButtonContainer>
              {({ squirclePath: innerSquirclePath, ref }) => {
                return (
                  <div ref={ref}>
                    <button
                      {...props}
                      className="w-full py-4 text-gray-100 bg-gray-800 focus:outline-none active:text-gray-600 text-md"
                      ref={buttonRef}
                      style={{ clipPath: `path('${innerSquirclePath}')` }}
                      type="button"
                    />
                  </div>
                )
              }}
            </SquircleButtonContainer>
          </div>
        )
      }}
    </SquircleButtonContainer>
  )
})

const SolidButton = forwardRef<HTMLButtonElement, HTMLProps<HTMLButtonElement>>(
  (props, buttonRef) => {
    return (
      <SquircleButtonContainer>
        {({ squirclePath, ref }) => {
          return (
            <div ref={ref}>
              <button
                {...props}
                className="w-full py-4 text-indigo-100 bg-indigo-600 focus:outline-none hover:bg-indigo-500 active:bg-indigo-700 text-md"
                ref={buttonRef}
                style={{ clipPath: `path('${squirclePath}')` }}
                type="button"
              />
            </div>
          )
        }}
      </SquircleButtonContainer>
    )
  }
)

interface SquircleButtonContainerProps {
  children: (args: {
    squirclePath: string
    ref: RefObject<any>
  }) => ReactElement
}

function SquircleButtonContainer({ children }: SquircleButtonContainerProps) {
  return (
    <Rect>
      {({ rect, ref }) => {
        const squirclePath = rect
          ? getSvgPath({
              width: rect.width,
              height: rect.height,
              cornerRadius: 0.25 * rect.height,
              cornerSmoothing: 1,
            })
          : null

        return children({ ref, squirclePath })
      }}
    </Rect>
  )
}

interface SliderProps extends ReachSliderProps {
  label: string
}

function Slider({ label, value, ...rest }: SliderProps) {
  const sliderId = useId()

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between">
        <label htmlFor={sliderId} className="text-gray-400">
          {label}
        </label>
        <span className="text-gray-200">{value}</span>
      </div>
      <div className="pt-2" />

      <div>
        <ReachSlider
          handleAlignment="contain"
          value={value}
          id={sliderId}
          {...rest}
        />
      </div>
    </div>
  )
}

function createSVG(params: FigmaSquircleParams) {
  const squirclePath = getSvgPath(params)

  return `
  <svg width="${params.width}" height="${params.height}" xmlns="http://www.w3.org/2000/svg">
    <path d="${squirclePath}" fill="#4F46E5"/>
  </svg>`
}
