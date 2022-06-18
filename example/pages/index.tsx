import React, {
  HTMLProps,
  useState,
  RefObject,
  ReactElement,
  useEffect,
  ReactNode,
} from 'react'
import Head from 'next/head'
import {
  SliderProps as ReachSliderProps,
  SliderTrack,
  SliderMarker,
  SliderRange,
  SliderHandle,
  SliderInput,
} from '@reach/slider'
import { Rect } from '@reach/rect'
import { saveAs } from 'file-saver'
import copy from 'copy-to-clipboard'
import toast, { Toaster } from 'react-hot-toast'
import { getSvgPath, FigmaSquircleParams } from '../../src'
import GithubCorner from 'react-github-corner'
import {
  CustomCheckboxContainer,
  CustomCheckboxInput,
  CustomCheckboxProps,
} from '@reach/checkbox'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Head>
        <title>Figma Squircle</title>
        <meta
          name="description"
          content="Figma-flavored squircles for everyone"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-1">
        <App />
      </main>

      <GithubCorner
        href="https://github.com/tienphaw/figma-squircle"
        direction="left"
        bannerColor="#262626"
      />
    </div>
  )
}

function App() {
  const [size, setSize] = useState(300)
  const [cornerRadius, setCornerRadius] = useState(48)
  const [cornerSmoothing, setCornerSmoothing] = useState(0.8)
  const [preserveSmoothing, setPreserveSmoothing] = useState(false)

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="relative flex items-center justify-center flex-1">
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

        <svg
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
          className="fill-current text-violet-600 absolute"
        >
          <path
            d={`${getSvgPath({
              width: size,
              height: size,
              cornerSmoothing,
              cornerRadius,
              preserveSmoothing,
            })}`}
          />
        </svg>
      </div>
      {/* Sidebar */}
      <div className="flex flex-col w-full bg-gray-800 md:min-h-screen min-h-1/2 md:w-80">
        <div className="hidden md:block">
          <div className="p-6 flex justify-center">
            <img src="/logo.svg" alt="" />
          </div>
          <hr className="border-gray-700" />
        </div>
        {/* Controls */}
        <div className="p-6">
          <div className="flex flex-row gap-4">
            <NumberInput
              label="Size"
              initialValue={300}
              min={100}
              max={1000}
              onChange={setSize}
              icon="/icon_size.svg"
            />
            <NumberInput
              label="Radius"
              initialValue={40}
              min={0}
              onChange={setCornerRadius}
              icon="/icon_radius.svg"
            />
          </div>
          <div className="pt-8 md:pt-12" />

          <CornerSmoothingSlider
            value={cornerSmoothing}
            onChange={setCornerSmoothing}
          />
          <div className="pt-8 md:pt-12" />
          <PreserveSmoothingCheckbox
            checked={preserveSmoothing}
            onChange={e => setPreserveSmoothing(e.target.checked)}
          />
        </div>

        <div className="flex flex-1" />

        <hr className="hidden md:block border-gray-700" />
        <div className="flex flex-row py-8 px-6 md:flex-col gap-4">
          <div className="flex-1">
            <SecondaryButton
              onClick={() => {
                const svg = createSVG({
                  width: size,
                  height: size,
                  cornerRadius,
                  cornerSmoothing,
                  preserveSmoothing,
                })

                const blob = new Blob([svg], {
                  type: 'text/plain;charset=utf-8',
                })

                saveAs(blob, 'squircle.svg')
              }}
            >
              Save Svg
            </SecondaryButton>
          </div>

          <div className="flex-1">
            <PrimaryButton
              onClick={() => {
                const svg = createSVG({
                  width: size,
                  height: size,
                  cornerRadius,
                  cornerSmoothing,
                  preserveSmoothing,
                })

                copy(svg)
                toast.success('Copied to clipboard!')
              }}
            >
              Copy
            </PrimaryButton>
          </div>
          <span className="hidden md:block text-sm text-gray-400 font-semi-bold">
            Try copy-pasting this into Figma and compare
          </span>
        </div>
      </div>
    </div>
  )
}

function PreserveSmoothingCheckbox(props: CustomCheckboxProps) {
  return (
    <label className="block flex items-center text-sm text-gray-400 uppercase font-semibold tracking-wider">
      <CustomCheckboxContainer
        {...props}
        className="inline-block relative bg-gray-700 h-4 w-4 rounded outline-none shadow-none mr-2"
      >
        <CustomCheckboxInput className="absolute inset-0 opacity-0 z-10" />
        <span
          aria-hidden
          className={`absolute w-full h-full ${
            props.checked ? 'scale-50' : 'scale-100'
          } bg-violet-600 rounded ${
            props.checked ? 'opacity-100' : 'opacity-0'
          } transition`}
        />
      </CustomCheckboxContainer>
      Preserve smoothing
    </label>
  )
}

interface NumberInputProps {
  label: string
  onChange: (value: number) => void
  initialValue: number
  icon: string
  min?: number
  max?: number
}

