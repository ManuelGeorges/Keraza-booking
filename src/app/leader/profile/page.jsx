"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import SelectChurch from "@/components/SelectChurch";
import "./page.css";

export default function LeaderProfile() {
  const { userData, loading: authLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    church: "",
  });

  const churches = [
    "كنيسة الشهيد العظيم مارمينا بفلمنج",
    "كنيسة السيدة العذراء مريم و القديس يوحنا الحبيب بجناكليس",
    "كنيسة السيدة العذراء مريم و الانبا باخوميوس  شارع سوريا",
    "كنيسة رئيس الملائكة الجليل ميخائيل بمصطفى كامل",
    "كنيسة السيدة العذراء مريم و الشهيد العظيم مارمرقس الرسول بجرين بلازا",
    "كنيسة العذراء ومارجرجس بغبريال",
    "كنيسة الانبا شنوده والانبا هرمينا بدنا",
    "كنيسة مارجرجس باكوس",
    "كنيسة العذراء والانبا باخوميوس كوبرى الناموس (البشارة)",
    "كنيسة الملاك ميخائيل والانبا كاراس ارض الفولى",
    "كنيسة العذراء وابوسيفين حجر النواتيه",
    "كنيسة العذراء و مارمرقس جرين بلازا – خدمة ام الرحمة",
    "كنيسة مارجرجس والانبا انطونيوس محرم بك",
    "كنيسة ابوسيفين امبروزو",
    "كنيسة العذراء محرم بك",
    "كنيسة العذراء ومارمينا بالمستشفى القبطى",
    "كنيسة الانبا ابرام زين العابدين محرم بك",
    "كنيسة العذراء والقديس بولس بكرموز",
    "كنيسة الملاك ميخائيل غربال",
    "جمعية اصدقاء الكتاب المقدس محرم بك",
    "جمعية الملاك ميخائيل محرم بك",
    "كنيسة العذراء مريم و ابونا سمعان الاخميمي بغربال",
    "كنيسة الشهيد العظيم مارجرجس بالحضرة",
    "كنيسة القديس ابومقار و البابا كيرلس السادس بالدريسة",
  ];

  useEffect(() => {
    if (userData) {
      setFormData({
        phone: userData.phone || "",
        church: userData.church || "",
      });
    }
  }, [userData]);

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "leaders", auth.currentUser.uid);
    await updateDoc(docRef, formData);
    setEditMode(false);
  };

  if (authLoading || !userData) {
    return (
      <div className="loading-container">
        <div className="apple-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container page-transition">
      <h1 className="profile-title">الملف الشخصي</h1>
      <div className="profile-card glass-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {userData.firstName?.[0]}{userData.lastName?.[0]}
          </div>
          <div className="profile-info">
            <h2>{userData.firstName} {userData.lastName}</h2>
            <p className="profile-email">{userData.email}</p>
          </div>
        </div>

        <div className="profile-details">
          {editMode ? (
            <div className="edit-form">
              <div className="profile-field">
                <label>رقم التليفون</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleEditChange}
                />
              </div>

              <div className="profile-field">
                <label>الكنيسة</label>
                <SelectChurch
                  options={churches.map((ch) => ({ value: ch, label: ch }))}
                  onChange={(value) => setFormData({ ...formData, church: value })}
                  defaultValue={{ value: formData.church, label: formData.church }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="detail-row">
                <span className="label">رقم التليفون</span>
                <span className="value">{userData.phone}</span>
              </div>
              <div className="detail-row">
                <span className="label">الكنيسة</span>
                <span className="value">{userData.church}</span>
              </div>
            </>
          )}

          <div className="detail-row">
            <span className="label">تاريخ التسجيل</span>
            <span className="value">
              {userData.createdAt?.toDate?.()
                ? userData.createdAt.toDate().toLocaleDateString("ar-EG")
                : "غير متوفر"}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="btn-primary" onClick={handleSave}>حفظ التعديلات</button>
              <button className="btn-secondary" onClick={() => setEditMode(false)}>إلغاء</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setEditMode(true)}>تعديل البيانات</button>
          )}
        </div>
      </div>
    </div>
  );
}
