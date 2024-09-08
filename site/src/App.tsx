import { useEffect, useState } from 'preact/hooks'
import './app.css'
import { getSvgPath } from 'figma-squircle'
import sizeIcon from './assets/size.svg'
import radiusIcon from './assets/radius.svg'

export function App() {
  const [size, setSize] = useState(400)
  const [cornerRadius, setCornerRadius] = useState(120)
  const [cornerSmoothingPercent, setCornerSmoothingPercent] = useState(60)
  const [preserveSmoothing, setPreserveSmoothing] = useState(false)

  const svgPath = getSvgPath({
    width: size,
    height: size,
    cornerRadius,
    cornerSmoothing: cornerSmoothingPercent / 100,
    preserveSmoothing,
  })

  return (
    <div className="flex flex-1">
      <div className="flex flex-1 bg-neutral-900 justify-center items-center">
        <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <path d={svgPath} fill="pink" />
        </svg>
      </div>

      <div className="flex flex-col bg-neutral-800 w-80 p-6 gap-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <NumberInput
              label="Size"
              icon={sizeIcon}
              value={size}
              onChange={setSize}
            />
          </div>
          <div className="flex-1">
            <NumberInput
              label="Radius"
              icon={radiusIcon}
              value={cornerRadius}
              onChange={setCornerRadius}
            />
          </div>
        </div>

        <CornerSmoothingSlider
          value={cornerSmoothingPercent}
          onChange={setCornerSmoothingPercent}
        />

        <PreserveSmoothingToggle
          value={preserveSmoothing}
          onChange={setPreserveSmoothing}
        />
      </div>
    </div>
  )
}

interface NumberInputProps {
  label: string
  icon: string
  value: number
  onChange: (value: number) => void
}

function NumberInput({ label, icon, value, onChange }: NumberInputProps) {
  return (
    <label>
      <span className="text-neutral-400 text-xs uppercase font-bold tracking-widest">
        {label}
      </span>
      <div className="flex rounded-sm py-1 -translate-x-2 has-[:focus]:bg-neutral-700 has-[:focus]:ring-2 has-[:focus]:ring-blue-600 transition duration-200 ease-out">
        <IconSlider value={value} onChange={onChange} icon={icon} />

        <input
          value={value}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
          type="number"
          class="w-full font-normal bg-transparent text-white text-lg focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </label>
  )
}

interface IconSliderProps {
  value: number
  onChange: (value: number) => void
  icon: string
}

// https://dev.to/graftini/how-to-change-numeric-input-by-dragging-in-react-315
function IconSlider({ value, onChange, icon }: IconSliderProps) {
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
    <div
      className="flex justify-center items-center cursor-ew-resize select-none px-2"
      draggable={false}
      onMouseDown={(e) => {
        setInitialX(e.clientX)
        setSnapshot(value)
      }}
    >
      <img
        src={icon}
        alt=""
        draggable={false}
        className="fill-neutral-300 w-4 h-4"
      />
    </div>
  )
}

interface PreserveSmoothingToggleProps {
  value: boolean
  onChange: (value: boolean) => void
}

function PreserveSmoothingToggle({
  value,
  onChange,
}: PreserveSmoothingToggleProps) {
  return (
    <label class="flex items-center gap-2">
      <div class="relative">
        <input
          type="checkbox"
          class="sr-only peer"
          checked={value}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
        <div class="w-11 h-6 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-800 rounded-full bg-neutral-700 peer-checked:bg-blue-600" />
        <div class="absolute top-[2px] left-[2px] bg-white border rounded-full h-5 w-5 transition-all peer-checked:translate-x-full border-neutral-600" />
      </div>
      <span class="text-neutral-400 text-xs uppercase font-bold tracking-widest">
        Preserve Smoothing
      </span>
    </label>
  )
}

interface CornerSmoothingSliderProps {
  value: number
  onChange: (value: number) => void
}

function CornerSmoothingSlider({
  value,
  onChange,
}: CornerSmoothingSliderProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <label
          className="flex-1 text-neutral-400 text-xs uppercase font-bold tracking-widest"
          htmlFor="corner-smoothing-slider"
        >
          Corner Smoothing
        </label>
        <div className="text-white">{value}%</div>
      </div>
      <input
        id="corner-smoothing-slider"
        type="range"
        min="0"
        max="100"
        value={value}
        onInput={(e) => onChange(Number(e.currentTarget.value))}
        className="w-full rounded-full appearance-none focus:outline-none focus:ring-blue-600 focus-visible:ring-2 bg-neutral-700 accent-white"
      />
    </div>
  )
}
