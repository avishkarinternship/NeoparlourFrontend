import React from 'react';
import SEOFooter from '../common/SEOFooter';

const CustomerTermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black antialiased font-sans text-gray-800 dark:text-gray-300 flex flex-col justify-between">
      
      {/* Main Content Area */}
      <div className="py-12 px-4 flex-grow">
        <div className="max-w-4xl mx-auto bg-white dark:bg-black dark:border dark:border-gray-800 shadow-lg rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">SALON BOOKING PLATFORM</h1>
            <h2 className="text-2xl font-semibold">Terms &amp; Conditions for Customers</h2>
            <div className="mt-6 text-sm opacity-90 flex justify-center gap-8">
              <p><strong>Version 1.0</strong></p>
              <p><strong>Effective Date: 27/05/26</strong></p>
              <p><strong>Governed by Indian Law</strong></p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-8 py-4">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-purple-700 dark:text-purple-400">
              <a href="#booking-rules" className="hover:underline">Booking Rules</a>
              <a href="#cancellation-policy" className="hover:underline">Cancellation Policy</a>
              <a href="#your-safety" className="hover:underline">Your Safety</a>
              <a href="#ratings-reviews" className="hover:underline">Ratings &amp; Reviews</a>
            </div>
          </div>

          <div className="p-8 space-y-10 text-gray-800 dark:text-gray-300">
            {/* Important Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-6 rounded-lg">
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-center text-lg">
                IMPORTANT: These Terms form a legally binding agreement between you and the Platform. 
                By creating an account or making a booking, you accept these Terms in full.
              </p>
            </div>

            {/* Section 1 */}
            <section id="who-we-are">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. WHO WE ARE &amp; WHAT WE DO</h2>
              <p className="leading-relaxed">
                [Neoparlour ] (&apos;Platform&apos;, &apos;We&apos;, &apos;Us&apos;) is a technology-based salon booking marketplace. We connect customers with independently operated salons (&apos;Salon Partners&apos;) through our mobile application and website.
              </p>
              <p className="mt-4 leading-relaxed">
                We are a booking facilitator only. We do not provide salon services, employ stylists, or collect payment for services. All salon services are delivered by Salon Partners, and all payments for services are made directly by you to the salon after your service is completed.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. ELIGIBILITY</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>2.1 Age</strong> — You must be at least 18 years old to register and book on this Platform.</p>
                <p><strong>2.2 Minors</strong> — Persons below 18 may use the Platform only with the consent and supervision of a parent or legal guardian, who accepts full responsibility under these Terms.</p>
                <p><strong>2.3 Legal Capacity</strong> — By using the Platform, you confirm you have the legal capacity to enter a binding contract under the Indian Contract Act, 1872.</p>
                <p><strong>2.4 Right to Refuse</strong> — We reserve the right to refuse or revoke access at our discretion where eligibility requirements are not met.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. ACCOUNT REGISTRATION</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>3.1 How to Register</strong> — You may register using your mobile number (OTP-verified). Guest bookings are permitted with a valid mobile number only.</p>
                <p><strong>3.2 Accuracy</strong> — You must provide accurate, current, and complete information and update it promptly if it changes.</p>
                <p><strong>3.3 Security</strong> — Keep your login credentials secure. You are responsible for all activity under your account. Notify us immediately of any unauthorized access.</p>
                <p><strong>3.4 One Account</strong> — One account per person. Duplicate accounts may be suspended without notice.</p>
                <p><strong>3.5 Verification</strong> — We may verify your identity at any time. Failure to verify may result in account suspension.</p>
                
                <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg">
                  <p className="font-semibold mb-3">3.6 TERMS &amp; PRIVACY CONSENT</p>
                  <p>By creating an account, logging in, or making a booking on the Platform, you expressly agree to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>These Terms &amp; Conditions</li>
                    <li>Our Privacy Policy (available within the app and on our website)</li>
                  </ul>
                  <p className="mt-3">Your continued use of the Platform constitutes ongoing acceptance of these Terms and any updates made to them.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. HOW BOOKINGS WORK</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>4.1 Select Services First</strong> — You must select all your required services before choosing a time slot. The Platform calculates your appointment duration based on your service selection. Do not skip this step — it prevents scheduling conflicts.</p>
                <p><strong>4.2 Stylist Selection</strong> — Where enabled by your Salon Partner, you may select a preferred stylist. This feature may be disabled on certain days (such as weekends) or for certain service types. Stylist availability is not guaranteed.</p>
                <p><strong>4.3 Confirmation</strong> — Your booking is confirmed only when you receive a confirmation notification from the Platform. Selecting a slot alone is not a confirmed booking.</p>
                <p><strong>4.5 Arrive On Time</strong> — Please arrive at the salon at your confirmed appointment time. A grace period of up to 10 minutes applies. If you arrive after the grace period, your appointment may be forfeited at the Salon&apos;s discretion.</p>
                <p><strong>4.6 Add-On Services</strong> — If you wish to add services during your appointment (e.g., beard trim after a haircut), your stylist will accommodate this subject to the next customer&apos;s booking. To avoid this situation, we strongly recommend booking all desired services upfront when selecting your slot.</p>
                <p><strong>4.7 Walk-In Option</strong> — Salons also accept walk-in customers. If you visit a salon without a booking, the salon&apos;s stylist will manage your queue manually. Walk-in wait times depend on the salon&apos;s current queue and are not managed by the Platform.</p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg mt-6">
                  <p className="font-semibold text-blue-800 dark:text-blue-200">TIP: To get the best experience, always select all services you want before picking your time slot. This ensures your stylist has enough time allocated and avoids conflicts with other booked customers.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. PRICING &amp; PAYMENT</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>5.1 How Payment Works</strong> — All payments for salon services are made directly by you to the Salon at the time of or after your service. The Platform does not collect, process, or hold any payment from you at any point.</p>
                <p><strong>5.2 Pricing</strong> — Service prices are set by each Salon Partner independently. Prices displayed on the Platform are indicative and inclusive of applicable taxes (GST) where applicable. Confirm the final price with the salon at the time of your visit.</p>
                <p><strong>5.3 Payment Methods</strong> — Payment methods accepted (cash, card, UPI, etc.) are determined by each Salon Partner. The Platform has no involvement in payment processing and does not guarantee any specific payment method will be available at any salon.</p>
                <p><strong>5.4 No Platform Fees</strong> — The Platform does not charge customers any booking fee, service fee, convenience fee, or any other fee for using the Platform to make a booking.</p>
                <p><strong>5.5 Price Disputes</strong> — Any dispute regarding the price charged at the salon must be resolved directly between you and the Salon Partner. The Platform is not a party to the payment transaction and cannot intervene in price disputes.</p>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-lg mt-6 border border-emerald-200 dark:border-emerald-800/50">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-200">IMPORTANT: You pay the salon directly after your service — cash, card, or UPI as the salon accepts. The Platform is completely free for customers.</p>
                </div>
              </div>
            </section>

            {/* Section 6 - Cancellation Policy */}
            <section id="cancellation-policy">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. CANCELLATION POLICY</h2>
              <p className="mb-6">
                Since all payments are made directly at the salon, there is no financial penalty for cancellation. However, we ask you to cancel responsibly to respect the salon&apos;s time and allow other customers to book the slot.
              </p>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-700 px-6 py-3 text-left">Action</th>
                      <th className="border border-gray-300 dark:border-gray-700 px-6 py-3 text-left">How</th>
                      <th className="border border-gray-300 dark:border-gray-700 px-6 py-3 text-left">No-Show Consequence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Cancel booking</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Via Platform app — anytime</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">No charge. Slot released for other customers.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Reschedule booking</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Via Platform app — anytime</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">No charge. Select a new available slot.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">No-show (did not arrive)</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Auto-detected by Platform after grace period</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Slot marked as no-show. Repeated no-shows may affect your account standing.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Salon cancels your booking</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Platform notifies you immediately</td>
                      <td className="border border-gray-300 dark:border-gray-700 px-6 py-4">Rebook or choose another salon. No charge to you.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>6.1 Cancel via App</strong> — Please cancel or reschedule through the Platform app so the salon is notified in time and the slot can be given to another customer.</p>
                <p><strong>6.2 Repeated No-Shows</strong> — Repeated no-shows reflect negatively on your account. The Platform tracks no-show patterns. Accounts with excessive no-shows may be subject to booking restrictions.</p>
                <p><strong>6.3 Salon&apos;s Own Policy</strong> — Individual salons may have their own cancellation or no-show policies (e.g., declining future bookings from repeat no-show customers). This is at the salon&apos;s discretion and is not controlled by the Platform.</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg mt-6">
                <p className="font-semibold">GOOD PRACTICE: No financial penalty applies for cancellations or no-shows since all payments are made at the salon. But please cancel in advance — it allows another customer to take your slot.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. REFUNDS</h2>
              <p>Since the Platform does not collect any payment from customers, Platform-level refunds do not apply.</p>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200 mt-4">
                <p><strong>7.1 Service Refunds</strong> — If you are dissatisfied with a service or believe you were overcharged, you must raise this directly with the Salon Partner at the time of payment or immediately after your visit.</p>
                <p><strong>7.2 Platform&apos;s Role</strong> — The Platform may assist as a mediator in escalated disputes between customers and salons, but cannot issue or enforce refunds as it has no involvement in the payment.</p>
                <p><strong>7.3 Dispute Escalation</strong> — If you cannot resolve a payment or service dispute directly with the salon, you may raise a complaint through the Platform&apos;s in-app Help section. The Platform will attempt mediation in good faith.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="your-safety">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. HEALTH, SAFETY &amp; ALLERGY DISCLOSURE</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>8.1 Disclose Allergies</strong> — Inform your stylist of any known allergies, skin sensitivities, scalp conditions, or medical conditions before your service begins.</p>
                <p><strong>8.2 Patch Test</strong> — Before any chemical treatment (hair colour, bleach, keratin, straightening), request a patch test from your salon. If you decline a patch test, neither the Platform nor the Salon will be liable for any resulting reaction.</p>
                <p><strong>8.3 Chemical Treatment Consent</strong> — By booking a chemical treatment, you acknowledge the risk of skin sensitivity and consent to the treatment subject to your stylist&apos;s professional assessment.</p>
                <p><strong>8.4 Adverse Reactions</strong> — If you experience any adverse reaction during or after a service, stop the service immediately, inform the salon, and seek appropriate medical attention. You may also report the incident through the Platform&apos;s in-app safety report feature.</p>
                <p><strong>8.5 Hygiene Standards</strong> — The Platform requires Salon Partners to comply with our Hygiene Policy (minimum hygiene standards for tools, linen, disposables, and premises). However, we do not physically inspect salons and hygiene compliance is the Salon&apos;s legal responsibility.</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-lg mt-6 border border-red-200 dark:border-red-800/50">
                <p className="font-semibold text-red-800 dark:text-red-200">SAFETY: Always tell your stylist about allergies or skin sensitivities before your service. Never skip a patch test for chemical treatments.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="ratings-reviews">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. RATINGS &amp; REVIEWS</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>9.1 Who Can Review</strong> — Only customers who have completed a verified booking may submit a rating or review for a salon or stylist.</p>
                <p><strong>9.2 Honest Reviews</strong> — Reviews must be honest and based on your genuine experience. You must not post false, misleading, defamatory, or abusive reviews.</p>
                <p><strong>9.3 Licence</strong> — By submitting a review, you grant us a non-exclusive, royalty-free licence to display your review on the Platform.</p>
                <p><strong>9.4 Moderation</strong> — We reserve the right to remove reviews that violate our Reviews Policy, without prior notice.</p>
                <p><strong>9.5 No Fake Reviews</strong> — Submitting incentivized or fake reviews is strictly prohibited and will result in account suspension.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. PROHIBITED CONDUCT</h2>
              <p className="mb-4">The following conduct is strictly prohibited and may result in account suspension or permanent termination:</p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Providing false information during registration, booking, or review submission.</li>
                <li>Making bookings with no intention to attend (fraudulent booking).</li>
                <li>Arranging services with salon staff outside the Platform to circumvent booking records.</li>
                <li>Harassment, abuse, or threatening behaviour toward salon staff, stylists, or Platform support.</li>
                <li>Misusing the complaint or dispute system to obtain unfair advantages.</li>
                <li>Sharing your account with another person.</li>
                <li>Attempting to hack, scrape, or disrupt Platform systems.</li>
                <li>Using the Platform for any unlawful purpose under Indian law.</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. ACCOUNT SUSPENSION &amp; TERMINATION</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>11.1 Our Rights</strong> — We may suspend or permanently close your account, with or without notice, for violation of these Terms, repeated no-shows, abusive conduct, or any activity harmful to our platform or partners.</p>
                <p><strong>11.2 Your Right</strong> — You may close your account at any time through app settings. You may reinstate your account within 30 days of closure.</p>
                <p><strong>11.3 Effect</strong> — Pending bookings will be cancelled on termination. The salon will be notified.</p>
                <p><strong>11.4 Data Retention</strong> — Your data will be retained as required under applicable Indian law including the DPDP Act 2023.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. PLATFORM LIABILITY</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>12.1 Booking Facilitation Only</strong> — The Platform is a booking tool. We are not liable for the quality, outcome, suitability, or safety of any salon service. Your service contract is with the Salon Partner.</p>
                <p><strong>12.2 No Payment Liability</strong> — Since we do not collect any payment, we have no liability for payment disputes, overcharging, or refund failures. These are between you and the Salon.</p>
                <p><strong>12.3 Liability Limit</strong> — To the maximum extent permitted by Indian law, our total liability to you for any claim shall not exceed INR 1,000 or the notional value of the disputed booking — whichever is lower.</p>
                <p><strong>12.4 Consumer Rights</strong> — Nothing in these Terms limits your statutory rights under the Consumer Protection Act, 2019.</p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. GRIEVANCE REDRESSAL</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>13.1 Grievance Officer</strong> — In accordance with applicable Indian law, we have appointed a Grievance Officer. Details are published in the app under Help &amp; Legal.</p>
                <p><strong>13.2 Process</strong> — Lodge grievances via the in-app Help section. We acknowledge within 48 hours and resolve within 30 days.</p>
                <p><strong>13.3 Consumer Forum</strong> — If your grievance is unresolved, you may approach the Consumer District Forum or State Consumer Commission under the Consumer Protection Act, 2019.</p>
              </div>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. GOVERNING LAW &amp; DISPUTES</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>14.1 Governing Law</strong> — These Terms are governed by the laws of India.</p>
                <p><strong>14.2 Dispute Resolution</strong> — Disputes will first go through our internal grievance mechanism. If unresolved within 30 days, you may approach the relevant Consumer Forum. Arbitration is available by mutual consent under the Arbitration and Conciliation Act, 1996.</p>
                <p><strong>14.3 Jurisdiction</strong> — Courts at Pune, India shall have jurisdiction over disputes not resolved otherwise.</p>
              </div>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. CHANGES TO THESE TERMS</h2>
              <p><strong>15.1 Updates</strong> — We may update these Terms from time to time with notice via the app. Continued use after notification constitutes acceptance of revised Terms.</p>
            </section>

            {/* Section 16 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. PRIVACY &amp; DATA USAGE</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>16.1 Data Collection</strong> — We collect personal information such as your mobile number, booking details, and usage data to provide and improve our services.</p>
                <p><strong>16.2 Purpose of Data Use</strong> — Your data is used for:</p>
                <ul className="list-disc pl-8 space-y-1">
                  <li>Account authentication and login</li>
                  <li>Booking management and confirmations</li>
                  <li>Customer support and dispute resolution</li>
                  <li>Sending service-related notifications</li>
                </ul>
                <p><strong>16.3 Push Notifications</strong> — By using the Platform, you consent to receive notifications including booking confirmations, reminders, offers, and updates. You may manage notification preferences in your device settings.</p>
                <p><strong>16.4 Data Sharing</strong> — We do not sell your personal data. Your information is shared only with relevant Salon Partners to fulfill your bookings.</p>
                <p><strong>16.5 Data Protection</strong> — Your data is handled in accordance with the Digital Personal Data Protection Act, 2023.</p>
              </div>
            </section>

            {/* Section 17 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">17. ACCOUNT DELETION</h2>
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <p><strong>17.1</strong> You may request deletion of your account at any time through the app settings or by contacting support.</p>
                <p><strong>17.2 Upon deletion request:</strong></p>
                <ul className="list-disc pl-8 space-y-1">
                  <li>Your account will be deactivated</li>
                  <li>Personal data will be deleted or anonymized, subject to legal retention requirements</li>
                </ul>
                <p><strong>17.3</strong> Certain data may be retained for compliance with applicable laws, dispute resolution, or fraud prevention.</p>
              </div>
            </section>

            {/* Section 18 */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">18. CONTACT US</h2>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl">
                <p className="font-medium mb-4">For queries, grievances, or support:</p>
                <div className="space-y-3">
                  <p><strong>In-App:</strong> Help → Contact Us</p>
                  <p><strong>Email:</strong> support@neopaceinfotech.com</p>
                  <p>
                    <strong>Grievance Officer:</strong> Jeevan Joshi<br />
                    Mail – Jeevan.j@neopaceinfotech.com<br />
                    <span className="text-sm text-gray-500">Response within 48 hours</span>
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Page Specific Minimal Footer */}
          <div className="bg-gray-100 dark:bg-black px-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800">
            © 2026 Neoparlour. All rights reserved. | Last updated: 27 May 2026
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
