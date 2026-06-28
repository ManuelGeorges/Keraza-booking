"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, X, UserPlus, Phone, Mail, BadgeDollarSign } from "lucide-react";
import "./page.css";

export default function LeaderMembersPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [showForm, setShowForm] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    // Real-time listener for "Instant" updates
    const mQuery = query(
      collection(db, "members"),
      where("leaderId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(mQuery, (snapshot) => {
      const fetchedMembers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(fetchedMembers);
      setDataLoading(false);
    }, (error) => {
      console.error("Error fetching members:", error);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    try {
      const dataToSave = {
        ...formData,
        leaderId: user.uid,
        gender: userData.gender || "غير محدد",
        grade: userData.grade || "غير محددة",
        church: userData.church || "",
        joinedCompetitions: [],
        totalFees: 0,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "members"), dataToSave);
      setFormData({ name: "", phone: "", email: "" });
      setShowForm(false);
    } catch (error) {
      alert("حدث خطأ أثناء الإضافة: " + error.message);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="loading-container">
        <div className="apple-spinner"></div>
      </div>
    );
  }

  return (
    <div className="mem-container page-transition">
      <div className="mem-header">
        <h1 className="text-gradient">المخدومين</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-primary ${showForm ? 'btn-danger' : ''}`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? "إغلاق" : "إضافة مخدوم"}
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="mem-form glass-card page-transition">
            <h3>بيانات المخدوم الجديد</h3>
            <div className="input-group">
              <label>الاسم الرباعي</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="أدخل الاسم بالكامل" />
            </div>

            <div className="input-group">
              <label>رقم التليفون</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="01234567890" />
            </div>

            <div className="input-group">
              <label>الإيميل (اختياري)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" />
            </div>

            <button type="submit" className="btn-primary full-width">حفظ البيانات</button>
          </form>
        </div>
      )}

      <div className="members-grid">
        {members.length === 0 ? (
          <div className="empty-state glass-card">
            <UserPlus size={48} />
            <p>لا يوجد مخدومين حالياً. ابدأ بإضافة أول مخدوم!</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="member-card glass-card">
              <div className="member-main">
                <h4>{member.name}</h4>
                <div className="member-info-row">
                  <Phone size={14} /> <span>{member.phone}</span>
                </div>
                {member.email && (
                  <div className="member-info-row">
                    <Mail size={14} /> <span>{member.email}</span>
                  </div>
                )}
              </div>
              <div className="member-footer">
                <div className="badge">{member.grade}</div>
                <div className="fees-badge">
                  <BadgeDollarSign size={16} />
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
