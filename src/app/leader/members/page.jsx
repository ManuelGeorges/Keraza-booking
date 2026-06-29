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

    // Real-time listener for "Instant" updates with table data
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
    if (!user) {
      alert("جاري تحميل البيانات...");
      return;
    }

    if (!formData.name || !formData.phone) {
      alert("الاسم ورقم التليفون مطلوبين");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        leaderId: user.uid,
        gender: userData?.gender || "غير محدد",
        grade: userData?.grade || "غير محددة",
        church: userData?.church || "",
        joinedCompetitions: [],
        totalFees: 0,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "members"), dataToSave);
      alert("تم إضافة المخدوم بنجاح");
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
          {showForm ? "إغلاق" : "+ إضافة مخدوم"}
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="mem-form glass-card page-transition">
            <h3>بيانات المخدوم الجديد</h3>
            <div className="input-group">
              <label>الاسم الرباعي <span className="mem-required">(إجباري)</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="أدخل الاسم بالكامل" />
            </div>

            <div className="input-group">
              <label>رقم التليفون <span className="mem-required">(إجباري)</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="01234567890" />
            </div>

            <div className="input-group">
              <label>الإيميل <span className="mem-optional">(اختياري)</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" />
            </div>

            <button type="submit" className="btn-primary full-width">حفظ المخدوم</button>
          </form>
        </div>
      )}

      <div className="table-card glass-card">
        <div className="mem-table-wrapper">
          <table className="mem-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>رقم التليفون</th>
                <th>الإيميل</th>
                <th>النوع</th>
                <th>المرحلة</th>
                <th>المال المطلوب</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">لا يوجد مخدومين حالياً.. ابدأ بإضافة مخدوم</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id}>
                    <td className="font-bold">{member.name}</td>
                    <td>{member.phone}</td>
                    <td>{member.email || "-"}</td>
                    <td>{member.gender}</td>
                    <td>{member.grade}</td>
                    <td className="mem-fees-td">{member.totalFees || 0} ج.م</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
