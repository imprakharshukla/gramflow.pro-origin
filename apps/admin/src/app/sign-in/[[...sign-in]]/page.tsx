import { SignIn } from "@clerk/nextjs";

export default async function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
