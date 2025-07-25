"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import "./page.css";

const competitionsData = [
  { id: "football_boys_grade0", name: "كرة القدم - بنين - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_boys_grade12", name: "كرة القدم - بنين - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_boys_grade34", name: "كرة القدم - بنين - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_boys_grade56", name: "كرة القدم - بنين - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_girls_grade0", name: "كرة القدم - بنات - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_girls_grade12", name: "كرة القدم - بنات - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_girls_grade34", name: "كرة القدم - بنات - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "football_girls_grade56", name: "كرة القدم - بنات - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_boys_grade0", name: "الكرة الطائرة - بنين - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_boys_grade12", name: "الكرة الطائرة - بنين - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_boys_grade34", name: "الكرة الطائرة - بنين - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_boys_grade56", name: "الكرة الطائرة - بنين - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_girls_grade0", name: "الكرة الطائرة - بنات - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_girls_grade12", name: "الكرة الطائرة - بنات - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_girls_grade34", name: "الكرة الطائرة - بنات - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "volleyball_girls_grade56", name: "الكرة الطائرة - بنات - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "table_tennis_boys_individual_grade0", name: "تنس الطاولة - بنين - فردي - حضانة", pricePerUnit: 30 },   
  { id: "table_tennis_boys_individual_grade12", name: "تنس الطاولة - بنين - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "table_tennis_boys_individual_grade34", name: "تنس الطاولة - بنين - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },  
  { id: "table_tennis_boys_individual_grade56", name: "تنس الطاولة - بنين - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
  { id: "table_tennis_boys_group_grade0", name: "تنس الطاولة - بنين - جماعي - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },   
  { id: "table_tennis_boys_group_grade12", name: "تنس الطاولة - بنين - جماعي - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "table_tennis_boys_group_grade34", name: "تنس الطاولة - بنين - جماعي - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },  
  { id: "table_tennis_boys_group_grade56", name: "تنس الطاولة - بنين - جماعي - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "table_tennis_girls_individual_grade0", name: "تنس الطاولة - بنات - فردي - حضانة", pricePerUnit: 30 },   
  { id: "table_tennis_girls_individual_grade12", name: "تنس الطاولة - بنات - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "table_tennis_girls_individual_grade34", name: "تنس الطاولة - بنات - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },  
  { id: "table_tennis_girls_individual_grade56", name: "تنس الطاولة - بنات - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
  { id: "table_tennis_girls_group_grade0", name: "تنس الطاولة - بنات - جماعي - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },   
  { id: "table_tennis_girls_group_grade12", name: "تنس الطاولة - بنات - جماعي - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "table_tennis_girls_group_grade34", name: "تنس الطاولة - بنات - جماعي - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },  
  { id: "table_tennis_girls_group_grade56", name: "تنس الطاولة - بنات - جماعي - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "chess_boys_individual_grade0", name: "الشطرنج - بنين - فردي - حضانة", pricePerUnit: 30 },   
  { id: "chess_boys_individual_grade12", name: "الشطرنج - بنين - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "chess_boys_individual_grade34", name: "الشطرنج - بنين - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },  
  { id: "chess_boys_individual_grade56", name: "الشطرنج - بنين - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
  { id: "chess_boys_group_grade0", name: "الشطرنج - بنين - جماعي - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },   
  { id: "chess_boys_group_grade12", name: "الشطرنج - بنين - جماعي - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "chess_boys_group_grade34", name: "الشطرنج - بنين - جماعي - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },  
  { id: "chess_boys_group_grade56", name: "الشطرنج - بنين - جماعي - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "chess_girls_individual_grade0", name: "الشطرنج - بنات - فردي - حضانة", pricePerUnit: 30 },   
  { id: "chess_girls_individual_grade12", name: "الشطرنج - بنات - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "chess_girls_individual_grade34", name: "الشطرنج - بنات - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },  
  { id: "chess_girls_individual_grade56", name: "الشطرنج - بنات - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
  { id: "chess_girls_group_grade0", name: "الشطرنج - بنات - جماعي - حضانة", pricePerUnit: 200, countLabel: "عدد الفرق" },   
  { id: "chess_girls_group_grade12", name: "الشطرنج - بنات - جماعي - أولي وثانية ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "chess_girls_group_grade34", name: "الشطرنج - بنات - جماعي - ثالثة ورابعة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },  
  { id: "chess_girls_group_grade56", name: "الشطرنج - بنات - جماعي - خامسة وسادسة ابتدائي", pricePerUnit: 200, countLabel: "عدد الفرق" },
  { id: "running_boys_grade0", name: "جري - بنين - فردي - حضانة", pricePerUnit: 30 },
  { id: "running_boys_grade12", name: "جري - بنين - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "running_boys_grade34", name: "جري - بنين - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },
  { id: "running_boys_grade56", name: "جري - بنين - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
  { id: "running_girls_grade0", name: "جري - بنات - فردي - حضانة", pricePerUnit: 30 },
  { id: "running_girls_grade12", name: "جري - بنات - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "running_girls_grade34", name: "جري - بنات - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },
  { id: "running_girls_grade56", name: "جري - بنات - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
  { id: "connect4_boys_grade0", name: "كونكت فور - بنين - فردي - حضانة", pricePerUnit: 30 },
  { id: "connect4_boys_grade12", name: "كونكت فور - بنين - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "connect4_boys_grade34", name: "كونكت فور - بنين - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },
  { id: "connect4_boys_grade56", name: "كونكت فور - بنين - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
  { id: "connect4_girls_grade0", name: "كونكت فور - بنات - فردي - حضانة", pricePerUnit: 30 },
  { id: "connect4_girls_grade12", name: "كونكت فور - بنات - فردي - أولي وثانية ابتدائي", pricePerUnit: 30 },
  { id: "connect4_girls_grade34", name: "كونكت فور - بنات - فردي - ثالثة ورابعة ابتدائي", pricePerUnit: 30 },
  { id: "connect4_girls_grade56", name: "كونكت فور - بنات - فردي - خامسة وسادسة ابتدائي", pricePerUnit: 30 },
];
const mandatoryItems = [
  {
    id: "sports_insurance",
    name: "التأمين الرياضي",
    count: 1,
    totalPrice: 100
  },
  // ممكن تزود إلزاميات تانية بعدين
];

export default function SportCompetitionsPage() {
  const [userChurch, setUserChurch] = useState(null);
  const [counts, setCounts] = useState({ competitions: {}, totalPayment: 0 });
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sections = [...new Set(competitionsData.map(c => c.name.split(" - ")[0]))];
  

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
        let competitions = data.competitions || {};

if (!competitions["sports_insurance"]) {
  competitions["sports_insurance"] = {
    count: 1,
    totalPrice: 100,
  };
  setDoc(docRef, { competitions }, { merge: true }).then(() => {
    setCounts({
      competitions,
      totalPayment: Object.values(competitions).reduce(
        (acc, c) => acc + (c.totalPrice || 0),
        0
      )
    });
  });
}
  

        const totalPayment = Object.values(competitions).reduce(
          (acc, c) => acc + (c.totalPrice || 0),
          0
        );

        setCounts({ competitions, totalPayment });
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
<nav className="sport-navbar">
  {sections.map((section, index) => (
    <a key={index} href={`#${section}`} className="sport-navbar-link">
      {section}
    </a>
  ))}
</nav>

      <div className="sport-total-cost">
        التكلفة الإجمالية لجميع المسابقات:{" "}
        <span>{counts.totalPayment.toLocaleString()} جـ</span>
      </div>
      
{counts.competitions["sports_insurance"] && (
  <div className="sport-card">
    <h3 className="sport-card-title">التأمين الرياضي</h3>
    <p className="sport-card-price">سعر التأمين: 100 جـ</p>
    <p className="sport-count-info">
      عدد المشتركين: <strong>{counts.competitions["sports_insurance"].count}</strong> - 
      التكلفة: <strong>{counts.competitions["sports_insurance"].totalPrice.toLocaleString()} جـ</strong>
    </p>
  </div>
)}

{sections.map((section) => (
  <div key={section}>
    <h2 id={section} className="sport-section-title">{section}</h2>

    {competitionsData
      .filter(c => c.name.startsWith(section))
      .map(({ id, name, pricePerUnit, countLabel }) => {
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
))}  </div>);
}
