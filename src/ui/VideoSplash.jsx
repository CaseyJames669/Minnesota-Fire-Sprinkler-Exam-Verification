import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export const VideoSplash = ({ onComplete }) => {
  const videoRef = useRef(null);
  const playCountRef = useRef(0);
  const MAX_PLAYS = 1;

  useEffect(() => {
    // Ensure video plays (sometimes required for stricter autoplay policies)
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error("Autoplay failed:", err);
      });
    }
  }, []);

  const handleEnded = () => {
    playCountRef.current += 1;
    if (playCountRef.current < MAX_PLAYS) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      <video
        ref={videoRef}
        src="/splash.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted // Start muted to ensure autoplay works on all devices
        playsInline
        onEnded={handleEnded}
      />
    </motion.div>
  );
};
