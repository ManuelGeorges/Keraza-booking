// app/admin/churches/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc, // تأكد أن هذه مستوردة
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import * as XLSX from "xlsx";
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return router.push("/register");
      }
      const userDoc = await getDoc(doc(db, "leaders", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        return router.push("/leader/profile");
      }

      fetchData();
    });
    return () => unsubscribe();
  }, []);

  // دالة مساعدة لحساب السعر بعد الخصم
  const calculatePriceAfterDiscount = (originalPrice, discountPercentage) => {
    // التأكد من أن الخصم رقم وضمن النطاق من 0-100
    const discount = parseFloat(discountPercentage);
    if (isNaN(discount) || discount < 0) return originalPrice;
    if (discount > 100) return 0; // إذا كان الخصم 100% أو أكثر، يصبح السعر 0

    return originalPrice * (1 - (discount / 100));
  };

  const handlePaidToggle = async (id, churchName, currentPaidStatus) => {
    if (!id || !churchName) return;

    try {
      // تحديث حالة الدفع للخادم
      await updateDoc(doc(db, "leaders", id), {
        paid: !currentPaidStatus,
      });

      // تحديث حالة الدفع للكنيسة في كولكشن 'churches'
      await updateDoc(doc(db, "churches", churchName), {
        paid: !currentPaidStatus,
      });

      // تحديث الحالة المحلية لعكس التغيير فورا
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, paid: !currentPaidStatus } : item
        )
      );
    } catch (error) {
      console.error("Error updating paid status:", error);
      alert("فشل تحديث حالة الدفع. الرجاء المحاولة مرة أخرى.");
    }
  };

  const handleDiscountChange = async (churchName, newDiscountValue) => {
    let newDiscount = parseFloat(newDiscountValue);
    if (isNaN(newDiscount) || newDiscount < 0) {
      newDiscount = 0;
    }
    if (newDiscount > 100) {
      newDiscount = 100;
    }

    try {
      // تحديث نسبة الخصم في كولكشن 'churches'
      await updateDoc(doc(db, "churches", churchName), {
        discountPercentage: newDiscount,
      });

      // تحديث الحالة المحلية لعكس التغيير فورا
      setData((prevData) =>
        prevData.map((item) => {
          if (item.church === churchName) {
            const updatedTotalAfterDiscount = calculatePriceAfterDiscount(
              item.totalPayment, // هذا هو الإجمالي قبل الخصم
              newDiscount
            );
            return {
              ...item,
              discountPercentage: newDiscount,
              totalPaymentAfterDiscount: updatedTotalAfterDiscount,
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error updating discount percentage:", error);
      alert("فشل تحديث نسبة الخصم في قاعدة البيانات. الرجاء المحاولة مرة أخرى.");
    }
  };

  const fetchData = async () => {
    const leadersSnapshot = await getDocs(collection(db, "leaders"));
    const sportSnapshot = await getDocs(collection(db, "church_competitions"));
    const otherSnapshot = await getDocs(collection(db, "other-competitions"));

    const allCompetitionsDocs = [...sportSnapshot.docs, ...otherSnapshot.docs];

    const result = [];

    for (const churchName of churchList) {
      const leader = leadersSnapshot.docs.find(
        (doc) => doc.data().church === churchName
      );

      const churchCompsDocs = allCompetitionsDocs.filter(
        (compDoc) => compDoc.id === churchName
      );

      let totalSubs = 0;
      let totalPaymentBeforeDiscount = 0; // هذا يمثل عمود 'السعر'
      let discountPercentage = 0; // قيمة افتراضية

      // جلب مستند الكنيسة من كولكشن 'churches' للحصول على نسبة الخصم الخاصة بها
      const churchDocRef = doc(db, "churches", churchName);
      const churchDocSnap = await getDoc(churchDocRef);

      if (churchDocSnap.exists()) {
        discountPercentage = churchDocSnap.data().discountPercentage || 0;
      }

      churchCompsDocs.forEach((compDoc) => {
        const competitions = compDoc.data().competitions || {};
        Object.values(competitions).forEach((compDetails) => {
          totalSubs += compDetails.count || 0;
          totalPaymentBeforeDiscount += compDetails.totalPrice || 0;
        });
      });

      const totalPaymentAfterDiscount = calculatePriceAfterDiscount(
        totalPaymentBeforeDiscount,
        discountPercentage
      );

      const paid = leader?.data()?.paid || false;

      const leaderName = leader?.data()
        ? `${leader.data().firstName} ${leader.data().lastName}`
        : "—";

      result.push({
        church: churchName,
        leader: leaderName,
        subscribers: totalSubs,
        totalPayment: totalPaymentBeforeDiscount, // هذا هو 'السعر'
        discountPercentage: discountPercentage,
        totalPaymentAfterDiscount: totalPaymentAfterDiscount, // هذا هو 'السعر الإجمالي بعد الخصم'
        paid,
        id: leader?.id, // معرّف مستند الخادم
      });

      // 🏗️ كتابة أو تحديث البيانات في كولكشن churches
      const docDataToSet = {
        church: churchName,
        leader: leaderName,
        subscribers: totalSubs,
        totalPayment: totalPaymentBeforeDiscount, // تخزين الإجمالي الأصلي
        discountPercentage: discountPercentage,
        totalPaymentAfterDiscount: totalPaymentAfterDiscount,
        paid: paid,
      };

      if (leader?.id) {
        docDataToSet.leaderId = leader.id;
      }

      // استخدام { merge: true } لتجنب الكتابة فوق الحقول الموجودة
      await setDoc(doc(db, "churches", churchName), docDataToSet, { merge: true });
    }

    setData(result);
    setLoading(false);
  };

  const downloadExcel = () => {
    const exportData = data.map((row) => ({
      "الكنيسة": row.church,
      "الخادم": row.leader,
      "عدد المشتركين": row.subscribers,
      "السعر": row.totalPayment, // السعر الأصلي
      "نسبة الخصم (%)": row.discountPercentage,
      "السعر الإجمالي بعد الخصم": row.totalPaymentAfterDiscount,
      "تم الدفع؟": row.paid ? "✔" : "✘",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Churches");
    XLSX.writeFile(workbook, "churches_report.xlsx");
  };

  if (loading) return <p className="ad-church-loading">جاري التحميل...</p>;

  return (
    <div className="ad-church-container">
      <h1 className="ad-church-title">تقرير الكنائس والاشتراكات</h1>
      <button className="ad-church-download-btn" onClick={downloadExcel}>
        ⬇ تحميل Excel
      </button>
      <div className="ad-church-table-wrapper">
        <table className="ad-church-table">
          <thead>
            <tr>
              <th>الكنيسة</th>
              <th>الخادم</th>
              <th>عدد المشتركين</th>
              <th>السعر</th>
              <th>نسبة الخصم</th>
              <th>السعر الإجمالي بعد الخصم</th>
              <th>تم الدفع؟</th>
            </tr>
          </thead>
          <tbody>
            {data.map((church) => (
              <tr key={church.church}> {/* هنا تبدأ المشكلة عادةً */}
                <td>{church.church}</td> {/* تأكد من عدم وجود مسافة بين <td> و {church.church} */}
                <td>{church.leader}</td>
                <td>{church.subscribers}</td>
                <td>{church.totalPayment.toLocaleString()} جـ</td>
                <td>
                  <input
                    type="number"
                    value={church.discountPercentage}
                    onChange={(e) =>
                      handleDiscountChange(church.church, e.target.value)
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className="discount-input"
                  />
                  %
                </td>
                <td>{church.totalPaymentAfterDiscount.toLocaleString()} جـ</td>
                <td>
                  <input
                    type="checkbox"
                    checked={church.paid}
                    onChange={() => handlePaidToggle(church.id, church.church, church.paid)}
                  />
                </td>
              </tr> // وهنا تنتهي المشكلة، لا مسافات بيضاء قبل أو بعد </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}