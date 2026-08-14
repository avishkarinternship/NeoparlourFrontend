import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const PrivacyPolicyScreen = () => {
  const { i18n } = useTranslation();
  const { lang: langParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let targetLang = null;
    const path = location.pathname.toLowerCase();

    if (langParam) {
      const p = langParam.toLowerCase();
      if (p === 'hindi' || p === 'hi') targetLang = 'hi';
      else if (p === 'marathi' || p === 'mr') targetLang = 'mr';
      else if (p === 'english' || p === 'en') targetLang = 'en';
    }
    
    if (!targetLang) {
      if (path.includes('/hindi') || path.includes('/hi/')) targetLang = 'hi';
      else if (path.includes('/marathi') || path.includes('/mr/')) targetLang = 'mr';
      else if (path.includes('/english') || path.includes('/en/')) targetLang = 'en';
    }

    if (targetLang && i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
  }, [langParam, location.pathname, i18n]);

  const lang = (i18n.language || localStorage.getItem('i18nextLng') || 'en').substring(0, 2);

  const content = {
    en: {
      title: "Privacy Policy",
      subtitle: "Neoparlour Salon (Owner) App",
      effectiveDate: "Effective Date: 27 May 2026",

      sec1Title: "1. INTRODUCTION",
      sec1Text1: "Neoparlour provides a marketplace platform that connects salon owners with customers.",
      sec1Text2: "This Privacy Policy explains how we collect, use, store, and share information of salon owners using the Neoparlour Partner App.",
      sec1Text3: "By registering or using the Platform, you agree to this Privacy Policy.",

      sec2Title: "2. INFORMATION WE COLLECT",
      sec2_1Title: "2.1 Personal Information",
      sec2_1Items: [
        "Name",
        "Phone number (OTP login)",
        "Email address",
        "Profile photo (if uploaded)"
      ],
      sec2_2Title: "2.2 Business Information",
      sec2_2Items: [
        "Salon name",
        "Salon address",
        "City and area details",
        "Business registration details",
        "GST details"
      ],
      sec2_3Title: "2.3 Financial & Payment Information",
      sec2_3Items: [
        "Subscription/payment details",
        "Transaction records",
        "Payment reference IDs"
      ],
      sec2_3ImportantTitle: "Important:",
      sec2_3ImportantText: "We do NOT store your card, UPI PIN, or banking credentials. All payments are securely processed.",
      sec2_4Title: "2.4 Device & Technical Information",
      sec2_4Items: [
        "Device type and OS",
        "IP address",
        "App usage logs"
      ],
      sec2_5Title: "2.5 Push Notification Data",
      sec2_5Items: [
        "Firebase Cloud Messaging (FCM) token"
      ],

      sec3Title: "3. HOW WE USE YOUR INFORMATION",
      sec3Items: [
        "Create and manage your partner account",
        "Verify your identity and business",
        "Enable salon listing and booking management",
        "Process subscription payments",
        "Send booking notifications and alerts",
        "Provide analytics and performance insights",
        "Improve app functionality and services"
      ],

      sec4Title: "4. PAYMENT PROCESSING",
      sec4Items: [
        "Payments for subscriptions are processed securely",
        "Payment providers collect data as per their privacy policy",
        "We only store transaction references and status"
      ],

      sec5Title: "5. SHARING OF INFORMATION",
      sec5_1Title: "5.1 Customers",
      sec5_1Text: "Salon name, services, and basic details for bookings.",
      sec5_2Title: "5.2 Payment Providers",
      sec5_2Text: "Payment gateway providers (for processing).",
      sec5_3Title: "5.3 Service Providers",
      sec5_3Items: [
        "Cloud hosting providers",
        "Notification services (Firebase)"
      ],
      sec5_4Title: "5.4 Legal Authorities",
      sec5_4Text: "If required under applicable law.",

      sec6Title: "6. DATA SECURITY",
      sec6Items: [
        "Unauthorized access protection",
        "Data breach protection",
        "Misuse prevention"
      ],
      sec6Footer: "However, no system is completely secure.",

      sec7Title: "7. DATA RETENTION",
      sec7Items: [
        "As long as your account is active",
        "For accounting and tax compliance",
        "For dispute resolution and fraud prevention"
      ],

      sec8Title: "8. ACCOUNT DELETION",
      sec8Text: "You may request account deletion by contacting support.",
      sec8Items: [
        "Your account will be deactivated",
        "Business data may be retained for legal/tax compliance",
        "Transaction records may be retained as required by law"
      ],

      sec9Title: "9. YOUR RIGHTS",
      sec9Items: [
        "Request access to your data",
        "Request correction",
        "Request deletion",
        "Withdraw consent"
      ],

      sec10Title: "10. THIRD-PARTY SERVICES",
      sec10Items: [
        "Payment processing services",
        "Firebase Cloud Messaging (notifications)"
      ],

      sec11Title: "11. PUSH NOTIFICATIONS",
      sec11Items: [
        "Booking alerts",
        "Customer updates",
        "Payment reminders",
        "Platform announcements"
      ],
      sec11Footer: "You can disable notifications from device settings.",

      sec12Title: "12. CONFIDENTIALITY OF BUSINESS DATA",
      sec12Items: [
        "Maintain confidentiality of your login credentials",
        "Sensitive business data must not be shared externally",
        "We do not guarantee protection against misuse caused by user negligence"
      ],

      sec13Title: "13. CHANGES TO THIS POLICY",
      sec13Text1: "We may update this Privacy Policy from time to time.",
      sec13Text2: "Continued use of the Platform implies acceptance of the updated policy.",

      sec14Title: "14. GOVERNING LAW",
      sec14Text: "This Privacy Policy is governed by the laws of India.",

      sec15Title: "15. CONTACT US",
      sec15Email: "Email: support@neopaceinfotech.com",
      sec15App: "App: Partner Support Section",

      sec16Title: "16. CONSENT",
      sec16Items: [
        "Agree to this Privacy Policy",
        "Consent to data collection and processing",
        "Acknowledge payment processing terms"
      ]
    },
    hi: {
      title: "प्राइवेसी पॉलिसी",
      subtitle: "नियोपार्लर सलून (ओनर) ऐप",
      effectiveDate: "प्रभावी तिथि: 27 मई 2026",

      sec1Title: "1. परिचय",
      sec1Text1: "नियोपार्लर एक मार्केटप्लेस प्लेटफॉर्म प्रदान करता है जो सलून मालिकों को ग्राहकों से जोड़ता है।",
      sec1Text2: "यह प्राइवेसी पॉलिसी बताती है कि हम नियोपार्लर पार्टनर ऐप का उपयोग करने वाले सलून मालिकों की जानकारी कैसे एकत्र, उपयोग और साझा करते हैं।",
      sec1Text3: "पंजीकरण करके या प्लेटफॉर्म का उपयोग करके, आप इस प्राइवेसी पॉलिसी से सहमत होते हैं।",

      sec2Title: "2. हमारे द्वारा एकत्र की जाने वाली जानकारी",
      sec2_1Title: "2.1 व्यक्तिगत जानकारी",
      sec2_1Items: [
        "नाम",
        "फोन नंबर (ओटीपी लॉगिन)",
        "ईमेल पता",
        "प्रोफ़ाइल फ़ोटो (यदि अपलोड की गई हो)"
      ],
      sec2_2Title: "2.2 व्यावसायिक जानकारी",
      sec2_2Items: [
        "सलून का नाम",
        "सलून का पता",
        "शहर और क्षेत्र विवरण",
        "व्यवसाय पंजीकरण विवरण",
        "जीएसटी विवरण"
      ],
      sec2_3Title: "2.3 वित्तीय और भुगतान जानकारी",
      sec2_3Items: [
        "सब्सक्रिप्शन/भुगतान विवरण",
        "लेन-देन रिकॉर्ड",
        "भुगतान संदर्भ आईडी"
      ],
      sec2_3ImportantTitle: "महत्वपूर्ण:",
      sec2_3ImportantText: "हम आपका कार्ड, यूपीआई पिन या बैंकिंग विवरण संग्रहीत नहीं करते हैं। सभी भुगतान सुरक्षित रूप से संसाधित होते हैं।",
      sec2_4Title: "2.4 उपकरण और तकनीकी जानकारी",
      sec2_4Items: [
        "उपकरण प्रकार और ओएस",
        "आईपी पता",
        "ऐप उपयोग लॉग"
      ],
      sec2_5Title: "2.5 पुश सूचना डेटा",
      sec2_5Items: [
        "फायरबेस क्लाउड मैसेजिंग (FCM) टोकन"
      ],

      sec3Title: "3. हम आपकी जानकारी का उपयोग कैसे करते हैं",
      sec3Items: [
        "अपना पार्टनर खाता बनाएं और प्रबंधित करें",
        "अपनी पहचान और व्यवसाय की पुष्टि करें",
        "सलून लिस्टिंग और बुकिंग प्रबंधन सक्षम करें",
        "सब्सक्रिप्शन भुगतान संसाधित करें",
        "बुकिंग अलर्ट और सूचनाएं भेजें",
        "प्रदर्शन और विश्लेषण प्रदान करें",
        "ऐप कार्यक्षमता में सुधार करें"
      ],

      sec4Title: "4. भुगतान प्रसंस्करण",
      sec4Items: [
        "सब्सक्रिप्शन के लिए भुगतान सुरक्षित रूप से संसाधित किए जाते हैं",
        "भुगतान प्रदाता अपनी गोपनीयता नीति के अनुसार डेटा एकत्र करते हैं",
        "हम केवल लेन-देन संदर्भ संग्रहीत करते हैं"
      ],

      sec5Title: "5. जानकारी का साझाकरण",
      sec5_1Title: "5.1 ग्राहक",
      sec5_1Text: "बुकिंग के लिए सलून का नाम, सेवाएं और बुनियादी विवरण।",
      sec5_2Title: "5.2 भुगतान प्रदाता",
      sec5_2Text: "भुगतान गेटवे प्रदाता (प्रसंस्करण के लिए)।",
      sec5_3Title: "5.3 सेवा प्रदाता",
      sec5_3Items: [
        "क्लाउड होस्टिंग प्रदाता",
        "सूचना सेवाएं (फायरबेस)"
      ],
      sec5_4Title: "5.4 कानूनी प्राधिकरण",
      sec5_4Text: "यदि लागू कानून के तहत आवश्यक हो।",

      sec6Title: "6. डेटा सुरक्षा",
      sec6Items: [
        "अनधिकृत पहुंच सुरक्षा",
        "डेटा उल्लंघन सुरक्षा",
        "दुरुपयोग की रोकथाम"
      ],
      sec6Footer: "हालांकि, कोई भी प्रणाली पूरी तरह से सुरक्षित नहीं है।",

      sec7Title: "7. डेटा प्रतिधारण",
      sec7Items: [
        "जब तक आपका खाता सक्रिय है",
        "लेखांकन और कर अनुपालन के लिए",
        "विवाद समाधान के लिए"
      ],

      sec8Title: "8. खाता हटाना",
      sec8Text: "आप सहायता से संपर्क करके खाता हटाने का अनुरोध कर सकते हैं।",
      sec8Items: [
        "आपका खाता निष्क्रिय कर दिया जाएगा",
        "कानूनी अनुपालन के लिए व्यावसायिक डेटा रखा जा सकता है",
        "लेन-देन रिकॉर्ड कानून द्वारा आवश्यक अनुसार रखे जा सकते हैं"
      ],

      sec9Title: "9. आपके अधिकार",
      sec9Items: [
        "अपने डेटा तक पहुंच का अनुरोध करें",
        "सुधार का अनुरोध करें",
        "हटाने का अनुरोध करें",
        "सहमति वापस लें"
      ],

      sec10Title: "10. तृतीय-पक्ष सेवाएं",
      sec10Items: [
        "भुगतान प्रसंस्करण सेवाएं",
        "फायरबेस क्लाउड मैसेजिंग"
      ],

      sec11Title: "11. पुश सूचनाएं",
      sec11Items: [
        "बुकिंग अलर्ट",
        "ग्राहक अपडेट",
        "भुगतान रिमाइंडर",
        "प्लेटफॉर्म घोषणाएं"
      ],
      sec11Footer: "आप डिवाइस सेटिंग्स से सूचनाएं अक्षम कर सकते हैं।",

      sec12Title: "12. व्यावसायिक डेटा की गोपनीयता",
      sec12Items: [
        "अपने लॉगिन क्रेडेंशियल की गोपनीयता बनाए रखें",
        "संवेदनशील व्यावसायिक डेटा बाहरी रूप से साझा नहीं किया जाना चाहिए"
      ],

      sec13Title: "13. इस नीति में परिवर्तन",
      sec13Text1: "हम समय-समय पर इस नीति को अपडेट कर सकते हैं।",
      sec13Text2: "निरंतर उपयोग का अर्थ नीति की स्वीकृति है।",

      sec14Title: "14. शासी कानून",
      sec14Text: "यह नीति भारत के कानूनों द्वारा शासित है।",

      sec15Title: "15. हमसे संपर्क करें",
      sec15Email: "ईमेल: support@neopaceinfotech.com",
      sec15App: "ऐप: पार्टनर सहायता अनुभाग",

      sec16Title: "16. सहमति",
      sec16Items: [
        "इस गोपनीयता नीति से सहमत हैं",
        "डेटा संग्रह और प्रसंस्करण के लिए सहमति देते हैं"
      ]
    },
    mr: {
      title: "प्रायव्हसी पॉलिसी",
      subtitle: "नियोपार्लर सलून (ओनर) ॲप",
      effectiveDate: "प्रभावी तारीख: 27 मे 2026",

      sec1Title: "1. परिचय",
      sec1Text1: "नियोपार्लर हे सलून मालकांना ग्राहकांशी जोडणारे प्लॅटफॉर्म प्रदान करते.",
      sec1Text2: "ही प्रायव्हसी पॉलिसी आम्ही सलून मालकांची माहिती कशी गोळा करतो, वापरतो आणि सुरक्षित ठेवतो हे स्पष्ट करते.",
      sec1Text3: "नोंदणी करून किंवा प्लॅटफॉर्म वापरून, तुम्ही या प्रायव्हसी पॉलिसीशी सहमत होता.",

      sec2Title: "2. आम्ही गोळा करतो ती माहिती",
      sec2_1Title: "2.1 वैयक्तिक माहिती",
      sec2_1Items: [
        "नाव",
        "फोन नंबर (ओटीपी लॉगिन)",
        "ईमेल पत्ता",
        "प्रोफाइल फोटो (अपलोड केला असल्यास)"
      ],
      sec2_2Title: "2.2 व्यावसायिक माहिती",
      sec2_2Items: [
        "सलूनचे नाव",
        "सलूनचा पत्ता",
        "शहर आणि परिसर तपशील",
        "व्यवसाय नोंदणी तपशील",
        "जीएसटी तपशील"
      ],
      sec2_3Title: "2.3 आर्थिक आणि पेमेंट माहिती",
      sec2_3Items: [
        "सबस्क्रिप्शन/पेमेंट तपशील",
        "व्यवहार नोंदी",
        "पेमेंट संदर्भ आयडी"
      ],
      sec2_3ImportantTitle: "महत्त्वाचे:",
      sec2_3ImportantText: "आम्ही तुमचे कार्ड, यूपीआय पिन किंवा बँकिंग तपशील जतन करत नाही. सर्व पेमेंट सुरक्षितपणे प्रक्रिया केले जातात.",
      sec2_4Title: "2.4 डिव्हाइस आणि तांत्रिक माहिती",
      sec2_4Items: [
        "डिव्हाइस प्रकार आणि ओएस",
        "आयपी पत्ता",
        "ॲप वापर नोंदी"
      ],
      sec2_5Title: "2.5 पुश सूचना डेटा",
      sec2_5Items: [
        "फायरबेस क्लाउड मेसेजिंग (FCM) टोकन"
      ],

      sec3Title: "3. आम्ही तुमच्या माहितीचा वापर कसा करतो",
      sec3Items: [
        "तुमचे पार्टनर खाते तयार करा आणि व्यवस्थापित करा",
        "तुमची ओळख आणि व्यवसायाची पडताळणी करा",
        "सलून लिस्टिंग आणि बुकिंग व्यवस्थापन सक्षम करा",
        "सबस्क्रिप्शन पेमेंट प्रक्रिया करा",
        "बुकिंग अलर्ट आणि सूचना पाठवा",
        "ॲप कार्यक्षमतेत सुधारणा करा"
      ],

      sec4Title: "4. पेमेंट प्रक्रिया",
      sec4Items: [
        "सबस्क्रिप्शन पेमेंट सुरक्षितपणे प्रक्रिया केले जातात",
        "पेमेंट प्रदाते त्यांच्या धोरणानुसार डेटा गोळा करतात",
        "आम्ही फक्त व्यवहार संदर्भ जतन करतो"
      ],

      sec5Title: "5. माहिती शेअर करणे",
      sec5_1Title: "5.1 ग्राहक",
      sec5_1Text: "बुकिंगसाठी सलूनचे नाव, सेवा आणि मूलभूत तपशील.",
      sec5_2Title: "5.2 पेमेंट प्रदाते",
      sec5_2Text: "पेमेंट गेटवे प्रदाते (प्रक्रियेसाठी).",
      sec5_3Title: "5.3 सेवा प्रदाते",
      sec5_3Items: [
        "क्लाउड होस्टिंग प्रदाते",
        "सूचना सेवा (फायरबेस)"
      ],
      sec5_4Title: "5.4 कायदेशीर अधिकारी",
      sec5_4Text: "कायद्यानुसार आवश्यक असल्यास.",

      sec6Title: "6. डेटा सुरक्षा",
      sec6Items: [
        "अनधिकृत प्रवेश सुरक्षा",
        "डेटा उल्लंघन सुरक्षा",
        "गैरवापर प्रतिबंध"
      ],
      sec6Footer: "तथापि, कोणतीही प्रणाली पूर्णपणे सुरक्षित नाही.",

      sec7Title: "7. डेटा राखणे",
      sec7Items: [
        "तुमचे खाते सक्रिय असेपर्यंत",
        "कर पालनासाठी",
        "वाद निवारणासाठी"
      ],

      sec8Title: "8. खाते हटवणे",
      sec8Text: "तुम्ही सपोर्टशी संपर्क साधून खाते हटवण्याची विनंती करू शकता.",
      sec8Items: [
        "तुमचे खाते निष्क्रिय केले जाईल",
        "कायदेशीर पालनासाठी व्यावसायिक डेटा राखला जाऊ शकतो"
      ],

      sec9Title: "9. तुमचे हक्क",
      sec9Items: [
        "तुमच्या डेटामध्ये प्रवेश मागवा",
        "दुरुस्तीची विनंती करा",
        "हटवण्याची विनंती करा",
        "संमती मागे घ्या"
      ],

      sec10Title: "10. तृतीय-पक्ष सेवा",
      sec10Items: [
        "पेमेंट प्रक्रिया सेवा",
        "फायरबेस क्लाउड मेसेजिंग"
      ],

      sec11Title: "11. पुश सूचना",
      sec11Items: [
        "बुकिंग अलर्ट",
        "ग्राहक अपडेट्स",
        "पेमेंट स्मरणपत्रे"
      ],
      sec11Footer: "तुम्ही डिव्हाइस सेटिंग्जमधून सूचना बंद करू शकता.",

      sec12Title: "12. व्यावसायिक डेटाची गोपनीयता",
      sec12Items: [
        "लॉगिन माहितीची गोपनीयता राखा",
        "संवेदनशील माहिती बाहेर शेअर करू नका"
      ],

      sec13Title: "13. या धोरणातील बदल",
      sec13Text1: "आम्ही वेळोवेळी हे धोरण अपडेट करू शकतो.",
      sec13Text2: "पुढील वापर संमती दर्शवतो.",

      sec14Title: "14. नियमन कायदा",
      sec14Text: "हे धोरण भारताच्या कायद्यांनुसार चालते.",

      sec15Title: "15. आमच्याशी संपर्क साधा",
      sec15Email: "ईमेल: support@neopaceinfotech.com",
      sec15App: "ॲप: पार्टनर सपोर्ट विभाग",

      sec16Title: "16. संमती",
      sec16Items: [
        "या प्रायव्हसी पॉलिसीशी सहमत आहात",
        "डेटा संकलन आणि प्रक्रियेस संमती देता"
      ]
    }
  };

  const tData = content[lang] || content.en;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-black text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{tData.title}</h1>
            <p className="text-gray-300 mt-2">{tData.subtitle}</p>
            <p className="text-sm text-gray-400 mt-1">{tData.effectiveDate}</p>
          </div>

          {/* Language Pills */}
          <div className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => { i18n.changeLanguage('en'); navigate('/owner/english/privacy-policy'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${lang === 'en' ? 'bg-[#FF0B01] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => { i18n.changeLanguage('hi'); navigate('/owner/hindi/privacy-policy'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${lang === 'hi' ? 'bg-[#FF0B01] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => { i18n.changeLanguage('mr'); navigate('/owner/marathi/privacy-policy'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${lang === 'mr' ? 'bg-[#FF0B01] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 text-gray-700">

          <Section title={tData.sec1Title}>
            <p>{tData.sec1Text1}</p>
            <p className="mt-3">{tData.sec1Text2}</p>
            <p className="mt-3 font-medium">{tData.sec1Text3}</p>
          </Section>

          <Section title={tData.sec2Title}>
            <Card title={tData.sec2_1Title}>
              <BulletList items={tData.sec2_1Items} />
            </Card>

            <Card title={tData.sec2_2Title}>
              <BulletList items={tData.sec2_2Items} />
            </Card>

            <Card title={tData.sec2_3Title}>
              <BulletList items={tData.sec2_3Items} />
              <div className="mt-4 bg-yellow-100 border border-yellow-300 p-4 rounded-xl">
                <p className="font-semibold text-yellow-800">{tData.sec2_3ImportantTitle}</p>
                <p className="text-yellow-700 mt-1">{tData.sec2_3ImportantText}</p>
              </div>
            </Card>

            <Card title={tData.sec2_4Title}>
              <BulletList items={tData.sec2_4Items} />
            </Card>

            <Card title={tData.sec2_5Title}>
              <BulletList items={tData.sec2_5Items} />
            </Card>
          </Section>

          <Section title={tData.sec3Title}>
            <BulletList items={tData.sec3Items} />
          </Section>

          <Section title={tData.sec4Title}>
            <BulletList items={tData.sec4Items} />
          </Section>

          <Section title={tData.sec5Title}>
            <Card title={tData.sec5_1Title}>
              <p>{tData.sec5_1Text}</p>
            </Card>

            <Card title={tData.sec5_2Title}>
              <p>{tData.sec5_2Text}</p>
            </Card>

            <Card title={tData.sec5_3Title}>
              <BulletList items={tData.sec5_3Items} />
            </Card>

            <Card title={tData.sec5_4Title}>
              <p>{tData.sec5_4Text}</p>
            </Card>
          </Section>

          <Section title={tData.sec6Title}>
            <BulletList items={tData.sec6Items} />
            <p className="mt-3">{tData.sec6Footer}</p>
          </Section>

          <Section title={tData.sec7Title}>
            <BulletList items={tData.sec7Items} />
          </Section>

          <Section title={tData.sec8Title}>
            <p>{tData.sec8Text}</p>
            <BulletList items={tData.sec8Items} />
          </Section>

          <Section title={tData.sec9Title}>
            <BulletList items={tData.sec9Items} />
          </Section>

          <Section title={tData.sec10Title}>
            <BulletList items={tData.sec10Items} />
          </Section>

          <Section title={tData.sec11Title}>
            <BulletList items={tData.sec11Items} />
            <p className="mt-3">{tData.sec11Footer}</p>
          </Section>

          <Section title={tData.sec12Title}>
            <BulletList items={tData.sec12Items} />
          </Section>

          <Section title={tData.sec13Title}>
            <p>{tData.sec13Text1}</p>
            <p className="mt-3">{tData.sec13Text2}</p>
          </Section>

          <Section title={tData.sec14Title}>
            <p>{tData.sec14Text}</p>
          </Section>

          <Section title={tData.sec15Title}>
            <div className="bg-gray-100 p-4 rounded-xl space-y-2">
              <p><span className="font-semibold">{tData.sec15Email.split(':')[0]}:</span> {tData.sec15Email.split(':')[1]}</p>
              <p><span className="font-semibold">{tData.sec15App.split(':')[0]}:</span> {tData.sec15App.split(':')[1]}</p>
            </div>
          </Section>

          <Section title={tData.sec16Title}>
            <BulletList items={tData.sec16Items} />
          </Section>

        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-bold text-black mb-4">
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 my-3">
    <h3 className="text-lg font-semibold mb-3 text-black">
      {title}
    </h3>
    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-start gap-2">
        <span className="text-black mt-1">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default PrivacyPolicyScreen;