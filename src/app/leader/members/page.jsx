"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import "./page.css";

export default function LeaderMembersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leaderData, setLeaderData] = useState({ gender: "", grade: "" });
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("✅ Logged in as:", currentUser.uid);

        try {
          const docRef = doc(db, "leaders", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.approved && userData.role === "leader") {
              setUser(currentUser);
              setLeaderData({
                gender: userData.gender || "غير محدد",
                grade: userData.grade || "غير محددة",
              });

              const mQuery = query(
                collection(db, "members"),
                where("leaderId", "==", currentUser.uid)
              );
              const mSnapshot = await getDocs(mQuery);
              const fetchedMembers = mSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setMembers(fetchedMembers);
            } else {
              router.push("/unauthorized");
            }
          } else {
            router.push("/register");
          }
        } catch (error) {
          console.error("Error fetching leader data:", error);
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("جاري تحميل البيانات...");
      return;
    }

    if (!formData.name || !formData.phone) {
      alert("الاسم ورقم التليفون مطلوبين");
      return;
    }

    const dataToSave = {
      ...formData,
      leaderId: user.uid,
      gender: leaderData.gender,
      grade: leaderData.grade,
      joinedCompetitions: [],
      totalFees: 0,
    };

    console.log("🟢 Preparing to save member with data:", dataToSave);

    try {
      await addDoc(collection(db, "members"), dataToSave);
      alert("تم إضافة المخدوم بنجاح");

      setFormData({ name: "", phone: "", email: "" });
      setShowForm(false);

      const mQuery = query(
        collection(db, "members"),
        where("leaderId", "==", user.uid)
      );
      const mSnapshot = await getDocs(mQuery);
      const fetchedMembers = mSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(fetchedMembers);
    } catch (error) {
      console.error("❌ Error while adding member:", error);
      alert("حدث خطأ أثناء الإضافة: " + error.message);
    }
  };

  return (
    <div className="mem-container">
      <h1 className="mem-title">المخدومين</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mem-toggle-button"
      >
        {showForm ? "إغلاق" : "+ إضافة مخدوم"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mem-form">
          <label>
            الاسم الرباعي <span className="mem-required">(إجباري)</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>
            رقم التليفون <span className="mem-required">(إجباري)</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>
            الإيميل <span className="mem-optional">(اختياري)</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <button type="submit" className="mem-submit-button">
            حفظ المخدوم
          </button>
        </form>
      )}

      <table className="mem-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رقم التليفون</th>
            <th>الإيميل</th>
            <th>النوع</th>
            <th>المرحلة</th>
            <th>المال المطلوب</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.phone}</td>
              <td>{member.email || "-"}</td>
              <td>{member.gender}</td>
              <td>{member.grade}</td>
              <td className="mem-fees">{member.totalFees || 0} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
