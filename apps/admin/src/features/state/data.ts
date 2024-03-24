import { CompleteOrders } from '@gramflow/db/prisma/zod'
import { atom } from 'jotai'

const orderDataAtom = atom<CompleteOrders[]>([])

export { orderDataAtom }