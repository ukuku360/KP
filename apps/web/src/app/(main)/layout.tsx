import { Header } from "@/components/layout/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center py-6">
        <div className="container px-4 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
