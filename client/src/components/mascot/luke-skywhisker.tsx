import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Luke Skywhisker SVG Component with animations
const LukeSkywhiskerSVG = ({ className }: { className?: string }) => {
  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      {/* Cat face - base */}
      <motion.circle cx="60" cy="60" r="45" fill="#FFE0B2" />
      
      {/* Cat ears */}
      <motion.path
        d="M30 30L45 45L25 15Z"
        fill="#FFB74D"
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.path
        d="M90 30L75 45L95 15Z"
        fill="#FFB74D"
        animate={{ rotate: [0, -5, 0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      {/* Eyes */}
      <motion.circle 
        cx="45" 
        cy="55" 
        r="5" 
        fill="#5D4037"
        animate={{ scaleY: [1, 0.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
      />
      <motion.circle 
        cx="75" 
        cy="55" 
        r="5" 
        fill="#5D4037"
        animate={{ scaleY: [1, 0.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
      />
      
      {/* Nose */}
      <motion.path
        d="M60 65L55 70H65L60 65Z"
        fill="#FF66C4"
      />
      
      {/* Mouth */}
      <motion.path
        d="M50 75Q60 85 70 75"
        stroke="#5D4037"
        strokeWidth="2"
        fill="none"
        animate={{ d: ["M50 75Q60 85 70 75", "M50 75Q60 80 70 75", "M50 75Q60 85 70 75"] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Whiskers */}
      <motion.line
        x1="30" y1="70" x2="45" y2="70"
        stroke="#5D4037"
        strokeWidth="1"
        animate={{ x1: [30, 33, 30] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.line
        x1="30" y1="75" x2="45" y2="75"
        stroke="#5D4037"
        strokeWidth="1"
        animate={{ x1: [30, 33, 30] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.line
        x1="90" y1="70" x2="75" y2="70"
        stroke="#5D4037"
        strokeWidth="1"
        animate={{ x1: [90, 87, 90] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.line
        x1="90" y1="75" x2="75" y2="75"
        stroke="#5D4037"
        strokeWidth="1"
        animate={{ x1: [90, 87, 90] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      
      {/* Light Saber */}
      <motion.rect
        x="95" y="90"
        width="5" height="15"
        fill="#5D4037"
      />
      <motion.rect
        x="96" y="50"
        width="3" height="40"
        fill="#5CE1E6"
        animate={{ height: [40, 45, 40], y: [50, 45, 50] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.svg>
  );
};

// A collection of Cat + Star Wars puns
const CAT_STAR_WARS_PUNS = [
  "May the purrce be with you.",
  "I am your fur-ther.",
  "These are not the jobs you're looking fur.",
  "Paw-dawan training begins now.",
  "Use the fur-ce, always.",
  "Job search, I must. Nap later, I will.",
  "You were the chosen bun... for this job!",
  "That resume? Immeowculate.",
  "I sense a meowment of opportunity.",
  "Time to claw your way to the top, young Skywhisker."
];

// Resume-related cat puns
const CAT_RESUME_PUNS = [
  "Let's declaw that outdated resume.",
  "Furget the resume, let them see the real you.",
  "Your purrsonal brand is paws-itively strong.",
  "Nine lives, nine versions of your resume.",
  "Put your best paw forward - and not in Comic Sans.",
  "Tailor that resume like you're stalking prey.",
  "Don't be kitten around - show them your skills.",
  "This resume? Cat-chy and claw-ver.",
  "Resume ghosted? Let's haunt 'em back.",
  "No fluff - just sharp claws and clear accomplishments."
];

// Ghosting-related cat puns
const CAT_GHOST_PUNS = [
  "That recruiter ghosted? Hiss-terical.",
  "Ghosting is for haunted houses, not job seekers.",
  "They vanished faster than a scaredy-cat!",
  "Let's claw back from the ghostlands.",
  "I ain't afraid of no ghost... recruiter.",
  "One minute it's 'great interview,' next it's 👻.",
  "Exorcising ghost jobs from your search.",
  "You deserve more than a phantom 'we'll be in touch.'",
  "Seen too many ghostings? Let's howl about it.",
  "Purrhaps they weren't ready for your sparkle."
];

// Report-related cat puns
const CAT_REPORT_PUNS = [
  "This report is pawsitively insightful.",
  "Data purr-sists, opinions don't.",
  "Let's pounce on these findings.",
  "Numbers don't lie - but they do nap.",
  "Clawing through the data, one tab at a time.",
  "Reporting live: feline findings ahead.",
  "Charts so good, I'm feline fine.",
  "Can't argue with the meow-trics.",
  "Analytics? More like meow-nalytics.",
  "This dashboard is littered with insight."
];

// Job search-related cat puns
const CAT_JOB_SEARCH_PUNS = [
  "Keep calm and stay paw-sitive.",
  "You're the cat-alyst for workplace change.",
  "Every rejection is just a hiss-toric redirection.",
  "That job wasn't good enough fur you anyway.",
  "You've got grit, grace, and purr-sistence.",
  "Networking: aka strategic social scratching.",
  "Let's swipe right on opportunity.",
  "Interview nerves? Just channel your inner lion.",
  "Career growth? I smell it... like tuna.",
  "Your next job is out there - lurking like a laser dot."
];

// Combine all pun categories
const ALL_PUNS = [
  ...CAT_STAR_WARS_PUNS,
  ...CAT_RESUME_PUNS,
  ...CAT_GHOST_PUNS,
  ...CAT_REPORT_PUNS,
  ...CAT_JOB_SEARCH_PUNS
];

// Pun categories for the filter dropdown
const PUN_CATEGORIES = [
  { id: 'all', name: 'All Puns' },
  { id: 'star-wars', name: 'Star Wars Puns' },
  { id: 'resume', name: 'Resume Puns' },
  { id: 'ghost', name: 'Ghosting Puns' },
  { id: 'report', name: 'Report Puns' },
  { id: 'job-search', name: 'Job Search Puns' }
];

interface LukeSkywhiskerProps {
  className?: string;
}

export default function LukeSkywhisker({ className = '' }: LukeSkywhiskerProps) {
  const [currentPun, setCurrentPun] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get puns based on selected category
  const getPunsByCategory = (category: string) => {
    switch (category) {
      case 'star-wars':
        return CAT_STAR_WARS_PUNS;
      case 'resume':
        return CAT_RESUME_PUNS;
      case 'ghost':
        return CAT_GHOST_PUNS;
      case 'report':
        return CAT_REPORT_PUNS;
      case 'job-search':
        return CAT_JOB_SEARCH_PUNS;
      case 'all':
      default:
        return ALL_PUNS;
    }
  };

  // Get a random pun from the selected category
  const getRandomPun = () => {
    const puns = getPunsByCategory(selectedCategory);
    const randomIndex = Math.floor(Math.random() * puns.length);
    setCurrentPun(puns[randomIndex]);
  };

  // Set an initial pun on component mount
  useEffect(() => {
    getRandomPun();
  }, [selectedCategory]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <div className="mr-3">
            {/* Replace emoji with our SVG component */}
            <LukeSkywhiskerSVG className="w-20 h-20" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-heading">Luke Skywhisker</h3>
            <p className="text-base text-gray-600">Career Jedi Master</p>
          </div>
        </div>
        <div>
          {/* Improved font and styling for dropdown */}
          <div className="relative">
            <select 
              className="w-full md:w-auto text-base border-2 border-gray-300 rounded-lg py-2 px-4 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-[#5CE1E6] focus:border-[#5CE1E6] font-medium appearance-none cursor-pointer shadow-sm"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
              aria-label="Select pun category"
            >
              {PUN_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="bg-gray-50 rounded-lg p-5 mb-5 min-h-[90px] flex items-center shadow-inner"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentPun} // This ensures animation triggers on pun change
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-800 text-lg font-medium leading-relaxed">{currentPun}</p>
      </motion.div>
      
      <div className="flex justify-end">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={getRandomPun}
            className="bg-gradient-to-r from-[#FF66C4] to-[#5CE1E6] text-white hover:shadow-lg transition-all text-base px-6 py-3 rounded-lg font-medium"
            size="lg"
          >
            Another Pun
          </Button>
        </motion.div>
      </div>
    </div>
  );
}