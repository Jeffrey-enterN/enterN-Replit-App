import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { User, JobseekerProfile } from '@shared/schema';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SwipeCardProps = {
  profile: User & { jobseekerProfile: JobseekerProfile };
  onSwipe: (direction: 'left' | 'right') => void;
  isFirstCard?: boolean;
};

/**
 * Enhanced SwipeCard component with realistic card deck feel
 * 
 * Features:
 * - Natural physics-based swiping motion
 * - Rotation during swipe to feel realistic
 * - Smooth animations and transitions
 * - Clear visual feedback during swipe actions
 * - Stacked card appearance for depth
 */
export function EnhancedSwipeCard({ profile, onSwipe, isFirstCard = false }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exitX, setExitX] = useState<number>(0);
  const [exitY, setExitY] = useState<number>(0);
  
  // Track swipe progress and direction
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  // Motion values for drag interactions
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  
  // Rotate card slightly during drag
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  
  // Visual indicators for like/dislike based on drag position
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  // Scale down other cards slightly to create deck effect
  const cardIndex = isFirstCard ? 0 : 1;
  const baseScale = 1 - (cardIndex * 0.05);
  const baseY = cardIndex * 10;
  
  // Get firstName and lastName
  const firstName = profile.firstName || '';
  const lastName = profile.lastName ? profile.lastName.charAt(0) + '.' : '';
  const displayName = `${firstName} ${lastName}`;
  
  // Get school and major
  const school = profile.jobseekerProfile?.school || 'University';
  const major = profile.jobseekerProfile?.major || 'Not specified';
  
  // Handle drag end
  const handleDragEnd = (info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right (like)
      setDirection('right');
      setExitX(500);
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      // Swiped left (dislike)
      setDirection('left');
      setExitX(-500);
      onSwipe('left');
    }
  };
  
  // Card style based on deck position
  const cardStyle = {
    zIndex: 100 - cardIndex,
    y: baseY,
    scale: baseScale,
    boxShadow: isFirstCard 
      ? '0 4px 14px rgba(0, 0, 0, 0.2)' 
      : '0 2px 8px rgba(0, 0, 0, 0.15)',
  };
  
  // Define variants for card animations
  const cardVariants = {
    active: {
      scale: baseScale,
      y: baseY,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      x: exitX,
      y: exitY,
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <motion.div
      ref={cardRef}
      className="absolute top-0 left-0 right-0 w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden"
      style={{
        ...cardStyle,
        x,
        y: y,
        rotate,
      }}
      drag={isFirstCard}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => handleDragEnd(info)}
      variants={cardVariants}
      initial="active"
      animate="active"
      exit="exit"
      whileTap={{ scale: 1.02 }}
    >
      {/* Card Content */}
      <div className="relative h-[500px]">
        {/* Profile Picture Placeholder */}
        <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
          <div className="rounded-full w-20 h-20 bg-gray-300 flex items-center justify-center text-gray-500 text-2xl">
            {firstName.charAt(0)}
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="p-4">
          <h3 className="text-xl font-semibold">{displayName}</h3>
          <p className="text-gray-500">{school}</p>
          <p className="text-gray-600">{major}</p>
          
          {/* Additional Profile Details */}
          <div className="mt-4 space-y-2">
            {profile.jobseekerProfile?.preferredLocations?.map((location, index) => (
              <span 
                key={index} 
                className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
        
        {/* Action Indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Like Indicator */}
          <motion.div 
            className="absolute top-10 right-10 bg-green-500 text-white rounded-full p-4"
            style={{ opacity: likeOpacity }}
          >
            <Check className="h-8 w-8" />
          </motion.div>
          
          {/* Dislike Indicator */}
          <motion.div 
            className="absolute top-10 left-10 bg-red-500 text-white rounded-full p-4"
            style={{ opacity: dislikeOpacity }}
          >
            <X className="h-8 w-8" />
          </motion.div>
        </div>
      </div>
      
      {/* Action Buttons (if first card) */}
      {isFirstCard && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-6">
          <button
            onClick={() => {
              setDirection('left');
              setExitX(-500);
              onSwipe('left');
            }}
            className="bg-white shadow-lg rounded-full p-4 text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={() => {
              setDirection('right');
              setExitX(500);
              onSwipe('right');
            }}
            className="bg-white shadow-lg rounded-full p-4 text-green-500 hover:bg-green-50 transition-colors"
          >
            <Check className="h-6 w-6" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/**
 * SwipeCardDeck component to manage a stack of cards
 */
export function SwipeCardDeck({ 
  profiles, 
  onSwipe 
}: { 
  profiles: (User & { jobseekerProfile: JobseekerProfile })[], 
  onSwipe: (id: number, direction: 'left' | 'right') => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex < profiles.length) {
      onSwipe(profiles[currentIndex].id, direction);
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      {/* Display up to 3 cards for stack effect */}
      {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
        <EnhancedSwipeCard
          key={profile.id}
          profile={profile}
          onSwipe={handleSwipe}
          isFirstCard={index === 0}
        />
      ))}
      
      {/* Empty state when no more profiles */}
      {currentIndex >= profiles.length && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
          <p className="text-gray-500">Check back later for new matches</p>
        </div>
      )}
    </div>
  );
}