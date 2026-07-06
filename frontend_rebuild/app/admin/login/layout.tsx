import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in · Admin",
    template: "%s · Admin · Dashboard",
  },
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}