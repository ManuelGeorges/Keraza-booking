import { AuthProvider } from "@/lib/AuthContext";
import LeaderNavbar from "./LeaderNavbar";
import "./layout.css";
import "./globals.css";

export const metadata = {
  title: "Keraza Booking - Admin Panel",
};

export default function LeaderLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <div className="leader-layout">
            <LeaderNavbar />
            <main className="leader-content page-transition">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
