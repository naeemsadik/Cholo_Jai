export const metadata = {
  title: "Admin · Cholo Jai",
  description: "Internal admin panel for managing submissions, events, and featured picks.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-paper text-ink min-h-screen">{children}</div>;
}