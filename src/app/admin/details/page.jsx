"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Search, Church, Users, Wallet } from "lucide-react";
import "./page.css";

export default function AdminChurchDetailsPage() {
  const { userData, loading: authLoading } = useAuth();
  const [churchesData, setChurchesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!userData || userData.role !== "admin") {
      router.push("/leader/profile");
      return;
    }

    const fetchChurches = async () => {
      try {
        // Fast Parallel Fetch
        const [churchCompsSnap, otherCompsSnap, churchesMainSnap] = await Promise.all([
          getDocs(collection(db, "church_competitions")),
          getDocs(collection(db, "other-competitions")),
          getDocs(collection(db, "churches"))
        ]);

        const settingsMap = {};
        churchesMainSnap.forEach(doc => settingsMap[doc.id] = doc.data());

        const consolidated = {};

        const process = (snap) => {
          snap.forEach(docSnap => {
            const name = docSnap.id;
            const data = docSnap.data().competitions || {};
            if (!consolidated[name]) consolidated[name] = { name, totalParticipants: 0, totalPrice: 0 };

            Object.values(data).forEach(c => {
              consolidated[name].totalParticipants += c.count || 0;
              consolidated[name].totalPrice += c.totalPrice || 0;
            });
          });
        };

        process(churchCompsSnap);
        process(otherCompsSnap);

        const finalData = Object.values(consolidated).map(church => {
          const discount = settingsMap[church.name]?.discountPercentage || 0;
          return {
            ...church,
            discount,
            finalPrice: church.totalPrice * (1 - discount / 100)
          };
        });

        setChurchesData(finalData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChurches();
  }, [userData, authLoading, router]);

  const filteredChurches = useMemo(() => {
    return churchesData.filter(c => c.name.includes(searchTerm))
      .sort((a, b) => b.totalParticipants - a.totalParticipants);
  }, [churchesData, searchTerm]);

  if (authLoading || loading) return (
    <div className="loading-container">
      <div className="apple-spinner"></div>
    </div>
  );

  return (
    <div className="admin-details-container page-transition">
      <h1 className="text-gradient">تفاصيل الكنائس</h1>

      <div className="search-wrapper glass-card">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="ابحث عن كنيسة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="church-grid">
        {filteredChurches.map((church, idx) => (
          <div key={idx} className="church-card glass-card">
            <div className="church-card-header">
              <Church size={24} className="primary-icon" />
              <h3>{church.name}</h3>
            </div>

            <div className="church-stats">
              <div className="stat-box">
                <Users size={18} />
                <div className="stat-text">
                  <span>المشتركين</span>
                  <strong>{church.totalParticipants}</strong>
                </div>
              </div>
              <div className="stat-box">
                <Wallet size={18} />
                <div className="stat-text">
                  <span>المبلغ النهائي</span>
                  <strong>{Math.round(church.finalPrice).toLocaleString()} جـ</strong>
                </div>
              </div>
            </div>

            {church.discount > 0 && (
              <div className="discount-tag">خصم {church.discount}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
