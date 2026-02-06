import { useState } from "react";
import { Star, Trophy, Heart, Mic } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import avatar1 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar2 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar3 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar4 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import neonPhantomsLogo from "figma:asset/e7095faa4d286b81d827f7ec5105d4cc4c6ebe83.png";
import jamseshHuntersLogo from "figma:asset/8bccb91dc4451190b8755ee6a14174cd822f190d.png";
import electricDreamsLogo from "figma:asset/b68c8fdb5cc5289790a4bc1cd35653e67ea6b063.png";
import rhythmRebelsLogo from "figma:asset/447ba958ffb77b6079632ac524a094a6ea803582.png";
import jamseshLogo from "figma:asset/8f21c73b1596e2021befc55be858a14f3bf5de85.png";
import badge50Songs from "figma:asset/a25ab31633b7283024a56b5387ceacd4d40e49d4.png";
import badgeLevel10Group from "figma:asset/48116286450e97b9783a3705b75fe43f0b9cfbad.png";
import badgeLevel20Vocals from "figma:asset/a20b6c7961750513b40edd33b9fe2dc9c9e6a412.png";
import fateOfOpheliaArt from "figma:asset/0f8640ca9c34f14ee786d6f146b7de668a243f88.png";

export function PrototypeSoloToRewards({ onBackToMenu }: { onBackToMenu?: () => void }) {
  const [currentScreen, setCurrentScreen] = useState<'solo' | 'rewards'>('solo');

  if (currentScreen === 'solo') {
    return <SoloArtworkScreen onContinue={() => setCurrentScreen('rewards')} />;
  }

  return <RewardsScreenView onContinue={onBackToMenu || (() => setCurrentScreen('solo'))} />;
}

