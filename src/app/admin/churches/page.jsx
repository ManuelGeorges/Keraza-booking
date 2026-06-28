"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import { Download, CheckCircle, XCircle } from "lucide-react";
import "./page.css";

const churchList = [
  "كنيسة الشهيد العظيم مارمينا بفلمنج",
  "كنيسة السيدة العذراء مريم و القديس يوحنا الحبيب بجناكليس",
  "كنيسة السيدة العذراء مريم و الانبا باخوميوس شارع سوريا",
  "كنيسة رئيس الملائكة الجليل ميخائيل بمصطفى كامل",
  "كنيسة السيدة العذراء مريم و الشهيد العظيم مارمرقس الرسول بجرين بلازا",
  "كنيسة العذراء ومارجرجس بغبريال",
  "كنيسة الانبا شنوده والانبا هرمينا بدنا",
  "كنيسة مارجرجس باكوس",
  "كنيسة العذراء والانبا باخوميوس كوبرى الناموس (البشارة)",
  "كنيسة الملاك ميخائيل والانبا كاراس ارض الفولى",
  "كنيسة العذراء وابوسيفين حجر النواتيه",
  "كنيسة العذراء و مارمرقس جرين بلازا – خدمة ام الرحمة",
  "كنيسة مارجرجس والانبا انطونيوس محرم بك",
  "كنيسة ابوسيفين امبروزو",
  "كنيسة العذراء محرم بك",
  "كنيسة العذراء ومارمينا بالمستشفى القبطى",
  "كنيسة الانبا ابرام زين العابدين محرم بك",
  "كنيسة العذراء والقديس بولس بكرموز",
  "كنيسة الملاك ميخائيل غربال",
  "جمعية اصدقاء الكتاب المقدس محرم بك",
  "جمعية الملاك ميخائيل محرم بك",
  "كنيسة العذراء مريم و ابونا سمعان الاخميمي بغربال",
  "كنيسة الشهيد العظيم مارجرجس بالحضرة",
  "كنيسة القديس ابومقار و البابا كيرلس السادس بالدريسة",
];

export default function ChurchesPage() {
  const { userData, loading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Parallel fetch for everything
      const [leadersSnap, sportSnap, otherSnap, churchesSnap] = await Promise.all([
        getDocs(collection(db, "leaders")),
        getDocs(collection(db, "church_competitions")),
        getDocs(collection(db, "other-competitions")),
        getDocs(collection(db, "churches"))
      ]);

      const leadersMap = {};
      leadersSnap.forEach(d => {
        const ld = d.data();
        if (ld.church) leadersMap[ld.church] = { id: d.id, ...ld };
      });

      const churchSettings = {};
      churchesSnap.forEach(d => churchSettings[d.id] = d.data());

      const compStats = {};
      const process = (snap) => {
        snap.forEach(d => {
          const church = d.id;
          const comps = d.data().competitions || {};
          if (!compStats[church]) compStats[church] = { totalSubs: 0, totalPayment: 0 };
          Object.values(comps).forEach(c => {
            compStats[church].totalSubs += c.count || 0;
            compStats[church].totalPayment += c.totalPrice || 0;
          });
        });
      };

      process(sportSnap);
      process(otherSnap);

      const result = churchList.map(churchName => {
        const leader = leadersMap[churchName];
        const stats = compStats[churchName] || { totalSubs: 0, totalPayment: 0 };
        const discount = churchSettings[churchName]?.discountPercentage || 0;
        const totalAfterDiscount = stats.totalPayment * (1 - discount / 100);

        return {
          church: churchName,
          leader: leader ? `${leader.firstName} ${leader.lastName}` : "—",
          subscribers: stats.totalSubs,
          totalPayment: stats.totalPayment,
          discountPercentage: discount,
          totalPaymentAfterDiscount: totalAfterDiscount,
          paid: leader?.paid || false,
          id: leader?.id,
        };
      });

      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaidToggle = async (id, churchName, currentPaidStatus) => {
    if (!id || !churchName) return;
    try {
      const nextStatus = !currentPaidStatus;
      await Promise.all([
        updateDoc(doc(db, "leaders", id), { paid: nextStatus }),
        setDoc(doc(db, "churches", churchName), { paid: nextStatus }, { merge: true })
      ]);
      setData(prev => prev.map(item => item.id === id ? { ...item, paid: nextStatus } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiscountChange = async (churchName, value) => {
    let discount = Math.min(100, Math.max(0, parseFloat(value) || 0));
    try {
      await setDoc(doc(db, "churches", churchName), { discountPercentage: discount }, { merge: true });
      setData(prev => prev.map(item => {
        if (item.church === churchName) {
          return {
            ...item,
            discountPercentage: discount,
            totalPaymentAfterDiscount: item.totalPayment * (1 - discount / 100)
          };
        }
        return item;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return (
    <div className="loading-container">
      <div className="apple-spinner"></div>
    </div>
  );

  return (
    <div className="ad-church-container page-transition">
      <div className="admin-header-flex">
        <h1 className="text-gradient">تقرير الكنائس</h1>
        <button className="btn-primary" onClick={() => {
           const ws = XLSX.utils.json_to_sheet(data);
           const wb = XLSX.utils.book_new();
           XLSX.utils.book_append_sheet(wb, ws, "Report");
           XLSX.writeFile(wb, "churches_report.xlsx");
        }}>
          <Download size={18} /> تحميل Excel
        </button>
      </div>

      <div className="table-card glass-card">
        <div className="ad-church-table-wrapper">
          <table className="ad-church-table">
            <thead>
              <tr>
                <th>الكنيسة</th>
                <th>الخادم</th>
                <th>المشتركين</th>
                <th>المبلغ</th>
                <th>الخصم</th>
                <th>الصافي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.church}>
                  <td className="church-name-td">{row.church}</td>
                  <td>{row.leader}</td>
                  <td className="font-bold">{row.subscribers}</td>
                  <td>{row.totalPayment.toLocaleString()} جـ</td>
                  <td>
                    <div className="discount-cell">
                      <input
                        type="number"
                        value={row.discountPercentage}
                        onChange={(e) => handleDiscountChange(row.church, e.target.value)}
                        className="discount-input"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="font-bold color-primary">{Math.round(row.totalPaymentAfterDiscount).toLocaleString()} جـ</td>
                  <td>
                    <button
                      className={`status-toggle ${row.paid ? 'is-paid' : ''}`}
                      onClick={() => handlePaidToggle(row.id, row.church, row.paid)}
                    >
                      {row.paid ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
