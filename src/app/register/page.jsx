"use client";

import "./page.css";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import SelectChurch from "@/components/SelectChurch";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    church: "",
    grade: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error
  const router = useRouter();

  // ✅ حماية الراوت لو مسجل دخول بالفعل
  useEffect(() => {
    const checkUserApproval = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "leaders", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.role === "admin") {
              router.push("/admin/pending");
            } else if (data.approved === true) {
              router.push("/leader/profile");
            } else {
              router.push("/waiting");
            }
          }
        }
      });
    };
    checkUserApproval();
  }, [router]);

  const churches = [
    "كنيسة الشهيد العظيم مارمينا بفلمنج",
    "كنيسة السيدة العذراء مريم و القديس يوحنا الحبيب بجناكليس",
    "كنيسة السيدة العذراء مريم و الانبا باخوميوس  شارع سوريا",
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

  const grades = [
    "أولى حضانة",
    "تانية حضانة",
    "أولى ابتدائي",
    "تانية ابتدائي",
    "تالتة ابتدائي",
    "رابعة ابتدائي",
    "خامسة ابتدائي",
    "سادسة ابتدائي",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const {
        firstName, lastName, email, password, phone, church, grade, gender,
      } = formData;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const leaderData = {
        firstName, lastName, email, phone, church, grade, gender,
        approved: false,
        role: "leader",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "leaders", user.uid), leaderData);

      setMessage("✅ تم إنشاء الحساب! برجاء الانتظار للموافقة.");
      setMessageType("success");

      setFormData({
        firstName: "", lastName: "", email: "", password: "",
        phone: "", church: "", grade: "", gender: "",
      });

      router.push("/waiting");

    } catch (err) {
      console.error(err);
if (err.code === "auth/email-already-in-use") {
  setMessage(
    <>
      ❌ هذا الإيميل مستخدم بالفعل.{" "}
      <a href="/login" className="reg-inline-link">
        سجّل الدخول بدلًا من ذلك
      </a>
    </>
  );
}
 else if (err.code === "auth/weak-password") {
        setMessage("❌ كلمة السر ضعيفة. لازم تكون 6 حروف أو أكتر.");
      } else {
        setMessage("❌ حصل خطأ أثناء التسجيل. حاول مرة تانية.");
      }
      setMessageType("error");
    }

    setLoading(false);
  };

  return (
    <div className="reg-container">
      <h1 className="reg-title">تسجيل حساب خادم</h1>
      <form onSubmit={handleSubmit} className="reg-form">
        <input type="text" name="firstName" placeholder="الاسم الأول"
          value={formData.firstName} onChange={handleChange} required className="reg-input" />
        <input type="text" name="lastName" placeholder="الاسم الأخير"
          value={formData.lastName} onChange={handleChange} required className="reg-input" />
        <input type="tel" name="phone" placeholder="رقم التليفون"
          value={formData.phone} onChange={handleChange} required className="reg-input" />
        <input type="email" name="email" placeholder="البريد الإلكتروني"
          value={formData.email} onChange={handleChange} required className="reg-input" />
        <input type="password" name="password" placeholder="كلمة المرور"
          value={formData.password} onChange={handleChange} required className="reg-input" />

        <SelectChurch
          options={churches.map((ch) => ({ value: ch, label: ch }))}
          onChange={(value) => setFormData({ ...formData, church: value })}
        />

        <button type="submit" disabled={loading} className="reg-button">
          {loading ? "جارٍ التسجيل..." : "تسجيل الحساب"}
        </button>

        {message && (
          <p className={`reg-message ${messageType === "success" ? "success" : "error"}`}>
            {message}
          </p>
        )}

        {/* ✅ لينك تسجيل الدخول */}
        <p className="reg-note">
          لديك حساب بالفعل؟{" "}
          <a href="/login" className="reg-link">سجّل الدخول من هنا</a>
        </p>
      </form>
    </div>
  );
}
