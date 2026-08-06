import { ImageResponse } from 'next/og'

export const alt = 'Launchpad4Success affiliate funnel mission control'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          color: '#f8fafc',
          background:
            'linear-gradient(135deg, #050913 0%, #10233d 58%, #0a5f64 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#2ee6c2',
            fontSize: 28,
            letterSpacing: 6,
            textTransform: 'uppercase',
          }}
        >
          Launchpad4Success.pro
        </div>
        <div
          style={{
            display: 'flex',
            maxWidth: 980,
            marginTop: 34,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.08,
          }}
        >
          Build your funnel system once. Let it sell on repeat.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 38,
            fontSize: 30,
            color: '#cbd5e1',
          }}
        >
          AI funnels · Email automation · Performance analytics
        </div>
      </div>
    ),
    size,
  )
}
