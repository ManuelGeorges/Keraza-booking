"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import "./page.css";

const competitionsData = [
  {
    sectionId: "festival",
    sectionTitle: "اشتراك حجز المهرجان",
    items: [
      { id: "festival_subscription", name: "إشتراك حجز المهرجان للكنيسة (إلزامى)", pricePerUnit: 700 },
    ],
  },
  {
    sectionId: "rouhi_alex",
    sectionTitle: "مسابقة روحى الأسكندرية",
    items: [
      { id: "rouhi_alex_kindergarten_1", name: "مرحلة حضانة - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true,},
      { id: "rouhi_alex_grade1_2_1", name: "مرحلة أولى وثانية ابتدائي - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true, },
      { id: "rouhi_alex_grade3_4_1", name: "مرحلة ثالثة ورابعة ابتدائي - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true, },
      { id: "rouhi_alex_grade5_6_1", name: "مرحلة خامسة وسادسة ابتدائي - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true, },
      { id: "rouhi_alex_kindergarten_extra", name: "مرحلة حضانة - الفريق الإضافي", pricePerUnit: 75 , countLabel: "عدد الفرق" },
      { id: "rouhi_alex_grade1_2_extra", name: "مرحلة أولى وثانية ابتدائي - الفريق الإضافي", pricePerUnit: 75 ,countLabel: "عدد الفرق" },
      { id: "rouhi_alex_grade3_4_extra", name: "مرحلة ثالثة ورابعة ابتدائي - الفريق الإضافي", pricePerUnit: 75 ,countLabel: "عدد الفرق" },
      { id: "rouhi_alex_grade5_6_extra", name: "مرحلة خامسة وسادسة ابتدائي - الفريق الإضافي", pricePerUnit: 75 , countLabel: "عدد الفرق" },
    ],
  },
  {
    sectionId: "melodies",
    sectionTitle: "مسابقة الألحان والتسبحة",
    items: [
      { id: "melodies_level1_Hadana", name: "المستوى الأول - فريق حضانة", pricePerUnit: 150, countLabel: "عدد الفرق" },
      { id: "melodies_level2_Hadana", name: " المستوى الثاني - فريق حضانة", pricePerUnit: 150, countLabel: "عدد الفرق" },

      { id: "melodies_level1_grades12", name: "المستوى الأول - فريق اولى وثانية", pricePerUnit: 150, countLabel: "عدد الفرق" },
      { id: "melodies_level2_grades12", name: "المستوى الثاني - فريق اولى وثانية", pricePerUnit: 150, countLabel: "عدد الفرق" },

      { id: "melodies_level1_grades34", name: "المستوى الأول - فريق ثالثة ورابعة", pricePerUnit: 150, countLabel: "عدد الفرق" },
      { id: "melodies_level2_grades34", name: "المستوى الثاني - فريق ثالثة ورابعة", pricePerUnit: 150, countLabel: "عدد الفرق" },
      
      { id: "melodies_level1_grades56", name: "المستوى الأول - فريق خامسة وسادسة", pricePerUnit: 150, countLabel: "عدد الفرق" },
      { id: "melodies_level2_grades56", name: "المستوى الثاني - فريق خامسة وسادسة", pricePerUnit: 150, countLabel: "عدد الفرق" },
      
      { id: "melodies_talented_individual_Hadana", name: "مستوي الموهوبين حضانة - فردي", pricePerUnit: 50 },
      { id: "melodies_talented_group_Hadana", name: "مستوي الموهوبين حضانة - جماعي", pricePerUnit: 150, countLabel: "عدد الفرق" },
      { id: "melodies_talented_individual_grades12", name: "مستوي الموهوبين اولى وثانية- فردي", pricePerUnit: 50 },
      { id: "melodies_talented_group_grades12", name: "مستوي الموهوبين اولى وثانية - جماعي", pricePerUnit: 150, countLabel: "عدد الفرق" },
      { id: "melodies_talented_individual_grades34", name: "مستوي الموهوبين ثالثة ورابعة - فردي", pricePerUnit: 50 },
      { id: "melodies_talented_group_grades34", name: "مستوي الموهوبين ثالثة ورابعة - جماعي", pricePerUnit: 150, countLabel: "عدد الفرق" },
      { id: "melodies_talented_individual_grades56", name: "مستوي الموهوبين خامسة وسادسة - فردي", pricePerUnit: 50 },
      { id: "melodies_talented_group_grades56", name: "مستوي الموهوبين خامسةوسادسة - جماعي", pricePerUnit: 150, countLabel: "عدد الفرق" },
    ],
  },
    {
    sectionId: "church_activities",
    sectionTitle: "مسابقة الأنشطة الكنسية",
    items: [
      { id: "church_activities_big_theatre", name: "المسرح الكبير - فريق", pricePerUnit: 500, countLabel: "عدد الفرق" },
      { id: "church_activities_chorus", name: "الكورال - فريق", pricePerUnit: 500, countLabel: "عدد الفرق" },
      { id: "church_activities_cantata", name: "الكنتاتا - فريق", pricePerUnit: 500, countLabel: "عدد الفرق" },
      { id: "church_activities_coptic_theatre", name: "المسرح باللغة القبطية - فريق", pricePerUnit: 500, countLabel: "عدد الفرق" },
      { id: "church_activities_operetta", name: "الأوبريت - فريق", pricePerUnit: 500, countLabel: "عدد الفرق" },
      { id: "church_activities_solo_individual", name: "مسابقة الصولو - فردي", pricePerUnit: 50 },
      { id: "church_activities_music_individual", name: "مسابقة العزف - فردي", pricePerUnit: 50 },
      { id: "church_activities_solo_team", name: "مسابقة الصولو - جماعي", pricePerUnit: 200, countLabel: "عدد الفرق" },
      { id: "church_activities_music_team", name: "مسابقة العزف - جماعي", pricePerUnit: 200, countLabel: "عدد الفرق" },
    ],
  },
  {
    sectionId: "research",
    sectionTitle: "مسابقة البحوث",
    items: [
      { id: "research_theoretical", name: "البحث النظرى - فردي", pricePerUnit: 30 },
      { id: "research_cultural", name: "البحث الثقافى - فردي", pricePerUnit: 30 },
    ],
  },
  {
    sectionId: "cultural",
    sectionTitle: "المسابقة الثقافية",
    items: [
      { id: "cultural_magazine_paper", name: "إعداد مجلة ورقية - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "cultural_magazine_wall", name: "إعداد مجلة حائط - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "cultural_field_visits", name: "الزيارات الميدانية - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
    ],
  },
  {
    sectionId: "electronic",
    sectionTitle: "المسابقة الالكترونية",
    items: [
      { id: "electronic_level1_individual", name: "المستوي الأول - فردي", pricePerUnit: 30 },
      { id: "electronic_level2_individual", name: "المستوي الثاني - فردي", pricePerUnit: 30 },
      { id: "electronic_level1_group", name: "المستوي الأول - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق"  },
      { id: "electronic_level2_group", name: "المستوي الثاني - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
    ],
  },
  {
    sectionId: "arts",
    sectionTitle: "مسابقة الفنون التشكيلية",
    items: [
      { id: "arts_kindergarten_individual", name: "مرحلة حضانة - فردي", pricePerUnit: 30 },
      { id: "arts_grade1_2_individual", name: "مرحلة أولى وثانية ابتدائي - فردي", pricePerUnit: 30 },
      { id: "arts_grade3_4_individual", name: "مرحلة ثالثة ورابعة ابتدائي - فردي", pricePerUnit: 30 },
      { id: "arts_grade5_6_individual", name: "مرحلة خامسة وسادسة ابتدائي - فردي", pricePerUnit: 30 },
      { id: "arts_kindergarten_group", name: "مرحلة حضانة - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "arts_grade1_2_group", name: "مرحلة أولى وثانية ابتدائي - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "arts_grade3_4_group", name: "مرحلة ثالثة ورابعة ابتدائي - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "arts_grade5_6_group", name: "مرحلة خامسة وسادسة ابتدائي - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
    ],
  },
  {
    sectionId: "free_arts",
    sectionTitle: "مسابقة الفنون التشكيلية - ابداع حر",
    items: [
      { id: "free_arts_kindergarten_individual", name: "مرحلة حضانة - فردي", pricePerUnit: 30 },
      { id: "free_arts_grade1_2_individual", name: "مرحلة أولى وثانية ابتدائي - فردي", pricePerUnit: 30 },
      { id: "free_arts_grade3_4_individual", name: "مرحلة ثالثة ورابعة ابتدائي - فردي", pricePerUnit: 30 },
      { id: "free_arts_grade5_6_individual", name: "مرحلة خامسة وسادسة ابتدائي - فردي", pricePerUnit: 30 },
      { id: "free_arts_kindergarten_group", name: "مرحلة حضانة - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "free_arts_grade1_2_group", name: "مرحلة أولى وثانية ابتدائي - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "free_arts_grade3_4_group", name: "مرحلة ثالثة ورابعة ابتدائي - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "free_arts_grade5_6_group", name: "مرحلة خامسة وسادسة ابتدائي - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
    ],
  },
  {
    sectionId: "literary",
    sectionTitle: "المسابقة الأدبية",
    items: [
      { id: "literary_poetry", name: "الشعر - فردي", pricePerUnit: 30 },
      { id: "literary_short_story", name: "القصة القصيرة - فردي", pricePerUnit: 30 },
    ],
  },
  {
    sectionId: "engineering",
    sectionTitle: "مسابقة الابتكارات الهندسية",
    items: [
      { id: "engineering_programming_mechanics_individual", name: "البرمجة والكهرباء والميكانيكا - فردي", pricePerUnit: 30 },
      { id: "engineering_programming_mechanics_group", name: "البرمجة والكهرباء والميكانيكا - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
      { id: "engineering_architecture_individual", name: "العمارة - فردي", pricePerUnit: 30 },
      { id: "engineering_architecture_group", name: "العمارة - جماعي", pricePerUnit: 100, countLabel: "عدد الفرق" },
    ],
  },
];

export default function OtherCompetitionsPage() {
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

    const docRef = doc(db, "other-competitions", userChurch);
    const unsubscribeData = onSnapshot(
      docRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          let competitions = data.competitions || {};

          if (!competitions["festival_subscription"]) {
            competitions["festival_subscription"] = {
              count: 1,
              totalPrice: 700,
            };
            await setDoc(docRef, { competitions }, { merge: true });
          }

          const totalPayment = Object.values(competitions).reduce(
            (acc, c) => acc + (c.totalPrice || 0),
            0
          );

          setCounts({ competitions, totalPayment });
        } else {
          const competitions = {
            festival_subscription: {
              count: 1,
              totalPrice: 700,
            },
          };
          await setDoc(docRef, { competitions }, { merge: true });
          setCounts({ competitions, totalPayment: 700 });
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
    if (!/^[0-9]*$/.test(value)) return;
    setInputs((prev) => ({ ...prev, [id]: value }));
  }

  function handleCheckboxChange(id, checked) {
    setInputs((prev) => ({ ...prev, [id]: checked }));
  }

  async function handleSubmit(id) {
    const allItems = competitionsData.flatMap((s) => s.items);
    const item = allItems.find((c) => c.id === id);
    const isTeamCheckbox = item?.isTeamCheckbox;

    let count = 0;
    if (id === "festival_subscription") {
      count = 1;
    } else if (isTeamCheckbox) {
      count = inputs[id] ? 1 : 0;
    } else {
      count = parseInt(inputs[id] || "0", 10);
      if (isNaN(count) || count < 0) return;
    }

    try {
      const docRef = doc(db, "other-competitions", userChurch);
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
      if (!item.isTeamCheckbox && id !== "festival_subscription") {
        setInputs((prev) => ({ ...prev, [id]: "" }));
      }
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    }
  }

  if (loading) return <p className="other-loading">...جاري التحميل</p>;
  if (error) return <p className="other-error">{error}</p>;

  return (
    <div className="other-container">
      <h1 className="other-title">المسابقات الأخرى</h1>

      <nav className="other-navbar">
        {competitionsData.map(({ sectionId, sectionTitle }) => (
          <a key={sectionId} href={`#${sectionId}`} className="other-navbar-link">
            {sectionTitle}
          </a>
        ))}
      </nav>

      <div className="other-total-cost">
        التكلفة الإجمالية لجميع المسابقات: <span>{counts.totalPayment.toLocaleString()} جـ</span>
      </div>

      {competitionsData.map(({ sectionId, sectionTitle, items }) => (
        <section key={sectionId} id={sectionId} className="other-section">
          <h2 className="other-section-title">{sectionTitle}</h2>
          <div className="other-cards">
            {items.map(({ id, name, pricePerUnit, isTeamCheckbox, countLabel }) => {
              const isFestival = id === "festival_subscription";
              const competitionCount = counts.competitions[id]?.count || 0;
              return (
                <div key={id} className="other-card">
                  <h3 className="other-card-title">{name}</h3>
                  <p className="other-card-price">سعر الاشتراك: {pricePerUnit} جـ</p>
                  <div className="other-input-section">
                    {isFestival ? (
                      <p className="other-fixed-count">الاشتراك إلزامي ويحسب كواحد فقط</p>
                    ) : isTeamCheckbox ? (
                      <>
                        <label className="other-checkbox-label">
                          <input
                            type="checkbox"
                            checked={!!inputs[id]}
                            onChange={(e) => handleCheckboxChange(id, e.target.checked)}
                          /> مشارك
                        </label>
                        <button className="other-submit-btn" onClick={() => handleSubmit(id)}>حفظ</button>
                      </>
                    ) : (
                      <>
                        <button
                          className="other-add-btn"
                          onClick={() =>
                            setInputs((prev) => ({ ...prev, [id]: inputs[id] ?? "" }))
                          }
                        >
                          ادخل {countLabel ? countLabel : "عدد المشتركين"}
                        </button>
                        {inputs[id] !== undefined && (
                          <div className="other-input-wrapper">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="other-input"
                              placeholder={`ادخل ${countLabel ? countLabel : "عدد المشتركين"}`}
                              value={inputs[id]}
                              onChange={(e) => handleInputChange(id, e.target.value)}
                            />
                            <button className="other-submit-btn" onClick={() => handleSubmit(id)}>حفظ</button>
                          </div>
                        )}
                      </>
                    )}
                    {competitionCount > 0 && (
                      <p className="other-count-info">
                        {countLabel ? `${countLabel}:` : isTeamCheckbox ? "المشاركة:" : "عدد المشتركين:"} {" "}
                        <strong>{competitionCount}</strong> - التكلفة: {" "}
                        <strong>{counts.competitions[id].totalPrice.toLocaleString()} جـ</strong>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
