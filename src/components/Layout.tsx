import { Outlet } from "react-router-dom";
import { FileText } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold tracking-tight text-foreground">CV Hub</span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