// Solo Artwork Screen Component
function SoloArtworkScreen({ onContinue }: { onContinue: () => void }) {
  const score = 987654;
  const accuracy = 98.5;
  const maxCombo = 342;
  const perfectHits = 523;
  const totalNotes = 531;
  const songName = "The Fate of Ophelia";
  const artistName = "Taylor Swift";
  const difficulty = "Expert";
  const coverArt = fateOfOpheliaArt;

  const stars = accuracy >= 99 ? 5 : accuracy >= 95 ? 4 : accuracy >= 85 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  const perfectPercentage = ((perfectHits / totalNotes) * 100).toFixed(1);
  const notesHitPercentage = (((totalNotes - 8) / totalNotes) * 100).toFixed(1);

  const bandLeaderboardEntries = [
    {
      rank: 1,
      bandName: "Neon Phantoms",
      score: 1245678,
      logoImage: neonPhantomsLogo,
      isCurrentBand: false,
    },
    {
      rank: 2,
      bandName: "Jamsesh Hunters",
      score: 1123456,
      logoImage: jamseshHuntersLogo,
      isCurrentBand: true,
    },
    {
      rank: 3,
      bandName: "Electric Dreams",
      score: 1098765,
      logoImage: electricDreamsLogo,
      isCurrentBand: false,
    },
    {
      rank: 4,
      bandName: "Rhythm Rebels",
      score: 987654,
      logoImage: rhythmRebelsLogo,
      isCurrentBand: false,
    },
  ];

  return (
    <div className="w-[1920px] h-[1080px] relative overflow-hidden rounded-2xl shadow-2xl">
      {/* Background artwork with overlay */}
      <div className="absolute inset-0">
        <img
          src={fateOfOpheliaArt}
          alt={songName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-90"></div>
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
        <div
          className="absolute top-32 left-32 w-96 h-96 bg-purple-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-slow 4s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-32 right-32 w-[28rem] h-[28rem] bg-blue-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-fast 5s ease-in-out infinite 1s' }}
        />
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
      <div className="relative z-10 h-full flex flex-col px-20 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-7xl font-black text-white">
            You crushed it, <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Jamsesh Hunters</span>!
          </h1>
        </motion.div>

        <div className="flex gap-10 mb-5" style={{ height: 'calc(100% - 240px)' }}>
          {/* Left Panel - Player Stats */}
          <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5">
            <h2 className="text-6xl font-black text-white mb-8 text-center">Score</h2>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-6 mb-6"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-purple-400" />
                <p className="text-3xl text-purple-400 font-black">{difficulty}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mic className="w-8 h-8 text-pink-400" />
                <p className="text-3xl text-pink-400 font-black">Vocals</p>
              </div>
            </motion.div>

            <div className="flex flex-col justify-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-6 text-center"
              >
                <p className="text-7xl font-black text-white tracking-tight leading-none">
                  {score.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex gap-4 justify-center"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  >
                    <Star
                      className={`w-16 h-16 ${
                        i < stars
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                          : "fill-transparent text-purple-800"
                      }`}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 gap-3"
            >
              <StatCard label="Accuracy" value={`${accuracy}%`} color="green" />
              <StatCard label="Max Combo" value={maxCombo.toString()} color="yellow" />
              <StatCard label="Perfect Hits" value={`${perfectPercentage}%`} color="pink" />
              <StatCard label="Notes Hit" value={`${notesHitPercentage}%`} color="blue" />
            </motion.div>
          </div>

          {/* Middle Panel - Cover Art */}
          <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center justify-between h-full"
            >
              <div className="w-[500px] h-[500px] rounded-2xl overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
                <img
                  src={fateOfOpheliaArt}
                  alt={songName}
                  className="w-full h-full object-cover"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center mt-4"
              >
                <h2 className="text-4xl font-black text-white mb-2">{songName}</h2>
                <p className="text-4xl text-purple-300">{artistName}</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Panel - Leaderboard */}
          <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-6xl font-black text-white mb-8 text-center">Leaderboard</h2>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-2.5">
                  {bandLeaderboardEntries.map((entry, index) => (
                    <motion.div
                      key={entry.bandName}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className={`flex items-center gap-5 p-2.5 rounded-xl transition-all duration-300 ${
                        entry.isCurrentBand
                          ? "bg-gradient-to-r from-yellow-600/40 to-yellow-800/40 border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/20"
                          : "bg-purple-900/30 hover:bg-purple-900/50"
                      }`}
                    >
                      <div className="w-7 text-center flex-shrink-0">
                        <span className="text-2xl font-black text-white">{entry.rank}</span>
                      </div>

                      <div className="relative w-20 h-20 rounded-full flex-shrink-0">
                        {entry.rank === 1 && (
                          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md opacity-60"></div>
                        )}
                        {entry.rank === 2 && (
                          <div className="absolute inset-0 rounded-full bg-gray-300 blur-md opacity-60"></div>
                        )}
                        {entry.rank === 3 && (
                          <div className="absolute inset-0 rounded-full bg-orange-600 blur-md opacity-60"></div>
                        )}
                        
                        <div className={`relative w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center ${
                          entry.isCurrentBand ? "border-yellow-400" : "border-purple-500"
                        }`}>
                          {entry.logoImage && (
                            <ImageWithFallback
                              src={entry.logoImage}
                              alt={entry.bandName}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-3xl font-black ${
                          entry.isCurrentBand ? "text-yellow-200" : "text-white"
                        }`}>
                          {entry.bandName}
                        </p>
                        <p className="text-2xl text-purple-300">
                          {entry.score.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row - Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center gap-6"
        >
          <button className="w-[240px] px-16 py-6 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border-2 border-purple-500 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm" style={{ fontSize: '2.5rem' }}>
            <Heart className="w-10 h-10" />
            Favorite
          </button>
          <button className="w-[240px] px-16 py-6 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border-2 border-purple-500 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm" style={{ fontSize: '2.5rem' }}>
            Retry
          </button>
          <button 
            onClick={onContinue}
            className="w-[240px] px-16 py-6 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50" 
            style={{ fontSize: '2.5rem' }}
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// Rewards Screen Component
function RewardsScreenView({ onContinue }: { onContinue: () => void }) {
  const coinsEarned = 1250;
  const xpEarned = 3500;
  const currentLevel = 42;
  const xpToNextLevel = 5000;
  const currentXP = 3200;
  const xpAfterReward = currentXP + xpEarned;
  const xpProgress = (xpAfterReward / xpToNextLevel) * 100;

  const coverArt = fateOfOpheliaArt;

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
        <img
          src={coverArt}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-90"></div>
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
        <div
          className="absolute top-32 left-32 w-96 h-96 bg-purple-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-slow 4s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-32 right-32 w-[28rem] h-[28rem] bg-blue-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-fast 5s ease-in-out infinite 1s' }}
        />
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

        <div className="flex gap-10 flex-1">
          {/* Left Panel - Jamsesh Coins */}
          <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col h-full items-center justify-center"
            >
              <h2 className="text-6xl font-black text-white mb-8">Jamsesh Coins</h2>
              
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
                <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-40"></div>
              </motion.div>

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
          <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col h-full items-center justify-center"
            >
              <h2 className="text-6xl font-black text-white mb-12">Badges</h2>
              
              <div className="flex flex-col gap-8">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
                    className="flex items-center gap-6 bg-purple-900/30 rounded-2xl p-4 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all"
                  >
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
          <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col h-full items-center justify-center"
            >
              <h2 className="text-6xl font-black text-white mb-12">XP</h2>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
                className="relative mb-12"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-50"></div>
                
                <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl border-4 border-purple-400">
                  <div className="text-center">
                    <p className="text-3xl text-purple-200 mb-2">Level</p>
                    <p className="text-9xl font-black text-white">{currentLevel}</p>
                  </div>
                </div>
              </motion.div>

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
          <button 
            onClick={onContinue}
            className="px-20 py-6 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50" 
            style={{ fontSize: '2.5rem' }}
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: "purple" | "yellow" | "pink" | "blue" | "green";
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    purple: "from-purple-600/40 to-purple-800/40 border-purple-500/50 text-purple-300",
    yellow: "from-yellow-600/40 to-yellow-800/40 border-yellow-500/50 text-yellow-300",
    pink: "from-pink-600/40 to-pink-800/40 border-pink-500/50 text-pink-300",
    blue: "from-blue-600/40 to-blue-800/40 border-blue-500/50 text-blue-300",
    green: "from-green-600/40 to-green-800/40 border-green-500/50 text-green-300",
  };

  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} border-2 p-4 backdrop-blur-sm text-center`}
    >
      <p className="text-xl opacity-80 mb-2">{label}</p>
      <p className="text-5xl font-black text-white">{value}</p>
    </div>
  );
}