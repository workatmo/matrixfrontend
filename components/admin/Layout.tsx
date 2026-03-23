import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { cn } from "@/lib/utils";
import { SettingsProvider } from "@/components/admin/SettingsProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  /** Edge-to-edge content that fills the area below the header (scroll handled inside children). */
  fullPage?: boolean;
}

export default function AdminLayout({ children, title, fullPage }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header title={title} />

        {/* Page Content */}
        <main
          className={cn(
            "flex-1 min-h-0 bg-muted/30",
            fullPage
              ? "flex flex-col overflow-hidden p-0"
              : "overflow-y-auto p-6"
          )}
        >
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </main>
      </div>
    </div>
  );
}

