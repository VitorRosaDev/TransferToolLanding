import { createRef } from 'react'

/**
 * Ancora do hero — a faixa escura que contem o cubo.
 *
 * Quem precisa da caixa do hero usa este ref: o `TransferCoreCanvas` normaliza a
 * posicao do ponteiro pelo `bounding rect` deste elemento, entao a medida tem de
 * ser a do hero visivel.
 */
export const heroSectionRef = createRef<HTMLElement>()
