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
  
  // Enhanced stacked card appearance with multiple visual cues
  const cardIndex = isFirstCard ? 0 : 1;
  
  // Apply a more noticeable scale decrease for background cards
  // The top card is full size, but cards below get progressively smaller
  const baseScale = 1 - (cardIndex * 0.03);
  
  // Stack cards with carefully calibrated offsets
  // This creates a realistic "stacked deck" appearance
  const baseY = cardIndex * 8; // vertical offset
  const baseX = cardIndex * 2; // slight horizontal offset
  
  // Apply subtle rotation to each card in the stack
  // First card is straight, cards below have slight counter-clockwise rotation
  const baseRotate = cardIndex * -0.6; // very subtle rotation for lower cards
  
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
    x: baseX,
    scale: baseScale,
    rotateZ: baseRotate,
    // Enhanced shadow effect for a more physical card look
    // First card has stronger shadow for elevation
    boxShadow: isFirstCard 
      ? '0 8px 20px rgba(0, 0, 0, 0.15)' 
      : `0 ${2 + cardIndex}px ${6 + cardIndex * 2}px rgba(0, 0, 0, 0.08)`,
  };
  
  // Define variants for card animations with enhanced stacking
  const cardVariants = {
    active: {
      scale: baseScale,
      y: baseY,
      x: baseX,
      rotateZ: baseRotate,
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      x: exitX,
      y: exitY,
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <motion.div
      ref={cardRef}
      className="absolute top-0 left-0 right-0 w-full max-w-sm mx-auto bg-white rounded-2xl overflow-hidden border border-gray-100"
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
      <div className="relative h-[480px]">
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
          {/* Like Indicator - With enterN brand color: #0097B1 */}
          <motion.div 
            className="absolute top-10 right-10 bg-[#0097B1] text-white rounded-full p-4 shadow-lg"
            style={{ opacity: likeOpacity }}
          >
            <Check className="h-8 w-8" />
          </motion.div>
          
          {/* Dislike Indicator - With enterN brand color: #FF66C4 */}
          <motion.div 
            className="absolute top-10 left-10 bg-[#FF66C4] text-white rounded-full p-4 shadow-lg"
            style={{ opacity: dislikeOpacity }}
          >
            <X className="h-8 w-8" />
          </motion.div>
          
          {/* Card edges - visual indicator when dragging */}
          <motion.div 
            className="absolute inset-0 border-4 border-[#0097B1] rounded-2xl pointer-events-none"
            style={{ opacity: likeOpacity }}
          />
          
          <motion.div 
            className="absolute inset-0 border-4 border-[#FF66C4] rounded-2xl pointer-events-none"
            style={{ opacity: dislikeOpacity }}
          />
        </div>
      </div>
      
      {/* Action Buttons (if first card) - Using enterN brand colors */}
      {isFirstCard && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-6">
          <button
            onClick={() => {
              setDirection('left');
              setExitX(-500);
              onSwipe('left');
            }}
            className="bg-white shadow-lg rounded-full p-4 text-[#FF66C4] hover:bg-[#fff2f9] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={() => {
              setDirection('right');
              setExitX(500);
              onSwipe('right');
            }}
            className="bg-white shadow-lg rounded-full p-4 text-[#0097B1] hover:bg-[#e6f7fa] transition-colors"
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
 * 
 * Features:
 * - Manages a stack of profile cards
 * - Shows multiple cards for a realistic deck appearance
 * - Handles swiping gestures and button interactions
 * - Provides smooth animations when cards are swiped
 * - Optimized for mobile viewing with proper card size and positioning
 */
export function SwipeCardDeck({ 
  profiles, 
  onSwipe 
}: { 
  profiles: (User & { jobseekerProfile: JobseekerProfile })[], 
  onSwipe: (id: number, direction: 'left' | 'right') => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Tracks if we're currently processing a swipe animation
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex < profiles.length && !isAnimating) {
      setIsAnimating(true);
      onSwipe(profiles[currentIndex].id, direction);
      
      // Wait for animation to complete before advancing
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };
  
  return (
    <div className="relative w-full mx-auto flex items-center justify-center">
      {/* Card container - sized to be slightly smaller than screen width */}
      <div className="relative h-[580px] w-[94%] max-w-sm mx-auto my-4">
        {/* Instructions - only shown when there are cards */}
        {profiles.length > 0 && currentIndex < profiles.length && (
          <div className="text-center text-sm text-gray-500 mb-3">
            Swipe right to show interest, left to pass
          </div>
        )}
        
        {/* Display up to 5 cards for enhanced stack effect */}
        {profiles.slice(currentIndex, currentIndex + 5).map((profile, index) => (
          <EnhancedSwipeCard
            key={profile.id}
            profile={profile}
            onSwipe={handleSwipe}
            isFirstCard={index === 0}
          />
        ))}
        
        {/* Card count indicator */}
        {profiles.length > 0 && currentIndex < profiles.length && (
          <div className="absolute top-[-18px] right-2 bg-white text-xs text-gray-500 px-2 py-1 rounded-full shadow-sm border border-gray-100">
            {profiles.length - currentIndex} profile{profiles.length - currentIndex !== 1 ? 's' : ''}
          </div>
        )}
        
        {/* Empty state when no more profiles */}
        {currentIndex >= profiles.length && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
            <p className="text-gray-500">Check back later for new matches</p>
          </div>
        )}
        
        {/* Loading state when data is being fetched */}
        {profiles.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-500">Loading profiles...</p>
          </div>
        )}
      </div>
      
      {/* Swipe instructions - only shown on larger screens */}
      <div className="hidden md:block absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400">
        You can also use ← and → arrow keys to swipe
      </div>
    </div>
  );
}