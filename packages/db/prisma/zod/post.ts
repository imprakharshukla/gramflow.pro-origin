import * as z from "zod"

export const PostModel = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
})
