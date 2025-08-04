"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LeaderNavbar() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "leaders", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role === "admin" || data.approved === true) {
            setRole(data.role);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (role === null) return null;

  return (
    <>
      <nav className="leader-nav-top">
        {role === "admin" ? (
          <>
          <Link href="/admin/churches">البيانات</Link>
          <Link href="/admin/competitions">المسابقات</Link>
          <Link href="/admin/details">الكنائس</Link>
          </>
        ) : (
          <>
          <Link href="/leader/profile">Profile</Link>
          </>
        )}
      </nav>

      <nav className="leader-nav-bottom">
        {role === "admin" ? (
          <>
            <Link href="/admin/pending">خدام منتظرين</Link>
            <Link href="/admin/general">إحصائيات عامة</Link>
          </>
        ) : (
          <>
            
            <Link href="/leader/church-info">Church info</Link>
          </>
        )}
      </nav>
    </>
  );
}
