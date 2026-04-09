// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // EXCLUDE /login, /api, and static files from the matcher
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|public|sounds|firebase-messaging-sw.js|manifest.json|$).*)",
  ],
};
