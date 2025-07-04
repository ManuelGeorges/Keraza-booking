"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import "./page.css";

const competitionsData = [
  { id: "football_boys", name: "كرة القدم - بنين - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_boys", name: "كرة القدم - بنين - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_boys", name: "كرة القدم - بنين - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_boys", name: "كرة القدم - بنين - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_girls", name: "كرة القدم - بنات", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_boys", name: "الكرة الطائرة - بنين", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_girls", name: "الكرة الطائرة - بنات", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "table_tennis_boys_individual", name: "تنس الطاولة - بنين - فردي", pricePerUnit: 30 },
  { id: "table_tennis_boys_team", name: "تنس الطاولة - بنين - جماعي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "table_tennis_girls_individual", name: "تنس الطاولة - بنات - فردي", pricePerUnit: 30 },
  { id: "table_tennis_girls_team", name: "تنس الطاولة - بنات - جماعي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "chess_boys_individual", name: "الشطرنج - بنين - فردي", pricePerUnit: 30 },
  { id: "chess_boys_team", name: "الشطرنج - بنين - جماعي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "chess_girls_individual", name: "الشطرنج - بنات - فردي", pricePerUnit: 30 },
  { id: "chess_girls_team", name: "الشطرنج - بنات - جماعي", pricePerUnit: 200, countLabel: "عدد الفرق" },
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
      () => {
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
    const item = competitionsData.find((c) => c.id === id);
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

      const totalPrice = count * item.pricePerUnit;
      currentData.competitions[id] = { count, totalPrice };
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

  if (loading) return <p className="sport-loading">...جاري التحميل</p>;
  if (error) return <p className="sport-error">{error}</p>;
  if (!userChurch) return <p className="sport-error">يتم جلب بيانات الكنيسة...</p>;

  return (
    <div className="sport-container">
      <h1 className="sport-title">المسابقات الرياضية</h1>

      <div className="sport-total-cost">
        التكلفة الإجمالية لجميع المسابقات:{" "}
        <span>{counts.totalPayment.toLocaleString()} جـ</span>
      </div>

      <div className="sport-cards">
        {competitionsData.map(({ id, name, pricePerUnit, countLabel }) => {
          const competition = counts.competitions[id];
          return (
            <div key={id} className="sport-card">
              <h3 className="sport-card-title">{name}</h3>
              <p className="sport-card-price">سعر الاشتراك: {pricePerUnit} جـ</p>

              <div className="sport-input-section">
                <button
                  className="sport-add-btn"
                  onClick={() =>
                    setInputs((prev) => ({ ...prev, [id]: inputs[id] ?? "" }))
                  }
                >
                  ادخل {countLabel || "عدد المشتركين"}
                </button>

                {inputs[id] !== undefined && (
                  <div className="sport-input-wrapper">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="sport-input"
                      placeholder={`ادخل ${countLabel || "عدد المشتركين"}`}
                      value={inputs[id]}
                      onChange={(e) => handleInputChange(id, e.target.value)}
                    />
                    <button
                      className="sport-submit-btn"
                      onClick={() => handleSubmit(id)}
                    >
                      حفظ
                    </button>
                  </div>
                )}

                {competition && (
                  <p className="sport-count-info">
                    {countLabel || "عدد المشتركين"}:{" "}
                    <strong>{competition.count}</strong> - التكلفة:{" "}
                    <strong>{competition.totalPrice.toLocaleString()} جـ</strong>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
