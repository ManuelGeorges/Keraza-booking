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
import { UserCheck, Clock, Mail, Church, ShieldCheck } from "lucide-react";
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
    try {
      const userRef = doc(db, "leaders", userId);
      await updateDoc(userRef, {
        approved: true,
        role: "leader",
        approvedAt: new Date(),
      });

      setPendingLeaders((prev) =>
        prev.filter((user) => user.id !== userId)
      );
      alert("تم تفعيل حساب الخادم بنجاح");
    } catch (error) {
      alert("حدث خطأ أثناء التفعيل");
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="loading-container">
        <div className="apple-spinner"></div>
        <p className="ad-pend-loading-text">جارٍ تحميل طلبات الانضمام...</p>
      </div>
    );
  }

  return (
    <div className="ad-pend-container page-transition">
      <header className="ad-pend-header">
        <div className="title-section">
          <h1 className="text-gradient">طلبات الانضمام</h1>
          <p className="subtitle">مراجعة وتفعيل حسابات الخدام الجدد</p>
        </div>
        <div className="stats-badge">
          <Clock size={16} />
          <span>{pendingLeaders.length} طلبات معلقة</span>
        </div>
      </header>

      {pendingLeaders.length === 0 ? (
        <div className="glass-card empty-state-box">
          <div className="empty-icon">✨</div>
          <h3>لا توجد طلبات معلقة</h3>
          <p>تمت الموافقة على جميع طلبات الخدام الحالية.</p>
        </div>
      ) : (
        <div className="ad-pend-grid">
          {pendingLeaders.map((user) => (
            <div key={user.id} className="glass-card ad-pend-card">
              <div className="card-accent"></div>
              <div className="ad-pend-user-info">
                <div className="user-main">
                   <div className="avatar-placeholder">
                     {user.firstName?.[0]}{user.lastName?.[0]}
                   </div>
                   <div>
                     <h3 className="ad-pend-name">{user.firstName} {user.lastName}</h3>
                     <div className="info-row">
                       <Church size={14} />
                       <span className="ad-pend-church">{user.church}</span>
                     </div>
                   </div>
                </div>

                <div className="details-list">
                  <div className="info-row">
                    <Mail size={14} />
                    <span className="ad-pend-email">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="info-row">
                      <span className="icon">📱</span>
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="ad-pend-actions">
                <button
                  className="btn-primary full-width"
                  onClick={() => handleApprove(user.id)}
                >
                  <ShieldCheck size={18} />
                  تفعيل الحساب الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
