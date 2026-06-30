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
} from "recharts";
import * as XLSX from "xlsx";
import { Download, Search, Trophy, Users, DollarSign, BarChart3 } from "lucide-react";
import "./page.css";

const COLORS = ["#0071e3", "#34c759", "#ff9500", "#ff3b30", "#af52de", "#5856d6", "#5ac8fa", "#ff2d55"];

const competitionNamesInArabic = {
  // مسابقات المهرجان الأساسية
  "festival_subscription": "إشتراك حجز المهرجان للكنيسة (إلزامى)",

  // مسابقة روحى الأسكندرية
  "rouhi_alex_kindergarten_1": "روحي مرحلة حضانة - الفريق الأول",
  "rouhi_alex_grade1_2_1": " روحي مرحلة أولى وثانية ابتدائي - الفريق الأول",
  "rouhi_alex_grade3_4_1": "روحي مرحلة ثالثة ورابعة ابتدائي - الفريق الأول",
  "rouhi_alex_grade5_6_1": "روحي مرحلة خامسة وسادسة ابتدائي - الفريق الأول",
  "rouhi_alex_kindergarten_extra": "روحي مرحلة حضانة - الفريق الإضافي",
  "rouhi_alex_grade1_2_extra": "روحي مرحلة أولى وثانية ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade3_4_extra": "روحي مرحلة ثالثة ورابعة ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade5_6_extra": "روحي مرحلة خامسة وسادسة ابتدائي - الفريق الإضافي",

  // الألحان
  "melodies_level1": "الألحان - المستوى الأول - فريق",
  "melodies_level2": "الألحان - المستوى الثاني - فريق",
  "melodies_talented_individual": "الألحان - مستوي الموهوبين - فردي",
  "melodies_talented_group": "الألحان - مستوي الموهوبين - جماعي",

  // الأنشطة الكنسية
  "church_activities_big_theatre": "المسرح الكبير - فريق",
  "church_activities_chorus": "الكورال - فريق",
  "church_activities_cantata": "الكنتاتا - فريق",
  "church_activities_coptic_theatre": "المسرح باللغة القبطية - فريق",
  "church_activities_operetta": "الأوبريت - فريق",
  "church_activities_solo_individual": "مسابقة الصولو - فردي",
  "church_activities_music_individual": "مسابقة العزف - فردي",
  "church_activities_solo_team": "مسابقة الصولو - جماعي",
  "church_activities_music_team": "مسابقة العزف - جماعي",

  // البحوث
  "research_theoretical": "البحث النظرى - فردي",
  "research_cultural": "البحث الثقافى - فردي",

  // الثقافية
  "cultural_magazine_paper": "إعداد مجلة ورقية - جماعي",
  "cultural_magazine_wall": "إعداد مجلة حائط - جماعي",
  "cultural_field_visits": "الزيارات الميدانية - جماعي",

  // الإلكترونية
  "electronic_level1_individual": "المسابقة الإلكترونية - المستوى الأول - فردي",
  "electronic_level2_individual": "المسابقة الإلكترونية - المستوى الثاني - فردي",
  "electronic_level1_group": "المسابقة الإلكترونية - المستوى الأول - جماعي",
  "electronic_level2_group": "المسابقة الإلكترونية - المستوى الثاني - جماعي",

  // الفنون التشكيلية
  "arts_kindergarten_individual": "فنون تشكيلية - حضانة - فردي",
  "arts_grade1_2_individual": "فنون تشكيلية - أولى وثانية ابتدائي - فردي",
  "arts_grade3_4_individual": "فنون تشكيلية - ثالثة ورابعة ابتدائي - فردي",
  "arts_grade5_6_individual": "فنون تشكيلية - خامسة وسادسة ابتدائي - فردي",
  "arts_kindergarten_group": "فنون تشكيلية - حضانة - جماعي",
  "arts_grade1_2_group": "فنون تشكيلية - أولى وثانية ابتدائي - جماعي",
  "arts_grade3_4_group": "فنون تشكيلية - ثالثة ورابعة ابتدائي - جماعي",
  "arts_grade5_6_group": "فنون تشكيلية - خامسة وسادسة ابتدائي - جماعي",

  // إبداع حر
  "free_arts_kindergarten_individual": "إبداع حر - حضانة - فردي",
  "free_arts_grade1_2_individual": "إبداع حر - أولى وثانية ابتدائي - فردي",
  "free_arts_grade3_4_individual": "إبداع حر - ثالثة ورابعة ابتدائي - فردي",
  "free_arts_grade5_6_individual": "إبداع حر - خامسة وسادسة ابتدائي - فردي",
  "free_arts_kindergarten_group": "إبداع حر - حضانة - جماعي",
  "free_arts_grade1_2_group": "إبداع حر - أولى وثانية ابتدائي - جماعي",
  "free_arts_grade3_4_group": "إبداع حر - ثالثة ورابعة ابتدائي - جماعي",
  "free_arts_grade5_6_group": "إبداع حر - خامسة وسادسة ابتدائي - جماعي",

  // الأدبية
  "literary_poetry": "الأدبية - الشعر - فردي",
  "literary_short_story": "الأدبية - القصة القصيرة - فردي",

  // الابتكارات الهندسية
  "engineering_programming_mechanics_individual": "هندسة - برمجة وميكانيكا - فردي",
  "engineering_programming_mechanics_group": "هندسة - برمجة وميكانيكا - جماعي",
  "engineering_architecture_individual": "هندسة - عمارة - فردي",
  "engineering_architecture_group": "هندسة - عمارة - جماعي",

  // المسابقات الرياضية
  "football_boys": "كرة القدم - بنين - جماعي",
  "football_girls": "كرة القدم - بنات - جماعي",
  "volleyball_boys": "الكرة الطائرة - بنين - جماعي",
  "volleyball_girls": "الكرة الطائرة - بنات - جماعي",
  "table_tennis_boys_individual": "تنس الطاولة - بنين - فردي",
  "table_tennis_boys_team": "تنس الطاولة - بنين - جماعي",
  "table_tennis_girls_individual": "تنس الطاولة - بنات - فردي",
  "table_tennis_girls_team": "تنس الطاولة - بنات - جماعي",
  "chess_boys_individual": "الشطرنج - بنين - فردي",
  "chess_boys_team": "الشطرنج - بنين - جماعي",
  "chess_girls_individual": "الشطرنج - بنات - فردي",
  "chess_girls_team": "الشطرنج - بنات - جماعي",
  "running_boys": "جري - بنين - فردي",
  "running_girls": "جري - بنات - فردي",
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
        exportData.push({
          "الكنيسة": c.name,
          "المشتركين": c.participants,
          "السعر": Math.round(c.price)
        });
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
      <header className="admin-page-header glass-card">
        <div className="header-info">
           <Trophy size={40} className="header-icon-glow" />
           <div>
              <h1 className="text-gradient">تفاصيل المسابقات</h1>
              <p className="subtitle">عرض شامل لجميع المسابقات والمشاركات من الكنائس</p>
           </div>
        </div>
        <button className="btn-primary" onClick={downloadExcel} disabled={downloading}>
          <Download size={18} />
          {downloading ? "جاري..." : "تنزيل Excel"}
        </button>
      </header>

      <div className="stats-summary-grid">
         <div className="glass-card stat-summary-card">
            <Users size={24} />
            <div className="stat-content">
               <span>إجمالي المسابقات</span>
               <strong>{filteredComps.length}</strong>
            </div>
         </div>
         <div className="glass-card stat-summary-card">
            <BarChart3 size={24} />
            <div className="stat-content">
               <span>إجمالي المشتركين</span>
               <strong>{filteredComps.reduce((acc, c) => acc + c.totalParticipants, 0).toLocaleString()}</strong>
            </div>
         </div>
         <div className="glass-card stat-summary-card highlight">
            <DollarSign size={24} />
            <div className="stat-content">
               <span>إجمالي الإيرادات (بعد الخصم)</span>
               <strong>{Math.round(filteredComps.reduce((acc, c) => acc + c.totalPrice, 0)).toLocaleString()} جـ</strong>
            </div>
         </div>
      </div>

      <div className="search-wrapper glass-card">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="ابحث عن مسابقة محددة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <nav className="quick-nav glass-card">
        {filteredComps.map((comp, idx) => (
          <button
            key={idx}
            onClick={() => document.getElementById(`comp-${idx}`)?.scrollIntoView({ behavior: "smooth" })}
            className="nav-chip"
          >
            {comp.name}
          </button>
        ))}
      </nav>

      <div className="comps-list">
        {filteredComps.map((comp, idx) => {
          const dataForCount = comp.churches.filter(c => c.participants > 0);
          const dataForPrice = comp.churches.filter(c => c.price > 0);

          return (
            <div key={idx} id={`comp-${idx}`} className="comp-full-card glass-card">
              <div className="card-header-flex">
                 <h2 className="comp-title">{comp.name}</h2>
                 <div className="comp-badges">
                    <span className="badge-count"><Users size={14} /> {comp.totalParticipants} مشترك</span>
                    <span className="badge-price"><DollarSign size={14} /> {Math.round(comp.totalPrice).toLocaleString()} جـ</span>
                 </div>
              </div>

              <div className="card-body-grid">
                <div className="table-wrapper">
                  <table className="comp-table">
                    <thead>
                      <tr>
                        <th>الكنيسة</th>
                        <th className="center-th">المشتركين</th>
                        <th className="price-th">التكلفة الصافية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comp.churches.map((church, i) => (
                        <tr key={i}>
                          <td>{church.name}</td>
                          <td className="center-td"><strong>{church.participants}</strong></td>
                          <td className="price-td">{Math.round(church.price).toLocaleString()} جـ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="charts-box-flex">
                  <div className="chart-item">
                    <h3>تحليل المشاركات</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={dataForCount} dataKey="participants" nameKey="name" outerRadius={70} innerRadius={50} paddingAngle={5}>
                          {dataForCount.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
