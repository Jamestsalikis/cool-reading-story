import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: '#741515',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
        <path
          d="M10 3C7.5 1 2.5 1 1 2v11c1.5-1 6.5-1 9 1 2.5-2 7.5-2 9-1V2C17.5 1 12.5 1 10 3z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.15)"
        />
        <line x1="10" y1="3" x2="10" y2="14" stroke="white" strokeWidth="1"/>
      </svg>
    </div>,
    { ...size }
  );
}
