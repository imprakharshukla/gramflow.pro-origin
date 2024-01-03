import * as z from "zod"

export const PostsModel = z.object({
  id: z.string(),
  post_link: z.string(),
  caption: z.string(),
  slides: z.string().array(),
  post_created_at: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
})
