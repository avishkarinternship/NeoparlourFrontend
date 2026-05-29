import React from "react";

const PrivacyPolicyScreen = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-black text-white p-6">
          <h1 className="text-3xl font-bold">
            Privacy Policy
          </h1>
          <p className="text-gray-300 mt-2">
            Neoparlour Salon (Owner) App
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
              Neoparlour provides a marketplace platform that connects salon
              owners with customers.
            </p>

            <p className="mt-3">
              This Privacy Policy explains how we collect, use, store, and
              share information of salon owners using the Neoparlour Partner
              App.
            </p>

            <p className="mt-3 font-medium">
              By registering or using the Platform, you agree to this Privacy
              Policy.
            </p>
          </Section>

          {/* Information We Collect */}
          <Section title="2. INFORMATION WE COLLECT">

            <Card title="2.1 Personal Information">
              <BulletList
                items={[
                  "Name",
                  "Phone number (OTP login)",
                  "Email address",
                  "Profile photo (if uploaded)",
                ]}
              />
            </Card>

            <Card title="2.2 Business Information">
              <BulletList
                items={[
                  "Salon name",
                  "Salon address",
                  "City and area details",
                  "Business registration details",
                  "GST details",
                ]}
              />
            </Card>

            <Card title="2.3 Financial & Payment Information">
              <BulletList
                items={[
                  "Subscription/payment details",
                  "Transaction records",
                  "Razorpay payment reference IDs",
                ]}
              />

              <div className="mt-4 bg-yellow-100 border border-yellow-300 p-4 rounded-xl">
                <p className="font-semibold text-yellow-800">
                  Important:
                </p>
                <p className="text-yellow-700 mt-1">
                  We do NOT store your card, UPI PIN, or banking credentials.
                  All payments are securely processed via Razorpay.
                </p>
              </div>
            </Card>

            <Card title="2.4 Device & Technical Information">
              <BulletList
                items={[
                  "Device type and OS",
                  "IP address",
                  "App usage logs",
                ]}
              />
            </Card>

            <Card title="2.5 Push Notification Data">
              <BulletList items={["Firebase Cloud Messaging (FCM) token"]} />
            </Card>
          </Section>

          {/* Use of Information */}
          <Section title="3. HOW WE USE YOUR INFORMATION">
            <BulletList
              items={[
                "Create and manage your partner account",
                "Verify your identity and business",
                "Enable salon listing and booking management",
                "Process subscription payments via Razorpay",
                "Send booking notifications and alerts",
                "Provide analytics and performance insights",
                "Improve app functionality and services",
              ]}
            />
          </Section>

          {/* Razorpay */}
          <Section title="4. PAYMENT PROCESSING (RAZORPAY)">
            <BulletList
              items={[
                "Payments for subscriptions are processed via Razorpay",
                "Razorpay may collect and process payment data as per their privacy policy",
                "We only store transaction references and status",
              ]}
            />
          </Section>

          {/* Sharing */}
          <Section title="5. SHARING OF INFORMATION">

            <Card title="5.1 Customers">
              <p>
                Salon name, services, and basic details for bookings.
              </p>
            </Card>

            <Card title="5.2 Payment Providers">
              <p>Razorpay (for payment processing).</p>
            </Card>

            <Card title="5.3 Service Providers">
              <BulletList
                items={[
                  "Cloud hosting providers",
                  "Notification services (Firebase)",
                ]}
              />
            </Card>

            <Card title="5.4 Legal Authorities">
              <p>If required under applicable law.</p>
            </Card>
          </Section>

          {/* Security */}
          <Section title="6. DATA SECURITY">
            <BulletList
              items={[
                "Unauthorized access protection",
                "Data breach protection",
                "Misuse prevention",
              ]}
            />
            <p className="mt-3">
              However, no system is completely secure.
            </p>
          </Section>

          {/* Retention */}
          <Section title="7. DATA RETENTION">
            <BulletList
              items={[
                "As long as your account is active",
                "For accounting and tax compliance",
                "For dispute resolution and fraud prevention",
              ]}
            />
          </Section>

          {/* Account Deletion */}
          <Section title="8. ACCOUNT DELETION">
            <p>You may request account deletion by contacting support.</p>

            <BulletList
              items={[
                "Your account will be deactivated",
                "Business data may be retained for legal/tax compliance",
                "Transaction records may be retained as required by law",
              ]}
            />
          </Section>

          {/* Rights */}
          <Section title="9. YOUR RIGHTS">
            <BulletList
              items={[
                "Request access to your data",
                "Request correction",
                "Request deletion",
                "Withdraw consent",
              ]}
            />
          </Section>

          {/* Third Party */}
          <Section title="10. THIRD-PARTY SERVICES">
            <BulletList
              items={[
                "Razorpay (payment processing)",
                "Firebase Cloud Messaging (notifications)",
              ]}
            />
          </Section>

          {/* Notifications */}
          <Section title="11. PUSH NOTIFICATIONS">
            <BulletList
              items={[
                "Booking alerts",
                "Customer updates",
                "Payment reminders",
                "Platform announcements",
              ]}
            />

            <p className="mt-3">
              You can disable notifications from device settings.
            </p>
          </Section>

          {/* Confidentiality */}
          <Section title="12. CONFIDENTIALITY OF BUSINESS DATA">
            <BulletList
              items={[
                "Maintain confidentiality of your login credentials",
                "Sensitive business data must not be shared externally",
                "We do not guarantee protection against misuse caused by user negligence",
              ]}
            />
          </Section>

          {/* Changes */}
          <Section title="13. CHANGES TO THIS POLICY">
            <p>
              We may update this Privacy Policy from time to time.
            </p>

            <p className="mt-3">
              Continued use of the Platform implies acceptance of the updated
              policy.
            </p>
          </Section>

          {/* Governing Law */}
          <Section title="14. GOVERNING LAW">
            <p>This Privacy Policy is governed by the laws of India.</p>
          </Section>

          {/* Contact */}
          <Section title="15. CONTACT US">
            <div className="bg-gray-100 p-4 rounded-xl">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                support@neoparlour.com
              </p>

              <p className="mt-2">
                <span className="font-semibold">App:</span> Partner Support
                Section
              </p>
            </div>
          </Section>

          {/* Consent */}
          <Section title="16. CONSENT">
            <BulletList
              items={[
                "Agree to this Privacy Policy",
                "Consent to data collection and processing",
                "Acknowledge use of Razorpay for payment processing",
              ]}
            />
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
  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
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