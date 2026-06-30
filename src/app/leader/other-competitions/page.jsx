"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { Trophy, Wallet, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Zap, Save, RefreshCcw, Search, X } from "lucide-react";
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
      { id: "rouhi_alex_kindergarten_1", name: "مرحلة حضانة - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true },
      { id: "rouhi_alex_grade1_2_1", name: "مرحلة أولى وثانية ابتدائي - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true },
      { id: "rouhi_alex_grade3_4_1", name: "مرحلة ثالثة ورابعة ابتدائي - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true },
      { id: "rouhi_alex_grade5_6_1", name: "مرحلة خامسة وسادسة ابتدائي - الفريق الأول", pricePerUnit: 100 , isTeamCheckbox: true },
      { id: "rouhi_alex_kindergarten_extra", name: "مرحلة حضانة - الفريق الإضافي", pricePerUnit: 75 , isTeamCheckbox: true },
      { id: "rouhi_alex_grade1_2_extra", name: "مرحلة أولى وثانية ابتدائي - الفريق الإضافي", pricePerUnit: 75 , isTeamCheckbox: true },
      { id: "rouhi_alex_grade3_4_extra", name: "مرحلة ثالثة ورابعة ابتدائي - الفريق الإضافي", pricePerUnit: 75 , isTeamCheckbox: true },
      { id: "rouhi_alex_grade5_6_extra", name: "مرحلة خامسة وسادسة ابتدائي - الفريق الإضافي", pricePerUnit: 75 , isTeamCheckbox: true },
    ],
  },
  {
    sectionId: "melodies",
    sectionTitle: "مسابقة الألحان والتسبحة",
    items: [
      { id: "melodies_level1", name: "المستوى الأول - فريق", pricePerUnit: 150 },
      { id: "melodies_level2", name: "المستوى الثاني - فريق", pricePerUnit: 150 },
      { id: "melodies_talented_individual", name: "مستوي الموهوبين - فردي", pricePerUnit: 50 },
      { id: "melodies_talented_group", name: "مستوي الموهوبين - جماعي", pricePerUnit: 150 },
    ],
  },
  {
    sectionId: "church_activities",
    sectionTitle: "مسابقة الأنشطة الكنسية",
    items: [
      { id: "church_activities_big_theatre", name: "المسرح الكبير - فريق", pricePerUnit: 500 },
      { id: "church_activities_chorus", name: "الكورال - فريق", pricePerUnit: 500 },
      { id: "church_activities_cantata", name: "الكنتاتا - فريق", pricePerUnit: 500 },
      { id: "church_activities_coptic_theatre", name: "المسرح باللغة القبطية - فريق", pricePerUnit: 500 },
      { id: "church_activities_operetta", name: "الأوبريت - فريق", pricePerUnit: 500 },
      { id: "church_activities_solo_individual", name: "مسابقة الصولو - فردي", pricePerUnit: 50 },
      { id: "church_activities_music_individual", name: "مسابقة العزف - فردي", pricePerUnit: 50 },
      { id: "church_activities_solo_team", name: "مسابقة الصولو - جماعي", pricePerUnit: 200 },
      { id: "church_activities_music_team", name: "مسابقة العزف - جماعي", pricePerUnit: 200 },
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
      { id: "cultural_magazine_paper", name: "إعداد مجلة ورقية - جماعي", pricePerUnit: 100 },
      { id: "cultural_magazine_wall", name: "إعداد مجلة حائط - جماعي", pricePerUnit: 100 },
      { id: "cultural_field_visits", name: "الزيارات الميدانية - جماعي", pricePerUnit: 100 },
    ],
  },
  {
    sectionId: "electronic",
    sectionTitle: "المسابقة الالكترونية",
    items: [
      { id: "electronic_level1_individual", name: "المستوي الأول - فردي", pricePerUnit: 30 },
      { id: "electronic_level2_individual", name: "المستوي الثاني - فردي", pricePerUnit: 30 },
      { id: "electronic_level1_group", name: "المستوي الأول - جماعي", pricePerUnit: 100 },
      { id: "electronic_level2_group", name: "المستوي الثاني - جماعي", pricePerUnit: 100 },
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
      { id: "arts_kindergarten_group", name: "مرحلة حضانة - جماعي", pricePerUnit: 100 },
      { id: "arts_grade1_2_group", name: "مرحلة أولى وثانية ابتدائي - جماعي", pricePerUnit: 100 },
      { id: "arts_grade3_4_group", name: "مرحلة ثالثة ورابعة ابتدائي - جماعي", pricePerUnit: 100 },
      { id: "arts_grade5_6_group", name: "مرحلة خامسة وسادسة ابتدائي - جماعي", pricePerUnit: 100 },
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
      { id: "free_arts_kindergarten_group", name: "مرحلة حضانة - جماعي", pricePerUnit: 100 },
      { id: "free_arts_grade1_2_group", name: "مرحلة أولى وثانية ابتدائي - جماعي", pricePerUnit: 100 },
      { id: "free_arts_grade3_4_group", name: "مرحلة ثالثة ورابعة ابتدائي - جماعي", pricePerUnit: 100 },
      { id: "free_arts_grade5_6_group", name: "مرحلة خامسة وسادسة ابتدائي - جماعي", pricePerUnit: 100 },
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
      { id: "engineering_programming_mechanics_group", name: "البرمجة والكهرباء والميكانيكا - جماعي", pricePerUnit: 100 },
      { id: "engineering_architecture_individual", name: "العمارة - فردي", pricePerUnit: 30 },
      { id: "engineering_architecture_group", name: "العمارة - جماعي", pricePerUnit: 100 },
    ],
  },
];

