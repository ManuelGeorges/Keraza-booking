"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Clock, ClipboardList, User, Mail, Phone, Church } from "lucide-react";
import "./page.css";

export default function WaitingPage() {
  const [leaderData, setLeaderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/register");
        return;
      }

      const docRef = doc(db, "leaders", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        router.push("/register");
        return;
      }

      const data = docSnap.data();

      if (data.approved === true) {
        if (data.role === "admin") {
          router.push("/admin/pending");
        } else {
          router.push("/leader/profile");
        }
      } else {
        setLeaderData(data);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="loading-container">
      <div className="apple-spinner"></div>
    </div>
  );

  return (
    <div className="wait-container page-transition">
      <div className="wait-card glass-card">
        <div className="wait-icon-wrapper">
          <Clock size={48} className="primary-icon" />
        </div>
        <h1 className="text-gradient">في انتظار الموافقة</h1>
        <p className="wait-message">
          تم إنشاء حسابك بنجاح. جاري مراجعته من قبل مسؤولي الكرازة، ستتمكن من الدخول فور تفعيل الحساب.
        </p>

        {leaderData && (
          <div className="wait-info-box">
            <div className="info-header">
              <ClipboardList size={20} />
              <h3>بيانات التسجيل</h3>
            </div>

            <div className="info-grid">
              <div className="info-row">
                <div className="info-label">
                  <User size={16} />
                  <span>الاسم</span>
                </div>
                <div className="info-value">{leaderData.firstName} {leaderData.lastName}</div>
              </div>

              <div className="info-row">
                <div className="info-label">
                  <Mail size={16} />
                  <span>البريد الإلكتروني</span>
                </div>
                <div className="info-value">{leaderData.email}</div>
              </div>

              <div className="info-row">
                <div className="info-label">
                  <Phone size={16} />
                  <span>رقم الهاتف</span>
                </div>
                <div className="info-value">{leaderData.phone}</div>
              </div>

              <div className="info-row">
                <div className="info-label">
                  <Church size={16} />
                  <span>الكنيسة</span>
                </div>
                <div className="info-value">{leaderData.church}</div>
              </div>
            </div>
          </div>
        )}

        <button className="btn-secondary logout-btn" onClick={() => auth.signOut()}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
