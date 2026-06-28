"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
  "festival_subscription": "إشتراك حجز المهرجان",
  // ... (keeping other names for mapping)
};

export default function GeneralStatsPage() {
  const { userData, loading: authLoading } = useAuth();
  const [data, setData] = useState({
    mostPopular: [],
    mostPaid: [],
    churchSubscribers: [],
    churchPayments: []
  });
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!userData || userData.role !== "admin") {
      router.push("/leader/profile");
      return;
    }
    fetchData();
  }, [userData, authLoading, router]);

  const fetchData = async () => {
    try {
      // Use cache-first approach or parallel fetching
      const [sportSnap, otherSnap] = await Promise.all([
        getDocs(collection(db, "church_competitions")),
        getDocs(collection(db, "other-competitions"))
      ]);

      const allComps = [...sportSnap.docs, ...otherSnap.docs];
      const popularity = {};
      const payments = {};
      const churchSubs = {};
      const churchPays = {};

      allComps.forEach((docSnap) => {
        const church = docSnap.id;
        const compData = docSnap.data();
        const comps = compData.competitions || {};

        Object.entries(comps).forEach(([name, values]) => {
          const count = values.count || 0;
          const price = values.totalPrice || 0;

          popularity[name] = (popularity[name] || 0) + count;
          payments[name] = (payments[name] || 0) + price;
          churchSubs[church] = (churchSubs[church] || 0) + count;
          churchPays[church] = (churchPays[church] || 0) + price;
        });
      });

      setData({
        mostPopular: Object.entries(popularity).map(([name, value]) => ({
          name: competitionNamesInArabic[name] || name,
          value,
        })).sort((a, b) => b.value - a.value).slice(0, 7),

        mostPaid: Object.entries(payments).map(([name, value]) => ({
          name: competitionNamesInArabic[name] || name,
          value,
        })).sort((a, b) => b.value - a.value).slice(0, 7),

        churchSubscribers: Object.entries(churchSubs).map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value).slice(0, 7),

        churchPayments: Object.entries(churchPays).map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value).slice(0, 7)
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setDataLoading(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="loading-container">
        <div className="apple-spinner"></div>
      </div>
    );
  }

  const renderChart = (title, chartData) => (
    <div className="ad-gen-chart-box glass-card">
      <h2 className="ad-gen-chart-title">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            innerRadius={60}
            paddingAngle={5}
            cx="50%"
            cy="50%"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="ad-gen-container page-transition">
      <h1 className="ad-gen-title">إحصائيات الكرازة</h1>
      <div className="ad-gen-grid">
        {renderChart("أكثر المسابقات انتشارًا", data.mostPopular)}
        {renderChart("أكثر المسابقات دخلاً", data.mostPaid)}
        {renderChart("أكثر الكنائس تفاعلاً", data.churchSubscribers)}
        {renderChart("إجمالي تحصيل الكنائس", data.churchPayments)}
      </div>
    </div>
  );
}
