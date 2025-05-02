import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// A collection of Cat + Star Wars puns
const CAT_STAR_WARS_PUNS = [
  "May the purrce be with you.",
  "I am your fur-ther.",
  "These are not the jobs you're looking fur.",
  "Paw-dawan training begins now.",
  "Use the fur-ce, always.",
  "Job search, I must. Nap later, I will.",
  "You were the chosen bun… for this job!",
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
  "Put your best paw forward—and not in Comic Sans.",
  "Tailor that resume like you're stalking prey.",
  "Don't be kitten around—show them your skills.",
  "This resume? Cat-chy and claw-ver.",
  "Resume ghosted? Let's haunt 'em back.",
  "No fluff—just sharp claws and clear accomplishments."
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
  "Numbers don't lie—but they do nap.",
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
  "Career growth? I smell it… like tuna.",
  "Your next job is out there—lurking like a laser dot."
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-[#FF66C4] to-[#5CE1E6] rounded-full p-1">
            <div className="bg-white rounded-full p-1">
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-[#FF66C4] to-[#5CE1E6]">
                <span className="text-white text-xl">😺</span>
              </div>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-gray-900">Luke Skywhisker</h3>
            <p className="text-sm text-gray-500">Career Jedi Master</p>
          </div>
        </div>
        <div>
          <select 
            className="text-sm border border-gray-300 rounded-md py-1 pl-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
            onChange={(e) => setSelectedCategory(e.target.value)}
            value={selectedCategory}
          >
            {PUN_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[80px] flex items-center">
        <p className="text-gray-700 italic">{currentPun}</p>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={getRandomPun}
          className="bg-gradient-to-r from-[#FF66C4] to-[#5CE1E6] text-white hover:shadow-lg transition-all"
        >
          Another Pun
        </Button>
      </div>
    </div>
  );
}