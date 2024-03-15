import { withAuth } from "next-auth/middleware"

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

export default withAuth({
    // Matches the pages config in `[...nextauth]`
    pages: {
        signIn: '/login',
        error: '/error',
    }
})