// app/admin/cleanup-competitions/page.jsx (مثال لصفحة Next.js Admin)

"use client"; // استخدم هذا إذا كنت تستخدم Next.js App Router

import React, { useState } from 'react';
// تأكد من المسار الصحيح لـ Firebase config
import { db } from "@/lib/firebase"; 
// تم إضافة 'getDoc' هنا لتصحيح الخطأ
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";

// --- قائمة المسابقات الرسمية التي تريد الاحتفاظ بها ---
// هذه هي نفسها competitionNamesInArabic لديك، لكننا نحتاج المفاتيح فقط (IDs)
const officialCompetitionKeys = new Set([
  "karaza", "alhan", "research", "service", "holy_bible", "creative", "talents", "sports", "sports_insurance",
  "football_boys_grade0", "football_boys_grade12", "football_boys_grade34", "football_boys_grade56",
  "football_girls_grade0", "football_girls_grade12", "football_girls_grade34", "football_girls_grade56",
  "volleyball_boys_grade0", "volleyball_boys_grade12", "volleyball_boys_grade34", "volleyball_boys_grade56",
  "volleyball_girls_grade0", "volleyball_girls_grade12", "volleyball_girls_grade34", "volleyball_girls_grade56",
  "table_tennis_boys_individual_grade0", "table_tennis_boys_individual_grade12", "table_tennis_boys_individual_grade34", "table_tennis_boys_individual_grade56",
  "table_tennis_boys_group_grade0", "table_tennis_boys_group_grade12", "table_tennis_boys_group_grade34", "table_tennis_boys_group_grade56",
  "table_tennis_girls_individual_grade0", "table_tennis_girls_individual_grade12", "table_tennis_girls_individual_grade34", "table_tennis_girls_individual_grade56",
  "table_tennis_girls_group_grade0", "table_tennis_girls_group_grade12", "table_tennis_girls_group_grade34", "table_tennis_girls_group_grade56",
  "chess_boys_individual_grade0", "chess_boys_individual_grade12", "chess_boys_individual_grade34", "chess_boys_individual_grade56",
  "chess_boys_group_grade0", "chess_boys_group_grade12", "chess_boys_group_grade34", "chess_boys_group_grade56",
  "chess_girls_individual_grade0", "chess_girls_individual_grade12", "chess_girls_individual_grade34", "chess_girls_individual_grade56",
  "chess_girls_group_grade0", "chess_girls_group_grade12", "chess_girls_group_grade34", "chess_girls_group_grade56",
  "running_boys_grade0", "running_boys_grade12", "running_boys_grade34", "running_boys_grade56",
  "running_girls_grade0", "running_girls_grade12", "running_girls_grade34", "running_girls_grade56",
  "connect4_boys_grade0", "connect4_boys_grade12", "connect4_boys_grade34", "connect4_boys_grade56",
  "connect4_girls_grade0", "connect4_girls_grade12", "connect4_girls_grade34", "connect4_girls_grade56",
  "festival_subscription",
  "rouhi_alex_kindergarten_1", "rouhi_alex_grade1_2_1", "rouhi_alex_grade3_4_1", "rouhi_alex_grade5_6_1",
  "rouhi_alex_kindergarten_extra", "rouhi_alex_grade1_2_extra", "rouhi_alex_grade3_4_extra", "rouhi_alex_grade5_6_extra",
  "coptic_alex_kindergarten", "coptic_alex_grade1_2", "coptic_alex_grade3_4", "coptic_alex_grade5_6",
  "melodies_level1_Hadana", "melodies_level2_Hadana", "melodies_level1_grades12", "melodies_level2_grades12",
  "melodies_level1_grades34", "melodies_level2_grades34", "melodies_level1_grades56", "melodies_level2_grades56",
  "melodies_talented_individual_Hadana", "melodies_talented_group_Hadana", "melodies_talented_individual_grades12", "melodies_talented_group_grades12",
  "melodies_talented_individual_grades34", "melodies_talented_group_grades34", "melodies_talented_individual_grades56", "melodies_talented_group_grades56",
  "church_activities_big_theatre", "church_activities_chorus", "church_activities_cantata", "church_activities_coptic_theatre",
  "church_activities_operetta", "church_activities_solo_individual", "church_activities_music_individual", "church_activities_solo_team",
  "church_activities_music_team",
  "research_theoretical", "research_cultural",
  "cultural_magazine_paper", "cultural_magazine_wall", "cultural_field_visits",
  "electronic_level1_individual", "electronic_level2_individual", "electronic_level1_group", "electronic_level2_group",
  "arts_kindergarten_individual", "arts_grade1_2_individual", "arts_grade3_4_individual", "arts_grade5_6_individual",
  "arts_kindergarten_group", "arts_grade1_2_group", "arts_grade3_4_group", "arts_grade5_6_group",
  "free_arts_kindergarten_individual", "free_arts_grade1_2_individual", "free_arts_grade3_4_individual", "free_arts_grade5_6_individual",
  "free_arts_kindergarten_group", "free_arts_grade1_2_group", "free_arts_grade3_4_group", "free_arts_grade5_6_group",
  "literary_poetry", "literary_short_story",
  "engineering_programming_mechanics_individual", "engineering_programming_mechanics_group", "engineering_architecture_individual", "engineering_architecture_group"
]);

