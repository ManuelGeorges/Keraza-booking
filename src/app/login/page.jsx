"use client";

import "./page.css";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { sendPasswordResetEmail } from "firebase/auth"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 
  const router = useRouter();
  const firebaseErrorMessages = {
  "auth/user-not-found": "❌ هذا البريد الإلكتروني غير مسجل.",
  "auth/wrong-password": "❌ كلمة المرور غير صحيحة.",
  "auth/invalid-email": "❌ البريد الإلكتروني غير صالح.",
  "auth/too-many-requests": "❌ تم حظر المحاولة مؤقتًا بسبب محاولات كثيرة. حاول لاحقًا.",
  "auth/network-request-failed": "❌ حصلت مشكلة في الاتصال بالإنترنت.",
  "auth/internal-error": "❌ حصل خطأ داخلي. حاول تاني.",
  "auth/invalid-credential": "❌ البريد الإلكتروني أو كلمة المرور غير صحيحين.",
  "auth/user-disabled": "❌ تم تعطيل هذا الحساب من قبل المسؤول.",
  // Password reset
  "auth/missing-email": "❌ من فضلك أدخل بريدك الإلكتروني.",
};

  useEffect(() => {
    const checkUser = async () => {
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
    checkUser();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const docSnap = await getDoc(doc(db, "leaders", user.uid));
      if (!docSnap.exists()) {
        setMessage("❌ الحساب غير موجود في قاعدة البيانات.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      if (data.role === "admin") {
        router.push("/admin/pending");
      } else if (data.approved === true) {
        router.push("/leader/profile");
      } else {
        router.push("/waiting");
      }

    } catch (err) {
  const msg = firebaseErrorMessages[err.code] || "❌ حصل خطأ أثناء تسجيل الدخول.";
  setMessage(msg);
  setMessageType("error");
}

    

    setLoading(false);
  };
  const handleForgotPassword = async () => {
  if (!email) {
    setMessage("❌ من فضلك أدخل بريدك الإلكتروني أولاً.");
    setMessageType("error");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    setMessage("📧 تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    setMessageType("success");
  } catch (err) {
  const msg = firebaseErrorMessages[err.code] || "❌ حصل خطأ أثناء محاولة إرسال الإيميل.";
  setMessage(msg);
  setMessageType("error");
}

};

  return (
    <div className="reg-container">
      <h1 className="reg-title">تسجيل الدخول</h1>
      <form onSubmit={handleLogin} className="reg-form">
        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="reg-input"
        />
        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="reg-input"
        />

        <button type="submit" disabled={loading} className="reg-button">
          {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        {message && (
          <p className={`reg-message ${messageType === "success" ? "success" : "error"}`}>
            {message}
          </p>
        )}

        <p className="reg-note">
          New account?{" "}
          <a href="/register" className="reg-link">Click here</a>
        </p>
        <p className="reg-note">
        Forgot your password?{" "}
  <span className="reg-link" onClick={() => handleForgotPassword()}>
    Click here
  </span>
</p>

      </form>
    </div>
  );
}
