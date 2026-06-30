"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Dribbble, Wallet, Plus, Save, AlertCircle } from "lucide-react";
import "./page.css";

const competitionsData = [
  { id: "football_boys", name: "كرة القدم - بنين", pricePerUnit: 200 },
  { id: "football_girls", name: "كرة القدم - بنات", pricePerUnit: 200 },
  { id: "volleyball_boys", name: "الكرة الطائرة - بنين", pricePerUnit: 200 },
  { id: "volleyball_girls", name: "الكرة الطائرة - بنات", pricePerUnit: 200 },
  { id: "table_tennis_boys_individual", name: "تنس الطاولة - بنين - فردي", pricePerUnit: 30 },
  { id: "table_tennis_boys_team", name: "تنس الطاولة - بنين - جماعي", pricePerUnit: 200 },
  { id: "table_tennis_girls_individual", name: "تنس الطاولة - بنات - فردي", pricePerUnit: 30 },
  { id: "table_tennis_girls_team", name: "تنس الطاولة - بنات - جماعي", pricePerUnit: 200 },
  { id: "chess_boys_individual", name: "الشطرنج - بنين - فردي", pricePerUnit: 30 },
  { id: "chess_boys_team", name: "الشطرنج - بنين - جماعي", pricePerUnit: 200 },
  { id: "chess_girls_individual", name: "الشطرنج - بنات - فردي", pricePerUnit: 30 },
  { id: "chess_girls_team", name: "الشطرنج - بنات - جماعي", pricePerUnit: 200 },
  { id: "running_boys", name: "جري - بنين - فردي", pricePerUnit: 30 },
  { id: "running_girls", name: "جري - بنات - فردي", pricePerUnit: 30 },
];

export default function SportCompetitionsPage() {
  const [userChurch, setUserChurch] = useState(null);
  const [counts, setCounts] = useState({ competitions: {}, totalPayment: 0 });
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("يجب تسجيل الدخول أولاً");
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "leaders", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!data.church) {
            setError("لم يتم تحديد الكنيسة في بياناتك.");
            setLoading(false);
            return;
          }
          setUserChurch(data.church);
        } else {
          setError("لم يتم العثور على بيانات المستخدم.");
          setLoading(false);
        }
      } catch {
        setError("حدث خطأ في جلب بيانات المستخدم.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userChurch) return;

    const docRef = doc(db, "church_competitions", userChurch);
    const unsubscribeData = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCounts({
            competitions: data.competitions || {},
            totalPayment: data.totalPayment || 0,
          });
        } else {
          setCounts({ competitions: {}, totalPayment: 0 });
        }
        setLoading(false);
      },
      (err) => {
        setError("حدث خطأ أثناء تحميل بيانات المسابقات.");
        setLoading(false);
      }
    );

    return () => unsubscribeData();
  }, [userChurch]);

  function handleInputChange(id, value) {
    if (!/^\d*$/.test(value)) return;
    setInputs((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(id) {
    const count = parseInt(inputs[id] || "0", 10);
    if (isNaN(count) || count < 0) return;

    try {
      const docRef = doc(db, "church_competitions", userChurch);
      const docSnap = await getDoc(docRef);

      let currentData = { competitions: {}, totalPayment: 0 };

      if (docSnap.exists()) {
        currentData = docSnap.data();
        if (!currentData.competitions) currentData.competitions = {};
      }

      const compPrice = competitionsData.find((c) => c.id === id).pricePerUnit;
      const totalPriceForComp = count * compPrice;

      currentData.competitions[id] = {
        count,
        totalPrice: totalPriceForComp,
      };

      currentData.totalPayment = Object.values(currentData.competitions).reduce(
        (acc, c) => acc + (c.totalPrice || 0),
        0
      );

      await setDoc(docRef, currentData, { merge: true });
      setInputs((prev) => ({ ...prev, [id]: "" }));
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    }
  }

  if (loading) return (
    <div className="loading-container">
      <div className="apple-spinner"></div>
    </div>
  );

  if (error) return (
    <div className="error-container page-transition">
      <div className="glass-card error-card">
        <AlertCircle size={48} color="#ff3b30" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="sport-page-container page-transition">
      <header className="sport-header glass-card">
        <div className="header-icon"><Dribbble size={40} /></div>
        <h1 className="text-gradient">المسابقات الرياضية</h1>
        <div className="total-badge">
          <Wallet size={20} />
          <span>إجمالي التكلفة الرياضية: <strong>{counts.totalPayment.toLocaleString()} جـ</strong></span>
        </div>
      </header>

      <div className="sport-grid">
        {competitionsData.map(({ id, name, pricePerUnit }) => {
          const competitionCount = counts.competitions[id]?.count || 0;
          const isInputActive = inputs[id] !== undefined;

          return (
            <div key={id} className="sport-card glass-card">
              <div className="card-content">
                <h3>{name}</h3>
                <span className="price-tag">{pricePerUnit} جـ / للفرد</span>
              </div>

              <div className="card-actions">
                {!isInputActive ? (
                  <button
                    className="btn-add-ghost"
                    onClick={() => setInputs(p => ({ ...p, [id]: "" }))}
                  >
                    <Plus size={18} /> إضافة مشتركين
                  </button>
                ) : (
                  <div className="input-row">
                    <input
                      type="number"
                      placeholder="العدد"
                      className="mini-input"
                      value={inputs[id]}
                      onChange={(e) => handleInputChange(id, e.target.value)}
                      autoFocus
                    />
                    <button className="btn-primary btn-sm" onClick={() => handleSubmit(id)}>
                      <Save size={16} /> حفظ
                    </button>
                  </div>
                )}
              </div>

              {competitionCount > 0 && (
                <div className="card-footer success">
                  <div className="stat">
                    <span>المشتركين</span>
                    <strong>{competitionCount}</strong>
                  </div>
                  <div className="stat">
                    <span>التكلفة</span>
                    <strong>{counts.competitions[id].totalPrice.toLocaleString()} جـ</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
