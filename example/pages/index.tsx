import Head from 'next/head'
import { getSvgPath } from '../../src'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Figma Squircle</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div
          className="bg-indigo-600"
          style={{
            width: 400,
            height: 400,
            clipPath: `path('${getSvgPath({
              width: 400,
              height: 400,
              radius: 48,
              smoothing: 0.8,
            })}')`,
          }}
        />
      </main>
    </div>
  )
}
