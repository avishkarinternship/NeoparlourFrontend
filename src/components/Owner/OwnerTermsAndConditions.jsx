import React, { useState, useRef } from 'react';
import { ShieldCheck, FileText, Download, Scale, Search, CheckCircle } from 'lucide-react';

export default function OwnerTermsAndConditions() {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const contentRef = useRef(null);

    // Monitor text container scrolling behavior to ensure they look over the agreement details
    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            // Triggers when user gets within 15px of bottom boundary
            if (scrollHeight - scrollTop <= clientHeight + 15) {
                setHasScrolledToBottom(true);
            }
        }
    };

    // Simulated acceptance capture payload recording metadata
    const handleAcceptTerms = (e) => {
        e.preventDefault();
        if (accepted) {
            setIsSubmitted(true);
            console.log("Terms Accepted Record Captured:", {
                version: "1.0",
                effectiveDate: "27/May/2026",
                timestamp: new Date(new Date().getTime() + 330 * 60000).toISOString().slice(0, -1) + '+05:30',
                status: "Legally Binding Electronic Consent"
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 text-gray-800 font-sans antialiased py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">

            {/* Upper Brand Identification Branding Layout Card */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-8 print:border-0 print:shadow-none">
                <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-red-100 text-[#FF1100] px-2.5 py-1 rounded-md uppercase tracking-wider">
                                B2B Commercial Agreement
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mt-2">
                            Salon Partner Agreement
                        </h1>
                        <p className="text-xs font-semibold text-gray-400">
                            Brand Name: <span className="text-gray-700">Neoparlour</span> | Company: <span className="text-gray-700">Neopace Infotech LLP</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500 self-start sm:self-center print:hidden">
                        <div className="text-right hidden sm:block">
                            <p>Version: <span className="font-bold text-gray-900">1.0</span></p>
                            <p>Effective: <span className="font-bold text-gray-900">27/May/2026</span></p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-black transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                            title="Print Agreement"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold">Print / Save PDF</span>
                        </button>
                    </div>
                </div>

                {/* Quick Reference Warning Banner Box Row */}
                <div className="p-4 bg-amber-50/60 border-b border-amber-100 px-6 sm:px-8 flex gap-3 print:hidden">
                    <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                        <span className="font-extrabold uppercase">Important :</span>This is a B2B commercial agreement. By accepting this Agreement during onboarding, you agree to all terms. Customers pay you directly at the salon. The Platform invoices you separately for commission.
                    </p>
                </div>

                {/* Content Interactive Navigation Search Bar */}
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 px-6 sm:px-8 flex items-center gap-2 print:hidden">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search document sections or keywords (e.g., GST, Commission, SLA)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-xs font-medium text-gray-700 placeholder-gray-400"
                    />
                </div>

                {/* ================= LEGAL DOCUMENTATION SUB-CONTAINER BODY ================= */}
                <div
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto scroll-smooth space-y-6 text-xs sm:text-[13px] leading-relaxed text-gray-600 print:max-h-none print:overflow-visible"
                >
                    {/* Section 1 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                            <span className="text-[#FF1100]">1.</span> Definitions
                        </h3>
                        <ul className="space-y-1.5 list-none pl-0 font-medium">
                            <li><strong className="text-gray-900">"Salon Partner" or "You"</strong> — The business entity or individual operating a salon registered on the Platform.</li>
                            <li><strong className="text-gray-900">"Platform" or"We"</strong> — Brand Name Neoparlour, company name Neopace Infotech LLP incorporated under the Limited Liability Partnership (LLP) Act, 2008.</li>
                            <li><strong className="text-gray-900">"Booking"</strong> — A confirmed customer appointment facilitated through the Platform.</li>
                            <li><strong className="text-gray-900">"Booking Value"</strong> — The total service price displayed to the customer on the Platform for a confirmed booking, inclusive of applicable GST.</li>
                            <li><strong className="text-gray-900">"Commission"</strong> — The Platform's fee, expressed as a percentage of the Booking Value, invoiced to you monthly.</li>
                            <li><strong className="text-gray-900">"Stylist App"</strong> — The Platform's mobile app used by your stylists for queue and appointment management.</li>
                            <li><strong className="text-gray-900">"Owner Portal"</strong> — The Platform's web or mobile interface for salon configuration, service management, and dashboard access.</li>
                            <li><strong className="text-gray-900">"KYC Documents"</strong> — Identity proof, business registration, GST, and bank documents required for onboarding.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">2.</span> Eligibility & Onboarding
                        </h3>
                        <p><strong>2.1 Legal Status —</strong> You must be a legally registered business entity or licensed individual operating a salon in India. Acceptable structures include proprietorship, partnership, LLP, or private limited company.</p>
                        <p><strong>2.2 KYC Requirements —</strong> The following documents are required for onboarding:</p>
                        <ul className="list-disc pl-5 space-y-1 font-medium">
                            <li>PAN Card (business or individual)</li>
                            <li>Aadhaar Card or other government-issued ID of the authorised signatory</li>
                            <li>GST Registration Certificate (if applicable)</li>
                            <li>Shop and Establishment License or equivalent municipal registration</li>
                            <li>Salon photos — minimum 3 (exterior, interior, workstation)</li>
                        </ul>
                        <p><strong>2.3 Verification —</strong> The Platform reserves the right to conduct background and document verification and to approve or reject any application at its sole discretion.</p>
                        <p><strong>2.4 Accuracy —</strong> All onboarding information must be accurate and current. Misrepresentation or false documents are grounds for immediate termination and legal action.</p>
                        <p><strong>2.5 Profile Activation —</strong> Your salon profile goes live only after KYC verification and Platform approval.</p>
                        <p><strong>2.6 Electronic Consent —</strong> By completing onboarding and accepting this Agreement via the Platform, you provide legally binding electronic consent under applicable Indian laws. This Agreement shall be enforceable without physical signature.</p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">3.</span> Platform Services Provided to You
                        </h3>
                        <p> Once onboarded, the Platform provides: </p>
                        <p><strong>3.1 No Booking Guarantee —</strong> The Platform does not guarantee any minimum bookings, customers, or revenue.</p>
                        <p><strong>3.2 License —</strong> The Platform grants you a non-exclusive, non-transferable, revocable licence to access and use the Owner Portal and associated tools, subject to compliance with this Agreement.</p>

                    </section>

                    {/* Section 4 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">4.</span> Commission & Payment Model
                        </h3>
                        <div className="overflow-x-auto my-2 border border-gray-100 rounded-lg">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 font-bold">
                                        <th className="p-2.5 border-b border-gray-200"> Who Pays Whom</th>
                                        <th className="p-2.5 border-b border-gray-200"> When </th>
                                        <th className="p-2.5 border-b border-gray-200"> How </th>
                                    </tr>
                                </thead>
                                <tbody className="font-medium text-gray-600">
                                    <tr className="border-b border-gray-100">
                                        <td className="p-2.5 text-gray-900 font-bold">Customer &rarr; Salon </td>
                                        <td className="p-2.5">After service is completed at the salon</td>
                                        <td className="p-2.5">Cash, card, UPI, or any method the salon accepts. Platform has no involvement.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2.5 text-gray-900 font-bold">Salon  &rarr; Platform</td>
                                        <td className="p-2.5">Prepaid Subscription </td>
                                        <td className="p-2.5">Platform invoices you for buy subscription  . You pay via bank transfer or UPI.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p><strong>4.1 Monthly Subscription  Invoice  —</strong> The Platform will issue a tax invoice at the time of subscribed the services from the App.</p>
                        <p><strong>4.2 Disputed Payment    —</strong> Undisputed amounts remain due on the original payment date.</p>
                        <p><strong> KEY MODEL —</strong> Since the Platform does not collect customer payments, there is no escrow, no payout cycle, and no payment gateway. You collect all service revenue directly. </p>

                    </section>

                    {/* Section 5 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">5.</span> Service & Pricing Management
                        </h3>
                        <p><strong>5.1 Your Pricing Autonomy —</strong> You set service prices, service descriptions, and service durations in the Owner Portal. You have full control.</p>
                        <p><strong>5.2 Pricing Rules —</strong> Your pricing on the Platform must comply with:
                            <li> Prices must not be higher than your walk-in prices for equivalent services. </li>
                            <li>All prices must be inclusive of applicable GST, or GST must be disclosed separately.</li>
                            <li>Service durations must accurately reflect actual time required. Inaccurate durations causing conflicts are subject to penalty.</li>
                        </p>
                        <p><strong>5.3 Service Charges —</strong> You may add, edit, or deactivate services at any time through the Owner Portal. Changes apply to future bookings immediately.</p>
                        <p><strong>5.4 Audit Rights —</strong> The Platform reserves the right to audit listed prices and flag misleading pricing. Fraudulent pricing is grounds for immediate suspension.</p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">6.</span> Booking Obligations & SLA
                        </h3>
                        <p>You are obligated to honour all confirmed bookings made through the Platform. Your SLA commitments:</p>
                        <div className="overflow-x-auto my-2 border border-gray-100 rounded-lg">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 font-bold">
                                        <th className="p-2.5 border-b border-gray-200">SLA Metric </th>
                                        <th className="p-2.5 border-b border-gray-200"> Standard</th>
                                        <th className="p-2.5 border-b border-gray-200">Consequence of Breach</th>
                                    </tr>
                                </thead>
                                <tbody className="font-medium text-gray-600">
                                    <tr className="border-b border-gray-100">
                                        <td className="p-2.5 text-gray-900 font-bold">Maximum wait beyond confirmed slot</td>
                                        <td className="p-2.5">15 minutes average </td>
                                        <td className="p-2.5">Customer complaint triggers review</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="p-2.5 text-gray-900 font-bold">Response to customer complaints</td>
                                        <td className="p-2.5">Within 24 hours of Platform notification</td>
                                        <td className="p-2.5">Escalation to Platform Level 2</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="p-2.5 text-gray-900 font-bold">Operating Hours Accuracy</td>
                                        <td className="p-2.5">Always current and up to date</td>
                                        <td className="p-2.5">Customer refund obligation + SLA breach</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2.5 text-gray-900 font-bold">Service delivery completion</td>
                                        <td className="p-2.5">Always current and up to date</td>
                                        <td className="p-2.5">Customer refund obligation + SLA breach</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p><strong>6.1 SLA Breach Escalation —</strong> First breach — written warning. Second breach — written warning. Third breach — account suspension. Repeated breach — permanent termination.</p>
                        <p><strong>6.2 Walk-in Buffer —</strong> You may instruct stylists to block slots for walk-in buffers via the Stylist App. During any period where slots appear available for online booking, you must honour those bookings.</p>
                        <p><strong>6.3 Special Hours —</strong> Update operating hours promptly for public holidays, special closures, or early/late opening days. Failure to update hours that causes customer inconvenience is a breach of this Agreement</p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">7.</span> Hygiene, Safety &  Compliance
                        </h3>
                        <p><strong>7.1 Legal Compliance —</strong> You must comply with all applicable municipal regulations, state health and safety laws, and shop licensing requirements. Obtaining and maintaining required licences is your sole responsibility.</p>

                        <p><strong>7.2 Minimum Hygiene Standards —</strong> You must ensure: </p>
                        <li>All reusable tools sterilised between each customer.</li>
                        <li>Single-use items (razor blades, wax strips) used once only and immediately disposed of.</li>
                        <li>Clean towels or disposable covers for each customer.</li>
                        <li>Chemical treatment products within expiry and appropriate for the service.</li>
                        <li>Visible cleanliness of floors, chairs, workstations, and washrooms. </li>
                        <li>First-aid kit on premises, accessible to all staff.</li>
                        <p><strong>7.3 Stylist Qualification —</strong> Ensure all stylists performing services are appropriately trained and, where required, certified.</p>
                        <p><strong>7.4 Inspection —</strong> The Platform may conduct surprise audits or request photographic hygiene evidence. Non-compliance is grounds for suspension.</p>
                        <p><strong>7.5 Safety Incidents —</strong> For any customer adverse reaction, injury, or safety incident: (a) Provide immediate assistance; (b) Report to the Platform within 24 hours; (c) Cooperate fully with any investigation.</p>

                    </section>

                    {/* Section 8 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">8.</span> Tax Obligations
                        </h3>
                        <p><strong>8.1 GST Registration —</strong> Obtain GST registration if your annual turnover exceeds INR 20 lakhs. Declare your GST status accurately during onboarding.</p>
                        <p><strong>8.2 GST on  Services —</strong> You are responsible for charging, collecting, and remitting GST on your salon services. The Platform is not responsible for your GST compliance on service revenue.</p>
                        <p><strong>8.3 GST on Commission —</strong> [LEGAL REVIEW REQUIRED] The Platform's commission invoice will include GST. You may claim Input Tax Credit on this GST subject to applicable rules. </p>
                        <p><strong>8.4 Income Tax —</strong> Platform commission payments are a deductible business expense. Declare them accordingly. The Platform will issue a GST tax invoice for commission charged.</p>
                        <p><strong> LEGAL REVIEW REQUIRED</strong> Engage a CA before going live to confirm: GST registration status, applicable rates on salon services, GST on Platform commission invoice, and TDS applicability.</p>

                    </section>

                    {/* Section 9 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">9.</span> Stylist Management & Employment
                        </h3>
                        <p><strong>9.1 Your Responsibility —</strong> All stylists registered under your account are your employees, apprentices, or independent contractors — not employees of the Platform.</p>
                        <p><strong>9.2 Statutory Obligations  —</strong> You are solely responsible for: employment contracts; wages and timely payment; PF, ESI, gratuity, and all statutory contributions; background verification; labour law compliance.</p>
                        <p><strong>9.3 App Usage —</strong> Ensure your stylists use the Platform's Stylist App for all bookings assigned through the Platform. Stylists must not redirect Platform customers to book through external channels.</p>
                        <p><strong>9.4 Stylist Conduct  —</strong> You are responsible for stylist conduct while they use Platform tools. Misconduct by a stylist reflects on your Salon account.</p>
                        <p><strong>9.5 Indemnity</strong> You indemnify the Platform against all claims, losses, and costs arising from the employment or engagement of your stylists, including labour disputes and third-party injury claims.</p>
                    </section>

                    {/* Sections 10 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">10.</span> CUSTOMER COMPLAINT HANDLING
                        </h3>
                        <p><strong>10.1 Primary Responsibility —</strong> You are primarily responsible for resolving customer complaints about service quality, hygiene, stylist conduct, or pricing.</p>
                        <p><strong>10.2 License Grant —</strong> Acknowledge complaints within 24 hours of Platform notification. Provide proposed resolution within 72 hours.</p>
                        <p><strong>10.3 Platform Mediation —</strong> For unresolved complaints, the Platform will mediate. The Platform's decision is final for the purposes of Platform-level action (e.g., review removal, account flag).</p>
                        <p><strong>10.4 Repeated Complaints —</strong> Sustained complaints will result in rating impact, increased scrutiny, and potential suspension.</p>
                        <p><strong>10.5 Platform Intervention —</strong> While the Platform is not directly responsible for service delivery or payments, it reserves the right to intervene in exceptional disputes between customers and Salon Partners to maintain service quality and platform integrity.</p>

                    </section>

                    {/* Section 11 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">11.</span> NON-CIRCUMVENTION & NON-SOLICITATION
                        </h3>
                        <p><strong>11.1 Off Platform Bookings —</strong> You must not solicit or encourage customers acquired through the Platform to book services outside the Platform. This obligation applies during the term and for 12 months after termination.</p>
                        <p><strong>11.2 Customer Data —</strong> Customer contact data obtained through the Platform must not be used for direct marketing or communication outside the Platform</p>
                        <p><strong>11.3 Stylist Solicitation —</strong> Ensure your stylists comply with their own off-platform restrictions. A stylist violation you facilitated constitutes your breach.</p>
                        <p><strong>11.4 Consequences —</strong> Breach entitles the Platform to: immediate termination; legal action for damages</p>
                    </section>

                    {/* Section 12 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">12.</span> INTELLECTUAL PROPERTY
                        </h3>
                        <p><strong>12.1 Platform Licence to You  —</strong> The Platform grants a limited licence to use the Platform name and 'Book on [Platform Name]' badge for marketing your participation</p>
                        <p><strong>12.2 Your IP Licence to Platform  —</strong> You grant the Platform a non-exclusive, royalty-free licence to use your salon name, logo, photos, and service information for displaying your listing and promoting the Platform.</p>
                    </section>

                    {/* Section 13 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">13.</span> INTELLECTUAL PROPERTY
                        </h3>
                        <p><strong>13.1 Indemnity  —</strong> You shall indemnify the Platform and its officers from all claims, damages, losses, and costs arising from: your breach of this Agreement; your service delivery; acts of your stylists; violation of applicable law.</p>
                        <p><strong>13.2 Insurance  —</strong> You are strongly recommended to maintain commercial liability insurance covering customer bodily injury and product liability for salon treatments.</p>
                    </section>

                    {/* Sections 14 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">14</span> Confidentiality & Data
                        </h3>
                        <p><strong>14.1 Term—</strong> Effective from onboarding approval. Continues until terminated by either party.</p>
                        <p><strong>14.2 Notice —</strong>Either party may terminate with 30 days' written notice.</p>
                        <p><strong>14.3 Immediate Termination —</strong> The Platform may terminate immediately for: material breach; KYC fraud; regulatory action; repeated SLA failure; serious customer safety incident; conduct damaging to Platform reputation.</p>
                        <p><strong>14.4 Effect —</strong>On termination: listing removed immediately; pending bookings cancelled; outstanding commission invoices due within 30 days; non-circumvention obligations survive 12 months</p>
                    </section>

                    {/* Sections 15 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">15</span> Confidentiality & Data
                        </h3>
                        <p><strong>15.1 Platform Confidentiality -</strong> The Platform's technology, commission structure, and business processes are confidential. Do not disclose them to third parties.</p>
                        <p><strong>15.2 Customer Data —</strong>Customer data in the Owner Portal is for operational use only. Do not export, share with third parties, or use for purposes other than fulfilling booked services.</p>
                        <p><strong>15.3 DPDP Act —</strong> [LEGAL REVIEW REQUIRED] Your handling of customer data must comply with the Digital Personal Data Protection Act, 2023.</p>
                        <p><strong>15.4 Data Protection Compilance —</strong>You agree to comply with the Digital Personal Data Protection Act, 2023 and all applicable data protection laws in India.</p>
                        <p> You shall: </p>
                        <li>Use customer data only for fulfilling bookings </li>
                        <li>Not store, export, or misuse customer data outside the Platform</li>
                        <li>Ensure adequate safeguards to protect customer information</li>
                        <p>Failure to comply may result in suspension or termination of your account.</p>
                    </section>

                    {/* Sections 16 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">16. </span> Governing Law & Disputes
                        </h3>
                        <p><strong>16.1 Law</strong> This Agreement is governed by the laws of India.</p>
                        <p><strong>16.2 Dispute Resolution —</strong>Disputes first through commercial negotiation. If unresolved within 30 days, referred to arbitration under the Arbitration and Conciliation Act, 1996, sole arbitrator by mutual consent.</p>
                        <p><strong>16.3 Seat —</strong> Seat of arbitration: Pune , India. Language: English</p>
                    </section>

                    {/* Sections 17 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">17. </span> Entire Agreement
                        </h3>
                        <p>This Agreement, together with the Platform's Privacy Policy, Safety & Hygiene Policy, and Cancellation Policy, constitutes the entire agreement between you and the Platform for your participation as a Salon Partner.</p>
                    </section>

                    {/* Sections 18 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">18. </span> Contact
                        </h3>
                        <p> For Agreement queries or partner support.</p>
                        <li> Email: support@neopaceinfotech.com</li>
                        <li> Contact no- 91-9119591956</li>
                    </section>

                    {/* Sections 19 */}
                    <section className="space-y-2">
                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                            <span className="text-[#FF1100]">19. </span> Terms Acceptance Record
                        </h3>
                        <p> The Platform may record: </p>
                        <li>Timestamp of Agreement acceptance </li>
                        <li>IP/device details</li>
                        <li>Agreement version accepted</li>
                        <p> This record shall serve as proof of acceptance in case of disputes.</p>
                    </section>
                </div>
            </div>

            {/* --- DYNAMIC FORM / DIGITAL ACCEPTANCE ACTION AREA --- */}
            <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-200/80 print:hidden">
                {!isSubmitted ? (
                    <form onSubmit={handleAcceptTerms} className="space-y-4">

                        {/* Checkbox item */}
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
                                    I acknowledge and accept the B2B Salon Partner Agreement
                                </p>
                                <p className="text-gray-500 leading-normal">
                                    By checking this box, I extend legally binding electronic consent under Indian law, logging my current IP address and timestamp signature.
                                </p>
                                {!hasScrolledToBottom && (
                                    <p className="text-[11px] font-bold text-amber-600 mt-1 animate-pulse">
                                        * Please scroll through the legal text entirely to activate the acceptance confirmation checkbox.
                                    </p>
                                )}
                            </div>
                        </label>

                        {/* Form Submission Action Trigger */}
                        <div className="flex items-center justify-end pt-2">
                            <button
                                type="submit"
                                disabled={!accepted || !hasScrolledToBottom}
                                className="h-11 px-8 bg-[#FF1100] text-white text-xs font-bold tracking-wider rounded-xl uppercase transition-all duration-200 shadow-md shadow-red-500/10 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed hover:bg-red-700 hover:scale-[1.01] cursor-pointer"
                            >
                                Confirm & Activate Owner Portal
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Post-acceptance Success State Box */
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3.5 animate-scale-up">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                            <h4 className="font-bold text-emerald-900">Agreement Digitally Executed Successfully</h4>
                            <p className="text-emerald-700 font-medium">
                                Your electronic authorization footprint has been recorded matching standard DPDP and Indian Contract Act terms. Your portal configuration options are now unlocked.
                            </p>
                            <div className="pt-2 text-[11px] font-mono text-emerald-600 space-y-0.5">
                                <p>&bull; Target Log ID: NP-TCR-{Math.floor(100000 + Math.random() * 900000)}</p>
                                <p>&bull; Registered Timestamp: {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}