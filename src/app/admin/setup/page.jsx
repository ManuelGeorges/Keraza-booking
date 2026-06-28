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
    setStatus("⏳ جاري تهيئة البيانات بسرعة...");
    try {
      // Process churches in parallel chunks to avoid hitting rate limits while staying fast
      const processChurch = async (churchName) => {
        const churchRef = doc(db, "churches", churchName);
        const compRef = doc(db, "church_competitions", churchName);
        const otherCompRef = doc(db, "other-competitions", churchName);

        // Run checks in parallel for each church
        const [churchSnap, compSnap, otherSnap] = await Promise.all([
          getDoc(churchRef),
          getDoc(compRef),
          getDoc(otherCompRef)
        ]);

        const tasks = [];
        if (!churchSnap.exists()) {
          tasks.push(setDoc(churchRef, { name: churchName, discountPercentage: 0, createdAt: new Date() }));
        }
        if (!compSnap.exists()) {
          tasks.push(setDoc(compRef, { competitions: {} }));
        }
        if (!otherSnap.exists()) {
          tasks.push(setDoc(otherCompRef, { competitions: {} }));
        }

        if (tasks.length > 0) await Promise.all(tasks);
      };

      // Execute all church initializations in parallel
      await Promise.all(churches.map(name => processChurch(name)));

      setStatus("✅ تم تهيئة قاعدة البيانات بنجاح وبسرعة قياسية!");
    } catch (error) {
      console.error(error);
      setStatus("❌ حدث خطأ أثناء التهيئة: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="setup-container glass-card page-transition" style={{ maxWidth: '600px', margin: '10vh auto', padding: '40px', textAlign: 'center' }}>
      <h1 className="text-gradient">إعداد النظام</h1>
      <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>تقوم هذه الصفحة بتهيئة الكنائس والمستندات المطلوبة على Firebase.</p>

      <button
        onClick={initializeDatabase}
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', padding: '16px' }}
      >
        {loading ? "جاري التهيئة..." : "ابدأ التهيئة الآن"}
      </button>

      {status && (
        <div style={{
          marginTop: "30px",
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: "rgba(0,0,0,0.05)",
          color: "var(--text-main)",
          fontSize: "14px"
        }}>
          {status}
        </div>
      )}
    </div>
  );
}