function NumberInput({
  label,
  onChange,
  initialValue,
  icon,
  min,
  max,
}: NumberInputProps) {
  const [value, setValue] = useState<string | number>(initialValue)
  const numericValue = Number(value)

  function commitValue(value: number) {
    if (min !== undefined) {
      value = Math.max(min, value)
    }

    if (max !== undefined) {
      value = Math.min(max, value)
    }

    setValue(value)
    onChange(value)
  }

  return (
    <label>
      <span className="text-sm text-gray-400 uppercase font-semibold tracking-wider">
        {label}
      </span>
      <div className="flex flex-row mt-1 relative block">
        <SliderLabel
          value={numericValue}
          onChange={value => {
            commitValue(value)
          }}
        >
          <img
            src={icon}
            className="h-4 w-4 fill-slate-300"
            alt=""
            draggable={false}
          />
        </SliderLabel>
        <input
          value={value}
          type="number"
          onChange={e => setValue(e.target.value)}
          onBlur={() => commitValue(numericValue)}
          onKeyUp={e => {
            if (e.code === 'Enter') {
              commitValue(numericValue)
            }
          }}
          className="transition py-2 pl-11 pr-3 text-gray-100 bg-gray-700 rounded-lg w-full focus:outline-none focus:border-gray-500 focus:ring-gray-500 focus:ring-1 appearance-none"
          draggable={false}
        />
      </div>
    </label>
  )
}

interface SliderLabelProps {
  value: number
  onChange: (value: number) => void
  children: ReactNode
}

// https://dev.to/graftini/how-to-change-numeric-input-by-dragging-in-react-315
function SliderLabel({ value, onChange, children }: SliderLabelProps) {
  const [initialX, setInitialX] = useState<number | null>(null)
  const [snapshot, setSnapshot] = useState(value)

  useEffect(() => {
    function onUpdate(event: MouseEvent) {
      if (initialX !== null) {
        onChange(snapshot + event.clientX - initialX)
      }
    }

    function onEnd() {
      setInitialX(null)
    }

    document.addEventListener('mousemove', onUpdate)
    document.addEventListener('mouseup', onEnd)

    return () => {
      document.removeEventListener('mousemove', onUpdate)
      document.removeEventListener('mouseup', onEnd)
    }
  }, [initialX, onChange, snapshot])

  return (
    <span
      className="absolute inset-y-0 left-0 flex items-center pl-4 cursor-ew-resize select-none"
      draggable={false}
      onMouseDown={e => {
        setInitialX(e.clientX)
        setSnapshot(value)
      }}
    >
      {children}
    </span>
  )
}

function PrimaryButton(props: HTMLProps<HTMLButtonElement>) {
  return (
    <SquircleContainer>
      {({ squirclePath, ref }) => {
        return (
          <button
            {...props}
            className="transition w-full py-4 text-violet-100 bg-violet-600 focus:outline-none focus:bg-violet-500 hover:bg-violet-500 active:bg-violet-700 uppercase font-semibold tracking-wider text-sm"
            style={{ clipPath: `path('${squirclePath}')` }}
            type="button"
            ref={ref}
          />
        )
      }}
    </SquircleContainer>
  )
}

function SecondaryButton(props: HTMLProps<HTMLButtonElement>) {
  return (
    <SquircleContainer>
      {({ squirclePath, ref }) => {
        return (
          <button
            {...props}
            className="transition w-full py-4 text-gray-100 bg-gray-600 focus:outline-none focus:bg-gray-500 hover:bg-gray-500 active:bg-gray-700 uppercase font-semibold tracking-wider text-sm"
            style={{ clipPath: `path('${squirclePath}')` }}
            type="button"
            ref={ref}
          />
        )
      }}
    </SquircleContainer>
  )
}

interface SquircleContainerProps {
  children: (args: {
    squirclePath: string
    ref: RefObject<any>
  }) => ReactElement
}

function SquircleContainer({ children }: SquircleContainerProps) {
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

function CornerSmoothingSlider({ value, ...rest }: ReachSliderProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between">
        <label className="text-sm text-gray-400 uppercase font-semibold tracking-wider">
          Corner Smoothing
        </label>
        <span className="text-gray-200">{value}</span>
      </div>

      <div className="relative mt-2">
        <SliderInput
          handleAlignment="contain"
          getAriaLabel={() => 'Corner radius'}
          value={value}
          min={0}
          max={1}
          step={0.01}
          {...rest}
        >
          <SliderTrack className="bg-gray-700 h-4 rounded-full">
            <SliderRange />
            <SliderMarker value={0.6} className="bg-gray-500 h-4 w-0.5">
              <div className="w-0 flex justify-center pt-6 select-none">
                <span className="text-s text-gray-400">iOS</span>
              </div>
            </SliderMarker>
            <SliderHandle className="bg-gray-100 active:bg-gray-400 w-4 h-4 rounded-full focus:outline-none focus:ring focus:ring-gray-500" />
          </SliderTrack>
        </SliderInput>
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
