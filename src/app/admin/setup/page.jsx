"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const churches = [
  "كنيسة الشهيد العظيم مارمينا بفلمنج",
  "كنيسة السيدة العذراء مريم و القديس يوحنا الحبيب بجناكليس",
  "كنيسة السيدة العذراء مريم و الانبا باخوميوس شارع سوريا",
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
  "كنيسة القديس ابومقار و البابا كيرلس السادس بالدريسة"
];

export default function SetupPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const initializeDatabase = async () => {
    setLoading(true);
    setStatus("⏳ جاري تهيئة البيانات...");
    try {
      for (const churchName of churches) {
        // 1. تهيئة بيانات الكنيسة الأساسية (الخصومات)
        const churchRef = doc(db, "churches", churchName);
        const churchSnap = await getDoc(churchRef);

        if (!churchSnap.exists()) {
          await setDoc(churchRef, {
            name: churchName,
            discountPercentage: 0,
            createdAt: new Date(),
          });
        }

        // 2. تهيئة مستندات المسابقات لكل كنيسة (إذا أردت إنشاءها فارغة)
        const compRef = doc(db, "church_competitions", churchName);
        const compSnap = await getDoc(compRef);
        if (!compSnap.exists()) {
          await setDoc(compRef, { competitions: {} });
        }

        const otherCompRef = doc(db, "other-competitions", churchName);
        const otherCompSnap = await getDoc(otherCompRef);
        if (!otherCompSnap.exists()) {
          await setDoc(otherCompRef, { competitions: {} });
        }
      }
      setStatus("✅ تم تهيئة قاعدة البيانات بنجاح! يمكنك الآن البدء في استخدام النظام.");
    } catch (error) {
      console.error(error);
      setStatus("❌ حدث خطأ أثناء التهيئة: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", direction: "rtl", fontFamily: "sans-serif" }}>
      <h1>إعداد نظام الكرازة 2024</h1>
      <p>هذه الصفحة تقوم بإنشاء الكنائس والمجموعات المطلوبة على Firebase لأول مرة.</p>

      <button
        onClick={initializeDatabase}
        disabled={loading}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          backgroundColor: "#4f6ef7",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "20px"
        }}
      >
        {loading ? "جاري العمل..." : "تهيئة قاعدة البيانات الآن"}
      </button>

      {status && (
        <div style={{
          marginTop: "30px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          display: "inline-block",
          backgroundColor: "#f9f9f9"
        }}>
          {status}
        </div>
      )}
    </div>
  );
}
