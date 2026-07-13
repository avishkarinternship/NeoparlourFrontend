import React from "react";
import SEOFooter from "../common/SEOFooter";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 antialiased font-sans text-gray-700 flex flex-col justify-between">
      
      {/* Main Content Card Wrapper */}
      <div className="py-12 px-4 flex-grow">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-black text-white p-6">
            <h1 className="text-3xl font-bold">
              Privacy Policy
            </h1>

            <p className="text-gray-300 mt-2">
              Neoparlour Customer App
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Effective Date: 27 May 2026
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-8 text-gray-700">

            {/* Introduction */}
            <Section title="1. INTRODUCTION">
              <p>
                Neoparlour ("Platform", "we", "our", "us") is a salon booking marketplace that connects customers with independent salon partners.
              </p>

              <p className="mt-3">
                This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our mobile application and services.
              </p>

              <p className="mt-3 font-medium">
                By using the Platform, you agree to the terms of this Privacy Policy.
              </p>
            </Section>

            {/* Information */}
            <Section title="2. INFORMATION WE COLLECT">

              <p>
                We collect the following types of information:
              </p>

              <Card title="2.1 Personal Information">
                <BulletList
                  items={[
                    "Full Name",
                    "Mobile Number (OTP-based login)",
                    "Email Address (optional)",
                    "Gender and Date of Birth (if provided)",
                    "Address (if provided)",
                  ]}
                />
              </Card>

              <Card title="2.2 Booking Information">
                <BulletList
                  items={[
                    "Selected services",
                    "Appointment date and time",
                    "Salon details",
                    "Booking history",
                  ]}
                />
              </Card>

              <Card title="2.3 Device & Technical Information">
                <BulletList
                  items={[
                    "Device type and OS",
                    "App usage data",
                    "IP address (if applicable)",
                  ]}
                />
              </Card>

              <Card title="2.4 Push Notification Data">
                <BulletList
                  items={[
                    "Firebase Cloud Messaging (FCM) token",
                    "Notification preferences",
                  ]}
                />
              </Card>
            </Section>

            {/* Use */}
            <Section title="3. HOW WE USE YOUR INFORMATION">
              <p>We use your data to:</p>

              <BulletList
                items={[
                  "Create and manage your account",
                  "Authenticate users via OTP",
                  "Facilitate salon bookings",
                  "Send booking confirmations and reminders",
                  "Provide customer support",
                  "Improve app performance and user experience",
                  "Send promotional offers (if applicable)",
                ]}
              />
            </Section>

            {/* Sharing */}
            <Section title="4. SHARING OF INFORMATION">

              <p className="font-medium">
                We do NOT sell your personal data.
              </p>

              <p className="mt-3">
                We may share your information with:
              </p>

              <Card title="4.1 Salon Partners">
                <BulletList
                  items={[
                    "To fulfill your bookings",
                    "To provide services you requested",
                  ]}
                />
              </Card>

              <Card title="4.2 Service Providers">
                <BulletList
                  items={[
                    "Firebase (for notifications)",
                    "Hosting and analytics providers",
                  ]}
                />
              </Card>

              <Card title="4.3 Legal Authorities">
                <BulletList
                  items={[
                    "If required by law or government request",
                  ]}
                />
              </Card>
            </Section>

            {/* Payments */}
            <Section title="5. PAYMENTS">
              <BulletList
                items={[
                  "All payments are made directly to the salon",
                  "Neoparlour does NOT collect or process payments",
                  "We are not responsible for payment disputes",
                ]}
              />
            </Section>

            {/* Notifications */}
            <Section title="6. PUSH NOTIFICATIONS">

              <p>
                By using the Platform, you consent to receive:
              </p>

              <BulletList
                items={[
                  "Booking confirmations",
                  "Appointment reminders",
                  "Service updates",
                  "Promotional notifications (optional)",
                ]}
              />

              <p className="mt-3">
                You can disable notifications anytime from device settings.
              </p>
            </Section>

            {/* Retention */}
            <Section title="7. DATA RETENTION">

              <p>
                We retain your data:
              </p>

              <BulletList
                items={[
                  "As long as your account is active",
                  "As required for legal compliance",
                  "For dispute resolution and fraud prevention",
                ]}
              />
            </Section>

            {/* Deletion */}
            <Section title="8. ACCOUNT DELETION">

              <p>
                You may request account deletion by:
              </p>

              <BulletList
                items={[
                  "Using app settings (if available), OR",
                  "Contacting support",
                ]}
              />

              <p className="mt-3">
                Upon deletion:
              </p>

              <BulletList
                items={[
                  "Your account will be deactivated",
                  "Personal data will be deleted or anonymized",
                  "Some data may be retained for legal obligations",
                ]}
              />
            </Section>

            {/* Security */}
            <Section title="9. DATA SECURITY">

              <p>
                We implement reasonable security measures to protect your data from:
              </p>

              <BulletList
                items={[
                  "Unauthorized access",
                  "Misuse",
                  "Loss or alteration",
                ]}
              />

              <p className="mt-3">
                However, no system is 100% secure.
              </p>
            </Section>

            {/* Rights */}
            <Section title="10. YOUR RIGHTS">

              <p>
                Under applicable Indian laws (including DPDP Act, 2023), you have the right to:
              </p>

              <BulletList
                items={[
                  "Access your personal data",
                  "Request correction",
                  "Request deletion",
                  "Withdraw consent",
                ]}
              />
            </Section>

            {/* Third Party */}
            <Section title="11. THIRD-PARTY SERVICES">

              <p>
                The app may use third-party services such as:
              </p>

              <BulletList
                items={[
                  "Firebase Cloud Messaging (FCM)",
                  "Analytics tools",
                ]}
              />

              <p className="mt-3">
                These services may collect limited data as per their own privacy policies.
              </p>
            </Section>

            {/* Children */}
            <Section title="12. CHILDREN’S PRIVACY">

              <BulletList
                items={[
                  "The Platform is not intended for users under 18",
                  "Minors may use the app only under parental supervision",
                ]}
              />
            </Section>

            {/* Changes */}
            <Section title="13. CHANGES TO THIS POLICY">

              <p>
                We may update this Privacy Policy from time to time.
              </p>

              <BulletList
                items={[
                  "Updates will be notified via app or website",
                  "Continued use implies acceptance",
                ]}
              />
            </Section>

            {/* Contact */}
            <Section title="14. CONTACT US">

              <p>
                For any privacy-related queries:
              </p>

              <div className="bg-gray-100 p-4 rounded-xl mt-4">
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  support@neoparlour.com
                </p>

                <p className="mt-2">
                  <span className="font-semibold">App:</span>{" "}
                  Help Section
                </p>
              </div>
            </Section>

            {/* Consent */}
            <Section title="15. CONSENT">

              <p>
                By using the Platform, you:
              </p>

              <BulletList
                items={[
                  "Agree to this Privacy Policy",
                  "Consent to data collection and usage as described",
                ]}
              />
            </Section>

          </div>
        </div>
      </div>

      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white border-t border-gray-200">
        <SEOFooter />
      </div>

    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <div className="pt-4">
    <h2 className="text-2xl font-bold text-black mb-4">
      {title}
    </h2>
    <div className="space-y-3">
      {children}
    </div>
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

export default PrivacyPolicy;