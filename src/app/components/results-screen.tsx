import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../contexts/LanguageContext";
import avatar1 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar2 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar3 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar4 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import neonPhantomsLogo from "figma:asset/e7095faa4d286b81d827f7ec5105d4cc4c6ebe83.png";
import jamseshHuntersLogo from "figma:asset/8bccb91dc4451190b8755ee6a14174cd822f190d.png";
import electricDreamsLogo from "figma:asset/b68c8fdb5cc5289790a4bc1cd35653e67ea6b063.png";
import rhythmRebelsLogo from "figma:asset/447ba958ffb77b6079632ac524a094a6ea803582.png";

export function ResultsScreen({ onContinue }: { onContinue?: () => void }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"band" | "individual">("band");

  // Mock game data
  const score = 987654;
  const accuracy = 98.5;
  const maxCombo = 342;
  const perfectHits = 523;
  const totalNotes = 531;
  const songName = "The Fate of Ophelia";
  const artistName = "Taylor Swift";
  const difficulty = "Expert";
  const coverArt = "https://images.genius.com/20137020caed6518eafd30ae87b0c216.1000x1000x1.png";

  // Calculate star rating (0-5 stars based on accuracy)
  const stars = accuracy >= 99 ? 5 : accuracy >= 95 ? 4 : accuracy >= 85 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

  // Calculate percentages
  const perfectPercentage = ((perfectHits / totalNotes) * 100).toFixed(1);
  const notesHitPercentage = (((totalNotes - 8) / totalNotes) * 100).toFixed(1);

  // Mock individual leaderboard data
  const leaderboardEntries = [
    {
      rank: 1,
      username: "Julie",
      score: 1023456,
      avatar: avatar1,
      isCurrentPlayer: false,
    },
    {
      rank: 2,
      username: "Abbie",
      score: 987654,
      avatar: avatar2,
      isCurrentPlayer: false,
    },
    {
      rank: 3,
      username: "Jamsesh Hunters",
      score: 945321,
      avatar: avatar3,
      isCurrentPlayer: true,
    },
    {
      rank: 4,
      username: "Rael",
      score: 912345,
      avatar: avatar4,
      isCurrentPlayer: false,
    },
  ];

  // Mock band leaderboard data
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
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-6xl font-black text-white">
          {t('results.youCrushedIt')}, <span className="bg-gradient-to-r from-[#DB2777] to-[#9b5de5] bg-clip-text text-transparent">Jamsesh Hunters</span>!
        </h1>
      </motion.div>

      {/* Three Equal Panels */}
      <div className="flex gap-8 mb-4 flex-1">
        {/* Left Panel - Player Stats */}
        <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-md">
          {/* Score Title */}
          <h2 className="text-3xl font-black text-white mb-4 text-center">{t('results.score')}</h2>
          
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex gap-2 mb-8"
          >
            <button
              onClick={() => setActiveTab("band")}
              className={`flex-1 px-16 py-6 rounded-xl font-black transition-all duration-300 hover:scale-105 text-center ${
                activeTab === "band"
                  ? "bg-[#9b5de5] text-white shadow-lg shadow-[#9b5de5]/30"
                  : "bg-[#9b5de5]/30 text-[#9b5de5] hover:bg-[#9b5de5]/50"
              }`}
              style={{ fontSize: '2.5rem' }}
            >
              {t('results.group')}
            </button>
            <button
              onClick={() => setActiveTab("individual")}
              className={`flex-1 px-16 py-6 rounded-xl font-black transition-all duration-300 hover:scale-105 text-center ${
                activeTab === "individual"
                  ? "bg-[#9b5de5] text-white shadow-lg shadow-[#9b5de5]/30"
                  : "bg-[#9b5de5]/30 text-[#9b5de5] hover:bg-[#9b5de5]/50"
              }`}
              style={{ fontSize: '2.5rem' }}
            >
              {t('results.me')}
            </button>
          </motion.div>

          {/* Score Display */}
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

          {/* Stars */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-4 mb-6 justify-center"
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
                      : "fill-transparent text-[#1a1a2e]"
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Grid - Flexible to fill remaining space */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 gap-3 flex-1 content-end"
          >
            <StatCard
              label="Accuracy"
              value={`${accuracy}%`}
              color="purple"
            />
            <StatCard
              label="Max Combo"
              value={maxCombo.toString()}
              color="yellow"
            />
            <StatCard
              label="Perfect Hits"
              value={`${perfectPercentage}%`}
              color="pink"
            />
            <StatCard
              label="Notes Hit"
              value={`${notesHitPercentage}%`}
              color="blue"
            />
          </motion.div>
        </div>

        {/* Middle Panel - Cover Art */}
        <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center justify-between h-full"
          >
            {/* Cover Art - Square */}
            <div className="w-[500px] h-[500px] rounded-2xl overflow-hidden border-4 border-purple-500/50 shadow-2xl shadow-purple-500/30">
              <ImageWithFallback
                src={coverArt}
                alt={songName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Track Info - At bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-4"
            >
              <h2 className="text-4xl font-black text-white mb-2">{songName}</h2>
              <p className="text-4xl text-purple-300">{artistName}</p>
              <p className="text-2xl text-purple-400 mt-2">{difficulty}</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel - Leaderboard */}
        <div className="flex-1 flex flex-col h-full px-8 py-6 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col h-full"
          >
            {/* Leaderboard Title */}
            <h2 className="text-3xl font-black text-white mb-4 text-center">{t('results.leaderboard')}</h2>
            
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex gap-2 mb-8"
            >
              <button
                onClick={() => setActiveTab("band")}
                className={`flex-1 px-16 py-6 rounded-xl font-black transition-all duration-300 hover:scale-105 text-center ${
                  activeTab === "band"
                    ? "bg-[#9b5de5] text-white shadow-lg shadow-[#9b5de5]/30"
                    : "bg-[#9b5de5]/30 text-[#9b5de5] hover:bg-[#9b5de5]/50"
                }`}
                style={{ fontSize: '2.5rem' }}
              >
                {t('results.group')}
              </button>
              <button
                onClick={() => setActiveTab("individual")}
                className={`flex-1 px-16 py-6 rounded-xl font-black transition-all duration-300 hover:scale-105 text-center ${
                  activeTab === "individual"
                    ? "bg-[#9b5de5] text-white shadow-lg shadow-[#9b5de5]/30"
                    : "bg-[#9b5de5]/30 text-[#9b5de5] hover:bg-[#9b5de5]/50"
                }`}
                style={{ fontSize: '2.5rem' }}
              >
                {t('results.me')}
              </button>
            </motion.div>
            
            {/* Leaderboard Entries - Flexible to fill remaining space */}
            <div className="space-y-2.5 flex flex-col justify-end" style={{ maxHeight: 'calc(100% - 200px)' }}>
              {activeTab === "individual"
                ? leaderboardEntries.map((entry, index) => (
                    <motion.div
                      key={entry.username}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                        entry.isCurrentPlayer
                          ? "bg-gradient-to-r from-yellow-600/40 to-yellow-800/40 border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/20"
                          : "bg-purple-900/30 hover:bg-purple-900/50"
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-7 text-center flex-shrink-0">
                        <span className="text-2xl font-black text-white">{entry.rank}</span>
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                        entry.isCurrentPlayer ? "border-yellow-400" : "border-purple-500"
                      }`}>
                        <ImageWithFallback
                          src={entry.avatar}
                          alt={entry.username}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Username and Score */}
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-3xl font-black ${
                          entry.isCurrentPlayer ? "text-yellow-200" : "text-white"
                        }`}>
                          {entry.username}
                        </p>
                        <p className="text-2xl text-purple-300">
                          {entry.score.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                : bandLeaderboardEntries.map((entry, index) => (
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
                      {/* Rank */}
                      <div className="w-7 text-center flex-shrink-0">
                        <span className="text-2xl font-black text-white">{entry.rank}</span>
                      </div>

                      {/* Band Logo */}
                      <div className="relative w-20 h-20 rounded-full flex-shrink-0">
                        {/* Glow effect based on rank */}
                        {entry.rank === 1 && (
                          <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md opacity-60"></div>
                        )}
                        {entry.rank === 2 && (
                          <div className="absolute inset-0 rounded-full bg-gray-300 blur-md opacity-60"></div>
                        )}
                        {entry.rank === 3 && (
                          <div className="absolute inset-0 rounded-full bg-orange-600 blur-md opacity-60"></div>
                        )}
                        
                        {/* Logo */}
                        <div className={`relative w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center ${
                          entry.isCurrentBand ? "border-yellow-400" : "border-purple-500"
                        }`}>
                          {entry.logoImage ? (
                            <ImageWithFallback
                              src={entry.logoImage}
                              alt={entry.bandName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <div
                                className={`absolute inset-0 bg-gradient-to-r ${entry.logoColor}`}
                              />
                              <p className="relative text-sm font-black text-white">
                                {entry.logoInitials}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Band Name and Score */}
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
        <button className="w-[240px] px-16 py-6 rounded-xl bg-[#9b5de5]/30 hover:bg-[#9b5de5]/50 border-2 border-[#9b5de5] text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm" style={{ fontSize: '2.5rem' }}>
          {t('results.retry')}
        </button>
        <button
          className="w-[240px] px-16 py-6 rounded-xl bg-gradient-to-r from-[#DB2777] to-[#9b5de5] hover:from-[#DB2777]/80 hover:to-[#9b5de5]/80 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#9b5de5]/50"
          style={{ fontSize: '2.5rem' }}
          onClick={onContinue}
        >
          {t('results.continue')}
        </button>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: "purple" | "yellow" | "pink" | "blue";
}

function StatCard({ label, value, color }: StatCardProps) {
  const { t } = useLanguage();
  const colorClasses = {
    purple: "from-[#9b5de5]/40 to-[#9b5de5]/80 border-[#9b5de5]/50 text-[#9b5de5]",
    yellow: "from-[#34D399]/40 to-[#34D399]/80 border-[#34D399]/50 text-[#34D399]",
    pink: "from-[#DB2777]/40 to-[#DB2777]/80 border-[#DB2777]/50 text-[#DB2777]",
    blue: "from-[#0891B2]/40 to-[#0891B2]/80 border-[#0891B2]/50 text-[#0891B2]",
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