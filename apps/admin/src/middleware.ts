import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // "/" will be accessible to all users
  publicRoutes: ["/api/trigger", "/api/status", "/api/instagram"],
});
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
