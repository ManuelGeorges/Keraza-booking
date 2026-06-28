"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { Download, Search } from "lucide-react";
import "./page.css";

const COLORS = ["#0071e3", "#34c759", "#ff9500", "#ff3b30", "#af52de", "#5856d6", "#5ac8fa"];

const competitionNamesInArabic = {
  "karaza": "مسابقة الكرازة",
  "alhan": "مسابقة الألحان",
  "research": "مسابقة البحث",
  "service": "مسابقة الخدمة",
  "holy_bible": "مسابقة الكتاب المقدس",
  "creative": "مسابقة الابتكار",
  "talents": "مسابقة المواهب",
  "sports": "المسابقات الرياضية",
  // ... maps to many more
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
        // FAST FETCH: Fetch whole collections at once instead of individual getDocs in a loop
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
          "السعر": c.price
        });
      });
      exportData.push({ "الإجمالي": comp.totalParticipants, "إجمالي السعر": comp.totalPrice });
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
      <div className="admin-header-flex">
        <h1 className="text-gradient">تفاصيل المسابقات</h1>
        <button className="btn-primary" onClick={downloadExcel} disabled={downloading}>
          <Download size={18} />
          {downloading ? "جاري..." : "تصدير Excel"}
        </button>
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

      <div className="comps-grid">
        {filteredComps.map((comp) => (
          <div key={comp.id} className="comp-detail-card glass-card">
            <h3>{comp.name}</h3>
            <div className="stats-mini">
              <div className="stat-item">
                <span>المشتركين</span>
                <strong>{comp.totalParticipants}</strong>
              </div>
              <div className="stat-item">
                <span>الإجمالي</span>
                <strong>{comp.totalPrice.toLocaleString()} جـ</strong>
              </div>
            </div>

            <details className="church-breakdown">
              <summary>عرض تفاصيل الكنائس</summary>
              <div className="church-list-mini">
                {comp.churches.map((c, i) => (
                  <div key={i} className="mini-row">
                    <span>{c.name}</span>
                    <span>{c.participants} فرد</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