// --- قائمة بأسماء المسابقات باللغة العربية لعرضها في الواجهة ---
// هذا الكائن يجب أن يحتوي على جميع المفاتيح الموجودة في officialCompetitionKeys
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
  "sports_insurance": "تأمين رياضي", // تم إضافة هذا للتأمين الرياضي

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


const CleanupCompetitionsUI = () => {
  const [outdatedCompetitionsByChurch, setOutdatedCompetitionsByChurch] = useState({});
  const [scanLoading, setScanLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [totalOutdatedCount, setTotalOutdatedCount] = useState(0);

  // دالة لمسح قاعدة البيانات وتحديد المسابقات التي سيتم حذفها
  const findOutdatedCompetitions = async () => {
    setMessage('');
    setScanLoading(true);
    setOutdatedCompetitionsByChurch({});
    setTotalOutdatedCount(0);
    const collectionsToScan = ["church_competitions", "other-competitions"];
    const foundOutdated = {};
    let currentTotalOutdated = 0;

    try {
      for (const collectionName of collectionsToScan) {
        const snapshot = await getDocs(collection(db, collectionName));
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          const competitions = data.competitions || {};
          const outdatedInDoc = [];

          for (const compKey in competitions) {
            if (!officialCompetitionKeys.has(compKey)) {
              outdatedInDoc.push({
                key: compKey,
                name: competitionNamesInArabic[compKey] || compKey, // استخدم الاسم العربي إن وجد
                value: competitions[compKey] // احتفظ بالقيمة لو احتجتها للعرض
              });
            }
          }

          if (outdatedInDoc.length > 0) {
            foundOutdated[`${collectionName}/${docSnapshot.id}`] = outdatedInDoc;
            currentTotalOutdated += outdatedInDoc.length;
          }
        }
      }
      setOutdatedCompetitionsByChurch(foundOutdated);
      setTotalOutdatedCount(currentTotalOutdated);
      setMessage(`تم العثور على ${currentTotalOutdated} مسابقة غير رسمية جاهزة للحذف.`);
    } catch (error) {
      console.error("خطأ أثناء المسح:", error);
      setMessage(`حدث خطأ أثناء المسح: ${error.message}`);
    } finally {
      setScanLoading(false);
    }
  };

  // دالة لتنفيذ عملية الحذف الفعلية
  const executeCleanup = async () => {
    if (Object.keys(outdatedCompetitionsByChurch).length === 0) {
      alert("لا توجد مسابقات غير رسمية للحذف.");
      return;
    }

    if (!window.confirm("هل أنت متأكد من أنك تريد حذف هذه المسابقات؟ هذه العملية لا يمكن التراجع عنها!")) {
      return;
    }

    setDeleteLoading(true);
    setMessage('جاري الحذف، الرجاء الانتظار...');
    let removedCount = 0;

    try {
      for (const docPath in outdatedCompetitionsByChurch) {
        const [collectionName, docId] = docPath.split('/');
        const docRef = doc(db, collectionName, docId); // مرجع المستند

        // ****** التصحيح هنا: استخدام getDoc مع docRef ******
        const docSnapshot = await getDoc(docRef); 
        
        // استخدام .exists() كدالة وليس كخاصية
        if (!docSnapshot.exists()) { 
          console.warn(`المستند ${docPath} غير موجود، تم تخطيه.`);
          continue;
        }

        const currentData = docSnapshot.data();
        let competitions = currentData.competitions || {};
        // const initialCount = Object.keys(competitions).length; // غير مستخدم حالياً

        const updatedCompetitions = {};
        let compsRemovedInDoc = 0;

        for (const compKey in competitions) {
          if (officialCompetitionKeys.has(compKey)) {
            updatedCompetitions[compKey] = competitions[compKey];
          } else {
            compsRemovedInDoc++;
          }
        }
        
        if (compsRemovedInDoc > 0) {
          await updateDoc(docRef, { competitions: updatedCompetitions });
          removedCount += compsRemovedInDoc;
          console.log(`تم حذف ${compsRemovedInDoc} مسابقة من ${docPath}`);
        }
      }
      setOutdatedCompetitionsByChurch({}); // مسح القائمة بعد الحذف
      setTotalOutdatedCount(0);
      setMessage(`تمت عملية الحذف بنجاح. تم حذف إجمالي ${removedCount} مسابقة.`);
    } catch (error) {
      console.error("خطأ أثناء الحذف:", error);
      setMessage(`حدث خطأ أثناء الحذف: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>أداة تنظيف مسابقات الكنيسة (للمسؤولين فقط)</h1>
      <p style={{ color: 'red', fontWeight: 'bold' }}>
        **تحذير هام:** هذه الأداة تحذف البيانات بشكل دائم. **الرجاء أخذ نسخة احتياطية كاملة من قاعدة البيانات قبل الاستخدام!**
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={findOutdatedCompetitions}
          disabled={scanLoading || deleteLoading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: scanLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          {scanLoading ? 'جاري المسح...' : 'مسح المسابقات غير الرسمية'}
        </button>

        {totalOutdatedCount > 0 && (
          <button
            onClick={executeCleanup}
            disabled={deleteLoading || scanLoading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: deleteLoading ? '#ccc' : 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {deleteLoading ? 'جاري الحذف...' : `تأكيد حذف ${totalOutdatedCount} مسابقة`}
          </button>
        )}
      </div>

      {message && (
        <p style={{ padding: '10px', backgroundColor: message.includes('خطأ') ? '#ffe0e0' : '#e0ffe0', borderLeft: '5px solid ' + (message.includes('خطأ') ? '#a00000' : '#00a000'), marginBottom: '15px' }}>
          {message}
        </p>
      )}

      {Object.keys(outdatedCompetitionsByChurch).length > 0 && (
        <div>
          <h2>المسابقات غير الرسمية التي سيتم حذفها:</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {Object.entries(outdatedCompetitionsByChurch).map(([docPath, comps]) => (
              <li key={docPath} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                <p>
                  <strong style={{ color: '#333' }}>الكنيسة / المستند:</strong> {docPath}
                </p>
                <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                  {comps.map((comp) => (
                    <li key={comp.key}>
                      **{comp.name}** (`${comp.key}`) - القيمة: {JSON.stringify(comp.value)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CleanupCompetitionsUI;