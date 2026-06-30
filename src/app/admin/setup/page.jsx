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
      const processChurch = async (churchName) => {
        const churchRef = doc(db, "churches", churchName);
        const compRef = doc(db, "church_competitions", churchName);
        const otherCompRef = doc(db, "other-competitions", churchName);

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

      await Promise.all(churches.map(name => processChurch(name)));
      setStatus("✅ تم تهيئة قاعدة البيانات بنجاح!");
    } catch (error) {
      console.error(error);
      setStatus("❌ حدث خطأ أثناء التهيئة: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-card w-full" style={{ maxWidth: '500px' }}>
        <h1 className="text-gradient mb-20">إعداد النظام</h1>
        <p className="mb-20" style={{ color: 'var(--text-muted)' }}>
          تقوم هذه الصفحة بتهيئة الكنائس والمستندات المطلوبة على النظام.
        </p>

        <button
          onClick={initializeDatabase}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "جاري التهيئة..." : "ابدأ التهيئة الآن"}
        </button>

        {status && (
          <div className="mt-20" style={{
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "rgba(0,0,0,0.05)",
            color: "var(--text-main)",
            fontSize: "14px",
            textAlign: 'center'
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
