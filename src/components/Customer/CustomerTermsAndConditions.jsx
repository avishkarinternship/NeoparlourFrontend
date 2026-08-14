import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import SEOFooter from '../common/SEOFooter';

const CustomerTermsAndConditions = () => {
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
      title: "SALON BOOKING PLATFORM",
      subtitle: "Terms & Conditions for Customers",
      version: "Version 1.0",
      effectiveDate: "Effective Date: 27/05/26",
      governedBy: "Governed by Indian Law",
      navRules: "Booking Rules",
      navCancel: "Cancellation Policy",
      navSafety: "Your Safety",
      navReviews: "Ratings & Reviews",
      importantNotice: "IMPORTANT: These Terms form a legally binding agreement between you and the Platform. By creating an account or making a booking, you accept these Terms in full.",
      
      sec1Title: "1. WHO WE ARE & WHAT WE DO",
      sec1Text1: "Neoparlour ('Platform', 'We', 'Us') is a technology-based salon booking marketplace. We connect customers with independently operated salons ('Salon Partners') through our mobile application and website.",
      sec1Text2: "We are a booking facilitator only. We do not provide salon services, employ stylists, or collect payment for services. All salon services are delivered by Salon Partners, and all payments for services are made directly by you to the salon after your service is completed.",

      sec2Title: "2. ELIGIBILITY",
      sec2_1: "2.1 Age — You must be at least 18 years old to register and book on this Platform.",
      sec2_2: "2.2 Minors — Persons below 18 may use the Platform only with the consent and supervision of a parent or legal guardian, who accepts full responsibility under these Terms.",
      sec2_3: "2.3 Legal Capacity — By using the Platform, you confirm you have the legal capacity to enter a binding contract under the Indian Contract Act, 1872.",
      sec2_4: "2.4 Right to Refuse — We reserve the right to refuse or revoke access at our discretion where eligibility requirements are not met.",

      sec3Title: "3. ACCOUNT REGISTRATION",
      sec3_1: "3.1 How to Register — You may register using your mobile number (OTP-verified). Guest bookings are permitted with a valid mobile number only.",
      sec3_2: "3.2 Accuracy — You must provide accurate, current, and complete information and update it promptly if it changes.",
      sec3_3: "3.3 Security — Keep your login credentials secure. You are responsible for all activity under your account. Notify us immediately of any unauthorized access.",
      sec3_4: "3.4 One Account — One account per person. Duplicate accounts may be suspended without notice.",
      sec3_5: "3.5 Verification — We may verify your identity at any time. Failure to verify may result in account suspension.",
      sec3_6Title: "3.6 TERMS & PRIVACY CONSENT",
      sec3_6Text: "By creating an account, logging in, or making a booking on the Platform, you expressly agree to:",
      sec3_6List1: "These Terms & Conditions",
      sec3_6List2: "Our Privacy Policy (available within the app and on our website)",
      sec3_6Footer: "Your continued use of the Platform constitutes ongoing acceptance of these Terms and any updates made to them.",

      sec4Title: "4. HOW BOOKINGS WORK",
      sec4_1: "4.1 Select Services First — You must select all your required services before choosing a time slot. The Platform calculates your appointment duration based on your service selection. Do not skip this step — it prevents scheduling conflicts.",
      sec4_2: "4.2 Stylist Selection — Where enabled by your Salon Partner, you may select a preferred stylist. This feature may be disabled on certain days (such as weekends) or for certain service types. Stylist availability is not guaranteed.",
      sec4_3: "4.3 Confirmation — Your booking is confirmed only when you receive a confirmation notification from the Platform. Selecting a slot alone is not a confirmed booking.",
      sec4_4: "4.5 Arrive On Time — Please arrive at the salon at your confirmed appointment time. A grace period of up to 10 minutes applies. If you arrive after the grace period, your appointment may be forfeited at the Salon's discretion.",
      sec4_5: "4.6 Add-On Services — If you wish to add services during your appointment (e.g., beard trim after a haircut), your stylist will accommodate this subject to the next customer's booking. To avoid this situation, we strongly recommend booking all desired services upfront when selecting your slot.",
      sec4_6: "4.7 Walk-In Option — Salons also accept walk-in customers. If you visit a salon without a booking, the salon's stylist will manage your queue manually. Walk-in wait times depend on the salon's current queue and are not managed by the Platform.",
      sec4Tip: "TIP: To get the best experience, always select all services you want before picking your time slot. This ensures your stylist has enough time allocated and avoids conflicts with other booked customers.",

      sec5Title: "5. PRICING & PAYMENT",
      sec5_1: "5.1 How Payment Works — All payments for salon services are made directly by you to the Salon at the time of or after your service. The Platform does not collect, process, or hold any payment from you at any point.",
      sec5_2: "5.2 Pricing — Service prices are set by each Salon Partner independently. Prices displayed on the Platform are indicative and inclusive of applicable taxes (GST) where applicable. Confirm the final price with the salon at the time of your visit.",
      sec5_3: "5.3 Payment Methods — Payment methods accepted (cash, card, UPI, etc.) are determined by each Salon Partner. The Platform has no involvement in payment processing and does not guarantee any specific payment method will be available at any salon.",
      sec5_4: "5.4 No Platform Fees — The Platform does not charge customers any booking fee, service fee, convenience fee, or any other fee for using the Platform to make a booking.",
      sec5_5: "5.5 Price Disputes — Any dispute regarding the price charged at the salon must be resolved directly between you and the Salon Partner. The Platform is not a party to the payment transaction and cannot intervene in price disputes.",
      sec5Important: "IMPORTANT: You pay the salon directly after your service — cash, card, or UPI as the salon accepts. The Platform is completely free for customers.",

      sec6Title: "6. CANCELLATION POLICY",
      sec6Intro: "Since all payments are made directly at the salon, there is no financial penalty for cancellation. However, we ask you to cancel responsibly to respect the salon's time and allow other customers to book the slot.",
      thAction: "Action",
      thHow: "How",
      thConsequence: "No-Show Consequence",
      row1Action: "Cancel booking",
      row1How: "Via Platform app — anytime",
      row1Consequence: "No charge. Slot released for other customers.",
      row2Action: "Reschedule booking",
      row2How: "Via Platform app — anytime",
      row2Consequence: "No charge. Select a new available slot.",
      row3Action: "No-show (did not arrive)",
      row3How: "Auto-detected by Platform after grace period",
      row3Consequence: "Slot marked as no-show. Repeated no-shows may affect your account standing.",
      row4Action: "Salon cancels your booking",
      row4How: "Platform notifies you immediately",
      row4Consequence: "Rebook or choose another salon. No charge to you.",
      sec6_1: "6.1 Cancel via App — Please cancel or reschedule through the Platform app so the salon is notified in time and the slot can be given to another customer.",
      sec6_2: "6.2 Repeated No-Shows — Repeated no-shows reflect negatively on your account. The Platform tracks no-show patterns. Accounts with excessive no-shows may be subject to booking restrictions.",
      sec6_3: "6.3 Salon's Own Policy — Individual salons may have their own cancellation or no-show policies (e.g., declining future bookings from repeat no-show customers). This is at the salon's discretion and is not controlled by the Platform.",
      sec6GoodPractice: "GOOD PRACTICE: No financial penalty applies for cancellations or no-shows since all payments are made at the salon. But please cancel in advance — it allows another customer to take your slot.",

      sec7Title: "7. REFUNDS",
      sec7Intro: "Since the Platform does not collect any payment from customers, Platform-level refunds do not apply.",
      sec7_1: "7.1 Service Refunds — If you are dissatisfied with a service or believe you were overcharged, you must raise this directly with the Salon Partner at the time of payment or immediately after your visit.",
      sec7_2: "7.2 Platform's Role — The Platform may assist as a mediator in escalated disputes between customers and salons, but cannot issue or enforce refunds as it has no involvement in the payment.",
      sec7_3: "7.3 Dispute Escalation — If you cannot resolve a payment or service dispute directly with the salon, you may raise a complaint through the Platform's in-app Help section. The Platform will attempt mediation in good faith.",

      sec8Title: "8. HEALTH, SAFETY & ALLERGY DISCLOSURE",
      sec8_1: "8.1 Disclose Allergies — Inform your stylist of any known allergies, skin sensitivities, scalp conditions, or medical conditions before your service begins.",
      sec8_2: "8.2 Patch Test — Before any chemical treatment (hair colour, bleach, keratin, straightening), request a patch test from your salon. If you decline a patch test, neither the Platform nor the Salon will be liable for any resulting reaction.",
      sec8_3: "8.3 Chemical Treatment Consent — By booking a chemical treatment, you acknowledge the risk of skin sensitivity and consent to the treatment subject to your stylist's professional assessment.",
      sec8_4: "8.4 Adverse Reactions — If you experience any adverse reaction during or after a service, stop the service immediately, inform the salon, and seek appropriate medical attention. You may also report the incident through the Platform's in-app safety report feature.",
      sec8_5: "8.5 Hygiene Standards — The Platform requires Salon Partners to comply with our Hygiene Policy (minimum hygiene standards for tools, linen, disposables, and premises). However, we do not physically inspect salons and hygiene compliance is the Salon's legal responsibility.",
      sec8Safety: "SAFETY: Always tell your stylist about allergies or skin sensitivities before your service. Never skip a patch test for chemical treatments.",

      sec9Title: "9. RATINGS & REVIEWS",
      sec9_1: "9.1 Who Can Review — Only customers who have completed a verified booking may submit a rating or review for a salon or stylist.",
      sec9_2: "9.2 Honest Reviews — Reviews must be honest and based on your genuine experience. You must not post false, misleading, defamatory, or abusive reviews.",
      sec9_3: "9.3 Licence — By submitting a review, you grant us a non-exclusive, royalty-free licence to display your review on the Platform.",
      sec9_4: "9.4 Moderation — We reserve the right to remove reviews that violate our Reviews Policy, without prior notice.",
      sec9_5: "9.5 No Fake Reviews — Submitting incentivized or fake reviews is strictly prohibited and will result in account suspension.",

      sec10Title: "10. PROHIBITED CONDUCT",
      sec10Intro: "The following conduct is strictly prohibited and may result in account suspension or permanent termination:",
      sec10Items: [
        "Providing false information during registration, booking, or review submission.",
        "Making bookings with no intention to attend (fraudulent booking).",
        "Arranging services with salon staff outside the Platform to circumvent booking records.",
        "Harassment, abuse, or threatening behaviour toward salon staff, stylists, or Platform support.",
        "Misusing the complaint or dispute system to obtain unfair advantages.",
        "Sharing your account with another person.",
        "Attempting to hack, scrape, or disrupt Platform systems.",
        "Using the Platform for any unlawful purpose under Indian law."
      ],

      sec11Title: "11. ACCOUNT SUSPENSION & TERMINATION",
      sec11_1: "11.1 Our Rights — We may suspend or permanently close your account, with or without notice, for violation of these Terms, repeated no-shows, abusive conduct, or any activity harmful to our platform or partners.",
      sec11_2: "11.2 Your Right — You may close your account at any time through app settings. You may reinstate your account within 30 days of closure.",
      sec11_3: "11.3 Effect — Pending bookings will be cancelled on termination. The salon will be notified.",
      sec11_4: "11.4 Data Retention — Your data will be retained as required under applicable Indian law including the DPDP Act 2023.",

      sec12Title: "12. PLATFORM LIABILITY",
      sec12_1: "12.1 Booking Facilitation Only — The Platform is a booking tool. We are not liable for the quality, outcome, suitability, or safety of any salon service. Your service contract is with the Salon Partner.",
      sec12_2: "12.2 No Payment Liability — Since we do not collect any payment, we have no liability for payment disputes, overcharging, or refund failures. These are between you and the Salon.",
      sec12_3: "12.3 Liability Limit — To the maximum extent permitted by Indian law, our total liability to you for any claim shall not exceed INR 1,000 or the notional value of the disputed booking — whichever is lower.",
      sec12_4: "12.4 Consumer Rights — Nothing in these Terms limits your statutory rights under the Consumer Protection Act, 2019.",

      sec13Title: "13. GRIEVANCE REDRESSAL",
      sec13_1: "13.1 Grievance Officer — In accordance with applicable Indian law, we have appointed a Grievance Officer. Details are published in the app under Help & Legal.",
      sec13_2: "13.2 Process — Lodge grievances via the in-app Help section. We acknowledge within 48 hours and resolve within 30 days.",
      sec13_3: "13.3 Consumer Forum — If your grievance is unresolved, you may approach the Consumer District Forum or State Consumer Commission under the Consumer Protection Act, 2019.",

      sec14Title: "14. GOVERNING LAW & DISPUTES",
      sec14_1: "14.1 Governing Law — These Terms are governed by the laws of India.",
      sec14_2: "14.2 Dispute Resolution — Disputes will first go through our internal grievance mechanism. If unresolved within 30 days, you may approach the relevant Consumer Forum. Arbitration is available by mutual consent under the Arbitration and Conciliation Act, 1996.",
      sec14_3: "14.3 Jurisdiction — Courts at Pune, India shall have jurisdiction over disputes not resolved otherwise.",

      sec15Title: "15. CHANGES TO THESE TERMS",
      sec15_1: "15.1 Updates — We may update these Terms from time to time with notice via the app. Continued use after notification constitutes acceptance of revised Terms.",

      sec16Title: "16. PRIVACY & DATA USAGE",
      sec16_1: "16.1 Data Collection — We collect personal information such as your mobile number, booking details, and usage data to provide and improve our services.",
      sec16_2Title: "16.2 Purpose of Data Use — Your data is used for:",
      sec16_2List: [
        "Account authentication and login",
        "Booking management and confirmations",
        "Customer support and dispute resolution",
        "Sending service-related notifications"
      ],
      sec16_3: "16.3 Push Notifications — By using the Platform, you consent to receive notifications including booking confirmations, reminders, offers, and updates. You may manage notification preferences in your device settings.",
      sec16_4: "16.4 Data Sharing — We do not sell your personal data. Your information is shared only with relevant Salon Partners to fulfill your bookings.",
      sec16_5: "16.5 Data Protection — Your data is handled in accordance with the Digital Personal Data Protection Act, 2023.",

      sec17Title: "17. ACCOUNT DELETION",
      sec17_1: "17.1 You may request deletion of your account at any time through the app settings or by contacting support.",
      sec17_2Title: "17.2 Upon deletion request:",
      sec17_2List: [
        "Your account will be deactivated",
        "Personal data will be deleted or anonymized, subject to legal retention requirements"
      ],
      sec17_3: "17.3 Certain data may be retained for compliance with applicable laws, dispute resolution, or fraud prevention.",

      sec18Title: "18. CONTACT US",
      sec18Intro: "For queries, grievances, or support:",
      sec18App: "In-App: Help → Contact Us",
      sec18Email: "Email: support@neopaceinfotech.com",
      sec18Officer: "Grievance Officer: Jeevan Joshi",
      sec18Mail: "Mail – Jeevan.j@neopaceinfotech.com",
      sec18Response: "Response within 48 hours",
      footerRights: "© 2026 Neoparlour. All rights reserved. | Last updated: 27 May 2026"
    },
    hi: {
      title: "सलून बुकिंग प्लेटफॉर्म",
      subtitle: "ग्राहकों के लिए टर्म्स एंड कंडीशंस",
      version: "संस्करण 1.0",
      effectiveDate: "प्रभावी तिथि: 27/05/26",
      governedBy: "भारतीय कानून द्वारा शासित",
      navRules: "बुकिंग रूल्स",
      navCancel: "कैंसिलेशन पॉलिसी",
      navSafety: "आपकी सेफ्टी",
      navReviews: "रेटिंग्स एंड रिव्यूज़",
      importantNotice: "महत्वपूर्ण: ये नियम आपके और प्लेटफॉर्म के बीच एक कानूनी रूप से बाध्यकारी समझौता बनाते हैं। खाता बनाकर या बुकिंग करके, आप इन नियमों को पूरी तरह से स्वीकार करते हैं।",
      
      sec1Title: "1. हम कौन हैं और हम क्या करते हैं",
      sec1Text1: "नियोपार्लर ('प्लेटफॉर्म', 'हम') एक तकनीक-आधारित सलून बुकिंग मार्केटप्लेस है। हम अपने मोबाइल एप्लिकेशन और वेबसाइट के माध्यम से ग्राहकों को स्वतंत्र रूप से संचालित सलूनों ('सलून पार्टनर्स') से जोड़ते हैं।",
      sec1Text2: "हम केवल एक बुकिंग सुविधाप्रदाता हैं। हम सलून सेवाएं प्रदान नहीं करते, स्टाइलिस्ट नियुक्त नहीं करते या सेवाओं के लिए भुगतान एकत्र नहीं करते। सभी सलून सेवाएं सलून पार्टनर्स द्वारा प्रदान की जाती हैं, और सेवाओं के लिए सभी भुगतान आपकी सेवा पूरी होने के बाद सीधे आपके द्वारा सलून को किए जाते हैं।",

      sec2Title: "2. पात्रता",
      sec2_1: "2.1 आयु — इस प्लेटफॉर्म पर पंजीकरण करने और बुकिंग करने के लिए आपकी आयु कम से कम 18 वर्ष होनी चाहिए।",
      sec2_2: "2.2 नाबालिग — 18 वर्ष से कम आयु के व्यक्ति केवल माता-पिता या कानूनी अभिभावक की सहमति और देखरेख में ही प्लेटफॉर्म का उपयोग कर सकते हैं।",
      sec2_3: "2.3 कानूनी क्षमता — प्लेटफॉर्म का उपयोग करके, आप पुष्टि करते हैं कि आपके पास भारतीय अनुबंध अधिनियम, 1872 के तहत कानूनी अनुबंध करने की क्षमता है।",
      sec2_4: "2.4 मना करने का अधिकार — जब पात्रता आवश्यकताएं पूरी नहीं होती हैं तो हम अपने विवेक से पहुंच को अस्वीकार या रद्द करने का अधिकार सुरक्षित रखते हैं।",

      sec3Title: "3. खाता पंजीकरण",
      sec3_1: "3.1 पंजीकरण कैसे करें — आप अपने मोबाइल नंबर (ओटीपी द्वारा सत्यापित) का उपयोग करके पंजीकरण कर सकते हैं। केवल वैध मोबाइल नंबर के साथ अतिथि बुकिंग की अनुमति है।",
      sec3_2: "3.2 सटीकता — आपको सटीक, वर्तमान और पूर्ण जानकारी प्रदान करनी चाहिए और बदलने पर इसे तुरंत अपडेट करना चाहिए।",
      sec3_3: "3.3 सुरक्षा — अपने लॉगिन क्रेडेंशियल सुरक्षित रखें। आप अपने खाते के तहत सभी गतिविधियों के लिए जिम्मेदार हैं।",
      sec3_4: "3.4 एक खाता — प्रति व्यक्ति एक खाता। डुप्लिकेट खातों को बिना सूचना के निलंबित किया जा सकता है।",
      sec3_5: "3.5 सत्यापन — हम किसी भी समय आपकी पहचान सत्यापित कर सकते हैं। सत्यापन न होने पर खाता निलंबित हो सकता है।",
      sec3_6Title: "3.6 नियम और गोपनीयता सहमति",
      sec3_6Text: "खाता बनाकर, लॉगिन करके या बुकिंग करके, आप स्पष्ट रूप से सहमत होते हैं:",
      sec3_6List1: "ये नियम और शर्तें",
      sec3_6List2: "हमारी गोपनीयता नीति (ऐप और वेबसाइट में उपलब्ध)",
      sec3_6Footer: "प्लेटफॉर्म का आपका निरंतर उपयोग इन नियमों और उनमें किए गए संशोधनों की स्वीकृति माना जाएगा।",

      sec4Title: "4. बुकिंग कैसे काम करती है",
      sec4_1: "4.1 पहले सेवाएं चुनें — समय स्लॉट चुनने से पहले अपनी सभी आवश्यक सेवाओं का चयन करना अनिवार्य है। समय टकराव से बचने के लिए यह कदम महत्वपूर्ण है।",
      sec4_2: "4.2 स्टाइलिस्ट चयन — यदि सलून पार्टनर द्वारा सक्षम किया गया है, तो आप अपने पसंदीदा स्टाइलिस्ट का चयन कर सकते हैं। सप्ताहांत या विशेष दिनों में यह सुविधा सीमित हो सकती है।",
      sec4_3: "4.3 पुष्टि — आपकी बुकिंग केवल तभी पक्की मानी जाती है जब आपको प्लेटफॉर्म से पुष्टि सूचना प्राप्त होती है।",
      sec4_4: "4.5 समय पर पहुंचें — कृपया अपने निर्धारित समय पर सलून पहुंचे। 10 मिनट की छूट अवधि लागू होती है। इसके बाद सलून बुकिंग रद्द कर सकता है।",
      sec4_5: "4.6 अतिरिक्त सेवाएं — यदि आप अपॉइंटमेंट के दौरान अतिरिक्त सेवाएं जोड़ना चाहते हैं, तो स्टाइलिस्ट अगले ग्राहक के समय के अनुसार इसे समायोजित करेगा।",
      sec4_6: "4.7 वॉकिन विकल्प — सलून वॉकिन ग्राहकों को भी स्वीकार करते हैं। वॉकिन प्रतीक्षा समय सलून की कतार पर निर्भर करता है।",
      sec4Tip: "सुझाव: सर्वोत्तम अनुभव के लिए, हमेशा अपना समय स्लॉट चुनने से पहले अपनी सभी इच्छित सेवाओं का चयन करें।",

      sec5Title: "5. मूल्य निर्धारण और भुगतान",
      sec5_1: "5.1 भुगतान कैसे काम करता है — सलून सेवाओं के लिए सभी भुगतान सीधे सलून में आपकी सेवा पूरी होने के बाद किए जाते हैं। प्लेटफॉर्म कोई भुगतान एकत्र नहीं करता।",
      sec5_2: "5.2 मूल्य निर्धारण — सेवाएं और उनकी कीमतें सलून पार्टनर्स द्वारा तय की जाती हैं। प्रदर्शित कीमतें लागू करों (जीएसटी) सहित हैं।",
      sec5_3: "5.3 भुगतान विधियां — नकद, कार्ड, यूपीआई आदि भुगतान विधियां सलून द्वारा निर्धारित की जाती हैं।",
      sec5_4: "5.4 कोई प्लेटफॉर्म शुल्क नहीं — प्लेटफॉर्म ग्राहकों से बुकिंग या सुविधा के लिए कोई अतिरिक्त शुल्क नहीं लेता है।",
      sec5_5: "5.5 मूल्य विवाद — सलून में ली गई कीमत से संबंधित कोई भी विवाद सीधे आपके और सलून पार्टनर के बीच हल किया जाना चाहिए।",
      sec5Important: "महत्वपूर्ण: आप सेवा के बाद सीधे सलून को भुगतान करते हैं — नकद, कार्ड या यूपीआई। ग्राहकों के लिए प्लेटफॉर्म पूरी तरह मुफ्त है।",

      sec6Title: "6. रद्दीकरण नीति",
      sec6Intro: "चूंकि सभी भुगतान सीधे सलून में किए जाते हैं, इसलिए रद्दीकरण पर कोई वित्तीय दंड नहीं है। हालांकि, कृपया समय पर रद्द करें ताकि अन्य ग्राहक स्लॉट बुक कर सकें।",
      thAction: "कार्रवाई",
      thHow: "कैसे",
      thConsequence: "नो-शो परिणाम",
      row1Action: "बुकिंग रद्द करें",
      row1How: "प्लेटफॉर्म ऐप द्वारा — कभी भी",
      row1Consequence: "कोई शुल्क नहीं। स्लॉट दूसरों के लिए उपलब्ध।",
      row2Action: "समय बदलें (रीशेड्युल)",
      row2How: "प्लेटफॉर्म ऐप द्वारा — कभी भी",
      row2Consequence: "कोई शुल्क नहीं। नया स्लॉट चुनें।",
      row3Action: "नो-शो (नहीं पहुंचे)",
      row3How: "छूट अवधि के बाद स्वतः पहचान",
      row3Consequence: "नो-शो दर्ज किया जाएगा। बार-बार नो-शो करने पर खाता सीमित हो सकता है।",
      row4Action: "सलून बुकिंग रद्द करता है",
      row4How: "प्लेटफॉर्म आपको सूचित करता है",
      row4Consequence: "पुनः बुक करें या अन्य सलून चुनें। आपके लिए कोई शुल्क नहीं।",
      sec6_1: "6.1 ऐप से रद्द करें — कृपया ऐप के माध्यम से रद्द या रीशेड्युल करें ताकि सलून को समय पर सूचित किया जा सके।",
      sec6_2: "6.2 बार-बार नो-शो — बार-बार उपस्थित न होने पर खाते पर बुकिंग प्रतिबंध लगाए जा सकते हैं।",
      sec6_3: "6.3 सलून की अपनी नीति — व्यक्तिगत सलून की अपनी रद्दीकरण नीतियां हो सकती हैं।",
      sec6GoodPractice: "अच्छी आदत: रद्दीकरण पर कोई वित्तीय जुर्माना नहीं है, लेकिन कृपया अग्रिम में रद्द करें ताकि कोई अन्य ग्राहक स्लॉट ले सके।",

      sec7Title: "7. रिफंड",
      sec7Intro: "चूंकि प्लेटफॉर्म ग्राहकों से कोई भुगतान एकत्र नहीं करता है, इसलिए प्लेटफॉर्म स्तर पर रिफंड लागू नहीं होता है।",
      sec7_1: "7.1 सेवा रिफंड — यदि आप सेवा से असंतुष्ट हैं, तो भुगतान के समय सीधे सलून पार्टनर से बात करें।",
      sec7_2: "7.2 प्लेटफॉर्म की भूमिका — प्लेटफॉर्म ग्राहकों और सलून के बीच मध्यस्थ के रूप में सहायता कर सकता है।",
      sec7_3: "7.3 विवाद समाधान — यदि विवाद हल नहीं होता है, तो ऐप की सहायता अनुभाग से शिकायत दर्ज करें।",

      sec8Title: "8. स्वास्थ्य, सुरक्षा और एलर्जी प्रकटीकरण",
      sec8_1: "8.1 एलर्जी की जानकारी दें — सेवा शुरू होने से पहले अपने स्टाइलिस्ट को किसी भी एलर्जी या त्वचा संवेदनशीलता की जानकारी दें।",
      sec8_2: "8.2 पैच टेस्ट — रासायनिक उपचार (कलर, ब्लीच, केराटिन) से पहले पैच टेस्ट का अनुरोध करें।",
      sec8_3: "8.3 केमिकल ट्रीटमेंट सहमति — केमिकल ट्रीटमेंट बुक करके, आप त्वचा संवेदनशीलता के जोखिम को स्वीकार करते हैं।",
      sec8_4: "8.4 प्रतिकूल प्रतिक्रिया — यदि सेवा के दौरान या बाद में कोई विपरीत प्रभाव हो, तो सेवा तुरंत रोकें और डॉक्टर से परामर्श लें।",
      sec8_5: "8.5 स्वच्छता मानक — सलून पार्टनर्स को स्वच्छता मानकों का पालन करना अनिवार्य है।",
      sec8Safety: "सुरक्षा: सेवा से पहले हमेशा अपने स्टाइलिस्ट को एलर्जी के बारे में बताएं। केमिकल ट्रीटमेंट के लिए पैच टेस्ट कभी न छोड़ें।",

      sec9Title: "9. रेटिंग और समीक्षाएं",
      sec9_1: "9.1 समीक्षा कौन कर सकता है — केवल सत्यापित बुकिंग पूरी करने वाले ग्राहक ही समीक्षा प्रस्तुत कर सकते हैं।",
      sec9_2: "9.2 ईमानदार समीक्षाएं — समीक्षाएं आपके वास्तविक अनुभव पर आधारित होनी चाहिए।",
      sec9_3: "9.3 लाइसेंस — समीक्षा प्रस्तुत करके, आप इसे प्लेटफॉर्म पर प्रदर्शित करने का अधिकार देते हैं।",
      sec9_4: "9.4 मॉडरेशन — हम अनुचित समीक्षाओं को हटाने का अधिकार सुरक्षित रखते हैं।",
      sec9_5: "9.5 फर्जी समीक्षाएं नहीं — फर्जी या प्रलोभन वाली समीक्षाएं सख्त वर्जित हैं।",

      sec10Title: "10. निषिद्ध आचरण",
      sec10Intro: "निम्नलिखित आचरण सख्त वर्जित हैं और इसके परिणामस्वरूप खाता निलंबित किया जा सकता है:",
      sec10Items: [
        "पंजीकरण या बुकिंग के दौरान गलत जानकारी प्रदान करना।",
        "बिना किसी इरादे के फर्जी बुकिंग करना।",
        "सलून कर्मचारियों के साथ प्लेटफॉर्म के बाहर बुकिंग करना।",
        "कर्मचारियों या स्टाइलिस्टों के साथ अनुचित या अपमानजनक व्यवहार।",
        "शिकायत प्रणाली का दुरुपयोग करना।",
        "अपना खाता किसी अन्य व्यक्ति के साथ साझा करना।",
        "प्लेटफॉर्म सिस्टम को हैक या बाधित करने का प्रयास करना।",
        "भारतीय कानून के तहत किसी भी गैर-कानूनी उद्देश्य के लिए उपयोग करना।"
      ],

      sec11Title: "11. खाता निलंबन और समाप्ति",
      sec11_1: "11.1 हमारे अधिकार — नियमों के उल्लंघन पर हम आपका खाता निलंबित या बंद कर सकते हैं।",
      sec11_2: "11.2 आपका अधिकार — आप ऐप सेटिंग्स के माध्यम से किसी भी समय अपना खाता बंद कर सकते हैं।",
      sec11_3: "11.3 प्रभाव — समाप्ति पर लंबित बुकिंग रद्द कर दी जाएंगी।",
      sec11_4: "11.4 डेटा प्रतिधारण — आपका डेटा लागू भारतीय कानूनों के अनुसार सुरक्षित रखा जाएगा।",

      sec12Title: "12. प्लेटफॉर्म का दायित्व",
      sec12_1: "12.1 केवल बुकिंग सुविधा — प्लेटफॉर्म एक बुकिंग उपकरण है। हम सलून सेवा की गुणवत्ता के लिए उत्तरदायी नहीं हैं।",
      sec12_2: "12.2 भुगतान दायित्व नहीं — हम भुगतान एकत्र नहीं करते, इसलिए भुगतान विवादों के लिए हमारी कोई जिम्मेदारी नहीं है।",
      sec12_3: "12.3 दायित्व सीमा — भारतीय कानून के अनुसार हमारी अधिकतम देयता ₹1,000 तक सीमित है।",
      sec12_4: "12.4 उपभोक्ता अधिकार — ये नियम उपभोक्ता संरक्षण अधिनियम 2019 के तहत आपके वैधानिक अधिकारों को सीमित नहीं करते हैं।",

      sec13Title: "13. शिकायत निवारण",
      sec13_1: "13.1 शिकायत अधिकारी — हमने कानून के अनुसार शिकायत अधिकारी नियुक्त किया है।",
      sec13_2: "13.2 प्रक्रिया — इन-ऐप सहायता अनुभाग के माध्यम से शिकायत दर्ज करें। हम 48 घंटों में पावती देंगे और 30 दिनों में समाधान करेंगे।",
      sec13_3: "13.3 उपभोक्ता फोरम — यदि शिकायत अनसुलझी रहती है, तो आप उपभोक्ता फोरम में संपर्क कर सकते हैं।",

      sec14Title: "14. शासी कानून और विवाद",
      sec14_1: "14.1 शासी कानून — ये नियम भारत के कानूनों द्वारा शासित हैं।",
      sec14_2: "14.2 विवाद समाधान — विवादों का समाधान पहले हमारी आंतरिक शिकायत प्रणाली द्वारा किया जाएगा।",
      sec14_3: "14.3 क्षेत्राधिकार — पुणे, भारत के न्यायालयों का क्षेत्राधिकार होगा।",

      sec15Title: "15. इन नियमों में परिवर्तन",
      sec15_1: "15.1 अपडेट — हम समय-समय पर इन नियमों को अपडेट कर सकते हैं। ऐप का निरंतर उपयोग संशोधनों की स्वीकृति माना जाएगा।",

      sec16Title: "16. गोपनीयता और डेटा उपयोग",
      sec16_1: "16.1 डेटा संग्रह — हम सेवाएं प्रदान करने के लिए आपका मोबाइल नंबर और बुकिंग विवरण एकत्र करते हैं।",
      sec16_2Title: "16.2 डेटा उपयोग का उद्देश्य — आपके डेटा का उपयोग किया जाता है:",
      sec16_2List: [
        "खाता प्रमाणीकरण और लॉगिन",
        "बुकिंग प्रबंधन और पुष्टि",
        "ग्राहक सहायता और विवाद समाधान",
        "सेवा संबंधी सूचनाएं भेजना"
      ],
      sec16_3: "16.3 पुश सूचनाएं — प्लेटफॉर्म का उपयोग करके, आप बुकिंग पुष्टि और रिमाइंडर प्राप्त करने के लिए सहमत होते हैं।",
      sec16_4: "16.4 डेटा साझाकरण — हम आपका व्यक्तिगत डेटा नहीं बेचते हैं।",
      sec16_5: "16.5 डेटा सुरक्षा — आपका डेटा डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के तहत सुरक्षित है।",

      sec17Title: "17. खाता हटाना",
      sec17_1: "17.1 आप ऐप सेटिंग्स या सहायता से संपर्क करके किसी भी समय खाता हटाने का अनुरोध कर सकते हैं।",
      sec17_2Title: "17.2 हटाने के अनुरोध पर:",
      sec17_2List: [
        "आपका खाता निष्क्रिय कर दिया जाएगा",
        "कानूनी आवश्यकताओं के अधीन व्यक्तिगत डेटा हटा दिया जाएगा"
      ],
      sec17_3: "17.3 कानूनी अनुपालन के लिए कुछ डेटा रखा जा सकता है।",

      sec18Title: "18. हमसे संपर्क करें",
      sec18Intro: "प्रश्नों, शिकायतों या सहायता के लिए:",
      sec18App: "ऐप में: सहायता → हमसे संपर्क करें",
      sec18Email: "ईमेल: support@neopaceinfotech.com",
      sec18Officer: "शिकायत अधिकारी: जीवन जोशी",
      sec18Mail: "मेल – Jeevan.j@neopaceinfotech.com",
      sec18Response: "48 घंटों के भीतर उत्तर दिया जाएगा",
      footerRights: "© 2026 नियोपार्लर। सर्वाधिकार सुरक्षित। | अंतिम अद्यतन: 27 मई 2026"
    },
    mr: {
      title: "सलून बुकिंग प्लॅटफॉर्म",
      subtitle: "कस्टमर्ससाठी टर्म्स अँड कंडिशन्स",
      version: "आवृत्ती 1.0",
      effectiveDate: "प्रभावी तारीख: 27/05/26",
      governedBy: "भारतीय कायद्यानुसार शासित",
      navRules: "बुकिंग रूल्स",
      navCancel: "कॅन्सेलेशन पॉलिसी",
      navSafety: "आपली सेफ्टी",
      navReviews: "रेटिंग्स अँड रिव्ह्यूज",
      importantNotice: "महत्त्वाचे: या अटी तुमच्या आणि प्लॅटफॉर्मदरम्यान कायदेशीररित्या बंधनकारक करार तयार करतात. खाते तयार करून किंवा बुकिंग करून, तुम्ही या अटी पूर्णपणे स्वीकारता.",
      
      sec1Title: "1. आम्ही कोण आहोत आणि आम्ही काय करतो",
      sec1Text1: "नियोपार्लर ('प्लॅटफॉर्म', 'आम्ही') हे तंत्रज्ञान-आधारित सलून बुकिंग मार्केटप्लेस आहे. आम्ही आमच्या मोबाइल ॲप्लिकेशन आणि वेबसाइटद्वारे ग्राहकांना स्वतंत्रपणे चालवल्या जाणाऱ्या सलूनशी ('सलून पार्टनर्स') जोडतो.",
      sec1Text2: "आम्ही फक्त बुकिंग सुलभकर्ता आहोत. आम्ही सलून सेवा देत नाही, स्टायलिस्ट नियुक्त करत नाही किंवा सेवांसाठी पेमेंट गोळा करत नाही. सर्व सलून सेवा सलून पार्टनर्सद्वारे दिल्या जातात आणि सेवा पूर्ण झाल्यावर सर्व पेमेंट थेट तुमच्याद्वारे सलूनला केले जातात.",

      sec2Title: "2. पात्रता",
      sec2_1: "2.1 वय — या प्लॅटफॉर्मवर नोंदणी आणि बुकिंग करण्यासाठी तुमचे वय किमान १८ वर्षे असावे.",
      sec2_2: "2.2 अल्पवयीन — १८ वर्षांखालील व्यक्ती पालकांच्या किंवा कायदेशीर पालकांच्या संमतीने आणि देखरेखीखालीच प्लॅटफॉर्म वापरू शकतात.",
      sec2_3: "2.3 कायदेशीर क्षमता — प्लॅटफॉर्म वापरून, तुम्ही पुष्टी करता की तुमच्याकडे भारतीय करार कायदा, १८७२ अंतर्गत करार करण्याची कायदेशीर क्षमता आहे.",
      sec2_4: "2.4 नाकारण्याचा हक्क — पात्रता अटी पूर्ण न झाल्यास आम्ही प्रवेश नाकारण्याचा किंवा रद्द करण्याचा हक्क राखून ठेवतो.",

      sec3Title: "3. खाते नोंदणी",
      sec3_1: "3.1 नोंदणी कशी करावी — तुम्ही तुमच्या मोबाईल नंबरचा (ओटीपी द्वारे पडताळणी) वापर करून नोंदणी करू शकता. अतिथी बुकिंगला फक्त वैध मोबाईल नंबरसह अनुमती आहे.",
      sec3_2: "3.2 अचूकता — तुम्ही अचूक, अद्ययावत आणि पूर्ण माहिती देणे आवश्यक आहे आणि बदल झाल्यास ती ताबडतोब अपडेट करावी.",
      sec3_3: "3.3 सुरक्षितता — तुमचे लॉगिन तपशील सुरक्षित ठेवा. तुमच्या खात्यांतर्गत होणाऱ्या सर्व हालचालींसाठी तुम्ही जबाबदार असाल.",
      sec3_4: "3.4 एक खाते — एका व्यक्तीसाठी एक खाते. डुप्लिकेट खाती सूचनेशिवाय निलंबित केली जाऊ शकतात.",
      sec3_5: "3.5 पडताळणी — आम्ही कोणत्याही वेळी तुमच्या ओळखीची पडताळणी करू शकतो. पडताळणी न झाल्यास खाते निलंबित होऊ शकते.",
      sec3_6Title: "3.6 नियम आणि गोपनीयता संमती",
      sec3_6Text: "खाते तयार करून, लॉगिन करून किंवा बुकिंग करून, तुम्ही स्पष्टपणे खालील बाबींशी सहमत आहात:",
      sec3_6List1: "या नियम आणि अटी",
      sec3_6List2: "आमचे गोपनीयता धोरण (ॲप आणि वेबसाइटवर उपलब्ध)",
      sec3_6Footer: "प्लॅटफॉर्मचा तुमचा निरंतर वापर या अटी आणि त्यातील बदलांची स्वीकृती मानला जाईल.",

      sec4Title: "4. बुकिंग कसे कार्य करते",
      sec4_1: "4.1 आधी सेवा निवडा — वेळ स्लॉट निवडण्यापूर्वी तुमच्या सर्व आवश्यक सेवा निवडणे बंधनकारक आहे. वेळेचा गोंधळ टाळण्यासाठी हे पाऊल महत्त्वाचे आहे.",
      sec4_2: "4.2 स्टायलिस्ट निवड — सलून पार्टनरने उपलब्ध करून दिल्यास, तुम्ही तुमच्या पसंतीच्या स्टायलिस्टची निवड करू शकता.",
      sec4_3: "4.3 कन्फर्मेशन — प्लॅटफॉर्मवरून कन्फर्मेशन मेसेज मिळाल्यावरच तुमचे बुकिंग निश्चित मानले जाते.",
      sec4_4: "4.5 वेळेवर पोहोचा — कृपया तुमच्या निश्चित वेळेवर सलूनमध्ये पोहोचा. १० मिनिटांची सवलत दिली जाते. त्यानंतर सलून बुकिंग रद्द करू शकते.",
      sec4_5: "4.6 अतिरिक्त सेवा — तुम्हाला अपॉइंटमेंटदरम्यान अतिरिक्त सेवा जोडायच्या असल्यास, पुढील ग्राहकाच्या वेळेनुसार स्टायलिस्ट ते व्यवस्थापित करेल.",
      sec4_6: "4.7 वॉकिन पर्याय — सलून थेट येणाऱ्या (वॉकिन) ग्राहकांनाही स्वीकारतात. वॉकिन प्रतीक्षा वेळ सलूनच्या रांगेवर अवलंबून असतो.",
      sec4Tip: "टीप: सर्वोत्तम अनुभवासाठी, नेहमी वेळेचा स्लॉट निवडण्यापूर्वी तुमच्या सर्व इच्छित सेवा निवडा.",

      sec5Title: "5. किंमत आणि पेमेंट",
      sec5_1: "5.1 पेमेंट कसे कार्य करते — सलून सेवांसाठी सर्व पेमेंट थेट सलूनमध्ये तुमची सेवा पूर्ण झाल्यावर केले जाते. प्लॅटफॉर्म कोणतेही पेमेंट गोळा करत नाही.",
      sec5_2: "5.2 किंमत — सेवांचे दर प्रत्येक सलून पार्टनर स्वतंत्रपणे ठरवतात. प्लॅटफॉर्मवर दाखवलेले दर लागू करांसह (जीएसटी) आहेत.",
      sec5_3: "5.3 पेमेंट पद्धती — कॅश, कार्ड, यूपीआय इत्यादी पेमेंट पद्धती सलूनद्वारे ठरवल्या जातात.",
      sec5_4: "5.4 कोणताही प्लॅटफॉर्म चार्ज नाही — प्लॅटफॉर्म ग्राहकांकडून बुकिंगसाठी कोणताही अतिरिक्त चार्ज किंवा फी घेत नाही.",
      sec5_5: "5.5 किंमतीचे वाद — सलूनमध्ये आकारलेल्या दराबाबतचा कोणताही वाद थेट तुमच्यात आणि सलून पार्टनरमध्ये सोडवला जावा.",
      sec5Important: "महत्त्वाचे: तुम्ही सेवा पूर्ण झाल्यावर थेट सलूनला पेमेंट करता — कॅश, कार्ड किंवा यूपीआय. ग्राहकांसाठी प्लॅटफॉर्म पूर्णपणे मोफत आहे.",

      sec6Title: "6. रद्द करण्याचे धोरण",
      sec6Intro: "सर्व पेमेंट थेट सलूनमध्ये होत असल्याने, बुकिंग रद्द केल्यास कोणताही आर्थिक दंड नाही. तथापि, कृपया वेळेवर रद्द करा जेणेकरून इतर ग्राहक स्लॉट बुक करू शकतील.",
      thAction: "कृती",
      thHow: "कसे",
      thConsequence: "उपस्थित न राहण्याचे परिणाम",
      row1Action: "बुकिंग रद्द करा",
      row1How: "प्लॅटफॉर्म ॲपद्वारे — कधीही",
      row1Consequence: "कोणतेही शुल्क नाही. स्लॉट इतरांसाठी मोकळा.",
      row2Action: "वेळ बदला (रीशेड्युल)",
      row2How: "प्लॅटफॉर्म ॲपद्वारे — कधीही",
      row2Consequence: "कोणतेही शुल्क नाही. नवीन स्लॉट निवडा.",
      row3Action: "अनुपस्थित राहणे (नो-शो)",
      row3How: "सवलत वेळेनंतर आपोआप नोंद",
      row3Consequence: "नो-शो म्हणून नोंदवले जाईल. वारंवार नो-शो केल्यास खात्यावर मर्यादा येऊ शकतात.",
      row4Action: "सलूनने रद्द केले",
      row4How: "प्लॅटफॉर्म तुम्हाला सूचित करतो",
      row4Consequence: "पुन्हा बुक करा किंवा दुसरे सलून निवडा. तुमच्यासाठी कोणतेही शुल्क नाही.",
      sec6_1: "6.1 ॲपद्वारे रद्द करा — कृपया ॲपद्वारेच रद्द किंवा रीशेड्युल करा जेणेकरून सलूनला वेळेत सूचना मिळेल.",
      sec6_2: "6.2 वारंवार अनुपस्थिती — वारंवार अनुपस्थित राहिल्यास खात्यावर बुकिंग निर्बंध लादले जाऊ शकतात.",
      sec6_3: "6.3 सलूनचे स्वतःचे धोरण — वैयक्तिक सलूनचे स्वतःचे रद्द करण्याचे नियम असू शकतात.",
      sec6GoodPractice: "चांगली सवय: बुकिंग रद्द केल्यास कोणताही आर्थिक दंड नाही, पण कृपया आधीच रद्द करा जेणेकरून इतर ग्राहक तो स्लॉट घेऊ शकतील.",

      sec7Title: "7. परतावा (रिफंड)",
      sec7Intro: "प्लॅटफॉर्म ग्राहकांकडून कोणतेही पेमेंट गोळा करत नसल्याने, प्लॅटफॉर्म स्तरावर रिफंड लागू होत नाही.",
      sec7_1: "7.1 सेवा रिफंड — तुम्ही सेवेवर असमाधानी असल्यास, पेमेंट करताना थेट सलून पार्टनरशी बोला.",
      sec7_2: "7.2 प्लॅटफॉर्मची भूमिका — प्लॅटफॉर्म ग्राहक आणि सलूनमध्ये मध्यस्थ म्हणून मदत करू शकते.",
      sec7_3: "7.3 तक्रार — वाद न सुटल्यास, ॲपच्या मदत विभागातून तक्रार नोंदवा.",

      sec8Title: "8. आरोग्य, सुरक्षितता आणि ॲलर्जी प्रकटीकरण",
      sec8_1: "8.1 ॲलर्जीची माहिती द्या — सेवा सुरू होण्यापूर्वी तुमच्या स्टायलिस्टला कोणत्याही ॲलर्जी किंवा त्वचेच्या संवेदनशीलतेची माहिती द्या.",
      sec8_2: "8.2 पॅच टेस्ट — कोणत्याही केमिकल ट्रीटमेंट (कलर, ब्लीच, केराटिन) पूर्वी पॅच टेस्टची मागणी करा.",
      sec8_3: "8.3 केमिकल ट्रीटमेंट संमती — केमिकल ट्रीटमेंट बुक करून, तुम्ही त्वचेच्या संवेदनशीलतेची जोखीम स्वीकारता.",
      sec8_4: "8.4 आजार किंवा त्रास — सेवेदरम्यान किंवा नंतर काही त्रास झाल्यास, सेवा त्वरित थांबवा आणि डॉक्टरांचा सल्ला घ्या.",
      sec8_5: "8.5 स्वच्छता मानके — सलून पार्टनर्सना स्वच्छता मानकांचे पालन करणे बंधनकारक आहे.",
      sec8Safety: "सुरक्षितता: सेवेपूर्वी नेहमी तुमच्या स्टायलिस्टला ॲलर्जीबद्दल सांगा. केमिकल ट्रीटमेंटसाठी पॅच टेस्ट कधीही टाळू नका.",

      sec9Title: "9. रेटिंग आणि पुनरावलोकने",
      sec9_1: "9.1 पुनरावलोकन कोण करू शकते — फक्त पडताळणी केलेले बुकिंग पूर्ण केलेले ग्राहकच पुनरावलोकन सादर करू शकतात.",
      sec9_2: "9.2 प्रामाणिक पुनरावलोकने — पुनरावलोकने तुमच्या खऱ्या अनुभवावर आधारित असावीत.",
      sec9_3: "9.3 परवाना — पुनरावलोकन सबमिट करून, तुम्ही ते दाखवण्याचे हक्क प्लॅटफॉर्मला देता.",
      sec9_4: "9.4 नियंत्रण — अयोग्य पुनरावलोकने हटवण्याचा हक्क आम्ही राखून ठेवतो.",
      sec9_5: "9.5 बनावट पुनरावलोकने नाही — बनावट किंवा आमिष दाखवून दिलेली पुनरावलोकने सख्त वर्ज्य आहेत.",

      sec10Title: "10. प्रतिबंधित आचरण",
      sec10Intro: "खालील आचरण सख्त वर्ज्य आहे आणि यामुळे खाते निलंबित केले जाऊ शकते:",
      sec10Items: [
        "नोंदणी किंवा बुकिंग करताना खोटी माहिती देणे.",
        "येण्याचा उद्देश नसताना बनावट बुकिंग करणे.",
        "प्लॅटफॉर्मचा वापर टाळून सलून कर्मचाऱ्यांशी थेट व्यवहार करणे.",
        "सलून कर्मचारी किंवा स्टायलिस्टशी अयोग्य किंवा अपमानास्पद वर्तन.",
        "तक्रार प्रणालीचा गैरवापर करणे.",
        "तुमचे खाते इतर व्यक्तीसोबत शेअर करणे.",
        "प्लॅटफॉर्म सिस्टीम हॅक करण्याचा प्रयत्न करणे.",
        "भारतीय कायद्यानुसार कोणत्याही बेकायदेशीर कामासाठी वापर करणे."
      ],

      sec11Title: "11. खाते निलंबन आणि समाप्ती",
      sec11_1: "11.1 आमचे हक्क — नियमांचे उल्लंघन केल्यास आम्ही तुमचे खाते निलंबित किंवा बंद करू शकतो.",
      sec11_2: "11.2 तुमचा हक्क — तुम्ही ॲप सेटिंग्जमधून कधीही तुमचे खाते बंद करू शकता.",
      sec11_3: "11.3 परिणाम — समाप्तीवर प्रलंबित बुकिंग्ज रद्द केली जातील.",
      sec11_4: "11.4 डेटा जतन — तुमचा डेटा लागू भारतीय कायद्यांनुसार सुरक्षित ठेवला जाईल.",

      sec12Title: "12. प्लॅटफॉर्मची जबाबदारी",
      sec12_1: "12.1 फक्त बुकिंग सुलभकर्ता — प्लॅटफॉर्म हे बुकिंग साधन आहे. सलून सेवेच्या गुणवत्तेसाठी आम्ही जबाबदार नाही.",
      sec12_2: "12.2 पेमेंटची जबाबदारी नाही — आम्ही पेमेंट गोळा करत नाही, त्यामुळे पेमेंट वादांसाठी आमची जबाबदारी नाही.",
      sec12_3: "12.3 जबाबदारीची मर्यादा — भारतीय कायद्यानुसार आमची कमाल जबाबदारी ₹१,००० पर्यंत मर्यादित आहे.",
      sec12_4: "12.4 ग्राहक हक्क — या अटी ग्राहक संरक्षण कायदा २०१९ अंतर्गत तुमचे हक्क कमी करत नाहीत.",

      sec13Title: "13. तक्रार निवारण",
      sec13_1: "13.1 तक्रार अधिकारी — आम्ही कायद्यानुसार तक्रार निवारण अधिकारी नियुक्त केला आहे.",
      sec13_2: "13.2 प्रक्रिया — इन-ॲप मदत विभागाद्वारे तक्रार नोंदवा. आम्ही ४८ तासांत पोच देऊ आणि ३० दिवसांत निवारण करू.",
      sec13_3: "13.3 ग्राहक मंच — तक्रार न सुटल्यास, तुम्ही ग्राहक न्यायालयात संपर्क साधू शकता.",

      sec14Title: "14. नियमन कायदा आणि वाद",
      sec14_1: "14.1 नियमन कायदा — या अटी भारताच्या कायद्यांनुसार शासित आहेत.",
      sec14_2: "14.2 वाद निवारण — वाद प्रथम आमच्या अंतर्गत तक्रार निवारण यंत्रणेद्वारे सोडवले जातील.",
      sec14_3: "14.3 अधिकारक्षेत्र — पुणे, भारत येथील न्यायालयांचे अधिकारक्षेत्र असेल.",

      sec15Title: "15. या अटींमधील बदल",
      sec15_1: "15.1 अपडेट्स — आम्ही वेळोवेळी या अटी अपडेट करू शकतो. ॲपचा पुढील वापर बदलांची स्वीकृती मानला जाईल.",

      sec16Title: "16. गोपनीयता आणि डेटा वापर",
      sec16_1: "16.1 डेटा संकलन — आम्ही सेवा देण्यासाठी तुमचा मोबाईल नंबर आणि बुकिंग तपशील गोळा करतो.",
      sec16_2Title: "16.2 डेटा वापराचा उद्देश — तुमचा डेटा खालील गोष्टींसाठी वापरला जातो:",
      sec16_2List: [
        "खाते पडताळणी आणि लॉगिन",
        "बुकिंग व्यवस्थापन आणि कन्फर्मेशन",
        "ग्राहक सहाय्यता आणि तक्रार निवारण",
        "सेवा-संबंधी सूचना पाठवणे"
      ],
      sec16_3: "16.3 पुश सूचना — प्लॅटफॉर्म वापरून, तुम्ही बुकिंग कन्फर्मेशन आणि स्मरणपत्रे मिळवण्यास संमती देता.",
      sec16_4: "16.4 डेटा शेअरिंग — आम्ही तुमचा वैयक्तिक डेटा विकत नाही.",
      sec16_5: "16.5 डेटा सुरक्षा — तुमचा डेटा डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ अंतर्गत सुरक्षित आहे.",

      sec17Title: "17. खाते हटवणे",
      sec17_1: "17.1 तुम्ही ॲप सेटिंग्ज किंवा सपोर्टशी संपर्क साधून कधीही खाते हटवण्याची विनंती करू शकता.",
      sec17_2Title: "17.2 हटवण्याच्या विनंतीनंतर:",
      sec17_2List: [
        "तुमचे खाते निष्क्रिय केले जाईल",
        "कायदेशीर गरजांनुसार वैयक्तिक डेटा हटवला किंवा अनामित केला जाईल"
      ],
      sec17_3: "17.3 कायदेशीर पालनासाठी काही डेटा राखला जाऊ शकतो.",

      sec18Title: "18. आमच्याशी संपर्क साधा",
      sec18Intro: "प्रश्न, तक्रारी किंवा मदतीसाठी:",
      sec18App: "ॲपमध्ये: मदत → आमच्याशी संपर्क साधा",
      sec18Email: "ईमेल: support@neopaceinfotech.com",
      sec18Officer: "तक्रार अधिकारी: जीवन जोशी",
      sec18Mail: "मेल – Jeevan.j@neopaceinfotech.com",
      sec18Response: "४८ तासांच्या आत उत्तर दिले जाईल",
      footerRights: "© 2026 नियोपार्लर. सर्व हक्क राखीव. | अंतिम अद्यतन: 27 मे 2026"
    }
  };

  const tData = content[lang] || content.en;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black antialiased font-sans text-gray-800 dark:text-gray-300 flex flex-col justify-between">
      
      {/* Main Content Area */}
      <div className="py-12 px-4 flex-grow">
        <div className="max-w-4xl mx-auto bg-white dark:bg-black dark:border dark:border-gray-800 shadow-lg rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{tData.title}</h1>
            <h2 className="text-2xl font-semibold">{tData.subtitle}</h2>
            <div className="mt-6 text-sm opacity-90 flex justify-center gap-8 flex-wrap">
              <p><strong>{tData.version}</strong></p>
              <p><strong>{tData.effectiveDate}</strong></p>
              <p><strong>{tData.governedBy}</strong></p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-8 py-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-purple-700 dark:text-purple-400">
              <a href="#booking-rules" className="hover:underline">{tData.navRules}</a>
              <a href="#cancellation-policy" className="hover:underline">{tData.navCancel}</a>
              <a href="#your-safety" className="hover:underline">{tData.navSafety}</a>
              <a href="#ratings-reviews" className="hover:underline">{tData.navReviews}</a>
            </div>
          </div>

          <div className="p-8 space-y-10 text-gray-800 dark:text-gray-300">
            {/* Important Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-6 rounded-lg">
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-center text-lg leading-relaxed">
                {tData.importantNotice}
              </p>
            </div>

            {/* Section 1 */}
            <section id="who-we-are">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec1Title}</h2>
              <p className="leading-relaxed">{tData.sec1Text1}</p>
              <p className="mt-4 leading-relaxed">{tData.sec1Text2}</p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec2Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec2_1}</p>
                <p>{tData.sec2_2}</p>
                <p>{tData.sec2_3}</p>
                <p>{tData.sec2_4}</p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec3Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec3_1}</p>
                <p>{tData.sec3_2}</p>
                <p>{tData.sec3_3}</p>
                <p>{tData.sec3_4}</p>
                <p>{tData.sec3_5}</p>
                
                <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg">
                  <p className="font-semibold mb-3">{tData.sec3_6Title}</p>
                  <p>{tData.sec3_6Text}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>{tData.sec3_6List1}</li>
                    <li>{tData.sec3_6List2}</li>
                  </ul>
                  <p className="mt-3">{tData.sec3_6Footer}</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="booking-rules">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec4Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec4_1}</p>
                <p>{tData.sec4_2}</p>
                <p>{tData.sec4_3}</p>
                <p>{tData.sec4_4}</p>
                <p>{tData.sec4_5}</p>
                <p>{tData.sec4_6}</p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg mt-6">
                  <p className="font-semibold text-blue-800 dark:text-blue-200">{tData.sec4Tip}</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec5Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec5_1}</p>
                <p>{tData.sec5_2}</p>
                <p>{tData.sec5_3}</p>
                <p>{tData.sec5_4}</p>
                <p>{tData.sec5_5}</p>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-lg mt-6 border border-emerald-200 dark:border-emerald-800/50">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-200">{tData.sec5Important}</p>
                </div>
              </div>
            </section>

            {/* Section 6 - Cancellation Policy */}
            <section id="cancellation-policy">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec6Title}</h2>
              <p className="mb-6">{tData.sec6Intro}</p>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-left font-bold">{tData.thAction}</th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-left font-bold">{tData.thHow}</th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-left font-bold">{tData.thConsequence}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row1Action}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row1How}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row1Consequence}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row2Action}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row2How}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row2Consequence}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row3Action}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row3How}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row3Consequence}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row4Action}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row4How}</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-3">{tData.row4Consequence}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec6_1}</p>
                <p>{tData.sec6_2}</p>
                <p>{tData.sec6_3}</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg mt-6">
                <p className="font-semibold">{tData.sec6GoodPractice}</p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec7Title}</h2>
              <p>{tData.sec7Intro}</p>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200 mt-4">
                <p>{tData.sec7_1}</p>
                <p>{tData.sec7_2}</p>
                <p>{tData.sec7_3}</p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="your-safety">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec8Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec8_1}</p>
                <p>{tData.sec8_2}</p>
                <p>{tData.sec8_3}</p>
                <p>{tData.sec8_4}</p>
                <p>{tData.sec8_5}</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-lg mt-6 border border-red-200 dark:border-red-800/50">
                <p className="font-semibold text-red-800 dark:text-red-200">{tData.sec8Safety}</p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="ratings-reviews">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec9Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec9_1}</p>
                <p>{tData.sec9_2}</p>
                <p>{tData.sec9_3}</p>
                <p>{tData.sec9_4}</p>
                <p>{tData.sec9_5}</p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec10Title}</h2>
              <p className="mb-4">{tData.sec10Intro}</p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700 dark:text-gray-300">
                {tData.sec10Items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec11Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec11_1}</p>
                <p>{tData.sec11_2}</p>
                <p>{tData.sec11_3}</p>
                <p>{tData.sec11_4}</p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec12Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec12_1}</p>
                <p>{tData.sec12_2}</p>
                <p>{tData.sec12_3}</p>
                <p>{tData.sec12_4}</p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec13Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec13_1}</p>
                <p>{tData.sec13_2}</p>
                <p>{tData.sec13_3}</p>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec14Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec14_1}</p>
                <p>{tData.sec14_2}</p>
                <p>{tData.sec14_3}</p>
              </div>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec15Title}</h2>
              <p>{tData.sec15_1}</p>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec16Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec16_1}</p>
                <p>{tData.sec16_2Title}</p>
                <ul className="list-disc pl-8 space-y-1">
                  {tData.sec16_2List.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <p>{tData.sec16_3}</p>
                <p>{tData.sec16_4}</p>
                <p>{tData.sec16_5}</p>
              </div>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec17Title}</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p>{tData.sec17_1}</p>
                <p>{tData.sec17_2Title}</p>
                <ul className="list-disc pl-8 space-y-1">
                  {tData.sec17_2List.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <p>{tData.sec17_3}</p>
              </div>
            </section>

            {/* Section 18 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{tData.sec18Title}</h2>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl">
                <p className="font-medium mb-4">{tData.sec18Intro}</p>
                <div className="space-y-3">
                  <p><strong>{tData.sec18App}</strong></p>
                  <p><strong>{tData.sec18Email}</strong></p>
                  <p>
                    <strong>{tData.sec18Officer}</strong><br />
                    {tData.sec18Mail}<br />
                    <span className="text-sm text-gray-500">{tData.sec18Response}</span>
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Page Specific Minimal Footer */}
          <div className="bg-gray-100 dark:bg-black px-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800">
            {tData.footerRights}
          </div>
        </div>
      </div>

      {/* --- GLOBAL SEO FOOTER --- */}
      <div className="w-full bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <SEOFooter />
      </div>

    </div>
  );
};

export default CustomerTermsAndConditions;
