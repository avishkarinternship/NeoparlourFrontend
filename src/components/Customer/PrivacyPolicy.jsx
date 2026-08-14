import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SEOFooter from "../common/SEOFooter";

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const { lang: langParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let targetLang = null;
    const path = location.pathname.toLowerCase();

    if (langParam) {
      const p = langParam.toLowerCase();

      if (p === "hindi" || p === "hi") targetLang = "hi";
      else if (p === "marathi" || p === "mr") targetLang = "mr";
      else if (p === "english" || p === "en") targetLang = "en";
    }

    if (!targetLang) {
      if (path.includes("/hindi") || path.includes("/hi/")) {
        targetLang = "hi";
      } else if (path.includes("/marathi") || path.includes("/mr/")) {
        targetLang = "mr";
      } else if (path.includes("/english") || path.includes("/en/")) {
        targetLang = "en";
      }
    }

    if (targetLang && i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
  }, [langParam, location.pathname, i18n]);

  const lang = (
    i18n.language ||
    localStorage.getItem("i18nextLng") ||
    "en"
  ).substring(0, 2);

  const content = {
    en: {
      title: "Privacy Policy",
      subtitle: "Neoparlour Customer App",
      effectiveDate: "Effective Date: 27 May 2026",

      sec1Title: "1. INTRODUCTION",
      sec1Text1:
        'Neoparlour ("Platform", "we", "our", "us") is a salon booking marketplace that connects customers with independent salon partners.',
      sec1Text2:
        "This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our mobile application and services.",
      sec1Text3:
        "By using the Platform, you agree to the terms of this Privacy Policy.",

      sec2Title: "2. INFORMATION WE COLLECT",
      sec2Intro: "We collect the following types of information:",

      sec2_1Title: "2.1 Personal Information",
      sec2_1Items: [
        "Full Name",
        "Mobile Number (OTP-based login)",
        "Email Address (optional)",
        "Gender and Date of Birth (if provided)",
        "Address (if provided)",
      ],

      sec2_2Title: "2.2 Booking Information",
      sec2_2Items: [
        "Selected services",
        "Appointment date and time",
        "Salon details",
        "Booking history",
      ],

      sec2_3Title: "2.3 Device & Technical Information",
      sec2_3Items: [
        "Device type and OS",
        "App usage data",
        "IP address (if applicable)",
      ],

      sec2_4Title: "2.4 Push Notification Data",
      sec2_4Items: [
        "Firebase Cloud Messaging (FCM) token",
        "Notification preferences",
      ],

      sec3Title: "3. HOW WE USE YOUR INFORMATION",
      sec3Intro: "We use your data to:",
      sec3Items: [
        "Create and manage your account",
        "Authenticate users via OTP",
        "Facilitate salon bookings",
        "Send booking confirmations and reminders",
        "Provide customer support",
        "Improve app performance and user experience",
        "Send promotional offers (if applicable)",
      ],

      sec4Title: "4. SHARING OF INFORMATION",
      sec4Important: "We do NOT sell your personal data.",
      sec4Intro: "We may share your information with:",

      sec4_1Title: "4.1 Salon Partners",
      sec4_1Items: [
        "To fulfill your bookings",
        "To provide services you requested",
      ],

      sec4_2Title: "4.2 Service Providers",
      sec4_2Items: [
        "Firebase (for notifications)",
        "Hosting and analytics providers",
      ],

      sec4_3Title: "4.3 Legal Authorities",
      sec4_3Items: [
        "If required by law or government request",
      ],

      sec5Title: "5. PAYMENTS",
      sec5Items: [
        "All payments are made directly to the salon",
        "Neoparlour does NOT collect or process payments",
        "We are not responsible for payment disputes",
      ],

      sec6Title: "6. PUSH NOTIFICATIONS",
      sec6Intro: "By using the Platform, you consent to receive:",
      sec6Items: [
        "Booking confirmations",
        "Appointment reminders",
        "Service updates",
        "Promotional notifications (optional)",
      ],

      sec6Footer:
        "You can disable notifications anytime from device settings.",

      sec7Title: "7. DATA RETENTION",
      sec7Intro: "We retain your data:",
      sec7Items: [
        "As long as your account is active",
        "As required for legal compliance",
        "For dispute resolution and fraud prevention",
      ],

      sec8Title: "8. ACCOUNT DELETION",
      sec8Intro: "You may request account deletion by:",
      sec8Items1: [
        "Using app settings (if available), OR",
        "Contacting support",
      ],

      sec8Next: "Upon deletion:",
      sec8Items2: [
        "Your account will be deactivated",
        "Personal data will be deleted or anonymized",
        "Some data may be retained for legal obligations",
      ],

      sec9Title: "9. DATA SECURITY",
      sec9Intro:
        "We implement reasonable security measures to protect your data from:",
      sec9Items: [
        "Unauthorized access",
        "Misuse",
        "Loss or alteration",
      ],

      sec9Footer: "However, no system is 100% secure.",

      sec10Title: "10. YOUR RIGHTS",
      sec10Intro:
        "Under applicable Indian laws (including DPDP Act, 2023), you have the right to:",
      sec10Items: [
        "Access your personal data",
        "Request correction",
        "Request deletion",
        "Withdraw consent",
      ],

      sec11Title: "11. THIRD-PARTY SERVICES",
      sec11Intro: "The app may use third-party services such as:",
      sec11Items: [
        "Firebase Cloud Messaging (FCM)",
        "Analytics tools",
      ],

      sec11Footer:
        "These services may collect limited data as per their own privacy policies.",

      sec12Title: "12. CHILDREN’S PRIVACY",
      sec12Items: [
        "The Platform is not intended for users under 18",
        "Minors may use the app only under parental supervision",
      ],

      sec13Title: "13. CHANGES TO THIS POLICY",
      sec13Intro:
        "We may update this Privacy Policy from time to time.",
      sec13Items: [
        "Updates will be notified via app or website",
        "Continued use implies acceptance",
      ],

      sec14Title: "14. CONTACT US",
      sec14Intro: "For any privacy-related queries:",
      sec14Email: "Email: support@neopaceinfotech.com",
      sec14App: "App: Help Section",

      sec15Title: "15. CONSENT",
      sec15Intro: "By using the Platform, you:",
      sec15Items: [
        "Agree to this Privacy Policy",
        "Consent to data collection and usage as described",
      ],
    },

    // =========================
    // HINDI
    // =========================
    hi: {
      title: "गोपनीयता नीति",
      subtitle: "नियोपार्लर ग्राहक ऐप",
      effectiveDate: "प्रभावी तिथि: 27 मई 2026",

      sec1Title: "1. परिचय",
      sec1Text1:
        'नियोपार्लर ("प्लेटफॉर्म", "हम", "हमारा", "हमें") एक सलून बुकिंग मार्केटप्लेस है, जो ग्राहकों को स्वतंत्र सलून भागीदारों से जोड़ता है।',

      sec1Text2:
        "यह गोपनीयता नीति बताती है कि जब आप हमारे मोबाइल एप्लिकेशन और सेवाओं का उपयोग करते हैं, तब हम आपकी व्यक्तिगत जानकारी को कैसे एकत्र, उपयोग, साझा और सुरक्षित करते हैं।",

      sec1Text3:
        "प्लेटफॉर्म का उपयोग करके, आप इस गोपनीयता नीति की शर्तों से सहमत होते हैं।",

      sec2Title: "2. हमारे द्वारा एकत्र की जाने वाली जानकारी",
      sec2Intro:
        "हम निम्नलिखित प्रकार की जानकारी एकत्र करते हैं:",

      sec2_1Title: "2.1 व्यक्तिगत जानकारी",
      sec2_1Items: [
        "पूरा नाम",
        "मोबाइल नंबर (ओटीपी-आधारित लॉगिन)",
        "ईमेल पता (वैकल्पिक)",
        "लिंग और जन्मतिथि (यदि प्रदान की गई हो)",
        "पता (यदि प्रदान किया गया हो)",
      ],

      sec2_2Title: "2.2 बुकिंग जानकारी",
      sec2_2Items: [
        "चयनित सेवाएं",
        "अपॉइंटमेंट की तिथि और समय",
        "सलून विवरण",
        "बुकिंग इतिहास",
      ],

      sec2_3Title: "2.3 उपकरण और तकनीकी जानकारी",
      sec2_3Items: [
        "उपकरण का प्रकार और ओएस",
        "ऐप उपयोग डेटा",
        "आईपी पता (यदि लागू हो)",
      ],

      sec2_4Title: "2.4 पुश सूचना डेटा",
      sec2_4Items: [
        "फायरबेस क्लाउड मैसेजिंग (FCM) टोकन",
        "सूचना संबंधी प्राथमिकताएं",
      ],

      sec3Title: "3. हम आपकी जानकारी का उपयोग कैसे करते हैं",
      sec3Intro:
        "हम आपके डेटा का उपयोग निम्नलिखित उद्देश्यों के लिए करते हैं:",

      sec3Items: [
        "अपना खाता बनाना और प्रबंधित करना",
        "ओटीपी के माध्यम से उपयोगकर्ताओं का सत्यापन करना",
        "सलून बुकिंग की सुविधा प्रदान करना",
        "बुकिंग की पुष्टि और रिमाइंडर भेजना",
        "ग्राहक सहायता प्रदान करना",
        "ऐप के प्रदर्शन और उपयोगकर्ता अनुभव में सुधार करना",
        "प्रचारात्मक ऑफ़र भेजना (यदि लागू हो)",
      ],

      sec4Title: "4. जानकारी का साझाकरण",
      sec4Important:
        "हम आपकी व्यक्तिगत जानकारी नहीं बेचते हैं।",

      sec4Intro:
        "हम आपकी जानकारी निम्नलिखित के साथ साझा कर सकते हैं:",

      sec4_1Title: "4.1 सलून पार्टनर्स",
      sec4_1Items: [
        "आपकी बुकिंग पूरी करने के लिए",
        "आपके द्वारा अनुरोधित सेवाएं प्रदान करने के लिए",
      ],

      sec4_2Title: "4.2 सेवा प्रदाता",
      sec4_2Items: [
        "फायरबेस (सूचनाओं के लिए)",
        "होस्टिंग और एनालिटिक्स प्रदाता",
      ],

      sec4_3Title: "4.3 कानूनी प्राधिकरण",
      sec4_3Items: [
        "यदि कानून या सरकारी अनुरोध के अनुसार आवश्यक हो",
      ],

      sec5Title: "5. भुगतान",
      sec5Items: [
        "सभी भुगतान सीधे सलून को किए जाते हैं",
        "नियोपार्लर भुगतान एकत्र या संसाधित नहीं करता है",
        "हम भुगतान संबंधी विवादों के लिए जिम्मेदार नहीं हैं",
      ],

      sec6Title: "6. पुश सूचनाएं",
      sec6Intro:
        "प्लेटफॉर्म का उपयोग करके, आप निम्नलिखित सूचनाएं प्राप्त करने के लिए सहमति देते हैं:",

      sec6Items: [
        "बुकिंग की पुष्टि",
        "अपॉइंटमेंट रिमाइंडर",
        "सेवा संबंधी अपडेट",
        "प्रचारात्मक सूचनाएं (वैकल्पिक)",
      ],

      sec6Footer:
        "आप डिवाइस सेटिंग्स से किसी भी समय सूचनाएं अक्षम कर सकते हैं।",

      sec7Title: "7. डेटा प्रतिधारण",
      sec7Intro:
        "हम आपका डेटा निम्नलिखित अवधि और उद्देश्यों के लिए बनाए रखते हैं:",

      sec7Items: [
        "जब तक आपका खाता सक्रिय है",
        "कानूनी अनुपालन के लिए आवश्यक अवधि तक",
        "विवाद समाधान और धोखाधड़ी की रोकथाम के लिए",
      ],

      sec8Title: "8. खाता हटाना",
      sec8Intro:
        "आप निम्नलिखित तरीकों से खाता हटाने का अनुरोध कर सकते हैं:",

      sec8Items1: [
        "ऐप सेटिंग्स का उपयोग करके (यदि उपलब्ध हो), या",
        "सहायता टीम से संपर्क करके",
      ],

      sec8Next: "हटाने पर:",

      sec8Items2: [
        "आपका खाता निष्क्रिय कर दिया जाएगा",
        "व्यक्तिगत डेटा हटा दिया जाएगा या गुमनाम कर दिया जाएगा",
        "कानूनी दायित्वों के लिए कुछ डेटा रखा जा सकता है",
      ],

      sec9Title: "9. डेटा सुरक्षा",
      sec9Intro:
        "हम आपके डेटा की सुरक्षा के लिए उचित सुरक्षा उपाय लागू करते हैं, ताकि उसे निम्नलिखित से सुरक्षित रखा जा सके:",

      sec9Items: [
        "अनधिकृत पहुंच",
        "दुरुपयोग",
        "हानि या परिवर्तन",
      ],

      sec9Footer:
        "हालांकि, कोई भी प्रणाली 100% सुरक्षित नहीं है।",

      sec10Title: "10. आपके अधिकार",
      sec10Intro:
        "लागू भारतीय कानूनों के तहत, आपको निम्नलिखित अधिकार प्राप्त हैं:",

      sec10Items: [
        "अपने व्यक्तिगत डेटा तक पहुंचने का अधिकार",
        "सुधार का अनुरोध करने का अधिकार",
        "हटाने का अनुरोध करने का अधिकार",
        "सहमति वापस लेने का अधिकार",
      ],

      sec11Title: "11. तृतीय-पक्ष सेवाएं",
      sec11Intro:
        "ऐप निम्नलिखित तृतीय-पक्ष सेवाओं का उपयोग कर सकता है:",

      sec11Items: [
        "फायरबेस क्लाउड मैसेजिंग (FCM)",
        "एनालिटिक्स टूल",
      ],

      sec11Footer:
        "ये सेवाएं अपनी गोपनीयता नीतियों के अनुसार सीमित डेटा एकत्र कर सकती हैं।",

      sec12Title: "12. बच्चों की गोपनीयता",
      sec12Items: [
        "प्लेटफॉर्म 18 वर्ष से कम आयु के उपयोगकर्ताओं के लिए नहीं है",
        "नाबालिग माता-पिता की देखरेख में ऐप का उपयोग कर सकते हैं",
      ],

      sec13Title: "13. इस नीति में परिवर्तन",
      sec13Intro:
        "हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं।",

      sec13Items: [
        "अपडेट ऐप या वेबसाइट के माध्यम से सूचित किए जाएंगे",
        "प्लेटफॉर्म का निरंतर उपयोग इस नीति की स्वीकृति माना जाएगा",
      ],

      sec14Title: "14. हमसे संपर्क करें",
      sec14Intro:
        "किसी भी गोपनीयता संबंधी प्रश्न के लिए:",

      sec14Email:
        "ईमेल: support@neopaceinfotech.com",

      sec14App:
        "ऐप: सहायता अनुभाग",

      sec15Title: "15. सहमति",
      sec15Intro:
        "प्लेटफॉर्म का उपयोग करके, आप:",

      sec15Items: [
        "इस गोपनीयता नीति से सहमत हैं",
        "वर्णित तरीके से डेटा के संग्रह और उपयोग के लिए सहमति देते हैं",
      ],
    },

    // =========================
    // MARATHI
    // =========================
    mr: {
      title: "गोपनीयता धोरण",
      subtitle: "नियोपार्लर ग्राहक ॲप",
      effectiveDate: "प्रभावी तारीख: 27 मे 2026",

      sec1Title: "1. परिचय",

      sec1Text1:
        'नियोपार्लर ("प्लॅटफॉर्म", "आम्ही", "आमचे", "आम्हाला") हे सलून बुकिंग मार्केटप्लेस आहे, जे ग्राहकांना स्वतंत्र सलून भागीदारांशी जोडते.',

      sec1Text2:
        "हे गोपनीयता धोरण तुम्ही आमचे मोबाइल ॲप्लिकेशन आणि सेवा वापरता तेव्हा आम्ही तुमची वैयक्तिक माहिती कशी गोळा करतो, वापरतो, शेअर करतो आणि सुरक्षित ठेवतो हे स्पष्ट करते.",

      sec1Text3:
        "प्लॅटफॉर्म वापरून, तुम्ही या गोपनीयता धोरणाच्या अटींशी सहमत आहात.",

      sec2Title: "2. आम्ही गोळा करतो ती माहिती",

      sec2Intro:
        "आम्ही खालील प्रकारची माहिती गोळा करतो:",

      sec2_1Title: "2.1 वैयक्तिक माहिती",

      sec2_1Items: [
        "पूर्ण नाव",
        "मोबाईल नंबर (ओटीपी-आधारित लॉगिन)",
        "ईमेल पत्ता (ऐच्छिक)",
        "लिंग आणि जन्मतारीख (दिली असल्यास)",
        "पत्ता (दिला असल्यास)",
      ],

      sec2_2Title: "2.2 बुकिंग माहिती",

      sec2_2Items: [
        "निवडलेल्या सेवा",
        "अपॉइंटमेंटची तारीख आणि वेळ",
        "सलून तपशील",
        "बुकिंग इतिहास",
      ],

      sec2_3Title: "2.3 डिव्हाइस आणि तांत्रिक माहिती",

      sec2_3Items: [
        "डिव्हाइसचा प्रकार आणि ओएस",
        "ॲप वापर डेटा",
        "आयपी पत्ता (लागू असल्यास)",
      ],

      sec2_4Title: "2.4 पुश सूचना डेटा",

      sec2_4Items: [
        "फायरबेस क्लाउड मेसेजिंग (FCM) टोकन",
        "सूचनांशी संबंधित प्राधान्ये",
      ],

      sec3Title: "3. आम्ही तुमच्या माहितीचा वापर कसा करतो",

      sec3Intro:
        "आम्ही तुमचा डेटा खालील उद्देशांसाठी वापरतो:",

      sec3Items: [
        "तुमचे खाते तयार करणे आणि व्यवस्थापित करणे",
        "ओटीपीद्वारे वापरकर्त्यांची पडताळणी करणे",
        "सलून बुकिंगची सुविधा देणे",
        "बुकिंगची पुष्टी आणि स्मरणपत्रे पाठवणे",
        "ग्राहक सहाय्य प्रदान करणे",
        "ॲपचे कार्यप्रदर्शन आणि वापरकर्ता अनुभव सुधारणे",
        "प्रचारात्मक ऑफर पाठवणे (लागू असल्यास)",
      ],

      sec4Title: "4. माहिती शेअर करणे",

      sec4Important:
        "आम्ही तुमची वैयक्तिक माहिती विकत नाही.",

      sec4Intro:
        "आम्ही तुमची माहिती खालील घटकांसोबत शेअर करू शकतो:",

      sec4_1Title: "4.1 सलून पार्टनर्स",

      sec4_1Items: [
        "तुमचे बुकिंग पूर्ण करण्यासाठी",
        "तुम्ही मागवलेल्या सेवा देण्यासाठी",
      ],

      sec4_2Title: "4.2 सेवा प्रदाते",

      sec4_2Items: [
        "फायरबेस (सूचनांसाठी)",
        "होस्टिंग आणि ॲनालिटिक्स प्रदाते",
      ],

      sec4_3Title: "4.3 कायदेशीर प्राधिकरणे",

      sec4_3Items: [
        "कायद्यानुसार किंवा सरकारी विनंतीनुसार आवश्यक असल्यास",
      ],

      sec5Title: "5. पेमेंट",

      sec5Items: [
        "सर्व पेमेंट थेट सलूनला केले जातात",
        "नियोपार्लर पेमेंट गोळा किंवा प्रक्रिया करत नाही",
        "आम्ही पेमेंटसंबंधी वादांसाठी जबाबदार नाही",
      ],

      sec6Title: "6. पुश सूचना",

      sec6Intro:
        "प्लॅटफॉर्म वापरून, तुम्ही खालील सूचना प्राप्त करण्यास संमती देता:",

      sec6Items: [
        "बुकिंगची पुष्टी",
        "अपॉइंटमेंट स्मरणपत्रे",
        "सेवा अपडेट्स",
        "प्रचारात्मक सूचना (ऐच्छिक)",
      ],

      sec6Footer:
        "तुम्ही डिव्हाइस सेटिंग्जमधून कधीही सूचना बंद करू शकता.",

      sec7Title: "7. डेटा राखणे",

      sec7Intro:
        "आम्ही तुमचा डेटा खालील कालावधी आणि उद्देशांसाठी राखून ठेवतो:",

      sec7Items: [
        "तुमचे खाते सक्रिय असेपर्यंत",
        "कायदेशीर पालनासाठी आवश्यक कालावधीपर्यंत",
        "वाद निवारण आणि फसवणूक प्रतिबंधासाठी",
      ],

      sec8Title: "8. खाते हटवणे",

      sec8Intro:
        "तुम्ही खालील प्रकारे खाते हटवण्याची विनंती करू शकता:",

      sec8Items1: [
        "ॲप सेटिंग्ज वापरून (उपलब्ध असल्यास), किंवा",
        "सपोर्ट टीमशी संपर्क साधून",
      ],

      sec8Next: "हटवल्यानंतर:",

      sec8Items2: [
        "तुमचे खाते निष्क्रिय केले जाईल",
        "वैयक्तिक डेटा हटवला किंवा अनामित केला जाईल",
        "कायदेशीर गरजांसाठी काही डेटा राखला जाऊ शकतो",
      ],

      sec9Title: "9. डेटा सुरक्षितता",

      sec9Intro:
        "आम्ही तुमच्या डेटाच्या सुरक्षेसाठी योग्य सुरक्षा उपाययोजना लागू करतो, जेणेकरून तुमचा डेटा खालील गोष्टींपासून सुरक्षित राहील:",

      sec9Items: [
        "अनधिकृत प्रवेश",
        "गैरवापर",
        "हानी किंवा बदल",
      ],

      sec9Footer:
        "तथापि, कोणतीही प्रणाली १००% सुरक्षित नाही.",

      sec10Title: "10. तुमचे हक्क",

      sec10Intro:
        "लागू भारतीय कायद्यांनुसार, तुम्हाला खालील हक्क आहेत:",

      sec10Items: [
        "तुमच्या वैयक्तिक डेटामध्ये प्रवेश करण्याचा हक्क",
        "दुरुस्तीची विनंती करण्याचा हक्क",
        "हटवण्याची विनंती करण्याचा हक्क",
        "संमती मागे घेण्याचा हक्क",
      ],

      sec11Title: "11. तृतीय-पक्ष सेवा",

      sec11Intro:
        "ॲप खालील तृतीय-पक्ष सेवा वापरू शकते:",

      sec11Items: [
        "फायरबेस क्लाउड मेसेजिंग (FCM)",
        "ॲनालिटिक्स साधने",
      ],

      sec11Footer:
        "या सेवा त्यांच्या स्वतःच्या धोरणांनुसार मर्यादित डेटा गोळा करू शकतात.",

      sec12Title: "12. मुलांची गोपनीयता",

      sec12Items: [
        "प्लॅटफॉर्म १८ वर्षांखालील वापरकर्त्यांसाठी नाही",
        "अल्पवयीन मुले पालकांच्या देखरेखीखालीच ॲप वापरू शकतात",
      ],

      sec13Title: "13. या धोरणातील बदल",

      sec13Intro:
        "आम्ही वेळोवेळी हे गोपनीयता धोरण अपडेट करू शकतो.",

      sec13Items: [
        "अपडेट्स ॲप किंवा वेबसाइटद्वारे सूचित केले जातील",
        "प्लॅटफॉर्मचा पुढील वापर या धोरणास संमती दर्शवतो",
      ],

      sec14Title: "14. आमच्याशी संपर्क साधा",

      sec14Intro:
        "कोणत्याही गोपनीयतेशी संबंधित प्रश्नांसाठी:",

      sec14Email:
        "ईमेल: support@neopaceinfotech.com",

      sec14App:
        "ॲप: मदत विभाग",

      sec15Title: "15. संमती",

      sec15Intro:
        "प्लॅटफॉर्म वापरून, तुम्ही:",

      sec15Items: [
        "या गोपनीयता धोरणाशी सहमत आहात",
        "वर्णन केल्याप्रमाणे डेटा संकलन आणि वापरास संमती देता",
      ],
    },
  };

  const tData = content[lang] || content.en;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black antialiased font-sans text-gray-700 dark:text-gray-300 flex flex-col justify-between">

      {/* Main Content Card Wrapper */}
      <div className="py-12 px-4 flex-grow">
        <div className="max-w-5xl mx-auto bg-white dark:bg-black dark:border dark:border-gray-800 shadow-lg rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-black text-white p-6">
            <h1 className="text-3xl font-bold">
              {tData.title}
            </h1>

            <p className="text-gray-300 mt-2">
              {tData.subtitle}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              {tData.effectiveDate}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-8 text-gray-700 dark:text-gray-300">

            {/* Introduction */}
            <Section title={tData.sec1Title}>
              <p>{tData.sec1Text1}</p>
              <p className="mt-3">{tData.sec1Text2}</p>
              <p className="mt-3 font-medium">{tData.sec1Text3}</p>
            </Section>

            {/* Information */}
            <Section title={tData.sec2Title}>
              <p>{tData.sec2Intro}</p>

              <Card title={tData.sec2_1Title}>
                <BulletList items={tData.sec2_1Items} />
              </Card>

              <Card title={tData.sec2_2Title}>
                <BulletList items={tData.sec2_2Items} />
              </Card>

              <Card title={tData.sec2_3Title}>
                <BulletList items={tData.sec2_3Items} />
              </Card>

              <Card title={tData.sec2_4Title}>
                <BulletList items={tData.sec2_4Items} />
              </Card>
            </Section>

            {/* Use */}
            <Section title={tData.sec3Title}>
              <p>{tData.sec3Intro}</p>
              <BulletList items={tData.sec3Items} />
            </Section>

            {/* Sharing */}
            <Section title={tData.sec4Title}>
              <p className="font-medium">{tData.sec4Important}</p>
              <p className="mt-3">{tData.sec4Intro}</p>

              <Card title={tData.sec4_1Title}>
                <BulletList items={tData.sec4_1Items} />
              </Card>

              <Card title={tData.sec4_2Title}>
                <BulletList items={tData.sec4_2Items} />
              </Card>

              <Card title={tData.sec4_3Title}>
                <BulletList items={tData.sec4_3Items} />
              </Card>
            </Section>

            {/* Payments */}
            <Section title={tData.sec5Title}>
              <BulletList items={tData.sec5Items} />
            </Section>

            {/* Notifications */}
            <Section title={tData.sec6Title}>
              <p>{tData.sec6Intro}</p>
              <BulletList items={tData.sec6Items} />
              <p className="mt-3">{tData.sec6Footer}</p>
            </Section>

            {/* Retention */}
            <Section title={tData.sec7Title}>
              <p>{tData.sec7Intro}</p>
              <BulletList items={tData.sec7Items} />
            </Section>

            {/* Deletion */}
            <Section title={tData.sec8Title}>
              <p>{tData.sec8Intro}</p>
              <BulletList items={tData.sec8Items1} />
              <p className="mt-3">{tData.sec8Next}</p>
              <BulletList items={tData.sec8Items2} />
            </Section>

            {/* Security */}
            <Section title={tData.sec9Title}>
              <p>{tData.sec9Intro}</p>
              <BulletList items={tData.sec9Items} />
              <p className="mt-3">{tData.sec9Footer}</p>
            </Section>

            {/* Rights */}
            <Section title={tData.sec10Title}>
              <p>{tData.sec10Intro}</p>
              <BulletList items={tData.sec10Items} />
            </Section>

            {/* Third Party */}
            <Section title={tData.sec11Title}>
              <p>{tData.sec11Intro}</p>
              <BulletList items={tData.sec11Items} />
              <p className="mt-3">{tData.sec11Footer}</p>
            </Section>

            {/* Children */}
            <Section title={tData.sec12Title}>
              <BulletList items={tData.sec12Items} />
            </Section>

            {/* Changes */}
            <Section title={tData.sec13Title}>
              <p>{tData.sec13Intro}</p>
              <BulletList items={tData.sec13Items} />
            </Section>

            {/* Contact */}
            <Section title={tData.sec14Title}>
              <p>{tData.sec14Intro}</p>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mt-4 space-y-2">
                <p>
                  <span className="font-semibold">
                    {tData.sec14Email.split(":")[0]}:
                  </span>{" "}
                  {tData.sec14Email.split(":")[1]}
                </p>

                <p>
                  <span className="font-semibold">
                    {tData.sec14App.split(":")[0]}:
                  </span>{" "}
                  {tData.sec14App.split(":")[1]}
                </p>
              </div>
            </Section>

            {/* Consent */}
            <Section title={tData.sec15Title}>
              <p>{tData.sec15Intro}</p>
              <BulletList items={tData.sec15Items} />
            </Section>

          </div>
        </div>
      </div>

      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <SEOFooter />
      </div>

    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <div className="pt-4">
    <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
      {title}
    </h2>

    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 my-3">
    <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
      {title}
    </h3>

    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-start gap-2">
        <span className="text-black dark:text-gray-400 mt-1">
          •
        </span>

        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default PrivacyPolicy;