"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import "./page.css";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#b455f0", "#e35f5f", "#40a965", "#f58f00"
];

const competitionNamesInArabic = {
  // مسابقات الكرازة والكنسية
  "karaza": "مسابقة الكرازة",
  "alhan": "مسابقة الألحان",
  "research": "مسابقة البحث",
  "service": "مسابقة الخدمة",
  "holy_bible": "مسابقة الكتاب المقدس",
  "creative": "مسابقة الابتكار",
  "talents": "مسابقة المواهب",
  "sports": "المسابقات الرياضية",
  //التأمين الرياضي:
  "sports_insurance": "التأمين الرياضي",
  // كرة القدم
  "football_boys_grade0": "كرة القدم - بنين - حضانة - جماعي",
  "football_boys_grade12": "كرة القدم - بنين - أولى وثانية ابتدائي - جماعي",
  "football_boys_grade34": "كرة القدم - بنين - ثالثة ورابعة ابتدائي - جماعي",
  "football_boys_grade56": "كرة القدم - بنين - خامسة وسادسة ابتدائي - جماعي",
  "football_girls_grade0": "كرة القدم - بنات - حضانة - جماعي",
  "football_girls_grade12": "كرة القدم - بنات - أولى وثانية ابتدائي - جماعي",
  "football_girls_grade34": "كرة القدم - بنات - ثالثة ورابعة ابتدائي - جماعي",
  "football_girls_grade56": "كرة القدم - بنات - خامسة وسادسة ابتدائي - جماعي",

  // الكرة الطائرة
  "volleyball_boys_grade0": "الكرة الطائرة - بنين - حضانة - جماعي",
  "volleyball_boys_grade12": "الكرة الطائرة - بنين - أولى وثانية ابتدائي - جماعي",
  "volleyball_boys_grade34": "الكرة الطائرة - بنين - ثالثة ورابعة ابتدائي - جماعي",
  "volleyball_boys_grade56": "الكرة الطائرة - بنين - خامسة وسادسة ابتدائي - جماعي",
  "volleyball_girls_grade0": "الكرة الطائرة - بنات - حضانة - جماعي",
  "volleyball_girls_grade12": "الكرة الطائرة - بنات - أولى وثانية ابتدائي - جماعي",
  "volleyball_girls_grade34": "الكرة الطائرة - بنات - ثالثة ورابعة ابتدائي - جماعي",
  "volleyball_girls_grade56": "الكرة الطائرة - بنات - خامسة وسادسة ابتدائي - جماعي",

  // تنس الطاولة
  "table_tennis_boys_individual_grade0": "تنس الطاولة - بنين - فردي - حضانة",
  "table_tennis_boys_individual_grade12": "تنس الطاولة - بنين - فردي - أولى وثانية ابتدائي",
  "table_tennis_boys_individual_grade34": "تنس الطاولة - بنين - فردي - ثالثة ورابعة ابتدائي",
  "table_tennis_boys_individual_grade56": "تنس الطاولة - بنين - فردي - خامسة وسادسة ابتدائي",
  "table_tennis_boys_group_grade0": "تنس الطاولة - بنين - جماعي - حضانة",
  "table_tennis_boys_group_grade12": "تنس الطاولة - بنين - جماعي - أولى وثانية ابتدائي",
  "table_tennis_boys_group_grade34": "تنس الطاولة - بنين - جماعي - ثالثة ورابعة ابتدائي",
  "table_tennis_boys_group_grade56": "تنس الطاولة - بنين - جماعي - خامسة وسادسة ابتدائي",
  "table_tennis_girls_individual_grade0": "تنس الطاولة - بنات - فردي - حضانة",
  "table_tennis_girls_individual_grade12": "تنس الطاولة - بنات - فردي - أولى وثانية ابتدائي",
  "table_tennis_girls_individual_grade34": "تنس الطاولة - بنات - فردي - ثالثة ورابعة ابتدائي",
  "table_tennis_girls_individual_grade56": "تنس الطاولة - بنات - فردي - خامسة وسادسة ابتدائي",
  "table_tennis_girls_group_grade0": "تنس الطاولة - بنات - جماعي - حضانة",
  "table_tennis_girls_group_grade12": "تنس الطاولة - بنات - جماعي - أولى وثانية ابتدائي",
  "table_tennis_girls_group_grade34": "تنس الطاولة - بنات - جماعي - ثالثة ورابعة ابتدائي",
  "table_tennis_girls_group_grade56": "تنس الطاولة - بنات - جماعي - خامسة وسادسة ابتدائي",

  // الشطرنج
  "chess_boys_individual_grade0": "الشطرنج - بنين - فردي - حضانة",
  "chess_boys_individual_grade12": "الشطرنج - بنين - فردي - أولى وثانية ابتدائي",
  "chess_boys_individual_grade34": "الشطرنج - بنين - فردي - ثالثة ورابعة ابتدائي",
  "chess_boys_individual_grade56": "الشطرنج - بنين - فردي - خامسة وسادسة ابتدائي",
  "chess_boys_group_grade0": "الشطرنج - بنين - جماعي - حضانة",
  "chess_boys_group_grade12": "الشطرنج - بنين - جماعي - أولى وثانية ابتدائي",
  "chess_boys_group_grade34": "الشطرنج - بنين - جماعي - ثالثة ورابعة ابتدائي",
  "chess_boys_group_grade56": "الشطرنج - بنين - جماعي - خامسة وسادسة ابتدائي",
  "chess_girls_individual_grade0": "الشطرنج - بنات - فردي - حضانة",
  "chess_girls_individual_grade12": "الشطرنج - بنات - فردي - أولى وثانية ابتدائي",
  "chess_girls_individual_grade34": "الشطرنج - بنات - فردي - ثالثة ورابعة ابتدائي",
  "chess_girls_individual_grade56": "الشطرنج - بنات - فردي - خامسة وسادسة ابتدائي",
  "chess_girls_group_grade0": "الشطرنج - بنات - جماعي - حضانة",
  "chess_girls_group_grade12": "الشطرنج - بنات - جماعي - أولى وثانية ابتدائي",
  "chess_girls_group_grade34": "الشطرنج - بنات - جماعي - ثالثة ورابعة ابتدائي",
  "chess_girls_group_grade56": "الشطرنج - بنات - جماعي - خامسة وسادسة ابتدائي",

  // الجري
  "running_boys_grade0": "جري - بنين - فردي - حضانة",
  "running_boys_grade12": "جري - بنين - فردي - أولى وثانية ابتدائي",
  "running_boys_grade34": "جري - بنين - فردي - ثالثة ورابعة ابتدائي",
  "running_boys_grade56": "جري - بنين - فردي - خامسة وسادسة ابتدائي",
  "running_girls_grade0": "جري - بنات - فردي - حضانة",
  "running_girls_grade12": "جري - بنات - فردي - أولى وثانية ابتدائي",
  "running_girls_grade34": "جري - بنات - فردي - ثالثة ورابعة ابتدائي",
  "running_girls_grade56": "جري - بنات - فردي - خامسة وسادسة ابتدائي",

  // كونكت فور
  "connect4_boys_grade0": "كونكت فور - بنين - فردي - حضانة",
  "connect4_boys_grade12": "كونكت فور - بنين - فردي - أولى وثانية ابتدائي",
  "connect4_boys_grade34": "كونكت فور - بنين - فردي - ثالثة ورابعة ابتدائي",
  "connect4_boys_grade56": "كونكت فور - بنين - فردي - خامسة وسادسة ابتدائي",
  "connect4_girls_grade0": "كونكت فور - بنات - فردي - حضانة",
  "connect4_girls_grade12": "كونكت فور - بنات - فردي - أولى وثانية ابتدائي",
  "connect4_girls_grade34": "كونكت فور - بنات - فردي - ثالثة ورابعة ابتدائي",
  "connect4_girls_grade56": "كونكت فور - بنات - فردي - خامسة وسادسة ابتدائي",
  // المهرجان
  "festival_subscription": "إشتراك حجز المهرجان للكنيسة (إلزامى)",

  // الروحي الجماعي - اسكندرية
  "rouhi_alex_kindergarten_1": "روحي مرحلة حضانة - الفريق الأول",
  "rouhi_alex_grade1_2_1": " روحي مرحلة أولى وثانية ابتدائي - الفريق الأول",
  "rouhi_alex_grade3_4_1": "روحي مرحلة ثالثة ورابعة ابتدائي - الفريق الأول",
  "rouhi_alex_grade5_6_1": "روحي مرحلة خامسة وسادسة ابتدائي - الفريق الأول",
  "rouhi_alex_kindergarten_extra": "روحي مرحلة حضانة - الفريق الإضافي",
  "rouhi_alex_grade1_2_extra": "روحي مرحلة أولى وثانية ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade3_4_extra": "روحي مرحلة ثالثة ورابعة ابتدائي - الفريق الإضافي",
  "rouhi_alex_grade5_6_extra": "روحي مرحلة خامسة وسادسة ابتدائي - الفريق الإضافي",

  // اللغة القبطية - اسكندرية
  "coptic_alex_kindergarten": "مرحلة حضانة - قبطى",
  "coptic_alex_grade1_2": "مرحلة أولى وثانية ابتدائي - قبطى",
  "coptic_alex_grade3_4": "مرحلة ثالثة ورابعة ابتدائي - قبطى",
  "coptic_alex_grade5_6": "مرحلة خامسة وسادسة ابتدائي - قبطى",

  // الألحان والتسبحة
  "melodies_level1_Hadana": "المستوى الأول - فريق حضانة - ألحان",
  "melodies_level2_Hadana": "المستوى الثاني - فريق حضانة - ألحان",
  "melodies_level1_grades12": "المستوى الأول - فريق أولى وثانية - ألحان",
  "melodies_level2_grades12": "المستوى الثاني - فريق أولى وثانية - ألحان",
  "melodies_level1_grades34": "المستوى الأول - فريق ثالثة ورابعة - ألحان",
  "melodies_level2_grades34": "المستوى الثاني - فريق ثالثة ورابعة - ألحان",
  "melodies_level1_grades56": "المستوى الأول - فريق خامسة وسادسة - ألحان",
  "melodies_level2_grades56": "المستوى الثاني - فريق خامسة وسادسة - ألحان",

  "melodies_talented_individual_Hadana": "موهوبين حضانة - فردي - ألحان",
  "melodies_talented_group_Hadana": "موهوبين حضانة - جماعي - ألحان",
  "melodies_talented_individual_grades12": "موهوبين أولى وثانية - فردي - ألحان",
  "melodies_talented_group_grades12": "موهوبين أولى وثانية - جماعي - ألحان",
  "melodies_talented_individual_grades34": "موهوبين ثالثة ورابعة - فردي - ألحان",
  "melodies_talented_group_grades34": "موهوبين ثالثة ورابعة - جماعي - ألحان",
  "melodies_talented_individual_grades56": "موهوبين خامسة وسادسة - فردي - ألحان",
  "melodies_talented_group_grades56": "موهوبين خامسة وسادسة - جماعي - ألحان",
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

  // مسابقة البحوث
  "research_theoretical": "البحث النظري - فردي",
  "research_cultural": "البحث الثقافي - فردي",

  // المسابقة الثقافية
  "cultural_magazine_paper": "إعداد مجلة ورقية - جماعي",
  "cultural_magazine_wall": "إعداد مجلة حائط - جماعي",
  "cultural_field_visits": "الزيارات الميدانية - جماعي",

  // المسابقة الإلكترونية
  "electronic_level1_individual": "المستوى الأول - فردي - إلكترونية",
  "electronic_level2_individual": "المستوى الثاني - فردي - إلكترونية",
  "electronic_level1_group": "المستوى الأول - جماعي - إلكترونية",
  "electronic_level2_group": "المستوى الثاني - جماعي - إلكترونية",

  // الفنون التشكيلية
  "arts_kindergarten_individual": "مرحلة حضانة - فردي - فنون تشكيلية",
  "arts_grade1_2_individual": "أولى وثانية ابتدائي - فردي - فنون تشكيلية",
  "arts_grade3_4_individual": "ثالثة ورابعة ابتدائي - فردي - فنون تشكيلية",
  "arts_grade5_6_individual": "خامسة وسادسة ابتدائي - فردي - فنون تشكيلية",
  "arts_kindergarten_group": "مرحلة حضانة - جماعي - فنون تشكيلية",
  "arts_grade1_2_group": "أولى وثانية ابتدائي - جماعي - فنون تشكيلية",
  "arts_grade3_4_group": "ثالثة ورابعة ابتدائي - جماعي - فنون تشكيلية",
  "arts_grade5_6_group": "خامسة وسادسة ابتدائي - جماعي - فنون تشكيلية",

  // الفنون التشكيلية - إبداع حر
  "free_arts_kindergarten_individual": "إبداع حر - حضانة - فردي",
  "free_arts_grade1_2_individual": "إبداع حر - أولى وثانية ابتدائي - فردي",
  "free_arts_grade3_4_individual": "إبداع حر - ثالثة ورابعة ابتدائي - فردي",
  "free_arts_grade5_6_individual": "إبداع حر - خامسة وسادسة ابتدائي - فردي",
  "free_arts_kindergarten_group": "إبداع حر - حضانة - جماعي",
  "free_arts_grade1_2_group": "إبداع حر - أولى وثانية ابتدائي - جماعي",
  "free_arts_grade3_4_group": "إبداع حر - ثالثة ورابعة ابتدائي - جماعي",
  "free_arts_grade5_6_group": "إبداع حر - خامسة وسادسة ابتدائي - جماعي",

  // المسابقة الأدبية
  "literary_poetry": "الشعر - فردي",
  "literary_short_story": "القصة القصيرة - فردي",

  // الابتكارات الهندسية
  "engineering_programming_mechanics_individual": "البرمجة والكهرباء والميكانيكا - فردي",
  "engineering_programming_mechanics_group": "البرمجة والكهرباء والميكانيكا - جماعي",
  "engineering_architecture_individual": "العمارة - فردي",
  "engineering_architecture_group": "العمارة - جماعي",
};

