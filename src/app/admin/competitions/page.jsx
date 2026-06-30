"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import * as XLSX from "xlsx";
import {
  Download,
  Search,
  Trophy,
  Users,
  DollarSign,
  BarChart3,
  TrendingUp,
  LayoutGrid,
  ChevronLeft,
  Calendar,
  Zap
} from "lucide-react";
import "./page.css";

const COLORS = ["#0071e3", "#34c759", "#ff9500", "#ff3b30", "#af52de", "#5856d6", "#5ac8fa", "#ff2d55"];

const competitionNamesInArabic = {
  // مسابقات المهرجان الأساسية
  "festival_subscription": "إشتراك حجز المهرجان للكنيسة (إلزامى)",

  // مسابقة روحى الأسكندرية
  "rouhi_alex_kindergarten_1": "روحي: حضانة - الفريق الأول",
  "rouhi_alex_grade1_2_1": "روحي: أولى وثانية ابتدائي - الفريق الأول",
  "rouhi_alex_grade3_4_1": "روحي: ثالثة ورابعة ابتدائي - الفريق الأول",
  "rouhi_alex_grade5_6_1": "روحي: خامسة وسادسة ابتدائي - الفريق الأول",
  "rouhi_alex_kindergarten_extra": "روحي: حضانة - الفريق الإضافي",
  "rouhi_alex_grade1_2_extra": "روحي: أولى وثانية ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade3_4_extra": "روحي: ثالثة ورابعة ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade5_6_extra": "روحي: خامسة وسادسة ابتدائي - الفريق الإضافي",

  // مسابقة القبطي
  "coptic_alex_kindergarten": "قبطي: مرحلة حضانة",
  "coptic_alex_grade1_2": "قبطي: مرحلة أولى وثانية ابتدائي",
  "coptic_alex_grade3_4": "قبطي: مرحلة ثالثة ورابعة ابتدائي",
  "coptic_alex_grade5_6": "قبطي: مرحلة خامسة وسادسة ابتدائي",

  // الألحان والتسبحة
  "melodies_level1": "الألحان: المستوى الأول - فريق",
  "melodies_level2": "الألحان: المستوى الثاني - فريق",
  "melodies_talented_individual": "الألحان: مستوي الموهوبين - فردي",
  "melodies_talented_group": "الألحان: مستوي الموهوبين - جماعي",

  // الأنشطة الكنسية
  "church_activities_big_theatre": "الأنشطة: المسرح الكبير - فريق",
  "church_activities_chorus": "الأنشطة: الكورال - فريق",
  "church_activities_cantata": "الأنشطة: الكنتاتا - فريق",
  "church_activities_coptic_theatre": "الأنشطة: المسرح باللغة القبطية - فريق",
  "church_activities_operetta": "الأنشطة: الأوبريت - فريق",
  "church_activities_solo_individual": "الأنشطة: مسابقة الصولو - فردي",
  "church_activities_music_individual": "الأنشطة: مسابقة العزف - فردي",
  "church_activities_solo_team": "الأنشطة: مسابقة الصولو - جماعي",
  "church_activities_music_team": "الأنشطة: مسابقة العزف - جماعي",

  // البحوث
  "research_theoretical": "البحوث: البحث النظرى - فردي",
  "research_cultural": "البحوث: البحث الثقافى - فردي",

  // الثقافية
  "cultural_magazine_paper": "الثقافية: إعداد مجلة ورقية - جماعي",
  "cultural_magazine_wall": "الثقافية: إعداد مجلة حائط - جماعي",
  "cultural_field_visits": "الثقافية: الزيارات الميدانية - جماعي",

  // الإلكترونية
  "electronic_level1_individual": "الإلكترونية: المستوي الأول - فردي",
  "electronic_level2_individual": "الإلكترونية: المستوي الثاني - فردي",
  "electronic_level1_group": "الإلكترونية: المستوي الأول - جماعي",
  "electronic_level2_group": "الإلكترونية: المستوي الثاني - جماعي",

  // الفنون التشكيلية
  "arts_kindergarten_individual": "الفنون: مرحلة حضانة - فردي",
  "arts_grade1_2_individual": "الفنون: مرحلة أولى وثانية ابتدائي - فردي",
  "arts_grade3_4_individual": "الفنون: مرحلة ثالثة ورابعة ابتدائي - فردي",
  "arts_grade5_6_individual": "الفنون: مرحلة خامسة وسادسة ابتدائي - فردي",
  "arts_kindergarten_group": "الفنون: مرحلة حضانة - جماعي",
  "arts_grade1_2_group": "الفنون: مرحلة أولى وثانية ابتدائي - جماعي",
  "arts_grade3_4_group": "الفنون: مرحلة ثالثة ورابعة ابتدائي - جماعي",
  "arts_grade5_6_group": "الفنون: مرحلة خامسة وسادسة ابتدائي - جماعي",

  // إبداع حر
  "free_arts_kindergarten_individual": "إبداع حر: مرحلة حضانة - فردي",
  "free_arts_grade1_2_individual": "إبداع حر: مرحلة أولى وثانية ابتدائي - فردي",
  "free_arts_grade3_4_individual": "إبداع حر: مرحلة ثالثة ورابعة ابتدائي - فردي",
  "free_arts_grade5_6_individual": "إبداع حر: مرحلة خامسة وسادسة ابتدائي - فردي",
  "free_arts_kindergarten_group": "إبداع حر: مرحلة حضانة - جماعي",
  "free_arts_grade1_2_group": "إبداع حر: مرحلة أولى وثانية ابتدائي - جماعي",
  "free_arts_grade3_4_group": "إبداع حر: مرحلة ثالثة ورابعة ابتدائي - جماعي",
  "free_arts_grade5_6_group": "إبداع حر: مرحلة خامسة وسادسة ابتدائي - جماعي",

  // الأدبية
  "literary_poetry": "الأدبية: الشعر - فردي",
  "literary_short_story": "الأدبية: القصة القصيرة - فردي",

  // الابتكارات الهندسية
  "engineering_programming_mechanics_individual": "الهندسة: البرمجة والكهرباء والميكانيكا - فردي",
  "engineering_programming_mechanics_group": "الهندسة: البرمجة والكهرباء والميكانيكا - جماعي",
  "engineering_architecture_individual": "الهندسة: العمارة - فردي",
  "engineering_architecture_group": "الهندسة: العمارة - جماعي",

  // الرياضية
  "football_boys": "الرياضية: كرة القدم - بنين",
  "football_girls": "الرياضية: كرة القدم - بنات",
  "volleyball_boys": "الرياضية: الكرة الطائرة - بنين",
  "volleyball_girls": "الرياضية: الكرة الطائرة - بنات",
  "table_tennis_boys_individual": "الرياضية: تنس الطاولة - بنين - فردي",
  "table_tennis_boys_team": "الرياضية: تنس الطاولة - بنين - جماعي",
  "table_tennis_girls_individual": "الرياضية: تنس الطاولة - بنات - فردي",
  "table_tennis_girls_team": "الرياضية: تنس الطاولة - بنات - جماعي",
  "chess_boys_individual": "الرياضية: الشطرنج - بنين - فردي",
  "chess_boys_team": "الرياضية: الشطرنج - بنين - جماعي",
  "chess_girls_individual": "الرياضية: الشطرنج - بنات - فردي",
  "chess_girls_team": "الرياضية: الشطرنج - بنات - جماعي",
  "running_boys": "الرياضية: جري - بنين - فردي",
  "running_girls": "الرياضية: جري - بنات - فردي",
};

