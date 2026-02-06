import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import jamseshLogo from "figma:asset/8f21c73b1596e2021befc55be858a14f3bf5de85.png";
import goldenCoverArt from "figma:asset/30f8e2af4004fcbd6a1a0a5fa68bab38bceaf91c.png";
import badge50Songs from "figma:asset/a25ab31633b7283024a56b5387ceacd4d40e49d4.png";
import badgeLevel10Group from "figma:asset/48116286450e97b9783a3705b75fe43f0b9cfbad.png";
import badgeLevel20Vocals from "figma:asset/a20b6c7961750513b40edd33b9fe2dc9c9e6a412.png";

export function RewardsScreen() {
  // Mock rewards data
  const coinsEarned = 1250;
  const xpEarned = 3500;
  const currentLevel = 42;
  const xpToNextLevel = 5000;
  const currentXP = 3200;
  const xpAfterReward = currentXP + xpEarned;
  const xpProgress = (xpAfterReward / xpToNextLevel) * 100;

  const coverArt = goldenCoverArt;

  const badges = [
    {
      image: badge50Songs,
      name: "50 Songs Performed",
      isNew: true,
    },
    {
      image: badgeLevel10Group,
      name: "Level 10 Group",
      isNew: false,
    },
    {
      image: badgeLevel20Vocals,
      name: "Level 20 Vocals",
      isNew: true,
    },
  ];

  return (
    <div className="w-[1920px] h-[1080px] relative overflow-hidden rounded-2xl shadow-2xl">
      {/* Background artwork with overlay */}
      <div className="absolute inset-0">
        {/* Cover artwork as background */}
        <img
          src={coverArt}
          alt="Background"
          className="w-full h-full object-cover"
        />
        
        {/* 90% opaque black overlay */}
        <div className="absolute inset-0 bg-black opacity-90"></div>

        {/* Jamsesh Logo - Above black overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-8 right-8 z-10"
        >
          <img src={jamseshLogo} alt="Jamsesh" className="h-20 opacity-80" />
        </motion.div>
      </div>

      {/* Animated background elements - CSS GPU-composited */}
      <div className="absolute inset-0" style={{ contain: 'layout style paint' }}>
        {/* Glowing orbs */}
        <div
          className="absolute top-32 left-32 w-96 h-96 bg-purple-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-slow 4s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-32 right-32 w-[28rem] h-[28rem] bg-blue-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-fast 5s ease-in-out infinite 1s' }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col px-20 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-7xl font-black text-white">
            Your <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Rewards</span>
          </h1>
        </motion.div>

        {/* Three Equal Panels */}
        <div className="flex gap-10 flex-1">
          {/* Left Panel - Jamsesh Coins */}
          <div className="flex-1 flex flex-col h-full px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col h-full items-center justify-center"
            >
              <h2 className="text-6xl font-black text-white mb-8">Jamsesh Coins</h2>
              
              {/* Coin Visual */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                className="relative mb-12"
              >
                <div
                  className="w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50"
                >
                  <div className="w-52 h-52 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center border-4 border-yellow-200">
                    <span className="text-8xl font-black text-orange-900">J</span>
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-40"></div>
              </motion.div>

              {/* Coins Earned */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center"
              >
                <p className="text-3xl text-purple-300 mb-3">Earned</p>
                <p className="text-8xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                  +{coinsEarned.toLocaleString()}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Middle Panel - Badges */}
          <div className="flex-1 flex flex-col h-full px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col h-full items-center justify-center"
            >
              <h2 className="text-6xl font-black text-white mb-12">Badges</h2>
              
              {/* Badges Display */}
              <div className="flex flex-col gap-8">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                    className="flex items-center gap-6 bg-purple-900/30 rounded-2xl p-4 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all"
                  >
                    {/* Badge Image */}
                    <div className="relative">
                      <img 
                        src={badge.image} 
                        alt={badge.name} 
                        className="h-28 w-28 rounded-full object-cover border-4 border-purple-500/50" 
                      />
                      {badge.isNew && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.8 + index * 0.15 }}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl font-black px-4 py-1 rounded-full shadow-lg"
                        >
                          NEW
                        </motion.div>
                      )}
                    </div>

                    {/* Badge Name */}
                    <div className="flex-1">
                      <p className="text-3xl font-black text-white">{badge.name}</p>
                      {badge.isNew && (
                        <p className="text-xl text-pink-400">Just unlocked!</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - XP */}
          <div className="flex-1 flex flex-col h-full px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col h-full items-center justify-center"
            >
              <h2 className="text-6xl font-black text-white mb-12">XP</h2>
              
              {/* Level Circle */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
                className="relative mb-12"
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-50"></div>
                
                {/* Main level circle */}
                <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl border-4 border-purple-400">
                  <div className="text-center">
                    <p className="text-3xl text-purple-200 mb-2">Level</p>
                    <p className="text-9xl font-black text-white">{currentLevel}</p>
                  </div>
                </div>
              </motion.div>

              {/* XP Earned */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mb-8"
              >
                <p className="text-3xl text-purple-300 mb-3">Earned</p>
                <p className="text-8xl font-black text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]">
                  +{xpEarned.toLocaleString()}
                </p>
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="w-full"
              >
                <div className="bg-purple-900/40 rounded-full h-8 overflow-hidden border-2 border-purple-500/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg shadow-purple-500/50"
                  />
                </div>
                <div className="flex justify-between mt-3">
                  <p className="text-xl text-purple-300">{xpAfterReward.toLocaleString()} XP</p>
                  <p className="text-xl text-purple-300">{xpToNextLevel.toLocaleString()} XP</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row - Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex justify-center gap-6 mt-6"
        >
          <button className="px-20 py-6 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50" style={{ fontSize: '2.5rem' }}>
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}