"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import "./page.css";

export default function LeaderMembersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leaderData, setLeaderData] = useState({ gender: "", grade: "" });
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "leaders", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.approved && userData.role === "leader") {
              setUser(currentUser);
              setLeaderData({
                gender: userData.gender || "غير محدد",
                grade: userData.grade || "غير محددة",
              });

              fetchMembers(currentUser.uid);
            } else {
              router.push("/unauthorized");
            }
          } else {
            router.push("/register");
          }
        } catch (error) {
          console.error("Error fetching leader data:", error);
          router.push("/login");
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchMembers = async (uid) => {
    const mQuery = query(
      collection(db, "members"),
      where("leaderId", "==", uid)
    );
    const mSnapshot = await getDocs(mQuery);
    const fetchedMembers = mSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMembers(fetchedMembers);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("جاري تحميل البيانات...");
      return;
    }

    if (!formData.name || !formData.phone) {
      alert("الاسم ورقم التليفون مطلوبين");
      return;
    }

    const dataToSave = {
      ...formData,
      leaderId: user.uid,
      gender: leaderData.gender,
      grade: leaderData.grade,
      joinedCompetitions: [],
      totalFees: 0,
    };

    try {
      await addDoc(collection(db, "members"), dataToSave);
      alert("تم إضافة المخدوم بنجاح");

      setFormData({ name: "", phone: "", email: "" });
      setShowForm(false);
      fetchMembers(user.uid);
    } catch (error) {
      console.error("❌ Error while adding member:", error);
      alert("حدث خطأ أثناء الإضافة: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="apple-spinner"></div>
      </div>
    );
  }

  return (
    <div className="mem-container page-transition">
      <header className="mem-header">
        <h1 className="text-gradient">المخدومين</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <span>+</span> إضافة مخدوم
        </button>
      </header>

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="glass-card mem-form" onClick={(e) => e.stopPropagation()}>
            <h3>إضافة مخدوم جديد</h3>
            <p className="subtitle">أدخل بيانات المخدوم ليتم ربطه بك</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>الاسم الرباعي <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="مثال: أبانوب عماد شكري"
                  required
                />
              </div>

              <div className="input-group">
                <label>رقم التليفون <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01xxxxxxxxx"
                  required
                />
              </div>

              <div className="input-group">
                <label>الإيميل (اختياري)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@mail.com"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary full-width">
                  حفظ البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="members-grid">
        {members.length === 0 ? (
          <div className="glass-card empty-state">
             <div className="empty-icon">👥</div>
             <h3>لا يوجد مخدومين حالياً</h3>
             <p>ابدأ بإضافة أول مخدوم في مجموعتك</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="glass-card member-card">
              <div className="member-main">
                <h4>{member.name}</h4>
                <div className="member-info-row">
                  <span className="icon">📱</span>
                  <span>{member.phone}</span>
                </div>
                {member.email && (
                  <div className="member-info-row">
                    <span className="icon">📧</span>
                    <span>{member.email}</span>
                  </div>
                )}
              </div>
              <div className="member-footer">
                <div className="badges">
                  <span className="badge">{member.gender}</span>
                  <span className="badge">{member.grade}</span>
                </div>
                <div className="fees-badge">
                  <span>{member.totalFees || 0} ج.م</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
