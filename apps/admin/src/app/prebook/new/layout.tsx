import AuthNavMenu from "~/features/ui/components/authNavMenu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthNavMenu />
      <main className="mt-16">{children}</main>
    </>
  );
}
