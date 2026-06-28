"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import "./page.css";

export default function PendingLeadersPage() {
  const { userData, loading: authLoading } = useAuth();
  const [pendingLeaders, setPendingLeaders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!userData || userData.role !== "admin") {
      router.push("/leader/profile");
      return;
    }

    fetchPending();
  }, [userData, authLoading, router]);

  const fetchPending = async () => {
    try {
      const q = query(collection(db, "leaders"), where("approved", "==", false));
      const snapshot = await getDocs(q);
      const leaders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingLeaders(leaders);
    } catch (error) {
      console.error("Error fetching pending:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    const userRef = doc(db, "leaders", userId);
    await updateDoc(userRef, {
      approved: true,
      role: "leader",
      approvedAt: new Date(),
    });

    setPendingLeaders((prev) =>
      prev.filter((user) => user.id !== userId)
    );
  };

  if (authLoading || dataLoading) {
    return (
      <div className="loading-container">
        <div className="apple-spinner"></div>
        <p className="ad-pend-loading">جارٍ التحميل بسرعة...</p>
      </div>
    );
  }

  return (
    <div className="ad-pend-container glass-card page-transition">
      <h1 className="ad-pend-title">الخدام المنتظرين الموافقة</h1>
      {pendingLeaders.length === 0 ? (
        <p className="ad-pend-empty">لا يوجد خدام حالياً 👌</p>
      ) : (
        <ul className="ad-pend-list">
          {pendingLeaders.map((user) => (
            <li key={user.id} className="ad-pend-card glass-card">
              <div className="ad-pend-user-info">
                <p className="ad-pend-name">{user.firstName + " " + user.lastName}</p>
                <p className="ad-pend-church">{user.church}</p>
                <p className="ad-pend-email">{user.email}</p>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleApprove(user.id)}
              >
               تفعيل الحساب
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
