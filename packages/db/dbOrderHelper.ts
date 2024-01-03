import { z } from 'zod';
import {Status, db as prisma} from './index'
import {OrderShippingUpdateSchema} from "@gramflow/utils";


export const getOrder = async (id: string) => {
    return prisma.orders.findUnique({
      where: {
        id: id
      }
    })
  }
  export const getAllOrders = async () => {
    return prisma.orders.findMany({
      include: {
        user: true
      },
      orderBy: {
        created_at: "desc"
      }
    })
  }


  export const updateOrder = async (id: string, user_id: string) => {

    //now add the user to the order and update the order
    return prisma.orders.update({
      where: {
        id: id
      },
      data: {
        status: Status.ACCEPTED,
        user_id: user_id
      }
    })
  }

  export const OrderShippingUpdateSchemaWithOrderId = OrderShippingUpdateSchema.extend({
    id: z.string().uuid()
  })

  export const updateOrderStatus = async (order: z.infer<typeof OrderShippingUpdateSchemaWithOrderId>) => {
    const {id, ...rest} = order
  
    return prisma.orders.update({
      where: {
        id: id
      },
      data: {
        status: rest.status,
        courier: rest.courier,
        awb: rest.awb,
      }
    })
  
  }