export default function CompetitionsDetailsAdminPage() {
  const { userData, loading: authLoading } = useAuth();
  const [competitionsData, setCompetitionsData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!userData || userData.role !== "admin") {
      router.push("/leader/profile");
      return;
    }

    const fetchAllData = async () => {
      try {
        const [churchCompsSnap, otherCompsSnap, churchesMainSnap] = await Promise.all([
          getDocs(collection(db, "church_competitions")),
          getDocs(collection(db, "other-competitions")),
          getDocs(collection(db, "churches"))
        ]);

        const churchSettings = {};
        churchesMainSnap.forEach(doc => {
          churchSettings[doc.id] = doc.data();
        });

        const allCompetitions = {};

        const processSnap = (snap) => {
          snap.forEach(docSnap => {
            const churchName = docSnap.id;
            const data = docSnap.data().competitions || {};
            const discount = churchSettings[churchName]?.discountPercentage || 0;

            Object.entries(data).forEach(([compId, details]) => {
              if (!allCompetitions[compId]) {
                allCompetitions[compId] = {
                  id: compId,
                  name: competitionNamesInArabic[compId] || compId,
                  churches: [],
                  totalParticipants: 0,
                  totalPrice: 0,
                };
              }
              const finalPrice = details.totalPrice * (1 - discount / 100);
              allCompetitions[compId].churches.push({
                name: churchName,
                participants: details.count || 0,
                price: finalPrice,
              });
              allCompetitions[compId].totalParticipants += details.count || 0;
              allCompetitions[compId].totalPrice += finalPrice;
            });
          });
        };

        processSnap(churchCompsSnap);
        processSnap(otherCompsSnap);

        setCompetitionsData(allCompetitions);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userData, authLoading, router]);

  const filteredComps = useMemo(() => {
    return Object.values(competitionsData).filter(comp =>
      comp.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.totalParticipants - a.totalParticipants);
  }, [competitionsData, searchTerm]);

  const downloadExcel = () => {
    setDownloading(true);
    const exportData = [];
    filteredComps.forEach(comp => {
      exportData.push({ "المسابقة": comp.name });
      comp.churches.forEach(c => {
        if (c.participants > 0) {
          exportData.push({
            "الكنيسة": c.name,
            "المشتركين": c.participants,
            "السعر": Math.round(c.price)
          });
        }
      });
      exportData.push({ "إجمالي المشتركين": comp.totalParticipants, "إجمالي السعر": Math.round(comp.totalPrice) });
      exportData.push({});
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Details");
    XLSX.writeFile(wb, "competitions_details.xlsx");
    setDownloading(false);
  };

  if (authLoading || loading) return (
    <div className="loading-container">
      <div className="apple-spinner"></div>
    </div>
  );

  return (
    <div className="comp-admin-container page-transition">
      {/* Premium Header Section */}
      <header className="admin-page-header glass-card">
        <div className="header-main-info">
           <div className="icon-badge-glow">
              <Trophy size={36} />
           </div>
           <div className="text-info">
              <h1 className="text-gradient">تحليل المسابقات</h1>
              <div className="header-meta">
                 <span className="meta-item"><Calendar size={14} /> مهرجان الكرازة 2024</span>
                 <span className="meta-separator">|</span>
                 <span className="meta-item"><Zap size={14} /> تحديث مباشر</span>
              </div>
           </div>
        </div>
        <div className="header-actions">
           <button className="btn-primary" onClick={downloadExcel} disabled={downloading}>
             <Download size={18} />
             {downloading ? "جاري التصدير..." : "تصدير البيانات (Excel)"}
           </button>
        </div>
      </header>

      {/* Summary Statistics Cards */}
      <div className="stats-summary-grid">
         <div className="glass-card stat-summary-card">
            <div className="stat-visual purple"><LayoutGrid size={24} /></div>
            <div className="stat-data">
               <span className="label">إجمالي المسابقات</span>
               <strong className="value">{filteredComps.length}</strong>
            </div>
         </div>
         <div className="glass-card stat-summary-card">
            <div className="stat-visual blue"><Users size={24} /></div>
            <div className="stat-data">
               <span className="label">إجمالي المشتركين</span>
               <strong className="value">{filteredComps.reduce((acc, c) => acc + c.totalParticipants, 0).toLocaleString()}</strong>
            </div>
         </div>
         <div className="glass-card stat-summary-card highlight-glow">
            <div className="stat-visual gold"><DollarSign size={24} /></div>
            <div className="stat-data">
               <span className="label">الإيرادات الصافية</span>
               <strong className="value">{Math.round(filteredComps.reduce((acc, c) => acc + c.totalPrice, 0)).toLocaleString()} جـ</strong>
            </div>
         </div>
      </div>

      {/* Search and Navigation Bar */}
      <div className="search-nav-section glass-card">
        <div className="search-box-container">
          <Search size={22} className="search-icon" />
          <input
            type="text"
            placeholder="ابحث عن مسابقة محددة (مثل: كرة قدم، ألحان، روحي...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="scroll-pills-container">
          {filteredComps.slice(0, 10).map((comp, idx) => (
            <button
              key={idx}
              onClick={() => document.getElementById(`comp-${idx}`)?.scrollIntoView({ behavior: "smooth" })}
              className="scroll-pill"
            >
              {comp.name.includes(':') ? comp.name.split(':')[1].trim() : comp.name}
            </button>
          ))}
          {filteredComps.length > 10 && <span className="more-indicator">...</span>}
        </div>
      </div>

      {/* Detailed Competitions List */}
      <div className="comps-list">
        {filteredComps.length === 0 ? (
          <div className="glass-card empty-results">
             <Search size={48} />
             <h3>لا توجد نتائج للبحث</h3>
             <p>تأكد من كتابة اسم المسابقة بشكل صحيح</p>
          </div>
        ) : (
          filteredComps.map((comp, idx) => {
            const activeChurches = comp.churches.filter(c => c.participants > 0);

            return (
              <div key={idx} id={`comp-${idx}`} className="comp-full-card glass-card">
                <div className="card-top-header">
                   <div className="title-block">
                      <h2 className="comp-title-ar">{comp.name}</h2>
                      <div className="stats-badges">
                         <span className="badge-pill participant-pill"><Users size={14} /> {comp.totalParticipants} مشترك</span>
                         <span className="badge-pill revenue-pill"><DollarSign size={14} /> {Math.round(comp.totalPrice).toLocaleString()} جـ</span>
                      </div>
                   </div>
                   <div className="card-numeric-id">#{idx + 1}</div>
                </div>

                <div className="card-content-grid">
                  <div className="data-table-section">
                    <div className="table-overflow-wrapper">
                      <table className="liquid-data-table">
                        <thead>
                          <tr>
                            <th>اسم الكنيسة</th>
                            <th className="cell-center">عدد المشتركين</th>
                            <th className="cell-left">القيمة (بعد الخصم)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comp.churches.map((church, i) => (
                            <tr key={i} className={church.participants > 0 ? 'active-row' : 'inactive-row'}>
                              <td className="church-name-cell">{church.name}</td>
                              <td className="cell-center">
                                 <span className={church.participants > 0 ? 'count-bubble' : ''}>
                                    {church.participants}
                                 </span>
                              </td>
                              <td className="cell-left price-value-cell">
                                 {Math.round(church.price).toLocaleString()} <span className="currency">جـ</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="visual-analysis-section">
                    <div className="analysis-box-glass">
                       <h4>توزيع المشاركات بالكنائس</h4>
                       {activeChurches.length > 0 ? (
                         <div className="chart-outer">
                           <ResponsiveContainer width="100%" height={240}>
                             <PieChart>
                               <Pie
                                 data={activeChurches}
                                 dataKey="participants"
                                 nameKey="name"
                                 outerRadius={80}
                                 innerRadius={55}
                                 paddingAngle={6}
                                 stroke="none"
                               >
                                 {activeChurches.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                               </Pie>
                               <Tooltip
                                 contentStyle={{
                                   background: 'rgba(255, 255, 255, 0.95)',
                                   borderRadius: '16px',
                                   border: 'none',
                                   boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                   backdropFilter: 'blur(10px)',
                                   fontSize: '12px'
                                 }}
                               />
                             </PieChart>
                           </ResponsiveContainer>
                           <div className="chart-legend-grid">
                              {activeChurches.slice(0, 4).map((c, i) => (
                                <div key={i} className="legend-item">
                                   <span className="dot" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                   <span className="label truncate">{c.name.split(' ').slice(0, 2).join(' ')}</span>
                                </div>
                              ))}
                           </div>
                         </div>
                       ) : (
                         <div className="no-visual-data">
                            <TrendingUp size={32} className="dimmed-icon" />
                            <p>لا توجد بيانات رسم بياني</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