export default function OtherCompetitionsPage() {
  const [userChurch, setUserChurch] = useState(null);
  const [counts, setCounts] = useState({ competitions: {}, totalPayment: 0 });
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(competitionsData[0].sectionId);
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navRef = useRef(null);

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

  useEffect(() => {
    if (searchTerm !== "") return; // Don't track scroll when searching

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    competitionsData.forEach((section) => {
      const el = document.getElementById(section.sectionId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, searchTerm]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return competitionsData;
    const term = searchTerm.toLowerCase();
    return competitionsData.map(section => ({
      ...section,
      items: section.items.filter(item => item.name.toLowerCase().includes(term))
    })).filter(section => section.items.length > 0);
  }, [searchTerm]);

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
      const val = inputs[id] !== undefined ? inputs[id] : (counts.competitions[id]?.count || 0);
      count = parseInt(val || "0", 10);
      if (isNaN(count) || count < 0) return;
    }

    setSavingId(id);
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
      setInputs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    } finally {
      setSavingId(null);
    }
  }

  const scrollNav = (direction) => {
    if (navRef.current) {
      const scrollAmount = 300;
      // In RTL: direction 'right' means scrolling towards the beginning (positive scrollLeft in some browsers, negative in others)
      // Usually scrollBy({ left: value }) works relative to the coordinate system.
      // We'll use a safer approach for RTL.
      const multiplier = direction === 'left' ? -1 : 1;
      navRef.current.scrollBy({ left: multiplier * scrollAmount, behavior: 'smooth' });
    }
  };

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
    <div className="other-page-container page-transition">
      <header className="other-header glass-card">
        <div className="header-icon-box">
          <Trophy size={48} className="trophy-icon" />
          <Zap size={20} className="zap-icon" />
        </div>
        <h1 className="text-gradient">المسابقات الأخرى</h1>
        <div className="total-badge-premium">
          <Wallet size={20} />
          <span>إجمالي التكلفة: <strong>{counts.totalPayment.toLocaleString()} جـ</strong></span>
        </div>
      </header>

      <div className="search-and-nav-container">
        <div className="search-wrapper-premium glass-card">
           <Search size={20} className="search-icon" />
           <input
              type="text"
              placeholder="ابحث عن اسم المسابقة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           {searchTerm && (
             <button className="clear-search" onClick={() => setSearchTerm("")}>
               <X size={18} />
             </button>
           )}
        </div>

        {!searchTerm && (
          <div className="smart-nav-outer">
            <div className="nav-container-wrapper glass-card">
              <button className="nav-arrow right" onClick={() => scrollNav('right')} aria-label="Scroll Right">
                <ChevronRight size={24} />
              </button>
              <nav ref={navRef} className="other-quick-nav">
                {competitionsData.map(({ sectionId, sectionTitle }) => (
                  <button
                    key={sectionId}
                    onClick={() => {
                      const el = document.getElementById(sectionId);
                      if (el) {
                        window.scrollTo({
                          top: el.offsetTop - 120,
                          behavior: "smooth"
                        });
                      }
                    }}
                    className={`nav-chip ${activeSection === sectionId ? 'active' : ''}`}
                  >
                    {sectionTitle}
                  </button>
                ))}
              </nav>
              <button className="nav-arrow left" onClick={() => scrollNav('left')} aria-label="Scroll Left">
                <ChevronLeft size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="other-sections-list">
        {filteredData.length === 0 ? (
          <div className="empty-search-state glass-card">
             <Search size={48} className="dimmed-icon" />
             <p>لم يتم العثور على مسابقات بهذا الاسم</p>
             <button className="btn-primary btn-sm" onClick={() => setSearchTerm("")}>إعادة تعيين</button>
          </div>
        ) : (
          filteredData.map(({ sectionId, sectionTitle, items }) => (
            <section key={sectionId} id={sectionId} className="other-section-group">
              <h2 className="section-title">{sectionTitle}</h2>
              <div className="other-grid">
                {items.map(({ id, name, pricePerUnit, isTeamCheckbox }) => {
                  const isFestival = id === "festival_subscription";
                  const competitionCount = counts.competitions[id]?.count || 0;

                  let hasChanged = false;
                  if (isTeamCheckbox) {
                    const currentBool = competitionCount > 0;
                    const inputBool = inputs[id] !== undefined ? inputs[id] : currentBool;
                    hasChanged = inputs[id] !== undefined && inputBool !== currentBool;
                  } else if (!isFestival) {
                    const currentVal = competitionCount || 0;
                    const inputVal = inputs[id] === "" ? 0 : (inputs[id] !== undefined ? parseInt(inputs[id]) : currentVal);
                    hasChanged = inputs[id] !== undefined && inputVal !== currentVal;
                  }

                  return (
                    <div key={id} className={`competition-card glass-card ${hasChanged ? 'card-changed' : ''}`}>
                      <div className="card-info">
                        <h3>{name}</h3>
                        <span className="price-tag">{pricePerUnit} جـ / اشتراك</span>
                      </div>

                      <div className="card-actions">
                        {isFestival ? (
                          <div className="fixed-badge"><CheckCircle2 size={16} /> اشتراك مفعّل تلقائياً</div>
                        ) : isTeamCheckbox ? (
                          <div className="action-flex-column">
                            <div className="checkbox-row">
                              <label className="apple-switch">
                                <input
                                  type="checkbox"
                                  checked={inputs[id] !== undefined ? inputs[id] : (competitionCount > 0)}
                                  onChange={(e) => handleCheckboxChange(id, e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                              <span className="action-label">مشارك بالفريق؟</span>
                            </div>

                            <button
                              className={`btn-save-premium ${hasChanged ? 'visible' : ''}`}
                              onClick={() => handleSubmit(id)}
                              disabled={savingId === id}
                            >
                              <div className="btn-content">
                                 {savingId === id ? <RefreshCcw className="spin" size={18} /> : <Save size={18} />}
                                 <span>حفظ التعديل</span>
                              </div>
                            </button>
                          </div>
                        ) : (
                          <div className="action-flex-column">
                            <div className="input-row-premium">
                              <input
                                type="number"
                                placeholder="العدد"
                                className="mini-input-premium"
                                value={inputs[id] !== undefined ? inputs[id] : (competitionCount || "")}
                                onChange={(e) => handleInputChange(id, e.target.value)}
                              />
                            </div>

                            <button
                              className={`btn-save-premium ${hasChanged ? 'visible' : ''}`}
                              onClick={() => handleSubmit(id)}
                              disabled={savingId === id}
                            >
                              <div className="btn-content">
                                 {savingId === id ? <RefreshCcw className="spin" size={18} /> : <Zap size={18} />}
                                 <span>تحديث البيانات</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>

                      {competitionCount > 0 && !isFestival && (
                        <div className="card-status-premium success">
                          <div className="stat-pill">
                             <span className="label">العدد:</span>
                             <strong>{competitionCount}</strong>
                          </div>
                          <div className="stat-pill">
                             <span className="label">الإجمالي:</span>
                             <strong>{counts.competitions[id].totalPrice.toLocaleString()} جـ</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
