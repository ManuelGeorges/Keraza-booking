"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Church, User as UserIcon, Wallet, Users } from "lucide-react";
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
  "festival_subscription": "إشتراك المهرجان (إلزامي)",
};

export default function ChurchInfoPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [allCompetitions, setAllCompetitions] = useState([]);
  const [totalPayment, setTotalPayment] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!userData) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const church = userData.church;
        if (!church) {
          setDataLoading(false);
          return;
        }

        // Parallel Fetch for church competitions
        const [churchDoc, otherDoc] = await Promise.all([
          getDoc(doc(db, "church_competitions", church)),
          getDoc(doc(db, "other-competitions", church))
        ]);

        const competitions = [];
        const processData = (snap) => {
          if (snap.exists()) {
            const data = snap.data().competitions || {};
            Object.entries(data).forEach(([key, value]) => {
              competitions.push({
                id: key,
                name: competitionNamesInArabic[key] || value.name || key,
                count: value.count || 0,
                totalPrice: value.totalPrice || 0,
              });
            });
          }
        };

        processData(churchDoc);
        processData(otherDoc);

        const total = competitions.reduce((acc, item) => acc + item.totalPrice, 0);
        setAllCompetitions(competitions);
        setTotalPayment(total);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [userData, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="loading-container">
        <div className="apple-spinner"></div>
      </div>
    );
  }

  const dataForCount = allCompetitions.filter(c => c.id !== "festival_subscription" && c.count > 0);
  const dataForPrice = allCompetitions.filter(c => c.totalPrice > 0);

  return (
    <div className="church-info-container page-transition">
      <div className="church-hero glass-card">
        <div className="hero-icon"><Church size={40} /></div>
        <h1 className="text-gradient">{userData.church}</h1>
        <div className="hero-meta">
          <div className="meta-item">
            <UserIcon size={16} />
            <span>المسؤول: {userData.firstName} {userData.lastName}</span>
          </div>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="summary-card glass-card">
          <Wallet size={24} className="color-primary" />
          <div className="summary-info">
            <span>إجمالي التكلفة</span>
            <strong>{totalPayment.toLocaleString()} جـ</strong>
          </div>
        </div>
        <div className="summary-card glass-card">
          <Users size={24} className="color-success" />
          <div className="summary-info">
            <span>إجمالي الاشتراكات</span>
            <strong>{allCompetitions.reduce((a, b) => a + (b.count || 0), 0)}</strong>
          </div>
        </div>
      </div>

      <div className="table-section glass-card">
        <h3>تفاصيل المسابقات</h3>
        <div className="church-table-wrapper">
          <table className="church-table">
            <thead>
              <tr>
                <th>المسابقة</th>
                <th>المشتركين</th>
                <th>التكلفة</th>
              </tr>
            </thead>
            <tbody>
              {allCompetitions.map((c, index) => (
                <tr key={index}>
                  <td className="text-right">{c.name}</td>
                  <td>{c.count}</td>
                  <td className="font-bold">{c.totalPrice.toLocaleString()} جـ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="church-charts-container">
        <div className="church-chart glass-card">
          <h3>توزيع المشتركين</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={dataForCount} dataKey="count" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                {dataForCount.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="church-chart glass-card">
          <h3>توزيع التكلفة</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={dataForPrice} dataKey="totalPrice" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                {dataForPrice.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