const churches = [
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
  "كنيسة القديس ابومقار و البابا كيرلس السادس بالدريسة"
];

const getResponsiveRadius = () => {
  if (typeof window === 'undefined') return 100;
  const width = window.innerWidth;
  if (width < 400) return 70;
  if (width < 600) return 85;
  return 100;
};

export default function ChurchDetailsAdminPage() {
  const [churchData, setChurchData] = useState([]);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Function to calculate price after discount
  const calculatePriceAfterDiscount = (originalPrice, discountPercentage) => {
    // Ensure discount is a number and within 0-100 range
    const discount = parseFloat(discountPercentage);
    if (isNaN(discount) || discount < 0) return originalPrice;
    if (discount > 100) return 0; // If discount is 100% or more, price becomes 0

    return originalPrice * (1 - (discount / 100));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const all = [];

      for (let name of churches) {
        let competitions = [];
        let totalBeforeDiscount = 0;
        let leaderName = "";
        let discountPercentage = 0;

        // *** التعديل هنا: جلب البيانات من كولكشن 'churches' للحصول على الخصم واسم الخادم ***
        const churchMainDocSnap = await getDoc(doc(db, "churches", name));
        if (churchMainDocSnap.exists()) {
          const mainDocData = churchMainDocSnap.data();
          discountPercentage = mainDocData.discountPercentage || 0;
          leaderName = mainDocData.leader || "---"; // Assuming leader name is stored here
        }
        // ********************************************************************************

        // جلب بيانات المسابقات من 'church_competitions' و 'other-competitions'
        const churchCompetitionsSnap = await getDoc(doc(db, "church_competitions", name));
        const otherCompetitionsSnap = await getDoc(doc(db, "other-competitions", name));

        const data1 = churchCompetitionsSnap.exists() ? churchCompetitionsSnap.data().competitions : {};
        const data2 = otherCompetitionsSnap.exists() ? otherCompetitionsSnap.data().competitions : {};

        Object.entries({ ...data1, ...data2 }).forEach(([key, value]) => {
          const competitionTotalPrice = value.totalPrice || 0;
          totalBeforeDiscount += competitionTotalPrice;

          competitions.push({
            id: key,
            name: competitionNamesInArabic[key] || key,
            count: value.count || 0,
            totalPrice: competitionTotalPrice,
          });
        });

        const totalAfterDiscount = calculatePriceAfterDiscount(totalBeforeDiscount, discountPercentage);

        all.push({
          name,
          competitions,
          totalBeforeDiscount,
          totalAfterDiscount,
          leaderName, // Now sourced from 'churches' collection
          discountPercentage // Now sourced from 'churches' collection
        });
      }

      setChurchData(all);
      setFilteredChurches(all);
      setLoading(false);
    };

    fetchAllData();
  }, []); // لا يوجد user dependency هنا لأنه لا يوجد مستخدم للدخول لهذه الصفحة

  useEffect(() => {
    const filtered = churchData.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChurches(filtered);
  }, [searchTerm, churchData]);

  // Function to handle updating discount percentage in Firebase
  const updateChurchDiscount = async (churchName, newDiscount) => {
    try {
      // *** التعديل هنا: تحديث كولكشن 'churches' فقط ***
      await updateDoc(doc(db, "churches", churchName), {
        discountPercentage: newDiscount,
      });
      console.log(`Discount for ${churchName} updated to ${newDiscount}% in Firebase.`);
    } catch (error) {
      console.error("Error updating discount in Firebase:", error);
      alert("فشل تحديث نسبة الخصم في قاعدة البيانات. الرجاء المحاولة مرة أخرى.");
    }
  };

  // Handler for discount input change
  const handleDiscountChange = (e, churchIndex) => {
    let newDiscount = parseFloat(e.target.value);

    if (isNaN(newDiscount) || newDiscount < 0) {
      newDiscount = 0;
    }
    if (newDiscount > 100) {
      newDiscount = 100;
    }

    setChurchData(prevData => {
      const updatedData = prevData.map((church, idx) => {
        if (idx === churchIndex) {
          const newTotalAfterDiscount = calculatePriceAfterDiscount(church.totalBeforeDiscount, newDiscount);

          // Trigger Firebase update (non-blocking)
          updateChurchDiscount(church.name, newDiscount);

          return {
            ...church,
            discountPercentage: newDiscount,
            totalAfterDiscount: newTotalAfterDiscount
          };
        }
        return church;
      });
      return updatedData;
    });
  };

  const downloadExcel = async () => {
    setDownloading(true);

    const exportData = [];

    for (const church of churchData) {
      const name = church.name;
      const discountPercentage = church.discountPercentage;
      const totalBeforeDiscount = church.totalBeforeDiscount;
      const totalAfterDiscount = church.totalAfterDiscount;

      // Add individual competition data
      church.competitions.forEach((comp) => {
        exportData.push({
          "الكنيسة": name,
          "المسابقة": comp.name,
          "عدد المشاركين": comp.count,
          "السعر الكلي (للمسابقة)": comp.totalPrice,
          "نسبة الخصم (للكنيسة)": "",
          "إجمالي التكلفة قبل الخصم": "",
          "إجمالي التكلفة بعد الخصم": "",
        });
      });

      // Add summary row for the church
      exportData.push({
        "الكنيسة": name,
        "المسابقة": "إجمالي الكنيسة",
        "عدد المشاركين": "",
        "السعر الكلي (للمسابقة)": "",
        "نسبة الخصم (للكنيسة)": discountPercentage,
        "إجمالي التكلفة قبل الخصم": totalBeforeDiscount,
        "إجمالي التكلفة بعد الخصم": totalAfterDiscount,
      });

      // Add a blank row for separation
      exportData.push({
        "الكنيسة": "",
        "المسابقة": "",
        "عدد المشاركين": "",
        "السعر الكلي (للمسابقة)": "",
        "نسبة الخصم (للكنيسة)": "",
        "إجمالي التكلفة قبل الخصم": "",
        "إجمالي التكلفة بعد الخصم": "",
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "تفاصيل الكنائس");
    XLSX.writeFile(workbook, "تفاصيل_الكنائس.xlsx");

    setDownloading(false);
  };

  if (loading) return <p className="church-loading">جاري التحميل...</p>;

  return (
    <div className="church-container">
      <h1 className="church-title">تفاصيل كل الكنائس</h1>

      <button
        onClick={downloadExcel}
        disabled={downloading}
        style={{
          background: downloading ? "#6c757d" : "#4f6ef7",
          color: "white",
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          cursor: downloading ? "not-allowed" : "pointer",
          display: "block",
          margin: "0 auto 20px auto",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "all 0.3s ease",
        }}
      >
        {downloading ? "⏳ جارى التنزيل" : "⬇ تنزيل Excel"}
      </button>

      <input
        type="text"
        placeholder="ابحث عن كنيسة..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          margin: "20px auto",
          display: "block",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
      <nav style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "center",
        marginBottom: "30px"
      }}>
        {filteredChurches.map((c, idx) => (
          <button
            key={idx}
            onClick={() => {
              document.getElementById(`church-${idx}`)?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#4f6ef7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {c.name}
          </button>
        ))}
      </nav>
      {filteredChurches.map((church, idx) => {
        const dataForCount = church.competitions.filter(c => c.id !== "festival_subscription" && c.count > 0);
        const dataForPrice = church.competitions.filter(c => c.totalPrice > 0);

        return (
          <div key={idx} id={`church-${idx}`} style={{ marginBottom: "80px" }}>
            <h2 className="church-title">{church.name}</h2>
            <h3 className="church-subtitle">الخادم المسؤول: {church.leaderName || "---"}</h3>

            {/* Discount Percentage Input */}
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <label htmlFor={`discount-${idx}`} style={{ marginRight: "10px", fontWeight: "bold" }}>نسبة الخصم:</label>
              <input
                type="number"
                id={`discount-${idx}`}
                value={church.discountPercentage}
                onChange={(e) => handleDiscountChange(e, idx)}
                min="0"
                max="100"
                step="0.01"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  width: "80px",
                  textAlign: "center"
                }}
              />
              <span style={{ marginLeft: "5px" }}>%</span>
            </div>

            <div className="church-table-wrapper">
              <table className="church-table">
                <thead>
                  {/* FIX FOR HYDRATION ERROR: Removed whitespace between <th> tags */}
                  <tr><th>المسابقة</th><th>عدد المشتركين</th><th>السعر الكلي</th></tr>
                </thead>
                <tbody>
                  {church.competitions.map((c, i) => (
                    // FIX FOR HYDRATION ERROR: Removed whitespace between <td> tags
                    <tr key={i}><td>{c.name}</td><td>{c.count}</td><td>{c.totalPrice.toLocaleString()} جـ</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Displaying totals before and after discount */}
            <p className="church-total">
              إجمالي التكلفة قبل الخصم: <strong>{church.totalBeforeDiscount.toLocaleString()} جـ</strong>
            </p>
            <p className="church-total">
              إجمالي التكلفة بعد الخصم: <strong>{church.totalAfterDiscount.toLocaleString()} جـ</strong>
            </p>
            <div className="church-charts-container">
              <div className="church-chart">
                <h3>نسبة عدد المشتركين</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataForCount}
                      dataKey="count"
                      nameKey="name"
                      outerRadius={getResponsiveRadius()}
                    >
                      {dataForCount.map((entry, index) => (
                        <Cell
                          key={`cell-count-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="church-chart">
                <h3>نسبة التكلفة لكل مسابقة</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataForPrice}
                      dataKey="totalPrice"
                      nameKey="name"
                      outerRadius={getResponsiveRadius()}
                    >
                      {dataForPrice.map((entry, index) => (
                        <Cell
                          key={`cell-price-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}