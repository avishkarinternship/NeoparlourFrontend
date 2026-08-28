import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Download, Scale, Search, CheckCircle } from 'lucide-react';

export default function OwnerTermsAndConditions() {
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

    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleScroll = () => {
        const el = document.getElementById('tnc-content-container');
        if (el) {
            const { scrollTop, scrollHeight, clientHeight } = el;
            if (scrollHeight - scrollTop <= clientHeight + 15) {
                setHasScrolledToBottom(true);
            }
        }
    };

    const handleAcceptTerms = (e) => {
        e.preventDefault();
        if (accepted) {
            setIsSubmitted(true);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const content = {
        en: {
            b2bBadge: "B2B Commercial Agreement",
            title: "Salon Partner Agreement",
            brandInfo: "Brand Name: Neoparlour | Company: Neopace Infotech LLP",
            version: "Version: 1.0",
            effective: "Effective: 27/May/2026",
            printBtn: "Print / Save PDF",
            importantNotice: "IMPORTANT : This is a B2B commercial agreement. By accepting this Agreement during onboarding, you agree to all terms. Customers pay you directly at the salon. The Platform invoices you separately for commission.",
            searchPlaceholder: "Search document sections or keywords (e.g., GST, Commission, SLA)...",
            
            sec1Title: "1. Definitions",
            sec1_1: "'Salon Partner' or 'You' — The business entity or individual operating a salon registered on the Platform.",
            sec1_2: "'Platform' or 'We' — Brand Name Neoparlour, company name Neopace Infotech LLP incorporated under the Limited Liability Partnership (LLP) Act, 2008.",
            sec1_3: "'Booking' — A confirmed customer appointment facilitated through the Platform.",
            sec1_4: "'Booking Value' — The total service price displayed to the customer on the Platform for a confirmed booking, inclusive of applicable GST.",
            sec1_5: "'Commission' — The Platform's fee, expressed as a percentage of the Booking Value, invoiced to you monthly.",
            sec1_6: "'Stylist App' — The Platform's mobile app used by your stylists for queue and appointment management.",
            sec1_7: "'Owner Portal' — The Platform's web or mobile interface for salon configuration, service management, and dashboard access.",
            sec1_8: "'KYC Documents' — Identity proof, business registration, GST, and bank documents required for onboarding.",

            sec2Title: "2. Eligibility & Onboarding",
            sec2_1: "2.1 Legal Status — You must be a legally registered business entity or licensed individual operating a salon in India. Acceptable structures include proprietorship, partnership, LLP, or private limited company.",
            sec2_2Title: "2.2 KYC Requirements — The following documents are required for onboarding:",
            sec2_2Items: [
                "PAN Card (business or individual)",
                "Aadhaar Card or other government-issued ID of the authorised signatory",
                "GST Registration Certificate (if applicable)",
                "Shop and Establishment License or equivalent municipal registration",
                "Salon photos — minimum 3 (exterior, interior, workstation)"
            ],
            sec2_3: "2.3 Verification — The Platform reserves the right to conduct background and document verification and to approve or reject any application at its sole discretion.",
            sec2_4: "2.4 Accuracy — All onboarding information must be accurate and current. Misrepresentation or false documents are grounds for immediate termination and legal action.",
            sec2_5: "2.5 Profile Activation — Your salon profile goes live only after KYC verification and Platform approval.",
            sec2_6: "2.6 Electronic Consent — By completing onboarding and accepting this Agreement via the Platform, you provide legally binding electronic consent under applicable Indian laws.",

            sec3Title: "3. Platform Services Provided to You",
            sec3_1: "3.1 No Booking Guarantee — The Platform does not guarantee any minimum bookings, customers, or revenue.",
            sec3_2: "3.2 License — The Platform grants you a non-exclusive, non-transferable, revocable licence to access and use the Owner Portal.",

            sec4Title: "4. Commission & Payment Model",
            sec4_1: "4.1 Monthly Subscription Invoice — The Platform will issue a tax invoice at the time of subscribed services.",
            sec4_2: "4.2 Disputed Payment — Undisputed amounts remain due on the original payment date.",
            sec4KeyModel: "KEY MODEL — Since the Platform does not collect customer payments, there is no escrow, no payout cycle, and no payment gateway. You collect all service revenue directly.",

            sec5Title: "5. Service & Pricing Management",
            sec5_1: "5.1 Your Pricing Autonomy — You set service prices, service descriptions, and service durations in the Owner Portal.",
            sec5_2Title: "5.2 Pricing Rules — Your pricing on the Platform must comply with:",
            sec5_2Items: [
                "Prices must not be higher than your walk-in prices for equivalent services.",
                "All prices must be inclusive of applicable GST, or GST must be disclosed separately.",
                "Service durations must accurately reflect actual time required."
            ],
            sec5_3: "5.3 Service Charges — You may add, edit, or deactivate services at any time through the Owner Portal.",
            sec5_4: "5.4 Audit Rights — The Platform reserves the right to audit listed prices and flag misleading pricing.",

            sec6Title: "6. Booking Obligations & SLA",
            sec6_1: "6.1 SLA Breach Escalation — First breach: written warning. Second breach: written warning. Third breach: account suspension.",
            sec6_2: "6.2 Walk-in Buffer — You may instruct stylists to block slots for walk-in buffers via the Stylist App.",
            sec6_3: "6.3 Special Hours — Update operating hours promptly for public holidays or special closures.",

            sec7Title: "7. Hygiene, Safety & Compliance",
            sec7_1: "7.1 Legal Compliance — You must comply with all applicable municipal regulations and health laws.",
            sec7_2Title: "7.2 Minimum Hygiene Standards — You must ensure:",
            sec7_2Items: [
                "All reusable tools sterilised between each customer.",
                "Single-use items used once only and immediately disposed of.",
                "Clean towels or disposable covers for each customer.",
                "First-aid kit on premises, accessible to all staff."
            ],

            sec8Title: "8. Tax Obligations",
            sec8_1: "8.1 GST Registration — Obtain GST registration if your annual turnover exceeds INR 20 lakhs.",
            sec8_2: "8.2 GST on Services — You are responsible for charging and remitting GST on your salon services.",

            sec9Title: "9. Stylist Management & Employment",
            sec9_1: "9.1 Your Responsibility — All stylists registered under your account are your employees or contractors.",
            sec9_2: "9.2 Statutory Obligations — You are solely responsible for employment contracts, wages, and statutory contributions.",

            sec10Title: "10. Customer Complaint Handling",
            sec10_1: "10.1 Primary Responsibility — You are primarily responsible for resolving customer complaints.",

            sec11Title: "11. Non-Circumvention & Non-Solicitation",
            sec11_1: "11.1 Off Platform Bookings — You must not solicit Platform customers to book outside the Platform.",

            sec12Title: "12. Intellectual Property",
            sec12_1: "12.1 Platform License — The Platform grants a limited licence to use the Platform name.",

            sec13Title: "13. Indemnity & Insurance",
            sec13_1: "13.1 Indemnity — You shall indemnify the Platform from all claims arising from your service delivery.",

            sec14Title: "14. Term & Termination",
            sec14_1: "14.1 Term — Effective from onboarding approval until terminated by either party.",

            sec15Title: "15. Confidentiality & Data",
            sec15_1: "15.1 DPDP Act — You agree to comply with the Digital Personal Data Protection Act, 2023.",

            sec16Title: "16. Governing Law & Disputes",
            sec16_1: "16.1 Law — This Agreement is governed by the laws of India.",

            sec17Title: "17. Entire Agreement",
            sec17_1: "This Agreement constitutes the entire agreement between you and the Platform.",

            sec18Title: "18. Contact",
            sec18_1: "For Agreement queries: Email: support@neopaceinfotech.com | Contact: +91-9119591956",

            sec19Title: "19. Terms Acceptance Record",
            sec19_1: "The Platform records timestamp, IP details, and agreement version upon acceptance.",

            chkLabel: "I acknowledge and accept the B2B Salon Partner Agreement",
            chkSubLabel: "By checking this box, I extend legally binding electronic consent under Indian law.",
            scrollWarning: "* Please scroll through the legal text entirely to activate the acceptance confirmation checkbox.",
            btnSubmit: "Confirm & Activate Owner Portal",
            successTitle: "Agreement Digitally Executed Successfully",
            successMsg: "Your electronic authorization footprint has been recorded matching standard DPDP and Indian Contract Act terms."
        },
        hi: {
            b2bBadge: "बी2बी वाणिज्यिक समझौता",
            title: "सलून पार्टनर एग्रीमेंट",
            brandInfo: "ब्रांड नाम: नियोपार्लर | कंपनी: नियोपेस इन्फोटेक एलएलपी",
            version: "वर्जन: 1.0",
            effective: "प्रभावी: 27/मई/2026",
            printBtn: "प्रिंट / पीडीएफ सेव करें",
            importantNotice: "महत्वपूर्ण : यह एक बी2बी कमर्शियल एग्रीमेंट है। ऑनबोर्डिंग के दौरान इस एग्रीमेंट को एक्सेप्ट करके, आप सभी रूल्स से सहमत होते हैं। कस्टमर्स आपको सीधे सलून में पेमेंट करते हैं। प्लेटफॉर्म आपको कमीशन के लिए अलग से इनवॉइस इश्यू करता है।",
            searchPlaceholder: "डॉक्यूमेंट सेक्शन या कीवर्ड सर्च करें (जैसे, जीएसटी, कमीशन, एसएलए)...",

            sec1Title: "1. परिभाषाएं",
            sec1_1: "'सलून पार्टनर' या 'आप' — प्लेटफॉर्म पर पंजीकृत सलून का संचालन करने वाली व्यावसायिक संस्था या व्यक्ति।",
            sec1_2: "'प्लेटफॉर्म' या 'हम' — ब्रांड नाम नियोपार्लर, कंपनी का नाम नियोपेस इन्फोटेक एलएलपी।",
            sec1_3: "'बुकिंग' — प्लेटफॉर्म के माध्यम से सुगम बनाई गई ग्राहक की पुष्टि की गई अपॉइंटमेंट।",
            sec1_4: "'बुकिंग मूल्य' — प्लेटफॉर्म पर प्रदर्शित कुल सेवा मूल्य, जीएसटी सहित।",
            sec1_5: "'कमीशन' — बुकिंग मूल्य का प्रतिशत, जो मासिक आधार पर लिया जाता है।",
            sec1_6: "'स्टाइलिस्ट ऐप' — स्टाइलिस्ट द्वारा उपयोग किया जाने वाला मोबाइल ऐप।",
            sec1_7: "'ओनर पोर्टल' — सलून प्रबंधन के लिए वेब/मोबाइल इंटरफेस।",
            sec1_8: "'केवाईसी दस्तावेज़' — पहचान पत्र, व्यवसाय पंजीकरण, जीएसटी आदि।",

            sec2Title: "2. पात्रता और ऑनबोर्डिंग",
            sec2_1: "2.1 कानूनी स्थिति — आपको भारत में कानूनी रूप से पंजीकृत व्यवसाय संस्था होना चाहिए।",
            sec2_2Title: "2.2 केवाईसी आवश्यकताएं — निम्नलिखित दस्तावेज़ आवश्यक हैं:",
            sec2_2Items: [
                "पैन कार्ड (व्यवसाय या व्यक्तिगत)",
                "आधार कार्ड या अन्य सरकारी पहचान पत्र",
                "जीएसटी पंजीकरण प्रमाणपत्र (यदि लागू हो)",
                "दुकान और प्रतिष्ठान लाइसेंस",
                "सलून की तस्वीरें — न्यूनतम 3"
            ],
            sec2_3: "2.3 सत्यापन — प्लेटफॉर्म दस्तावेजों की जांच करने का अधिकार सुरक्षित रखता है।",
            sec2_4: "2.4 सटीकता — ऑनबोर्डिंग की सभी जानकारी सटीक और अद्यतन होनी चाहिए।",
            sec2_5: "2.5 प्रोफ़ाइल सक्रियण — आपकी सलून प्रोफ़ाइल केवल केवाईसी सत्यापन के बाद लाइव होती है।",
            sec2_6: "2.6 इलेक्ट्रॉनिक सहमति — प्लेटफॉर्म के माध्यम से इस समझौते को स्वीकार करके, आप कानूनी रूप से बाध्यकारी सहमति प्रदान करते हैं।",

            sec3Title: "3. आपको प्रदान की जाने वाली सेवाएं",
            sec3_1: "3.1 न्यूनतम बुकिंग की कोई गारंटी नहीं — प्लेटफॉर्म न्यूनतम बुकिंग या राजस्व की गारंटी नहीं देता है।",
            sec3_2: "3.2 लाइसेंस — प्लेटफॉर्म आपको ओनर पोर्टल का उपयोग करने का लाइसेंस प्रदान करता है।",

            sec4Title: "4. कमीशन और भुगतान मॉडल",
            sec4_1: "4.1 मासिक सदस्यता चालान — प्लेटफॉर्म सेवाओं की सदस्यता के समय कर चालान जारी करेगा।",
            sec4_2: "4.2 विवादित भुगतान — अविवादित राशियां मूल भुगतान तिथि पर देय रहेंगी।",
            sec4KeyModel: "मुख्य मॉडल — चूंकि प्लेटफॉर्म ग्राहकों से भुगतान एकत्र नहीं करता है, इसलिए आप सभी सेवा राजस्व सीधे एकत्र करते हैं।",

            sec5Title: "5. सेवा और मूल्य निर्धारण प्रबंधन",
            sec5_1: "5.1 आपकी मूल्य निर्धारण स्वायत्तता — आप ओनर पोर्टल में सेवाओं की कीमतें तय करते हैं।",
            sec5_2Title: "5.2 मूल्य निर्धारण नियम:",
            sec5_2Items: [
                "कीमतें आपके वॉकिन दरों से अधिक नहीं होनी चाहिए।",
                "सभी कीमतें लागू जीएसटी सहित होनी चाहिए।"
            ],
            sec5_3: "5.3 सेवा शुल्क — आप किसी भी समय सेवाओं को जोड़ या संपादित कर सकते हैं।",
            sec5_4: "5.4 ऑडिट अधिकार — प्लेटफॉर्म कीमतों का ऑडिट करने का अधिकार रखता है।",

            sec6Title: "6. बुकिंग दायित्व और एसएलए",
            sec6_1: "6.1 एसएलए उल्लंघन — पहली बार लिखित चेतावनी, दूसरी बार चेतावनी, तीसरी बार खाता निलंबन।",
            sec6_2: "6.2 वॉकिन बफर — स्टाइलिस्ट ऐप के माध्यम से स्लॉट ब्लॉक किए जा सकते हैं।",
            sec6_3: "6.3 विशेष समय — छुट्टियों के लिए समय तुरंत अपडेट करें।",

            sec7Title: "7. स्वच्छता, सुरक्षा और अनुपालन",
            sec7_1: "7.1 कानूनी अनुपालन — आपको सभी स्वास्थ्य और सुरक्षा कानूनों का पालन करना होगा।",
            sec7_2Title: "7.2 न्यूनतम स्वच्छता मानक:",
            sec7_2Items: [
                "प्रत्येक ग्राहक के बाद औजारों को स्टरलाइज़ करें।",
                "एकल-उपयोग वाली वस्तुओं का उपयोग केवल एक बार करें।",
                "साफ तौलिए और प्राथमिक चिकित्सा किट उपलब्ध रखें।"
            ],

            sec8Title: "8. कर दायित्व",
            sec8_1: "8.1 जीएसटी पंजीकरण — यदि टर्नओवर ₹20 लाख से अधिक है तो जीएसटी पंजीकरण प्राप्त करें।",
            sec8_2: "8.2 सेवाओं पर जीएसटी — आप सेवाओं पर जीएसटी जमा करने के लिए जिम्मेदार हैं।",

            sec9Title: "9. स्टाइलिस्ट प्रबंधन",
            sec9_1: "9.1 आपकी जिम्मेदारी — पंजीकृत स्टाइलिस्ट आपके कर्मचारी हैं, प्लेटफॉर्म के नहीं।",
            sec9_2: "9.2 वैधानिक दायित्व — वेतन और श्रम अनुपालन के लिए आप जिम्मेदार हैं।",

            sec10Title: "10. शिकायत निवारण",
            sec10_1: "10.1 प्राथमिक जिम्मेदारी — आप ग्राहक शिकायतों के समाधान के लिए जिम्मेदार हैं।",

            sec11Title: "11. गैर-उल्लंघन नियम",
      sec11_1: "11.1 प्लेटफॉर्म के बाहर बुकिंग न कराएं।",

            sec12Title: "12. बौद्धिक संपदा",
            sec12_1: "12.1 ब्रांड का सीमित उपयोग लाइसेंस।",

            sec13Title: "13. क्षतिपूर्ति",
            sec13_1: "13.1 सेवा वितरण से उत्पन्न दावों से प्लेटफॉर्म की क्षतिपूर्ति करें।",

            sec14Title: "14. अवधि और समाप्ति",
            sec14_1: "14.1 30 दिनों के लिखित नोटिस से समाप्त किया जा सकता है।",

            sec15Title: "15. डेटा सुरक्षा",
            sec15_1: "15.1 डीपीडब्ल्यूपी अधिनियम 2023 का पालन करें।",

            sec16Title: "16. शासी कानून",
            sec16_1: "16.1 यह समझौता भारत के कानूनों द्वारा शासित है।",

            sec17Title: "17. संपूर्ण समझौता",
            sec17_1: "यह समझौता दोनों पक्षों के बीच पूर्ण समझौते का गठन करता है।",

            sec18Title: "18. संपर्क करें",
            sec18_1: "ईमेल: support@neopaceinfotech.com | संपर्क: +91-9119591956",

            sec19Title: "19. स्वीकृति रिकॉर्ड",
            sec19_1: "स्वीकृति का समय, आईपी और संस्करण दर्ज किया जाएगा।",

            chkLabel: "मैं बी2बी सलून पार्टनर समझौते को स्वीकार करता हूं",
            chkSubLabel: "इस बॉक्स को चेक करके, मैं कानूनी रूप से बाध्यकारी सहमति देता हूं।",
            scrollWarning: "* कृपया चेकबॉक्स सक्षम करने के लिए पूरे कानूनी पाठ को स्क्रॉल करें।",
            btnSubmit: "पुष्टि करें और पोर्टल सक्रिय करें",
            successTitle: "समझौता सफलतापूर्वक निष्पादित हुआ",
            successMsg: "आपकी इलेक्ट्रॉनिक सहमति भारतीय कानून के अनुसार दर्ज कर ली गई है।"
        },
        mr: {
            b2bBadge: "बी२बी कमर्शियल एग्रीमेंट",
            title: "सलून पार्टनर एग्रीमेंट",
            brandInfo: "ब्रांड नाव: नियोपार्लर | कंपनी: नियोपेस इन्फोटेक एलएलपी",
            version: "वर्जन: 1.0",
            effective: "प्रभावी: 27/मे/2026",
            printBtn: "प्रिंट / पीडीएफ सेव्ह करा",
            importantNotice: "महत्त्वाचे : हा बी२बी कमर्शियल एग्रीमेंट आहे. ऑनबोर्डिंगदरम्यान हा एग्रीमेंट स्वीकारून, तुम्ही सर्व अटींशी सहमत होता. ग्राहक तुम्हाला थेट सलूनमध्ये पेमेंट करतात. प्लॅटफॉर्म तुम्हाला कमिशनसाठी स्वतंत्रपणे इनव्हॉइस पाठवतो.",
            searchPlaceholder: "डॉक्युमेंट सेक्शन किंवा शब्द शोधा (उदा. जीएसटी, कमिशन, एसएलए)...",

            sec1Title: "1. व्याख्या",
            sec1_1: "'सलून पार्टनर' किंवा 'तुम्ही' — प्लॅटफॉर्मवर नोंदणीकृत सलून चालवणारी व्यावसायिक संस्था किंवा व्यक्ती.",
            sec1_2: "'प्लॅटफॉर्म' किंवा 'आम्ही' — ब्रांड नाव नियोपार्लर, कंपनीचे नाव नियोपेस इन्फोटेक एलएलपी.",
            sec1_3: "'बुकिंग' — प्लॅटफॉर्मद्वारे निश्चित केलेली ग्राहक अपॉइंटमेंट.",
            sec1_4: "'बुकिंग मूल्य' — प्लॅटफॉर्मवर दाखवलेली एकूण सेवा किंमत (जीएसटीसह).",
            sec1_5: "'कमिशन' — बुकिंग मूल्याची टक्केवारी, जी मासिक आकारली जाते.",
            sec1_6: "'स्टायलिस्ट ॲप' — स्टायलिस्टद्वारे वापरले जाणारे ॲप.",
            sec1_7: "'ओनर पोर्टल' — सलून व्यवस्थापनासाठी वेब/मोबाइल इंटरफेस.",
            sec1_8: "'केवायसी दस्तऐवज' — ओळखपत्र, व्यवसाय नोंदणी, जीएसटी इ.",

            sec2Title: "2. पात्रता आणि ऑनबोर्डिंग",
            sec2_1: "2.1 कायदेशीर स्थिती — तुम्ही भारतात कायदेशीर नोंदणीकृत व्यवसाय संस्था असणे आवश्यक आहे.",
            sec2_2Title: "2.2 केवायसी गरजा — खालील दस्तऐवज आवश्यक आहेत:",
            sec2_2Items: [
                "पॅन कार्ड (व्यवसाय किंवा वैयक्तिक)",
                "आधार कार्ड किंवा इतर सरकारी ओळखपत्र",
                "जीएसटी नोंदणी प्रमाणपत्र (लागू असल्यास)",
                "दुकान आणि आस्थापना परवाना",
                "सलूनचे फोटो — किमान ३"
            ],
            sec2_3: "2.3 पडताळणी — प्लॅटफॉर्म दस्तऐवजांची पडताळणी करण्याचा हक्क राखून ठेवतो.",
            sec2_4: "2.4 अचूकता — सर्व माहिती अचूक आणि अद्ययावत असावी.",
            sec2_5: "2.5 प्रोफाइल सक्रिय करणे — केवायसी पडताळणीनंतरच प्रोफाइल लाईव्ह होते.",
            sec2_6: "2.6 इलेक्ट्रॉनिक संमती — हा करार स्वीकारून तुम्ही कायदेशीर संमती देता.",

            sec3Title: "3. पुरवल्या जाणाऱ्या सेवा",
            sec3_1: "3.1 बुकिंगची कोणतीही हमी नाही — प्लॅटफॉर्म किमान बुकिंगची हमी देत नाही.",
            sec3_2: "3.2 परवाना — प्लॅटफॉर्म तुम्हाला ओनर पोर्टल वापरण्याचा परवाना देतो.",

            sec4Title: "4. कमिशन आणि पेमेंट मॉडेल",
            sec4_1: "4.1 मासिक सबस्क्रिप्शन इनव्हॉइस — प्लॅटफॉर्म सबस्क्रिप्शनवेळी इनव्हॉइस जारी करेल.",
            sec4_2: "4.2 वादग्रस्त पेमेंट — मूळ तारखेला देय राहील.",
            sec4KeyModel: "मुख्य मॉडेल — प्लॅटफॉर्म ग्राहक पेमेंट गोळा करत नसल्याने, तुम्ही सर्व उत्पन्न थेट गोळा करता.",

            sec5Title: "5. सेवा आणि दर व्यवस्थापन",
            sec5_1: "5.1 दरांचे स्वातंत्र्य — तुम्ही ओनर पोर्टलवर सेवांचे दर ठरवता.",
            sec5_2Title: "5.2 दरांचे नियम:",
            sec5_2Items: [
                "दर तुमच्या थेट दरांपेक्षा जास्त नसावेत.",
                "सर्व दर जीएसटीसह असावेत."
            ],
            sec5_3: "5.3 सेवा जोडणे — तुम्ही कधीही सेवा बदलू शकता.",
            sec5_4: "5.4 ऑडिट हक्क — प्लॅटफॉर्म दरांची तपासणी करू शकतो.",

            sec6Title: "6. बुकिंग आणि एसएलए नियम",
            sec6_1: "6.1 एसएलए उल्लंघन — पहिल्या वेळी ताकीद, दुसऱ्या वेळी ताकीद, तिसऱ्या वेळी खाते निलंबन.",
            sec6_2: "6.2 वॉकिन बफर — स्टायलिस्ट ॲपद्वारे स्लॉट ब्लॉक करता येतात.",
            sec6_3: "6.3 सुट्ट्यांचे दिवस — वेळेवर अपडेट करा.",

            sec7Title: "7. स्वच्छता आणि सुरक्षा",
            sec7_1: "7.1 कायदेशीर पालन — आरोग्य आणि सुरक्षा कायद्यांचे पालन करा.",
            sec7_2Title: "7.2 स्वच्छता मानके:",
            sec7_2Items: [
                "प्रत्येक ग्राहकानंतर हत्यारे निर्जंतुक करा.",
                "एकदाच वापरायच्या वस्तू पुन्हा वापरू नका.",
                "स्वच्छ टॉवेल्स आणि प्रथमोपचार किट ठेवा."
            ],

            sec8Title: "8. कर दायित्वे",
            sec8_1: "8.1 जीएसटी नोंदणी — उत्पन्न ₹२० लाखांपेक्षा जास्त असल्यास नोंदणी करा.",
            sec8_2: "8.2 सेवांवर जीएसटी — तुम्ही जीएसटी भरण्यास जबाबदार आहात.",

            sec9Title: "9. स्टायलिस्ट व्यवस्थापन",
            sec9_1: "9.1 तुमची जबाबदारी — स्टायलिस्ट तुमचे कर्मचारी आहेत.",
            sec9_2: "9.2 कायदेशीर दायित्वे — पगार आणि कायद्यांचे पालन तुमची जबाबदारी आहे.",

            sec10Title: "10. तक्रार निवारण",
            sec10_1: "10.1 प्राथमिक जबाबदारी — तक्रारी सोडवणे तुमची जबाबदारी आहे.",

            sec11Title: "11. बाहेरील बुकिंग नाही",
      sec11_1: "11.1 ग्राहकांना प्लॅटफॉर्मबाहेर बुकिंग करण्यास सांगू नका.",

            sec12Title: "12. बौद्धिक संपदा",
            sec12_1: "12.1 ब्रँड नावाचा मर्यादित वापर.",

            sec13Title: "13. भरपाई",
            sec13_1: "13.1 सेवा दाव्यांपासून प्लॅटफॉर्मचे संरक्षण करा.",

            sec14Title: "14. कालावधी आणि समाप्ती",
            sec14_1: "14.1 ३० दिवसांच्या सूचनेने समाप्त करता येईल.",

            sec15Title: "15. डेटा सुरक्षा",
            sec15_1: "15.1 डीपीडीपी कायद्याचे पालन करा.",

            sec16Title: "16. नियमन कायदा",
            sec16_1: "16.1 हा करार भारताच्या कायद्यांनुसार चालतो.",

            sec17Title: "17. संपूर्ण करार",
            sec17_1: "हा अंतिम करार आहे.",

            sec18Title: "18. संपर्क",
            sec18_1: "ईमेल: support@neopaceinfotech.com | संपर्क: +91-9119591956",

            sec19Title: "19. संमती नोंद",
            sec19_1: "स्वीकृतीची वेळ आणि आयपी नोंदवला जाईल.",

            chkLabel: "मी बी२बी सलून पार्टनर करार स्वीकारतो",
            chkSubLabel: "या बॉक्सवर टिक करून मी कायदेशीर संमती देतो.",
            scrollWarning: "* चेकबॉक्स सक्षम करण्यासाठी संपूर्ण मजकूर स्क्रोल करा.",
            btnSubmit: "पुष्टी करा आणि पोर्टल सुरू करा",
            successTitle: "करार यशस्वीरित्या स्वीकारला गेला",
            successMsg: "तुमची संमती भारतीय कायद्यानुसार नोंदवली गेली आहे."
        }
    };

    const tData = content[lang] || content.en;

    return (
        <div className="w-full min-h-screen bg-gray-50 text-gray-800 font-sans antialiased py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">

            {/* Upper Brand Identification Branding Layout Card */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-8 print:border-0 print:shadow-none">
                <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-red-100 text-[#FF1100] px-2.5 py-1 rounded-md uppercase tracking-wider">
                                {tData.b2bBadge}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mt-2">
                            {tData.title}
                        </h1>
                        <p className="text-xs font-semibold text-gray-400">
                            {tData.brandInfo}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500 self-start sm:self-center print:hidden flex-wrap">
                        {/* Language Selection Pills */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                type="button"
                                onClick={() => { i18n.changeLanguage('en'); navigate('/owner/english/terms-and-conditions'); }}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${lang === 'en' ? 'bg-[#FF1100] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => { i18n.changeLanguage('hi'); navigate('/owner/hindi/terms-and-conditions'); }}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${lang === 'hi' ? 'bg-[#FF1100] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                हिंदी
                            </button>
                            <button
                                type="button"
                                onClick={() => { i18n.changeLanguage('mr'); navigate('/owner/marathi/terms-and-conditions'); }}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${lang === 'mr' ? 'bg-[#FF1100] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                मराठी
                            </button>
                        </div>

                        <div className="text-right hidden sm:block">
                            <p><span className="font-bold text-gray-900">{tData.version}</span></p>
                            <p><span className="font-bold text-gray-900">{tData.effective}</span></p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                            title="Print Agreement"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold">{tData.printBtn}</span>
                        </button>
                    </div>
                </div>

                {/* Quick Reference Warning Banner Box Row */}
                <div className="p-4 bg-amber-50/60 border-b border-amber-100 px-6 sm:px-8 flex gap-3 print:hidden">
                    <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                        {tData.importantNotice}
                    </p>
                </div>

                {/* Content Interactive Navigation Search Bar */}
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 flex items-center gap-2 print:hidden">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={tData.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-xs font-medium text-gray-700 placeholder-gray-400"
                    />
                </div>

                {/* LEGAL DOCUMENTATION BODY */}
                <div
                    id="tnc-content-container"
                    onScroll={handleScroll}
                    className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto scroll-smooth space-y-6 text-xs sm:text-[13px] leading-relaxed text-gray-600 print:max-h-none print:overflow-visible"
                >
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                            <span className="text-[#FF1100]">1.</span> {tData.sec1Title}
                        </h3>
                        <ul className="space-y-1.5 list-none pl-0 font-medium">
                            <li>{tData.sec1_1}</li>
                            <li>{tData.sec1_2}</li>
                            <li>{tData.sec1_3}</li>
                            <li>{tData.sec1_4}</li>
                            <li>{tData.sec1_5}</li>
                            <li>{tData.sec1_6}</li>
                            <li>{tData.sec1_7}</li>
                            <li>{tData.sec1_8}</li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">2.</span> {tData.sec2Title}
                        </h3>
                        <p>{tData.sec2_1}</p>
                        <p><strong>{tData.sec2_2Title}</strong></p>
                        <ul className="list-disc pl-5 space-y-1 font-medium">
                            {tData.sec2_2Items.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                        <p>{tData.sec2_3}</p>
                        <p>{tData.sec2_4}</p>
                        <p>{tData.sec2_5}</p>
                        <p>{tData.sec2_6}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">3.</span> {tData.sec3Title}
                        </h3>
                        <p>{tData.sec3_1}</p>
                        <p>{tData.sec3_2}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">4.</span> {tData.sec4Title}
                        </h3>
                        <p>{tData.sec4_1}</p>
                        <p>{tData.sec4_2}</p>
                        <p className="font-bold text-gray-800">{tData.sec4KeyModel}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">5.</span> {tData.sec5Title}
                        </h3>
                        <p>{tData.sec5_1}</p>
                        <p><strong>{tData.sec5_2Title}</strong></p>
                        <ul className="list-disc pl-5 space-y-1 font-medium">
                            {tData.sec5_2Items.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                        <p>{tData.sec5_3}</p>
                        <p>{tData.sec5_4}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">6.</span> {tData.sec6Title}
                        </h3>
                        <p>{tData.sec6_1}</p>
                        <p>{tData.sec6_2}</p>
                        <p>{tData.sec6_3}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">7.</span> {tData.sec7Title}
                        </h3>
                        <p>{tData.sec7_1}</p>
                        <p><strong>{tData.sec7_2Title}</strong></p>
                        <ul className="list-disc pl-5 space-y-1 font-medium">
                            {tData.sec7_2Items.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">8.</span> {tData.sec8Title}
                        </h3>
                        <p>{tData.sec8_1}</p>
                        <p>{tData.sec8_2}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">9.</span> {tData.sec9Title}
                        </h3>
                        <p>{tData.sec9_1}</p>
                        <p>{tData.sec9_2}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">10.</span> {tData.sec10Title}
                        </h3>
                        <p>{tData.sec10_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">11.</span> {tData.sec11Title}
                        </h3>
                        <p>{tData.sec11_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">12.</span> {tData.sec12Title}
                        </h3>
                        <p>{tData.sec12_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">13.</span> {tData.sec13Title}
                        </h3>
                        <p>{tData.sec13_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">14.</span> {tData.sec14Title}
                        </h3>
                        <p>{tData.sec14_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">15.</span> {tData.sec15Title}
                        </h3>
                        <p>{tData.sec15_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">16.</span> {tData.sec16Title}
                        </h3>
                        <p>{tData.sec16_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">17.</span> {tData.sec17Title}
                        </h3>
                        <p>{tData.sec17_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">18.</span> {tData.sec18Title}
                        </h3>
                        <p>{tData.sec18_1}</p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">19.</span> {tData.sec19Title}
                        </h3>
                        <p>{tData.sec19_1}</p>
                    </section>
                </div>
            </div>

            {/* ACTION AREA */}
            <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-200/80 print:hidden max-w-4xl mx-auto rounded-2xl">
                {!isSubmitted ? (
                    <form onSubmit={handleAcceptTerms} className="space-y-4">
                        <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${accepted ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-100/50 border-gray-200'}`}>
                            <input
                                type="checkbox"
                                disabled={!hasScrolledToBottom}
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="w-4 h-4 text-[#FF1100] focus:ring-[#FF1100] border-gray-300 rounded mt-0.5 accent-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="text-xs space-y-0.5">
                                <p className={`font-bold ${hasScrolledToBottom ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {tData.chkLabel}
                                </p>
                                <p className="text-gray-500 leading-normal">
                                    {tData.chkSubLabel}
                                </p>
                                {!hasScrolledToBottom && (
                                    <p className="text-[11px] font-bold text-amber-600 mt-1 animate-pulse">
                                        {tData.scrollWarning}
                                    </p>
                                )}
                            </div>
                        </label>

                        <div className="flex items-center justify-end pt-2">
                            <button
                                type="submit"
                                disabled={!accepted || !hasScrolledToBottom}
                                className="h-11 px-8 bg-[#FF1100] text-white text-xs font-bold tracking-wider rounded-xl uppercase transition-all duration-200 shadow-md shadow-red-500/10 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed hover:bg-red-700 hover:scale-[1.01] cursor-pointer"
                            >
                                {tData.btnSubmit}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3.5">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                            <h4 className="font-bold text-emerald-900">{tData.successTitle}</h4>
                            <p className="text-emerald-700 font-medium">
                                {tData.successMsg}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}