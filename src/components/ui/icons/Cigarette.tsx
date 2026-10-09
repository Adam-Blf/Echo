import type { IconType } from './types'

/**
 * Cigarette : Reicon n'a pas de glyphe equivalent, le trace de l'ancienne
 * bibliotheque (licence ISC) est garde ici en SVG local, sans dependance.
 */
export const Cigarette: IconType = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M17 12H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14" />
    <path d="M18 8c0-2.5-2-2.5-2-5" />
    <path d="M21 16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M22 8c0-2.5-2-2.5-2-5" />
    <path d="M7 12v4" />
  </svg>
)
