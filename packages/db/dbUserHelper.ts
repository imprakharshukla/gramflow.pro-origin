import {db as prisma} from './index'

export const getUserData = async (email: string) => {
    return prisma.users.findUnique({
      where: {
        email: email
      }
    })
  }