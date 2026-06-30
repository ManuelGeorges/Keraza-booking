"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  BarChart3,
  Clock,
  Church,
  Trophy,
  FolderOpen,
  Settings,
  User,
  Users,
  LogOut,
  MoreHorizontal,
  ChevronUp,
  Activity
} from "lucide-react";

export default function LeaderNavbar() {
  const { userData, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Don't show navbar if loading or if user is not approved/doesn't have a role
  if (loading || !userData) return null;
  if (!userData.approved && userData.role !== "admin") return null;

  const role = userData.role?.trim();
  const isActive = (path) => pathname === path;

  const adminLinks = [
    { name: "الإحصائيات", href: "/admin/general", icon: <BarChart3 size={20} /> },
    { name: "المنتظرين", href: "/admin/pending", icon: <Clock size={20} /> },
    { name: "الكنائس", href: "/admin/details", icon: <Church size={20} /> },
    { name: "المسابقات", href: "/admin/competitions", icon: <Trophy size={20} /> },
    { name: "البيانات", href: "/admin/churches", icon: <FolderOpen size={20} /> },
    { name: "الإعدادات", href: "/admin/setup", icon: <Settings size={20} /> },
  ];

  const leaderLinks = [
    { name: "حسابي", href: "/leader/profile", icon: <User size={20} /> },
    { name: "كنيستي", href: "/leader/church-info", icon: <Church size={20} /> },
    { name: "أخرى", href: "/leader/other-competitions", icon: <Activity size={20} /> },
    { name: "رياضية", href: "/leader/sport-competitions", icon: <Trophy size={20} /> },
    { name: "المشتركين", href: "/leader/members", icon: <Users size={20} /> },
  ];

  const links = role === "admin" ? adminLinks : leaderLinks;
  const barLinks = links.slice(0, 4);
  const moreLinks = links.slice(4);

  return (
    <>
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

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
          <button
            className="menu-item logout"
            onClick={() => auth.signOut()}
            style={{ width: '100%', border: 'none', background: 'none' }}
          >
            <span className="menu-icon"><LogOut size={20} /></span>
            <span className="menu-text">تسجيل الخروج</span>
          </button>
        </div>
      </div>

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

          {links.length > 4 && (
            <button
              className={`nav-link more-btn ${isMenuOpen ? "active" : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="nav-icon">
                {isMenuOpen ? <ChevronUp size={22} /> : <MoreHorizontal size={22} />}
              </span>
              <span className="nav-label">المزيد</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
