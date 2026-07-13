import React from 'react';
import SEOFooter from '../common/SEOFooter';

const directors = [
  {
    id: 1,
    name: 'Santosh Mhaske',
    role: 'Managing Director | Founder',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', 
  },
  { id: 2, name: 'Sagar Bamgude', role: 'Managing Director | Founder', image: null },
  { id: 3, name: 'Jeevan Joshi', role: 'Managing Director | Founder', image: null },
  { id: 4, name: 'Santosh  ', role: 'Managing Director | Founder', image: null },
];

// Split the team data exactly as requested
const topTeamRow = [
  { id: 1, name: 'Pratik Ghodke', role: 'Software Developer' },
  { id: 2, name: 'Tanuja Shete', role: 'Software Developer' },
  { id: 3, name: 'Avishkar Mandlik', role: 'Software Developer' },
  { id: 4, name: 'Akash Chaudhari', role: 'UI/UX Designer' },
];

const bottomTeamRow = [
  { id: 5, name: 'Pravin Wadkar', role: 'Senior UI/UX Designer' },
  { id: 6, name: 'Mitesh Waghmode', role: 'SDET' },
  { id: 7, name: 'Jayraj Pulate', role: 'Software Developer' },
  { id: 8, name: 'Omkar Joshi', role: 'Software Developer' },
  { id: 9, name: 'Atharv Borle', role: 'Cloud DevOps Engineer' },
];
 
export default function TeamPage() {
  // Helper component for the individual profile badges
  const TeamCard = ({ member }) => (
    <div className="flex-shrink-0 w-[280px] bg-white rounded-xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-gray-100 p-4 flex items-center space-x-4">
      <div className="w-11 h-11 bg-gray-300 rounded-full flex-shrink-0" />
      <div className="text-left overflow-hidden">
        <h4 className="font-bold text-sm text-gray-900 truncate">{member.name}</h4>
        <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{member.role}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white font-sans antialiased text-gray-900 overflow-x-hidden">
      
      {/* Injecting keyframes for infinite marquee loops */}
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          display: flex;
          width: max-content;
          animation: scrollLeft 25s linear infinite;
        }
        .animate-scroll-right {
          display: flex;
          width: max-content;
          animation: scrollRight 25s linear infinite;
        }
        .animate-scroll-left:hover, .animate-scroll-right:hover {
          animation-play-state: paused;
        }
        .mask-gradient {
          mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
        }
      `}</style>

      {/* --- LEADERSHIP / BOARD OF DIRECTORS SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase block mb-2">- Leadership -</span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">BOARD OF DIRECTORS</h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-12">
          Meet the team leading us into the future of AI-driven business solutions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {directors.map((director) => (
            <div key={director.id} className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#7d8285] shadow-md">
              {director.image && (
                <img src={director.image} alt={director.name} className="w-full h-full object-cover object-top" />
              )}
              <div className="absolute bottom-4 left-4 right-4 bg-red-600/85 backdrop-blur-sm text-white text-left p-3 rounded-lg">
                <h4 className="font-bold text-base tracking-wide leading-tight">{director.name}</h4>
                <p className="text-[11px] text-gray-200 mt-0.5 font-medium tracking-wide">{director.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- MEET OUR TEAM SECTION (SCROLLABLE ROWS) --- */}
      <section className="w-full bg-gradient-to-b from-[#f2f4f7] to-[#f9fafb] py-16 overflow-hidden">
        <div className="text-center w-full">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-12 text-gray-900 uppercase">
            Meet Our Team
          </h2>

          <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto relative">
            
            {/* ROW 1: Moves Left (4 Items duplicated) */}
            <div className="w-full overflow-hidden mask-gradient">
              <div className="animate-scroll-left gap-4 px-2">
                {/* Original elements */}
                {topTeamRow.map((member) => <TeamCard key={`top-orig-${member.id}`} member={member} />)}
                {/* Duplicated items to make the loop seamless */}
                {topTeamRow.map((member) => <TeamCard key={`top-dup-${member.id}`} member={member} />)}
              </div>
            </div>

            {/* ROW 2: Moves Right (5 Items duplicated) */}
            <div className="w-full overflow-hidden mask-gradient">
              <div className="animate-scroll-right gap-4 px-2">
                {/* Original elements */}
                {bottomTeamRow.map((member) => <TeamCard key={`bot-orig-${member.id}`} member={member} />)}
                {/* Duplicated items to make the loop seamless */}
                {bottomTeamRow.map((member) => <TeamCard key={`bot-dup-${member.id}`} member={member} />)}
              </div>
            </div>

          </div>
        </div>
      </section>
      <SEOFooter />
    </div>
  );
}