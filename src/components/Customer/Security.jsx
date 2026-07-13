import React from 'react';
import SEOFooter from '../common/SEOFooter';

const securityFeatures = [
  {
    id: 1,
    title: 'Safe Browsing',
    description: 'Our website and mobile application use secure HTTPS encryption to ensure that all data transmitted between your device and our servers remains protected from unauthorized access. We continuously monitor our platform to provide a safe and secure browsing experience.',
    icon: (
      <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Secured Logins',
    description: 'User accounts are protected with secure authentication methods and encrypted passwords. We encourage the use of strong passwords, and login sessions are securely managed to help prevent unauthorized account access.',
    icon: (
      <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'The Cloud',
    description: 'Your salon data is securely stored on reliable cloud infrastructure with regular backups and high availability. Cloud-based storage enables secure access to your business information while helping ensure data integrity and disaster recovery.',
    icon: (
      <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'Staff Access Control',
    description: 'Salon owners can assign role-based permissions to employees, allowing staff members to access only the features and information necessary for their responsibilities. This minimizes unauthorized access and helps maintain operational security.',
    icon: (
      <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408l1.531 1.532a2.25 2.25 0 003.182 0l2.9-2.9m-4.082-2.512a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
    )
  },
  {
    id: 5,
    title: 'Your Confidentiality',
    description: 'We respect your privacy and treat your business and customer information as confidential. Personal and business data is handled responsibly and is never shared with unauthorized third parties without your consent, except where required by law.',
    icon: (
      <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Security Testing',
    description: 'Our platform undergoes regular security assessments, testing, and updates to identify and address potential risks. We continuously improve our security measures to protect against evolving threats and maintain a secure environment.',
    icon: (
      <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    )
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between antialiased">
      
      {/* Content Wrapper Section */}
      <section className="w-full text-gray-900 font-sans px-4 py-16 md:py-24 flex-grow">
        <div className="max-w-7xl mx-auto">
          
          {/* === HEADER SECTION === */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase block">
              - Security -
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 uppercase">
              NEOPARLOUR SECURITY
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
              Neoparlour understands the privacy and security of customer's data. As the trustable brand, we follow 
              all the security measures to ensure that no stone remains untouched and gives the highest level of 
              security to keep the sensitive data protected.
            </p>
          </div>

          {/* === FEATURE CARDS GRID === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {securityFeatures.map((feature) => (
              <div 
                key={feature.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col items-start text-left"
              >
                {/* Icon container */}
                <div className="mb-5 p-1 bg-gray-50 rounded-lg">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- GLOBAL SEO FOOTER CONTAINER --- */}
      <div className="w-full bg-white border-t border-gray-200">
        <SEOFooter />
      </div>

    </div>
  );
}