import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: '#FF6B35',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'serif',
        fontSize: '18px',
        fontWeight: '900',
        color: 'white',
        letterSpacing: '-1px',
      }}
    >
      T★
    </div>,
    { ...size }
  );
}
