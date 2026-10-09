import type { ComponentType, SVGAttributes } from 'react'

/** Contrat minimal d'une icone : les composants Reicon et les traces locaux le satisfont. */
export type IconType = ComponentType<SVGAttributes<SVGSVGElement> & { size?: number | string }>
