import React, { useState } from 'react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: '1. Introduction', icon: '✨' },
    { id: 'info-collect', label: '2. Data Collection', icon: '📊' },
    { id: 'how-we-use', label: '3. Data Usage', icon: '⚙️' },
    { id: 'sharing', label: '4. Information Sharing', icon: '🤝' },
    { id: 'payments', label: '5. Payments', icon: '💳' },
    { id: 'notifications', label: '6. Push Notifications', icon: '🔔' },
    { id: 'retention', label: '7. Data Retention', icon: '⏳' },
    { id: 'deletion', label: '8. Account Deletion', icon: '🗑️' },
    { id: 'security', label: '9. Data Security', icon: '🛡️' },
    { id: 'rights', label: '10. Your Rights', icon: '⚖️' },
    { id: 'third-party', label: '11. Third-Party Services', icon: '🔌' },
    { id: 'children', label: '12. Children’s Privacy', icon: '👶' },
    { id: 'changes', label: '13. Policy Changes', icon: '🔄' },
    { id: 'contact', label: '14. Contact Us', icon: '✉️' },
    { id: 'consent', label: '15. Legal Consent', icon: '✅' },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Accounts for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-600 antialiased selection:bg-[#FF0B01]/10 selection:text-[#FF0B01]">
      
      {/* Decorative Brand Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

      {/* Main Sticky Navbar */}
      <header className="relative border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 py-5 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#FF0B01] animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF0B01]">Legal Portal</p>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">Privacy Policy</h1>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="text-xs text-slate-400 font-bold tracking-wide">NeoParlour Customer App</span>
            <div className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-slate-800">
              Effective: 27 May 2026
            </div>
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Column */}
        <aside className="lg:w-72 shrink-0 hidden lg:block sticky top-28 h-[calc(100vh-9rem)] overflow-y-auto pr-2 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 px-2">Table of Contents</p>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group ${
                  activeSection === section.id
                    ? 'bg-[#FF0B01] text-white shadow-md shadow-[#FF0B01]/20 transform translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`text-sm transition-transform group-hover:scale-110 ${activeSection === section.id ? 'brightness-100' : 'opacity-60'}`}>
                  {section.icon}
                </span>
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 bg-white p-6 sm:p-12 rounded-2xl shadow-xs border border-slate-200/60 space-y-12 relative">
          
          <section id="introduction" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">1.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Introduction</h2>
            <p className="leading-relaxed text-slate-600">
              <span className="font-extrabold text-slate-900">NeoParlour</span> (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is a salon booking marketplace that connects customers with independent salon partners.
            </p>
            <p className="leading-relaxed text-slate-600">
              This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our mobile application and services. By using the Platform, you agree to the terms outlined in this document.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section id="info-collect" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">2.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Information We Collect</h2>
            <p className="text-slate-600">We group the localized metrics we collect into four high-level profiles:</p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">👤 2.1 Personal Information</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-500">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Full Name</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Mobile Number (OTP-based login)</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Email Address (optional)</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Gender & Date of Birth (if provided)</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Address (if provided)</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">📅 2.2 Booking Information</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-500">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Selected services</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Appointment date and time</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Salon details</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Booking history</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">💻 2.3 Device & Technical Information</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-500">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Device type and OS version</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> App usage and interaction data</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> IP address (where applicable)</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">📣 2.4 Push Notification Data</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-500">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Firebase Cloud Messaging (FCM) token</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#FF0B01]" /> Personal notification configurations</li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section id="how-we-use" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">3.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">How We Use Your Information</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
              {[
                'Create, manage, and verify customer identities',
                'Authenticate secure logins cleanly using OTP verification',
                'Facilitate seamless booking routes to partner salons',
                'Provide direct booking updates and real-time reminders',
                'Analyze traffic to patch or optimize UI system engines',
                'Deliver contextual or promotional rewards'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="text-[#FF0B01] text-sm">✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          <section id="sharing" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">4.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sharing of Information</h2>
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs">
              <span>🛡️</span> Data Integrity Shield: We do NOT sell or cross-monetize your personal parameters.
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-4">
                <div className="bg-[#FF0B01]/10 text-[#FF0B01] px-2 py-0.5 rounded-md text-[10px] font-extrabold mt-0.5">4.1</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Salon Partners</h4>
                  <p className="text-xs text-slate-500 mt-0.5">We securely route specific profile blocks down to chosen Salons to actively complete your appointment requests.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#FF0B01]/10 text-[#FF0B01] px-2 py-0.5 rounded-md text-[10px] font-extrabold mt-0.5">4.2</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Infrastructure Service Providers</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Firebase systems hosting tracking metrics and platform communication notifications.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#FF0B01]/10 text-[#FF0B01] px-2 py-0.5 rounded-md text-[10px] font-extrabold mt-0.5">4.3</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Legal Requirements</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Disclosed solely under standard statutory verification updates or active state mandates.</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section id="payments" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">5.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payments</h2>
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-xl flex gap-4 items-start">
              <span className="text-amber-600 text-lg mt-0.5">⚠️</span>
              <div className="text-xs space-y-1.5 font-bold text-amber-900/90">
                <p>• All customer payments are processed directly at the physical salon side.</p>
                <p>• NeoParlour does NOT collect, handle, or vault customer transaction metrics.</p>
                <p>• We remain unlinked to transaction errors or separate store ledger disputes.</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section id="notifications" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">6.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Push Notifications</h2>
            <p className="text-slate-600 mb-2">By continuing with the application, you agree to receive sync operations including booking logs, custom slot reminders, platform variants, and optional promotional paths.</p>
            <p className="text-xs text-slate-400 font-semibold italic">You can alter notification flags inside system hardware preferences at any point.</p>
          </section>

          <hr className="border-slate-100" />

          <section id="retention" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">7.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Retention</h2>
            <p className="text-slate-600">We safely house data parameters for the full lifetime of your active profile instance, or strictly to maintain regulatory, auditing, or fraud security alignment.</p>
          </section>

          <hr className="border-slate-100" />

          <section id="deletion" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">8.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Deletion</h2>
            <p className="text-slate-600 mb-4">Request secure profiling cleanups using your native app settings view or by routing a direct query to support.</p>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-5">
              <h4 className="font-bold text-rose-900 mb-2 text-xs uppercase tracking-wide">Following explicit clean requests:</h4>
              <ul className="space-y-1.5 text-xs font-semibold text-rose-800">
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-rose-400" /> Target profiles become immediately non-accessible.</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-rose-400" /> Variables mask through clean hashing patterns.</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-rose-400" /> Fixed baseline footprints remain locked down if state auditing rules require them.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section id="security" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">9.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Security</h2>
            <p className="text-slate-600">
              We activate modern operational defenses to limit outside vector leaks. However, please remember that no structural cloud deployment offers total, absolute safety assurance.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section id="rights" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">10.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Rights</h2>
            <p className="text-slate-600 mb-4">Under statutory benchmarks including India&apos;s **Digital Personal Data Protection (DPDP) Act, 2023**, you maintain absolute enforcement control over:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[11px] font-extrabold tracking-tight">
              {['Data Record Access', 'Correction Requests', 'Complete Erasure', 'Consent Revocation'].map((right, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 hover:border-[#FF0B01]/20 transition-colors">
                  {right}
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          <section id="third-party" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">11.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Third-Party Services</h2>
            <p className="text-slate-600">
              Analytical systems and messaging nodes track localized tracking segments governed by their independent security frameworks.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section id="children" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">12.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Children’s Privacy</h2>
            <p className="text-slate-600">
              Onboarding requires users to be at least 18. Profiles for minors are invalid unless supervised directly under an active parent or guardian framework.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section id="changes" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">13.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Changes to This Policy</h2>
            <p className="text-slate-600">
              Amendments deploy seamlessly upon interface update updates. Continued application engagement signals a clean alignment with revised parameters.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section id="contact" className="space-y-4">
            <div className="inline-flex items-center justify-center px-2.5 py-1 bg-[#FF0B01]/5 text-[#FF0B01] rounded-lg mb-2 font-black text-xs border border-[#FF0B01]/10">14.0</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contact Us</h2>
            <p className="text-slate-600 mb-4">Direct legal escalations or profile questions straight to our desk:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:support@neoparlour.com" className="inline-flex items-center justify-center px-5 py-3 bg-[#FF0B01] hover:bg-[#D60A00] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF0B01]/10 transition-colors duration-150">
                ✉️ support@neoparlour.com
              </a>
              <div className="inline-flex items-center justify-center px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                📱 Native App: Help Desk
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          <section id="consent" className="p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-xl text-white space-y-3 shadow-lg border-l-4 border-[#FF0B01]">
            <h2 className="text-md font-black tracking-tight flex items-center gap-2">
              <span className="text-[#FF0B01]">●</span> 15.0 Consent Declaration
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Interacting inside the platform signals an explicit affirmation of this privacy configuration, providing clear agreement validation for the tracking parameters listed above.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;