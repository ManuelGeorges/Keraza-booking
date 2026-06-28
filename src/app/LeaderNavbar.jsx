"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { usePathname } from "next/navigation";

export default function LeaderNavbar() {
  const [role, setRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "leaders", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Handling the "admin " with space issue just in case
          const cleanRole = data.role?.trim();
          if (cleanRole === "admin" || data.approved === true) {
            setRole(cleanRole);
          }
        }
      } else {
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!role) return null;

  const isActive = (path) => pathname === path;

  const adminLinks = [
    { name: "الإحصائيات", href: "/admin/general", icon: "📊" },
    { name: "المنتظرين", href: "/admin/pending", icon: "⏳" },
    { name: "الكنائس", href: "/admin/details", icon: "⛪" },
    { name: "المسابقات", href: "/admin/competitions", icon: "🏆" },
    { name: "البيانات", href: "/admin/churches", icon: "📂" },
    { name: "الإعدادات", href: "/admin/setup", icon: "⚙️" },
  ];

  const leaderLinks = [
    { name: "حسابي", href: "/leader/profile", icon: "👤" },
    { name: "كنيستي", href: "/leader/church-info", icon: "⛪" },
    { name: "المشتركين", href: "/leader/members", icon: "👥" },
  ];

  const links = role === "admin" ? adminLinks : leaderLinks;
  // Main links for the bar (first 3 or 4)
  const barLinks = links.slice(0, 4);
  const moreLinks = links.slice(4);

  return (
    <>
      {/* Background overlay for menu */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* More Menu Drawer */}
      <div className={`more-menu-drawer ${isMenuOpen ? "open" : ""}`}>
        <div className="menu-header">المزيد</div>
        <div className="menu-links">
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`menu-item ${isActive(link.href) ? "active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="menu-icon">{link.icon}</span>
              <span className="menu-text">{link.name}</span>
            </Link>
          ))}
          {/* Default links for everyone in more menu */}
          <button
            className="menu-item logout"
            onClick={() => auth.signOut()}
            style={{ width: '100%', border: 'none', background: 'none', color: '#ff4d4f' }}
          >
            <span className="menu-icon">🚪</span>
            <span className="menu-text">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Bottom Navbar */}
      <nav className="liquid-nav-bottom">
        <div className="nav-container">
          {barLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.name}</span>
            </Link>
          ))}

          {/* Hamburger / More Button */}
          <button
            className={`nav-link more-btn ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="nav-label">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
}
