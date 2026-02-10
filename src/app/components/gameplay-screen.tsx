import { motion } from "motion/react";
import { Star, Zap } from "lucide-react";
import fateOfOpheliaArt from "figma:asset/0f8640ca9c34f14ee786d6f146b7de668a243f88.png";
import jamseshLogo from "figma:asset/8f21c73b1596e2021befc55be858a14f3bf5de85.png";

interface GameplayScreenProps {
  onComplete: () => void;
}

export function GameplayScreen({ onComplete }: GameplayScreenProps) {
  return (
    <div className="w-[1920px] h-[1080px] relative overflow-hidden rounded-2xl shadow-2xl">
      {/* Invisible full-screen button */}
      <button
        onClick={onComplete}
        className="absolute inset-0 w-full h-full z-50 cursor-pointer bg-transparent border-0 outline-0"
        aria-label="Complete gameplay"
      />

      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={fateOfOpheliaArt}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Animated background elements - CSS GPU-composited */}
      <div className="absolute inset-0" style={{ contain: 'layout style paint' }}>
        <div
          className="absolute top-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-gameplay-1 3s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-blue-500 rounded-full blur-xl"
          style={{ willChange: 'transform, opacity', animation: 'orb-pulse-gameplay-2 4s ease-in-out infinite 1s' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top HUD */}
        <div className="px-20 pt-8 pb-4">
          <div className="flex justify-between items-start">
            {/* Left: Song Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10"
            >
              <h2 className="text-3xl font-black text-white mb-1">The Fate of Ophelia</h2>
              <p className="text-2xl text-purple-300">Taylor Swift</p>
            </motion.div>

            {/* Right: Score and Combo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex gap-4"
            >
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10 text-center min-w-[200px]">
                <p className="text-xl text-purple-300 mb-1">Score</p>
                <p className="text-4xl font-black text-white">487,632</p>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-4 border border-yellow-500/30 text-center min-w-[200px]">
                <p className="text-xl text-yellow-300 mb-1">Combo</p>
                <p className="text-4xl font-black text-yellow-400">142x</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Center: Note Highway (Guitar Hero style) */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Note Highway Track */}
          <div className="relative w-[600px] h-full" style={{ perspective: '1000px' }}>
            {/* Perspective highway */}
            <div
              className="absolute inset-0 flex justify-center"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(60deg)',
              }}
            >
              {/* Highway lanes */}
              <div className="relative w-full h-[120%] top-[-10%]">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-purple-500/20 to-purple-500/5 blur-xl"></div>
                
                {/* Lane dividers */}
                {[0, 1, 2, 3, 4].map((lane) => (
                  <div
                    key={lane}
                    className="absolute h-full bg-gradient-to-b from-white/30 via-white/20 to-transparent"
                    style={{
                      left: `${lane * 20}%`,
                      width: '2px',
                      animation: `lane-pulse 2s ease-in-out infinite ${lane * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Falling Notes */}
            {/* Note 1 - Purple */}
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 700, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 0,
              }}
              className="absolute w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 border-4 border-purple-300 shadow-2xl shadow-purple-500/50 flex items-center justify-center"
              style={{ left: '10%', transform: 'translateX(-50%)' }}
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>

            {/* Note 2 - Blue */}
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 700, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 0.3,
              }}
              className="absolute w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 border-4 border-blue-300 shadow-2xl shadow-blue-500/50 flex items-center justify-center"
              style={{ left: '30%', transform: 'translateX(-50%)' }}
            >
              <Star className="w-12 h-12 text-white" />
            </motion.div>

            {/* Note 3 - Pink */}
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 700, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 0.6,
              }}
              className="absolute w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 border-4 border-pink-300 shadow-2xl shadow-pink-500/50 flex items-center justify-center"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>

            {/* Note 4 - Yellow */}
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 700, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 0.9,
              }}
              className="absolute w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 border-4 border-yellow-300 shadow-2xl shadow-yellow-500/50 flex items-center justify-center"
              style={{ left: '70%', transform: 'translateX(-50%)' }}
            >
              <Star className="w-12 h-12 text-white" />
            </motion.div>

            {/* Note 5 - Green */}
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 700, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 1.2,
              }}
              className="absolute w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 border-4 border-green-300 shadow-2xl shadow-green-500/50 flex items-center justify-center"
              style={{ left: '90%', transform: 'translateX(-50%)' }}
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>

            {/* Hit Zone (Target area at bottom) */}
            <div
              className="absolute bottom-20 left-0 right-0 h-32 rounded-2xl border-4 border-white/40 bg-white/10 backdrop-blur-sm"
              style={{ animation: 'hit-zone-glow 1.5s ease-in-out infinite' }}
            >
              <div className="flex h-full items-center justify-around px-4">
                {['purple', 'blue', 'pink', 'yellow', 'green'].map((color, i) => (
                  <div
                    key={i}
                    className={`w-20 h-20 rounded-xl bg-gradient-to-br from-${color}-500/40 to-${color}-700/40 border-2 border-${color}-300/50`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom HUD */}
        <div className="px-20 pb-8">
          <div className="flex justify-between items-end">
            {/* Left: Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 max-w-[600px] bg-black/40 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-xl text-purple-300">Progress</p>
                <p className="text-xl text-white font-black">1:23 / 3:45</p>
              </div>
              <div className="w-full h-4 bg-purple-900/40 rounded-full overflow-hidden border border-purple-500/30">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '37%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50"
                />
              </div>
            </motion.div>

            {/* Right: Multiplier */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="ml-6 bg-black/40 backdrop-blur-md rounded-2xl px-10 py-6 border border-pink-500/30 text-center"
            >
              <p className="text-2xl text-pink-300 mb-2">Multiplier</p>
              <p
                className="text-6xl font-black text-pink-400"
                style={{ animation: 'multiplier-pulse 0.5s ease-in-out infinite', willChange: 'transform' }}
              >
                4x
              </p>
            </motion.div>
          </div>
        </div>

        {/* Jamsesh Logo (bottom right) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute bottom-8 right-8"
        >
          <img src={jamseshLogo} alt="Jamsesh" className="h-16 opacity-60" />
        </motion.div>
      </div>

      {/* Hit feedback effects - CSS animated */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ animation: 'hit-flash 1s ease-in-out infinite' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-transparent"></div>
      </div>
    </div>
  );
}
