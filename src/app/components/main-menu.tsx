import { Box, Briefcase, Settings, ShoppingBag, User, Users, Plus, Edit3, LogOut, Check, Music, Mic, Zap, Star, Trophy, ChevronRight, ChevronLeft, ArrowLeft, Play, Clock, Activity, Volume2, Globe, Bug, MessageSquare, Timer, Tag, Sparkles, Guitar, Drum, Radio, Home, Heart, Wind, CircleDot, Flame, Crown, History, Layers, Lock, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, lazy, Suspense } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../contexts/LanguageContext";

const GameplayScreen = lazy(() => import("./gameplay-screen").then(m => ({ default: m.GameplayScreen })));
const PrototypeSoloToRewards = lazy(() => import("./prototype-solo-to-rewards").then(m => ({ default: m.PrototypeSoloToRewards })));
const ResultsScreen = lazy(() => import("./results-screen").then(m => ({ default: m.ResultsScreen })));
import avatar1 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar2 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import avatar3 from "figma:asset/d21d2dd4cabb12f0496ce9017bae59626ea91b4a.png";
import fateOfOpheliaArt from "figma:asset/0f8640ca9c34f14ee786d6f146b7de668a243f88.png";
import teamJamseshImage from "figma:asset/486e9f739395b80f86816fabb783eae3c817926c.png";
import avatarDecoration from "figma:asset/ed082b0b8f7d1a74c181415e145c3aed4b3b9a21.png";
import neonPhantomsLogo from "figma:asset/e7095faa4d286b81d827f7ec5105d4cc4c6ebe83.png";
import jamseshHuntersLogo from "figma:asset/8bccb91dc4451190b8755ee6a14174cd822f190d.png";
import electricDreamsLogo from "figma:asset/b68c8fdb5cc5289790a4bc1cd35653e67ea6b063.png";
import rhythmRebelsLogo from "figma:asset/447ba958ffb77b6079632ac524a094a6ea803582.png";
import prismGem from "figma:asset/077c9e97f04e7ef984a80a14709ed85cf68947c9.png";
import laserFrameGem from "figma:asset/47593bf9f1c7a1a726c648a492fe396455eb1b46.png";
import neonSynthwaveHighway from "figma:asset/e809ecd441f124cbbaa3691e5431d3f5d4f36a88.png";
import cosmicNebulaHighway from "figma:asset/60d3c4b6471bc5c3853e05a962e6b8888491f4c4.png";
import meetTheTeamImage from "figma:asset/7cde8f71c5243289d38a34ceba5589b85f88c553.png";
import drumsGif from "figma:asset/8c6c8ef842d7b67463ac9fd656955b786179999a.png";

type Tab = "home" | "profile" | "shop" | "solo" | "social" | "career" | "vault" | "settings" | "history";

export function MainMenu() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [shopCategory, setShopCategory] = useState<string | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleNavClick = (tab: Tab) => {
    if (activeTab === tab) {
      setResetTrigger(prev => prev + 1);
      if (tab === "shop") setShopCategory(null);
    } else {
      setActiveTab(tab);
      if (tab === "shop") setShopCategory(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-[1920px]">
      {/* Profile Nameplate Header */}
      <div className="w-full max-w-[1600px] flex justify-center z-20">
          <button 
            onClick={() => handleNavClick("profile")}
            className={`group relative flex items-center gap-8 px-12 py-6 w-[800px] bg-black/60 backdrop-blur-sm border rounded-3xl transition-all duration-300 ${activeTab === "profile" ? "border-pink-500/50 bg-black/80 shadow-[0_0_30px_rgba(236,72,153,0.3)]" : "border-white/10 hover:border-white/30 hover:bg-black/70"}`}
          >
              {/* Profile Frame & Avatar */}
              <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black relative z-10">
                      <ImageWithFallback src={avatar1} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  {/* Unlockable Frame Ring */}
                  <div className="absolute -inset-2 rounded-full border-2 border-[#9b5de5]/50 shadow-[0_0_15px_rgba(155,93,229,0.5)] pointer-events-none" />
              </div>

              {/* Nameplate Info */}
              <div className="flex flex-col items-start text-left flex-1">
                  <div className="flex items-center justify-between w-full">
                      <div className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Neon Runner</div>
                      <div className="flex gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/60 text-xs font-bold tracking-wider">LEVEL 24</span>
                      </div>
                  </div>
                  <div className="text-5xl font-black text-white tracking-tight group-hover:text-[#9b5de5] transition-colors mt-1 mb-2">
                      Jooleeno
                  </div>
                  {/* XP/Progress */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[65%] bg-gradient-to-r from-[#9b5de5] via-[#DB2777] to-[#f8f8fc] shadow-[0_0_10px_rgba(219,39,119,0.5)]" />
                  </div>
                  <div className="w-full flex justify-end mt-1">
                      <span className="text-sm font-mono text-white/40">XP: 24,500 / 30,000</span>
                  </div>
              </div>
          </button>
      </div>

      {/* Main Content Panel */}
      <div className="w-full h-[1080px] relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#9b5de5]/20 to-[#1a1a2e] rounded-3xl shadow-2xl flex flex-col">
        {/* Background Elements (Constant) - CSS GPU-composited */}
        <div className="absolute inset-0 pointer-events-none" style={{ contain: 'layout style paint' }}>
          <div
            className="absolute top-32 left-32 w-96 h-96 bg-[#9b5de5] rounded-full blur-xl"
            style={{ willChange: 'transform, opacity', animation: 'orb-pulse-slow 4s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[#0891B2] rounded-full blur-xl"
            style={{ willChange: 'transform, opacity', animation: 'orb-pulse-medium 7s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-32 right-32 w-[28rem] h-[28rem] bg-[#DB2777] rounded-full blur-xl"
            style={{ willChange: 'transform, opacity', animation: 'orb-pulse-fast 5s ease-in-out infinite 1s' }}
          />
          <div className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 flex flex-col p-12">
          <AnimatePresence mode="wait">
            {activeTab === "home" && <HomeView key={`home-${resetTrigger}`} />}
            {activeTab === "profile" && <ProfileView key={`profile-${resetTrigger}`} />}
            {activeTab === "shop" && <ShopView key="shop" shopCategory={shopCategory} setShopCategory={setShopCategory} />}
            {activeTab === "solo" && <PlaySoloView key={`solo-${resetTrigger}`} />}
            {activeTab === "social" && <SpacesView key={`spaces-${resetTrigger}`} />}
            {activeTab === "vault" && <VaultView key={`vault-${resetTrigger}`} />}
            {activeTab === "career" && <CareerView key={`career-${resetTrigger}`} />}
            {activeTab === "settings" && <SettingsView key={`settings-${resetTrigger}`} />}
            {activeTab === "history" && <HistoryView key={`history-${resetTrigger}`} />}
            {/* Placeholders for other tabs */}
            {activeTab !== "home" && activeTab !== "profile" && activeTab !== "shop" && activeTab !== "solo" && activeTab !== "social" && activeTab !== "vault" && activeTab !== "career" && activeTab !== "settings" && activeTab !== "history" && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <h2 className="text-5xl font-black text-white/20 uppercase tracking-widest">{activeTab} Coming Soon</h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Navigation Bar */}
      <motion.div 
        layout
        className="h-[160px] w-full max-w-[1600px] bg-black/60 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl flex items-center justify-between px-12"
      >
        <NavButton label={t('nav.store')} active={activeTab === "shop"} onClick={() => handleNavClick("shop")}>
          <ShoppingBag className="w-12 h-12" />
        </NavButton>

        <NavButton label={t('nav.play')} active={activeTab === "solo"} onClick={() => handleNavClick("solo")}>
          <Play className="w-12 h-12" />
        </NavButton>

        <NavButton label={t('nav.spaces')} active={activeTab === "social"} onClick={() => handleNavClick("social")}>
          <Layers className="w-12 h-12" />
        </NavButton>

        {/* Home Button - Larger */}
        <motion.button
          onClick={() => handleNavClick("home")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 min-w-[180px]
            ${activeTab === "home"
              ? "bg-gradient-to-br from-purple-600/60 to-blue-600/60 border border-white/30 shadow-[0_0_25px_rgba(124,58,237,0.4)] backdrop-blur-md" 
              : "hover:bg-white/5"}
          `}
        >
          <div className={`p-3 rounded-xl transition-colors group-hover:bg-white/10 ${activeTab === "home" ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
            <Home className="w-16 h-16" />
          </div>
          <span className={`text-2xl font-bold tracking-wide ${activeTab === "home" ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
            {t('nav.home')}
          </span>
        </motion.button>

        <NavButton label={t('nav.career')} active={activeTab === "career"} onClick={() => handleNavClick("career")}>
          <Briefcase className="w-12 h-12" />
        </NavButton>

        <NavButton label={t('nav.history')} active={activeTab === "history"} onClick={() => handleNavClick("history")}>
          <History className="w-12 h-12" />
        </NavButton>

        <NavButton label={t('nav.myVault')} active={activeTab === "vault"} onClick={() => handleNavClick("vault")}>
          <Box className="w-12 h-12" />
        </NavButton>

        <NavButton label={t('nav.settings')} active={activeTab === "settings"} onClick={() => handleNavClick("settings")}>
          <Settings className="w-12 h-12" />
        </NavButton>
      </motion.div>
    </div>
  );
}

// --- Views ---

function HomeView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col gap-3 h-full overflow-hidden"
    >
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white">Welcome back, <span className="bg-gradient-to-r from-[#DB2777] to-[#9b5de5] bg-clip-text text-transparent">Jooleeno</span></h1>
          <p className="text-base text-white/60">Here's what's happening in your world</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2 bg-black/30 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <p className="text-2xl font-black text-white">24</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <p className="text-2xl font-black text-white">#42</p>
          </div>
        </div>
      </div>

      {/* Top Row - Flash Deals & Vault Unlocks */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Flash Deal Highlight */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/20 group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
        >
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1602821485286-4a6520cca299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjBmdXR1cmlzdGljJTIwZWxlY3RyaWMlMjBndWl0YXIlMjBuZW9ufGVufDF8fHx8MTc2NzgwNDI0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
            alt="Golden Guitar" 
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Timer className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="px-2 py-1 bg-red-500/90 text-white font-black text-xs rounded-lg">ENDS IN 04:23:12</span>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1 mb-1">
              <ShoppingBag className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">Flash Deal in Store</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-1 leading-tight">Golden Cybercaster</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/40 line-through">2500 Jamsesh Coins</span>
              <span className="text-xl text-yellow-400 font-black">1200 Jamsesh Coins</span>
            </div>
          </div>
        </motion.div>

        {/* Vault Unlocks */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-3xl border border-white/10 p-4 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <Box className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-black text-white">Recent Vault Activity</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Guitar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-white">Unlocked 2 Guitars</p>
                <p className="text-xs text-white/60 truncate">Neon Striker & Void Shredder</p>
              </div>
              <span className="text-green-400 font-black text-xs px-2 py-0.5 bg-green-500/20 rounded-full flex-shrink-0">NEW</span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-white">New Highway Theme</p>
                <p className="text-xs text-white/60 truncate">Cosmic Nebula Highway</p>
              </div>
              <span className="text-green-400 font-black text-xs px-2 py-0.5 bg-green-500/20 rounded-full flex-shrink-0">NEW</span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-white">3 New Badges</p>
                <p className="text-xs text-white/60">Your collection is growing!</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row - Music Packs, Career & Quick Stats */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {/* New Music Pack Highlight */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/20 group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
        >
          <ImageWithFallback 
            src={teamJamseshImage}
            alt="Music Pack" 
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-pink-500/90 text-white font-black text-sm rounded-lg uppercase">Special Offer</span>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-6 h-6 text-pink-400" />
              <span className="text-pink-400 font-black text-sm uppercase tracking-wider">Featured Pack</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Taylor Swift Pack</h3>
            <p className="text-white/60 text-sm mb-3">15 songs • 50% OFF</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xl text-yellow-400 font-black">750 Jamsesh Coins</span>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-black text-sm transition-all hover:scale-105 flex items-center gap-2">
                <Music className="w-4 h-4" />
                Change Song
              </button>
            </div>
          </div>
        </motion.div>

        {/* Career Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-3xl border border-white/10 p-5 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-black text-white">Career Progress</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Songs Played</span>
                <span className="text-2xl font-black text-white">247</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[82%] bg-gradient-to-r from-indigo-500 to-purple-500" />
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">5-Star Performances</span>
                <span className="text-2xl font-black text-white">89</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between flex-1">
              <div>
                <p className="text-white/60 text-sm">Average Accuracy</p>
                <p className="text-3xl font-black text-green-400">96.8%</p>
              </div>
              <Activity className="w-10 h-10 text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Quick Play / Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-3xl border border-white/10 p-5 flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Play className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-black text-white">Quick Play</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group flex-1">
              <div className="flex items-center gap-3 h-full">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">Continue Playing</p>
                  <p className="text-white/60 text-sm">Last session</p>
                </div>
              </div>
            </button>

            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group flex-1">
              <div className="flex items-center gap-3 h-full">
                <Zap className="w-10 h-10 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">Daily Challenge</p>
                  <p className="text-white/60 text-sm">2x XP bonus today!</p>
                </div>
              </div>
            </button>

            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group flex-1">
              <div className="flex items-center gap-3 h-full">
                <Sparkles className="w-10 h-10 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">Recommended</p>
                  <p className="text-white/60 text-sm">Based on your style</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ShopView({ shopCategory, setShopCategory }: { shopCategory: string | null; setShopCategory: (category: string | null) => void }) {
  if (shopCategory === "Gems") {
    return <GemsShopView onBack={() => setShopCategory(null)} />;
  }
  
  if (shopCategory === "Highways") {
    return <HighwaysShopView onBack={() => setShopCategory(null)} />;
  }

  const categories = [
    { name: "Stages", image: "https://images.unsplash.com/photo-1730537456013-8dfd862f0036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBuZW9uJTIwbGlnaHRzfGVufDF8fHx8MTc2Nzc5ODI0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Environments", image: "https://images.unsplash.com/photo-1744111269242-59ffa48000b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2ktZmklMjBkaWdpdGFsJTIwbGFuZHNjYXBlJTIwcHVycGxlfGVufDF8fHx8MTc2Nzc5ODI1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Guitars", image: "https://images.unsplash.com/photo-1579985807337-32224ee8ca6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGd1aXRhciUyMG5lb258ZW58MXx8fHwxNzY3NzcwNjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Drums", image: "https://images.unsplash.com/photo-1627931544947-1b797c16da09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnVtJTIwa2l0JTIwc3RhZ2UlMjBuZW9uJTIwbGlnaHRzfGVufDF8fHx8MTc2Nzc5ODI1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Keys", image: "https://images.unsplash.com/photo-1535057697339-e2a798221230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aGVzaXplciUyMGtleWJvYXJkJTIwbmVvbnxlbnwxfHx8fDE3Njc3OTgyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Microphones", image: "https://images.unsplash.com/photo-1543062591-e3c0fdb97350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3Bob25lJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3Njc3OTgyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Highways", image: "https://images.unsplash.com/photo-1532204307534-972519e4f93d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGxpZ2h0JTIwdHVubmVsJTIwc3BlZWR8ZW58MXx8fHwxNzY3Nzk4MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Gems", image: prismGem },
    { name: "Outfits", image: "https://images.unsplash.com/photo-1711662171213-4141abec218f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBmYXNoaW9uJTIwb3V0Zml0JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3Njc3OTgxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex gap-8 h-full"
    >
      {/* Left Column: Time Limited Banners */}
      <div className="w-1/2 flex flex-col gap-6">
         <div className="flex items-center gap-3 mb-2">
            <Timer className="w-8 h-8 text-yellow-400" />
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Flash Deals</h2>
            <div className="px-3 py-1 bg-red-500 rounded text-white font-bold text-sm animate-pulse">ENDS IN 04:23:12</div>
         </div>

         {/* Main Hero Banner */}
         <div className="relative w-full flex-1 rounded-3xl overflow-hidden group shadow-2xl border border-white/10">
            <ImageWithFallback 
               src="https://images.unsplash.com/photo-1602821485286-4a6520cca299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjBmdXR1cmlzdGljJTIwZWxlY3RyaWMlMjBndWl0YXIlMjBuZW9ufGVufDF8fHx8MTc2NzgwNDI0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
               alt="Golden Guitar" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 p-8">
               <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-lg text-xs font-black uppercase tracking-widest">Legendary</span>
                  <span className="px-3 py-1 bg-white/10 text-white/60 border border-white/10 rounded-lg text-xs font-black uppercase tracking-widest line-through">2500 Jamsesh Coins</span>
               </div>
               <h3 className="text-5xl font-black text-white mb-2 leading-none">Golden Cybercaster</h3>
               <p className="text-white/80 mb-6 max-w-md">Limited edition gold-plated finish with custom neon strings. Includes exclusive VFX.</p>
               <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl flex items-center gap-2 transition-colors">
                  <ShoppingBag className="w-5 h-5" /> Buy Now - 1200 Jamsesh Coins
               </button>
            </div>
         </div>

         {/* Secondary Banners Grid */}
         <div className="h-48 grid grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden group border border-white/10">
               <ImageWithFallback src="https://images.unsplash.com/photo-1760539620105-a96c6faea0b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2lkJTIwc3BhY2UlMjBjb25jZXJ0JTIwc3RhZ2UlMjBmdXR1cmlzdGljfGVufDF8fHx8MTc2NzgwNDI0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Void Stage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
               <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded w-fit text-[10px] font-black uppercase mb-1">Bundle</span>
                  <h4 className="text-xl font-black text-white leading-tight">Voidwalker Stage Pack</h4>
               </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group border border-white/10">
               <ImageWithFallback src="https://images.unsplash.com/photo-1627413102606-db79f5cbc1dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjB3aW5ncyUyMG91dGZpdCUyMGdsb3dpbmd8ZW58MXx8fHwxNzY3ODA0MjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Wings" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
               <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded w-fit text-[10px] font-black uppercase mb-1">Cosmetic</span>
                  <h4 className="text-xl font-black text-white leading-tight">Neon Angel Wings</h4>
               </div>
            </div>
         </div>
      </div>

      {/* Right Column: Categories */}
      <div className="w-1/2 flex flex-col h-full">
         <div className="flex items-center gap-3 mb-8">
            <Tag className="w-8 h-8 text-pink-400" />
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Browse Shop</h2>
         </div>
         
         <div className="flex-1 grid grid-cols-3 gap-4 pb-4 overflow-y-auto pr-2">
            {categories.map((category) => (
               <button
                  key={category.name}
                  onClick={() => setShopCategory(category.name)}
                  className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white/10 hover:border-white/40 transition-all duration-300 shadow-lg"
               >
                  <div className="absolute inset-0 bg-gray-900">
                     <ImageWithFallback 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                     />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 p-4 bg-black/50 flex flex-col items-center justify-center text-center z-10 backdrop-blur-sm">
                     <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                        <Sparkles className="w-5 h-5 text-white" />
                     </div>
                     <span className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-purple-200 transition-colors">{category.name}</span>
                  </div>
               </button>
            ))}
         </div>
      </div>
    </motion.div>
  );
}

function CareerView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Column - Profile & Stats */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Profile Card with Decoration */}
          <div className="bg-black/20 rounded-3xl p-10 border border-white/5 flex items-center gap-12">
            {/* Profile Picture with Decoration Frame */}
            <div className="relative flex-shrink-0">
              {/* Profile Picture */}
              <div className="w-52 h-52 rounded-full overflow-hidden border-4 border-black relative z-10">
                <ImageWithFallback src={avatar1} alt="Profile" className="w-full h-full object-cover" />
              </div>
              
              {/* Decorative Frame - positioned to surround the profile picture */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'scale(1.35)' }}>
                <img 
                  src={avatarDecoration} 
                  alt="Profile Decoration" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-1 bg-purple-500/20 rounded-full text-purple-300 font-bold tracking-widest uppercase text-sm border border-purple-400/30">
                  Level 24
                </span>
                <span className="px-4 py-1 bg-yellow-500/20 rounded-full text-yellow-300 font-bold tracking-widest uppercase text-sm border border-yellow-400/30">
                  Neon Runner
                </span>
              </div>
              <h1 className="text-7xl font-black text-white tracking-tight mb-3">Jooleeno</h1>
              <p className="text-2xl text-white/60 mb-6">VR Rhythm Master • Joined Jan 2025</p>
              
              {/* XP Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-sm font-bold text-white/60 mb-2">
                  <span>Level 24</span>
                  <span>24,500 / 30,000 XP</span>
                  <span>Level 25</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-gradient-to-r from-purple-500 via-pink-500 to-white shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Career Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-5 h-5 text-cyan-400" />
                <p className="text-cyan-300 uppercase tracking-wider text-sm font-bold">Songs Played</p>
              </div>
              <p className="text-5xl font-black text-white">342</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <p className="text-yellow-300 uppercase tracking-wider text-sm font-bold">Avg Accuracy</p>
              </div>
              <p className="text-5xl font-black text-white">96.8%</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <p className="text-purple-300 uppercase tracking-wider text-sm font-bold">Highest Combo</p>
              </div>
              <p className="text-5xl font-black text-white">1,247</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <p className="text-yellow-300 uppercase tracking-wider text-sm font-bold">Total Score</p>
              </div>
              <p className="text-5xl font-black text-white">28.4M</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <p className="text-blue-300 uppercase tracking-wider text-sm font-bold">Play Time</p>
              </div>
              <p className="text-5xl font-black text-white">127h</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-pink-400" />
                <p className="text-pink-300 uppercase tracking-wider text-sm font-bold">Perfect Songs</p>
              </div>
              <p className="text-5xl font-black text-white">23</p>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
            <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Recent Achievements
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-2xl p-4 border border-yellow-400/20 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Combo Master</p>
                  <p className="text-white/60 text-sm">Hit 1000+ combo</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-purple-400/20 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Century Club</p>
                  <p className="text-white/60 text-sm">Play 100 songs</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-cyan-400/20 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Perfect Streak</p>
                  <p className="text-white/60 text-sm">5 perfect songs in a row</p>
                </div>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-pink-400/20 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Rhythm Heart</p>
                  <p className="text-white/60 text-sm">Play 100 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Rankings & Milestones */}
        <div className="w-[480px] flex flex-col gap-6 overflow-y-auto pl-2 flex-shrink-0">
          {/* Global Ranking */}
          <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
            <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Global Ranking
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-lg">Overall Rank</span>
                <span className="text-4xl font-black text-white">#1,247</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-lg">Regional Rank</span>
                <span className="text-4xl font-black text-cyan-400">#89</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-lg">Friends Rank</span>
                <span className="text-4xl font-black text-purple-400">#3</span>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-8 border border-purple-400/30">
            <h3 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-300" />
              Next Milestone
            </h3>
            <p className="text-white/80 text-lg mb-4">Play 50 more songs to unlock:</p>
            <div className="bg-black/40 rounded-2xl p-4 border border-purple-400/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">Elite Runner Title</p>
                  <p className="text-purple-300 text-sm">Legendary nameplate unlock</p>
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
              <p className="text-white/60 text-sm text-right mt-1">342 / 400 songs</p>
            </div>
          </div>

          {/* Career Highlights */}
          <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
            <h3 className="text-3xl font-black text-white mb-6">Highlights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-bold">First Perfect Score</p>
                  <p className="text-white/60 text-sm">The Fate of Ophelia - Jan 15, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-bold">Reached Level 20</p>
                  <p className="text-white/60 text-sm">Jan 12, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-bold">Joined Jamsesh Hunters</p>
                  <p className="text-white/60 text-sm">Jan 5, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HistoryView() {
  const { t } = useLanguage();
  const [selectedSongHistory, setSelectedSongHistory] = useState<number | null>(null);

  // Mock history data - 10 previously played songs
  const songHistory = [
    {
      id: 1,
      title: "The Fate of Ophelia",
      artist: "Taylor Swift",
      coverArt: fateOfOpheliaArt,
      stars: 5,
      score: 987654,
      accuracy: 98.5,
      maxCombo: 342,
      perfectHits: 523,
      totalNotes: 531,
      difficulty: "Expert",
      playedAt: "2 hours ago"
    },
    {
      id: 2,
      title: "Neon Nights",
      artist: "Electric Pulse",
      coverArt: "https://images.unsplash.com/photo-1679294176201-f9b302961f42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc2ODI2Nzg5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 4,
      score: 856234,
      accuracy: 94.2,
      maxCombo: 289,
      perfectHits: 451,
      totalNotes: 478,
      difficulty: "Hard",
      playedAt: "5 hours ago"
    },
    {
      id: 3,
      title: "Midnight Drive",
      artist: "Synthwave Runners",
      coverArt: "https://images.unsplash.com/photo-1631379054647-376f289b059f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aHdhdmUlMjByZXRyb3dhdmV8ZW58MXx8fHwxNzY4MzE2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 5,
      score: 1023456,
      accuracy: 99.1,
      maxCombo: 425,
      perfectHits: 612,
      totalNotes: 617,
      difficulty: "Expert",
      playedAt: "Yesterday"
    },
    {
      id: 4,
      title: "Electric Storm",
      artist: "Thunder & Bass",
      coverArt: "https://images.unsplash.com/photo-1748597603586-9b18f3e68655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGd1aXRhciUyMGNvbmNlcnR8ZW58MXx8fHwxNzY4MzE2MDEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 3,
      score: 745821,
      accuracy: 87.3,
      maxCombo: 178,
      perfectHits: 389,
      totalNotes: 446,
      difficulty: "Expert",
      playedAt: "2 days ago"
    },
    {
      id: 5,
      title: "Cosmic Voyage",
      artist: "Stellar Dreams",
      coverArt: "https://images.unsplash.com/photo-1557264322-b44d383a2906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtaWMlMjBuZWJ1bGElMjBwdXJwbGV8ZW58MXx8fHwxNzY4MjkwMTY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 4,
      score: 892345,
      accuracy: 95.8,
      maxCombo: 356,
      perfectHits: 498,
      totalNotes: 520,
      difficulty: "Hard",
      playedAt: "2 days ago"
    },
    {
      id: 6,
      title: "Cyber Dreams",
      artist: "Digital Awakening",
      coverArt: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBuZW9ufGVufDF8fHx8MTc2ODMyNjg5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 5,
      score: 1145678,
      accuracy: 99.7,
      maxCombo: 589,
      perfectHits: 723,
      totalNotes: 725,
      difficulty: "Expert",
      playedAt: "3 days ago"
    },
    {
      id: 7,
      title: "Neon Paradise",
      artist: "Retro Wave",
      coverArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBuZW9ufGVufDF8fHx8MTc2ODMyNjg5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 4,
      score: 823456,
      accuracy: 93.5,
      maxCombo: 267,
      perfectHits: 412,
      totalNotes: 441,
      difficulty: "Hard",
      playedAt: "4 days ago"
    },
    {
      id: 8,
      title: "Voltage",
      artist: "Shock Wave",
      coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMG5lb258ZW58MXx8fHwxNzY4MzI2ODk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 3,
      score: 678923,
      accuracy: 85.2,
      maxCombo: 156,
      perfectHits: 345,
      totalNotes: 405,
      difficulty: "Medium",
      playedAt: "5 days ago"
    },
    {
      id: 9,
      title: "Digital Horizon",
      artist: "Future Sound",
      coverArt: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGVxdWlwbWVudCUyMG5lb258ZW58MXx8fHwxNzY4MzI2OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 4,
      score: 945123,
      accuracy: 96.3,
      maxCombo: 412,
      perfectHits: 534,
      totalNotes: 554,
      difficulty: "Hard",
      playedAt: "1 week ago"
    },
    {
      id: 10,
      title: "Laser Show",
      artist: "Photon Collective",
      coverArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHZpbnlsfGVufDF8fHx8MTc2ODMyNjkwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      stars: 5,
      score: 1089234,
      accuracy: 98.9,
      maxCombo: 512,
      perfectHits: 678,
      totalNotes: 686,
      difficulty: "Expert",
      playedAt: "1 week ago"
    }
  ];

  // If a song is selected, show its results screen
  if (selectedSongHistory !== null) {
    const song = songHistory.find(s => s.id === selectedSongHistory);
    if (song) {
      return <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-white/40 text-2xl">Loading...</div></div>}><ResultsScreen onContinue={() => setSelectedSongHistory(null)} /></Suspense>;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >

      {/* Grid of previously played songs - 2 rows of 5 */}
      <div className="grid grid-cols-5 grid-rows-2 gap-6 flex-1">
        {songHistory.map((song, index) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col gap-4 hover:bg-black/30 transition-all duration-300"
          >
            {/* Cover Art - Clickable */}
            <button
              onClick={() => setSelectedSongHistory(song.id)}
              className="relative group"
            >
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-[#0891B2] transition-all duration-300 group-hover:scale-105">
                <ImageWithFallback
                  src={song.coverArt}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">{t('history.viewResults')}</p>
                </div>
              </div>
            </button>

            {/* Song Info */}
            <div className="flex-1 flex flex-col gap-2">
              <div>
                <h3 className="text-xl font-black text-white truncate">{song.title}</h3>
                <p className="text-sm text-white/60 truncate">{song.artist}</p>
              </div>

              {/* Star Rating */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < song.stars
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-transparent text-[#1a1a2e]"
                    }`}
                  />
                ))}
              </div>

              {/* Score */}
              <p className="text-2xl font-black text-[#0891B2]">{song.score.toLocaleString()}</p>

              {/* Additional Info */}
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="px-2 py-1 bg-[#9b5de5]/20 rounded border border-[#9b5de5]/30 font-bold">{song.difficulty}</span>
                <span>{song.playedAt}</span>
              </div>
            </div>

            {/* Play Again Button */}
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#DB2777] to-[#9b5de5] hover:from-[#DB2777]/80 hover:to-[#9b5de5]/80 text-white font-black text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-[#9b5de5]/30">
              {t('history.playAgain')}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SettingsView() {
  const { language, setLanguage, t } = useLanguage();
  const [viewState, setViewState] = useState<"settings" | "team">("settings");
  const [volumes, setVolumes] = useState({ master: 80, music: 70, sfx: 100, voice: 90 });

  const languages = [
    { code: "en", label: "English", local: "English" },
    { code: "ja", label: "Japanese", local: "日本語" },
    { code: "es", label: "Spanish", local: "Español" },
    { code: "fr", label: "French", local: "Français" },
    { code: "de", label: "German", local: "Deutsch" },
    { code: "pt", label: "Portuguese", local: "Português" },
  ];

  const handleVolumeChange = (type: keyof typeof volumes, val: number) => {
    setVolumes(prev => ({...prev, [type]: val}));
  };

  if (viewState === "team") {
    return <MeetTheTeamView onBack={() => setViewState("settings")} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex gap-12 h-full"
    >
      {/* Left Column: Audio & Language */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* Audio Section */}
        <div className="bg-black/20 rounded-3xl p-8 border border-white/5 flex flex-col gap-6">
           <h3 className="text-3xl font-black text-white flex items-center gap-3">
             <Volume2 className="w-8 h-8 text-cyan-400" /> Audio Mixing
           </h3>
           
           <div className="space-y-6">
             {/* Master */}
             <VolumeSlider label="Master Volume" value={volumes.master} onChange={(v) => handleVolumeChange('master', v)} />
             <VolumeSlider label="Music Volume" value={volumes.music} onChange={(v) => handleVolumeChange('music', v)} />
             <VolumeSlider label="SFX Volume" value={volumes.sfx} onChange={(v) => handleVolumeChange('sfx', v)} />
             <VolumeSlider label="Voice Volume" value={volumes.voice} onChange={(v) => handleVolumeChange('voice', v)} />
           </div>
        </div>

        {/* Language Section */}
        <div className="bg-black/20 rounded-3xl p-8 border border-white/5 flex flex-col gap-6 flex-1 min-h-0">
           <h3 className="text-3xl font-black text-white flex items-center gap-3">
             <Globe className="w-8 h-8 text-pink-400" /> Language
           </h3>
           <div className="grid grid-cols-2 grid-rows-3 gap-4 flex-1">
             {languages.map((lang) => (
               <button
                 key={lang.code}
                 onClick={() => setLanguage(lang.code)}
                 className={`relative w-full h-full rounded-2xl border-2 transition-all text-left group overflow-hidden flex flex-col justify-center px-6
                   ${language === lang.code 
                     ? "bg-white/10 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
                     : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20"
                   }`}
               >
                 <span className={`block font-black text-2xl mb-1 ${language === lang.code ? "text-white" : "text-white/60"}`}>
                   {lang.label}
                 </span>
                 <span className="block text-lg text-white/40 uppercase tracking-widest font-bold">{lang.local}</span>
                 {language === lang.code && <Check className="absolute top-1/2 -translate-y-1/2 right-6 w-8 h-8 text-pink-500" />}
               </button>
             ))}
           </div>
        </div>

      </div>

      {/* Right Column: System & Support */}
      <div className="w-1/3 flex flex-col gap-8">
         <div className="bg-black/20 rounded-3xl p-8 border border-white/5 flex flex-col gap-4">
            <h3 className="text-2xl font-bold text-white/50 uppercase tracking-widest mb-2">Support</h3>
            
            <button className="w-full p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all flex items-center gap-4 group">
               <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Bug className="w-6 h-6" />
               </div>
               <div className="text-left">
                 <p className="text-xl font-bold text-white">Report a Bug</p>
                 <p className="text-white/40 text-sm">Found a glitch in the matrix?</p>
               </div>
            </button>

            <button className="w-full p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all flex items-center gap-4 group">
               <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <MessageSquare className="w-6 h-6" />
               </div>
               <div className="text-left">
                 <p className="text-xl font-bold text-white">Send Feedback</p>
                 <p className="text-white/40 text-sm">Tell us what you think</p>
               </div>
            </button>
         </div>

         <div className="bg-black/20 rounded-3xl p-8 border border-white/5 flex flex-col gap-4">
             <h3 className="text-2xl font-bold text-white/50 uppercase tracking-widest mb-2">About</h3>
             <button 
               onClick={() => setViewState("team")}
               className="w-full p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all flex items-center gap-4 group"
             >
               <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Users className="w-6 h-6" />
               </div>
               <div className="text-left">
                 <p className="text-xl font-bold text-white">Meet the Team</p>
               </div>
            </button>
         </div>

         <div className="mt-auto p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
            <p className="text-white/30 font-mono text-sm uppercase tracking-widest mb-2">Build Version</p>
            <p className="text-white/60 font-bold text-xl">v0.9.4-beta</p>
            <p className="text-white/20 text-xs mt-2">ID: 8f7d-22a1-99c0</p>
         </div>
      </div>
    </motion.div>
  )
}

function MeetTheTeamView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
       <ImageWithFallback 
          src={meetTheTeamImage} 
          alt="Meet The Team" 
          className="w-full h-full object-cover" 
       />
       
       <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <button 
            onClick={onBack}
            aria-label="Back to Settings"
            className="w-[200px] px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/50 text-2xl cursor-pointer"
          >
            OK
          </button>
       </div>
    </motion.div>
  )
}

function VolumeSlider({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
       <div className="flex justify-between items-end">
          <label className="text-white/80 font-bold uppercase tracking-wide text-sm">{label}</label>
          <span className="text-cyan-400 font-mono font-bold">{value}%</span>
       </div>
       <div className="h-4 bg-white/10 rounded-full relative cursor-pointer group"
          onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const percentage = Math.round((x / rect.width) * 100);
             onChange(Math.max(0, Math.min(100, percentage)));
          }}
       >
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full transition-all duration-100"
            style={{ width: `${value}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] transform -translate-x-1/2 pointer-events-none transition-all duration-100 z-10"
            style={{ left: `${value}%` }}
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 rounded-full transition-opacity" />
       </div>
    </div>
  )
}

function SpacesView() {
  const { t } = useLanguage();

  const spaces = [
    {
      id: 'private',
      name: t('spaces.private'),
      icon: Lock,
      bgImage: 'https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwcm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc3MDM4Mzg4OXww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: 'social',
      name: t('spaces.social'),
      icon: Users,
      bgImage: 'https://images.unsplash.com/photo-1682133114083-81319fc857fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm93ZCUyMGNvbmNlcnQlMjBmZXN0aXZhbCUyMHBlb3BsZXxlbnwxfHx8fDE3NzAzODM4ODl8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: 'band',
      name: t('spaces.band'),
      icon: Music,
      bgImage: 'https://images.unsplash.com/photo-1767462315182-35492d3bcc1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5kJTIwbXVzaWNpYW5zJTIwcGVyZm9ybWluZyUyMHN0YWdlfGVufDF8fHx8MTc3MDM4Mzg5MHww&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col h-full"
    >
      {/* Grid of space options - 3 tiles */}
      <div className="grid grid-cols-3 gap-8 flex-1">
        {spaces.map((space) => {
          const Icon = space.icon;
          return (
            <button
              key={space.id}
              className="group relative overflow-hidden rounded-3xl border-2 border-white/10 hover:border-[#9b5de5]/50 transition-all duration-300 hover:scale-[1.02] shadow-2xl"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <ImageWithFallback 
                  src={space.bgImage}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              </div>

              {/* Icon */}
              <div className="absolute top-8 left-8 p-4 rounded-2xl bg-[#9b5de5]/20 backdrop-blur-sm border border-[#9b5de5]/30">
                <Icon className="w-12 h-12 text-[#9b5de5]" />
              </div>

              {/* Text Banner at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/90 to-transparent">
                <h3 className="text-5xl font-black text-white tracking-wide">{space.name}</h3>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#9b5de5]/20 to-transparent pointer-events-none" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function PlaySoloView() {
  const [viewState, setViewState] = useState<"selection" | "details" | "gameplay" | "results" | "rewards">("selection");
  const [selectedSong, setSelectedSong] = useState(1);
  const [selectedInstrument, setSelectedInstrument] = useState("guitar");
  const [selectedDifficulty, setSelectedDifficulty] = useState("hard");
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [tempSelectedSong, setTempSelectedSong] = useState(1);

  const songs = [
    { id: 1, title: "The Fate of Ophelia", artist: "Taylor Swift", bpm: 140, duration: "3:45", image: fateOfOpheliaArt },
    { id: 2, title: "Neon Nights", artist: "Electric Pulse", bpm: 128, duration: "4:12", image: "https://images.unsplash.com/photo-1679294176201-f9b302961f42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc2ODI2Nzg5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { id: 3, title: "Midnight Drive", artist: "Synthwave Runners", bpm: 135, duration: "3:58", image: "https://images.unsplash.com/photo-1631379054647-376f289b059f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aHdhdmUlMjByZXRyb3dhdmV8ZW58MXx8fHwxNzY4MzE2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { id: 4, title: "Electric Storm", artist: "Thunder & Bass", bpm: 145, duration: "3:33", image: "https://images.unsplash.com/photo-1748597603586-9b18f3e68655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGd1aXRhciUyMGNvbmNlcnR8ZW58MXx8fHwxNzY4MzE2MDEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { id: 5, title: "Cosmic Voyage", artist: "Stellar Dreams", bpm: 120, duration: "4:45", image: "https://images.unsplash.com/photo-1557264322-b44d383a2906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtaWMlMjBuZWJ1bGElMjBwdXJwbGV8ZW58MXx8fHwxNzY4MjkwMTY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  ];

  const currentSong = songs.find(s => s.id === selectedSong) || songs[0];

  if (viewState === "rewards") {
    return <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-white/40 text-2xl">Loading...</div></div>}><PrototypeSoloToRewards onBackToMenu={() => setViewState("selection")} /></Suspense>;
  }

  if (viewState === "results") {
    return <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-white/40 text-2xl">Loading...</div></div>}><ResultsScreen onContinue={() => setViewState("rewards")} /></Suspense>;
  }

  if (viewState === "gameplay") {
    return <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="text-white/40 text-2xl">Loading...</div></div>}><GameplayScreen onComplete={() => setViewState("results")} /></Suspense>;
  }

  if (viewState === "details") {
    return (
      <SongDetailsView 
        song={currentSong} 
        instrument={selectedInstrument} 
        difficulty={selectedDifficulty} 
        onBack={() => setViewState("selection")} 
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full gap-8 relative"
    >
      {/* Song Picker Modal */}
      <AnimatePresence>
        {showSongPicker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowSongPicker(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-16"
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-3xl border border-white/10 p-12 w-full shadow-2xl">
                <h2 className="text-4xl font-black text-white mb-8 text-center">Select a Song</h2>
                
                {/* Songs Row */}
                <div className="grid grid-cols-5 gap-6 mb-8">
                  {songs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => setTempSelectedSong(song.id)}
                      className="flex flex-col gap-3"
                    >
                      <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                        tempSelectedSong === song.id
                          ? 'border-4 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)] scale-105'
                          : 'border-2 border-white/20 hover:border-white/40 hover:scale-105'
                      }`}>
                        <div className="aspect-square">
                          <ImageWithFallback 
                            src={song.image} 
                            alt={song.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-lg truncate">{song.title}</p>
                        <p className="text-white/70 text-lg truncate">{song.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Confirm Button */}
                <button
                  onClick={() => {
                    setSelectedSong(tempSelectedSong);
                    setShowSongPicker(false);
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50 py-6 text-3xl"
                >
                  Confirm Selection
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        {/* Panel 1: Song Selection (4 cols) */}
        <div className="col-span-4 bg-black/20 rounded-3xl p-6 border border-white/5 flex flex-col min-h-0">
          <h3 className="text-2xl font-bold text-white/50 mb-6 flex items-center justify-center gap-3">
             <Music className="w-6 h-6" /> Select Song
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <button
                onClick={() => setSelectedSong(currentSong.id)}
                className="w-full rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-white/10 transition-all duration-200"
              >
                <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover" />
              </button>
              <div className="mt-6 text-center">
                <p className="font-black text-3xl text-white mb-2">{currentSong.title}</p>
                <p className="text-xl text-cyan-400 font-bold">{currentSong.artist}</p>
                <div className="flex gap-4 mt-3 text-sm font-bold text-white/30 uppercase justify-center">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {currentSong.duration}</span>
                  <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> {currentSong.bpm} BPM</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              setTempSelectedSong(selectedSong);
              setShowSongPicker(true);
            }}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#DB2777] to-[#9b5de5] hover:from-[#DB2777]/80 hover:to-[#9b5de5]/80 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#9b5de5]/50 py-8 text-2xl tracking-tight"
          >
            Change Song
          </button>
        </div>

        {/* Panel 2: Instrument + Difficulty (4 cols) */}
        <div className="col-span-4 bg-black/20 rounded-3xl p-6 border border-white/5 flex flex-col">
          <h3 className="text-2xl font-bold text-white/50 mb-4 text-center">
            Instrument
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
            {[
              { id: "guitar", label: "Guitar", icon: Guitar, color: "#DB2777" },
              { id: "drums", label: "Drums", icon: Drum, color: "#EA580C", hoverImage: drumsGif },
              { id: "keys", label: "Keys", icon: PianoKeys, color: "#9b5de5" },
              { id: "vocals", label: "Vocals", icon: Mic, color: "#0891B2" },
            ].map((inst) => (
              <button
                key={inst.id}
                onClick={() => setSelectedInstrument(inst.id)}
className="relative rounded-2xl overflow-hidden transition-all duration-300 border-2 border-transparent group"
              >
                {/* Background - Flat Color or GIF on hover */}
                <div className="absolute inset-0">
{/* Flat Color Background with 3 stages: inactive (10%), hover (30%), picked (60%) */}
                  <div 
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      selectedInstrument === inst.id 
                        ? "opacity-60" 
                        : inst.hoverImage 
                          ? "opacity-10 group-hover:opacity-0" 
                          : "opacity-10 group-hover:opacity-30"
                    }`}
                    style={{ backgroundColor: inst.color }}
                  />
                  {/* Hover Image (GIF) - only for drums */}
                  {inst.hoverImage && (
                    <ImageWithFallback 
                      src={inst.hoverImage} 
                      alt={`${inst.label} animated`} 
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    />
                  )}
                </div>
                
{/* Border Glow on Selected - uses instrument color */}
                <div 
                  className={`absolute inset-0 border-4 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                    selectedInstrument === inst.id ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ borderColor: inst.color }}
                />

                {/* Text Content - Clean */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center py-4 z-10">
<inst.icon className={`w-8 h-8 mb-2 transition-all duration-300 ${
                    selectedInstrument === inst.id 
                      ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                      : "text-white/70 group-hover:text-white/90 drop-shadow-lg"
                  }`} />
<h3 className={`text-2xl font-black text-white tracking-tight transition-transform duration-300 drop-shadow-lg ${
                    selectedInstrument === inst.id ? "scale-110" : "group-hover:scale-105"
                  }`}>
                    {inst.label}
                  </h3>
                </div>

                {/* Check Icon */}
                {selectedInstrument === inst.id && (
                  <Check className="w-6 h-6 text-white absolute top-3 right-3 z-20 drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
          
          <h3 className="text-2xl font-bold text-white/50 mb-4 text-center">
            Difficulty
          </h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
             {[
               { id: "easy", label: "Chill", color: "#34D399", icon: Wind },
               { id: "normal", label: "Normal", color: "#0891B2", icon: CircleDot },
               { id: "hard", label: "Hard", color: "#EA580C", icon: Flame },
               { id: "expert", label: "Expert", color: "#DB2777", icon: Crown },
             ].map((diff) => (
               <button
                 key={diff.id}
                 onClick={() => setSelectedDifficulty(diff.id)}
                 className="relative rounded-2xl overflow-hidden transition-all duration-300 border-2 border-transparent group"
               >
                 {/* Background with 3 stages: inactive (10%), hover (30%), picked (60%) */}
                 <div 
                   className={`absolute inset-0 transition-opacity duration-300 ${
                     selectedDifficulty === diff.id 
                       ? "opacity-60" 
                       : "opacity-10 group-hover:opacity-30"
                   }`} 
                   style={{ backgroundColor: diff.color }} 
                 />
                 
                 {/* Border Glow on Selected - uses difficulty color */}
                 <div 
                   className={`absolute inset-0 border-4 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                     selectedDifficulty === diff.id ? "opacity-100" : "opacity-0"
                   }`}
                   style={{ borderColor: diff.color }}
                 />

                 {/* Text Content - Clean */}
                 <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center py-4 z-10">
                   <diff.icon className={`w-8 h-8 mb-2 transition-all duration-300 ${
                     selectedDifficulty === diff.id 
                       ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                       : "text-white/70 group-hover:text-white/90 drop-shadow-lg"
                   }`} />
                   <h3 className={`text-2xl font-black text-white tracking-tight transition-transform duration-300 drop-shadow-lg ${
                     selectedDifficulty === diff.id ? "scale-110" : "group-hover:scale-105"
                   }`}>
                     {diff.label}
                   </h3>
                 </div>

                 {/* Check Icon */}
                 {selectedDifficulty === diff.id && (
                   <Check className="w-6 h-6 text-white absolute top-3 right-3 z-20 drop-shadow-lg" />
                 )}
               </button>
             ))}
          </div>
        </div>

        {/* Panel 3: Leaderboard (4 cols) */}
        <div className="col-span-4 bg-black/20 rounded-3xl p-6 border border-white/5 flex flex-col">
          <h3 className="text-2xl font-bold text-white/50 mb-6 flex items-center gap-3">
             <Trophy className="w-6 h-6" /> Leaderboard
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-2.5">
              {[
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
                {
                  rank: 5,
                  bandName: "Crimson Vipers",
                  score: 954321,
                  logoImage: null,
                  isCurrentBand: false,
                },
                {
                  rank: 6,
                  bandName: "Velvet Groove",
                  score: 923456,
                  logoImage: null,
                  isCurrentBand: false,
                },
                {
                  rank: 7,
                  bandName: "Cyber Pulse",
                  score: 890123,
                  logoImage: null,
                  isCurrentBand: false,
                },
                {
                  rank: 8,
                  bandName: "Starlight Synergy",
                  score: 856789,
                  logoImage: null,
                  isCurrentBand: false,
                },
              ].map((entry, index) => (
                <motion.div
                  key={entry.bandName}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className={`flex items-center gap-4 p-2.5 rounded-xl transition-all duration-300 ${
                    entry.isCurrentBand
                      ? "bg-gradient-to-r from-yellow-600/40 to-yellow-800/40 border-2 border-yellow-500/60 shadow-lg shadow-yellow-500/20"
                      : "bg-purple-900/30 hover:bg-purple-900/50"
                  }`}
                >
                  <div className="w-7 text-center flex-shrink-0">
                    <span className="text-2xl font-black text-white">{entry.rank}</span>
                  </div>

                  <div className="relative w-16 h-16 rounded-full flex-shrink-0">
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
                    } bg-black/40`}>
                      {entry.logoImage ? (
                        <img
                          src={entry.logoImage}
                          alt={entry.bandName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white/50">{entry.bandName.charAt(0)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-xl font-black ${
                      entry.isCurrentBand ? "text-yellow-200" : "text-white"
                    }`}>
                      {entry.bandName}
                    </p>
                    <p className="text-lg text-purple-300">
                      {entry.score.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewState("gameplay")}
          className="w-[240px] px-16 py-6 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
          style={{ fontSize: '2.5rem' }}
        >
          Play
        </motion.button>
      </div>
    </motion.div>
  );
}

function SongDetailsView({ song, instrument, difficulty, onBack }: { song: any, instrument: string, difficulty: string, onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex h-full gap-8"
    >
      {/* Left Panel: Song Info & Play */}
      <div className="w-1/3 flex flex-col gap-6">
         <button onClick={onBack} className="self-start flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to Selection
         </button>

         <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl relative group">
            <ImageWithFallback src={song.image} alt={song.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
               <h1 className="text-5xl font-black text-white mb-2">{song.title}</h1>
               <p className="text-2xl text-cyan-400 font-bold">{song.artist}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/5">
               <p className="text-white/40 font-bold uppercase text-xs tracking-widest mb-2">Instrument</p>
               <p className="text-2xl font-black text-white uppercase">{instrument}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/5">
               <p className="text-white/40 font-bold uppercase text-xs tracking-widest mb-2">Difficulty</p>
               <p className="text-2xl font-black text-white uppercase">{difficulty}</p>
            </div>
         </div>

         <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6)] transition-all border-2 border-white/20"
         >
            <Play className="w-10 h-10 fill-white text-white" />
            <span className="text-4xl font-black text-white tracking-widest">PLAY</span>
         </motion.button>
      </div>

      {/* Right Panel: Stats & Leaderboard */}
      <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 p-8 flex flex-col">
         {/* Personal Best Section */}
         <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 mb-8 border border-white/10">
            <div>
               <p className="text-purple-300 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Your Personal Best
               </p>
               <p className="text-6xl font-black text-white tracking-tighter">894,250</p>
            </div>
            <div className="flex gap-2">
               {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-8 h-8 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`} />
               ))}
            </div>
         </div>

         {/* Leaderboard */}
         <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-2xl font-bold text-white/50 mb-6 uppercase tracking-widest flex items-center gap-3">
               Global Leaderboard
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
               {[
                  { rank: 1, name: "NeonGod_99", score: "998,500", acc: "99.8%" },
                  { rank: 2, name: "RhythmMaster", score: "982,100", acc: "99.5%" },
                  { rank: 3, name: "CyberNinja", score: "975,400", acc: "99.2%" },
                  { rank: 4, name: "BassDrop_X", score: "968,200", acc: "98.9%" },
                  { rank: 5, name: "SynthWave_Lover", score: "950,800", acc: "98.5%" },
                  { rank: 6, name: "PixelPerfect", score: "942,000", acc: "98.1%" },
                  { rank: 7, name: "GlitchHunter", score: "935,600", acc: "97.8%" },
               ].map((entry) => (
                  <div key={entry.rank} className="flex items-center p-4 bg-white/5 rounded-xl border border-white/5">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mr-4
                        ${entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50" : 
                          entry.rank === 2 ? "bg-gray-400/20 text-gray-400 border border-gray-400/50" :
                          entry.rank === 3 ? "bg-orange-600/20 text-orange-600 border border-orange-600/50" :
                          "text-white/40"
                        }`}>
                        {entry.rank}
                     </div>
                     <div className="flex-1">
                        <p className="text-white font-bold text-lg">{entry.name}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-white font-black text-2xl tracking-tighter">{entry.score}</p>
                        <p className="text-white/40 text-sm font-bold">{entry.acc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function VaultView() {
  const categories = [
    { name: "Stages", image: "https://images.unsplash.com/photo-1730537456013-8dfd862f0036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBuZW9uJTIwbGlnaHRzfGVufDF8fHx8MTc2Nzc5ODI0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Environments", image: "https://images.unsplash.com/photo-1744111269242-59ffa48000b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2ktZmklMjBkaWdpdGFsJTIwbGFuZHNjYXBlJTIwcHVycGxlfGVufDF8fHx8MTc2Nzc5ODI1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Guitars", image: "https://images.unsplash.com/photo-1579985807337-32224ee8ca6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGd1aXRhciUyMG5lb258ZW58MXx8fHwxNzY3NzcwNjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Drums", image: "https://images.unsplash.com/photo-1627931544947-1b797c16da09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnVtJTIwa2l0JTIwc3RhZ2UlMjBuZW9uJTIwbGlnaHRzfGVufDF8fHx8MTc2Nzc5ODI1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Keys", image: "https://images.unsplash.com/photo-1535057697339-e2a798221230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aGVzaXplciUyMGtleWJvYXJkJTIwbmVvbnxlbnwxfHx8fDE3Njc3OTgyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Microphones", image: "https://images.unsplash.com/photo-1543062591-e3c0fdb97350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3Bob25lJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3Njc3OTgyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Highways", image: "https://images.unsplash.com/photo-1532204307534-972519e4f93d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGxpZ2h0JTIwdHVubmVsJTIwc3BlZWR8ZW58MXx8fHwxNzY3Nzk4MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Gems", image: "https://images.unsplash.com/photo-1766430191904-f2ffb8e10267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG93aW5nJTIwY3J5c3RhbCUyMGdlbXN8ZW58MXx8fHwxNzY3Nzk4MjUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Outfits", image: "https://images.unsplash.com/photo-1711662171213-4141abec218f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBmYXNoaW9uJTIwb3V0Zml0JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3Njc3OTgxODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col h-full"
    >
      {/* ... existing VaultView ... */}
      <div className="grid grid-cols-3 gap-6 flex-1 h-full pb-4 pt-8">
        {categories.map((category, index) => (
          <motion.button
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative group rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg hover:border-white/40 transition-all duration-300"
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gray-900">
               <ImageWithFallback 
                 src={category.image} 
                 alt={category.name} 
                 className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
               />
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
            
            {/* Border Glow on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none box-border border-4 border-purple-500/50 rounded-2xl" />

            {/* Text Content */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center py-6 bg-black/50 z-10 backdrop-blur-sm">
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                {category.name}
              </h3>
              <p className="mt-2 text-lg text-purple-200 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-bold uppercase tracking-widest absolute -bottom-8">
                View Items
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileView() {
  const [activeProfileId, setActiveProfileId] = useState(1);

  const profiles = [
    { id: 1, name: "Neon Hunter", level: 42, avatar: avatar1, banner: "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600", active: true },
    { id: 2, name: "Cyber Jazz", level: 15, avatar: avatar2, banner: "bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600", active: false },
    { id: 3, name: "Rhythm Soul", level: 8, avatar: avatar3, banner: "bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600", active: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex gap-12 h-full"
    >
      {/* Left Column: Current Profile Detail */}
      <div className="w-2/3 flex flex-col">
        <h2 className="text-6xl font-black text-white mb-12 flex items-center gap-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Current Profile</span>
        </h2>

        {/* Big Profile Card (The "Banner" Concept) */}
        <div className="relative w-full aspect-[2.5/1] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
          {/* Banner Background */}
          <div className={`absolute inset-0 ${profiles.find(p => p.id === activeProfileId)?.banner} transition-colors duration-500`} />
          
          {/* Animated Overlay Pattern */}
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center px-16 gap-10">
            {/* Avatar */}
            <div className="relative">
              <div className="w-64 h-64 rounded-full border-8 border-white/20 overflow-hidden shadow-2xl relative z-10">
                <ImageWithFallback 
                  src={profiles.find(p => p.id === activeProfileId)?.avatar || avatar1} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/10 z-20">
                 <Edit3 className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Text Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <span className="px-4 py-1 bg-black/40 rounded-full text-white/80 font-bold tracking-widest uppercase text-sm border border-white/10">
                  Level {profiles.find(p => p.id === activeProfileId)?.level}
                </span>
                <span className="px-4 py-1 bg-white/20 rounded-full text-white font-bold tracking-widest uppercase text-sm border border-white/10">
                  Pro Member
                </span>
              </div>
              <h1 className="text-8xl font-black text-white tracking-tighter drop-shadow-lg mb-2">
                {profiles.find(p => p.id === activeProfileId)?.name}
              </h1>
              <p className="text-2xl text-white/80 font-medium tracking-wide">
                Rhythm Enthusiast • Joined 2024
              </p>
            </div>
          </div>

          {/* Edit Button overlay for Banner */}
          <button className="absolute top-6 right-6 px-6 py-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl text-white font-bold border border-white/10 transition-colors flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Customize Banner
          </button>
        </div>

        {/* Stats / Recent Activity Placeholder */}
        <div className="mt-8 grid grid-cols-3 gap-6">
           <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <p className="text-purple-300 uppercase tracking-wider text-sm font-bold mb-1">Total Score</p>
              <p className="text-4xl font-black text-white">12,450,900</p>
           </div>
           <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <p className="text-purple-300 uppercase tracking-wider text-sm font-bold mb-1">Songs Cleared</p>
              <p className="text-4xl font-black text-white">142</p>
           </div>
           <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <p className="text-purple-300 uppercase tracking-wider text-sm font-bold mb-1">Play Time</p>
              <p className="text-4xl font-black text-white">48h 20m</p>
           </div>
        </div>
      </div>

      {/* Right Column: Switch Profile */}
      <div className="w-1/3 bg-black/20 rounded-3xl p-8 border border-white/5 flex flex-col">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-3xl font-black text-white">Switch Profile</h3>
           <span className="text-white/40 font-bold">{profiles.length}/5 Slots</span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setActiveProfileId(profile.id)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 border-2 group text-left ${
                activeProfileId === profile.id
                  ? "bg-white/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                  : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {/* Avatar Preview */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                <ImageWithFallback src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <p className={`font-black text-xl ${activeProfileId === profile.id ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                  {profile.name}
                </p>
                <p className="text-sm text-white/40">Level {profile.level}</p>
              </div>

              {/* Active Checkmark */}
              {activeProfileId === profile.id && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              )}
            </button>
          ))}

          {/* Add New Profile Button */}
          <button className="w-full p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 border-2 border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/50 hover:bg-white/5 h-24">
            <Plus className="w-8 h-8" />
            <span className="font-bold text-lg">Create New Profile</span>
          </button>
        </div>

        <div className="pt-8 mt-4 border-t border-white/10">
          <button className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold flex items-center justify-center gap-2 transition-colors">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function GemsShopView({ onBack }: { onBack: () => void }) {
  const gems = [
    { name: "Ruby Prism", price: 500, image: prismGem },
    { name: "Sapphire Prism", price: 500, image: prismGem },
    { name: "Emerald Prism", price: 500, image: prismGem },
    { name: "Amethyst Prism", price: 500, image: prismGem },
    { name: "Topaz Prism", price: 500, image: prismGem },
    { name: "Diamond Prism", price: 1000, image: prismGem },
    { name: "Onyx Prism", price: 500, image: prismGem },
    { name: "Quartz Prism", price: 500, image: prismGem },
    { name: "Opal Prism", price: 750, image: prismGem },
    { name: "Laser Frame", price: 1200, image: laserFrameGem },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex gap-8 h-full"
    >
      {/* Left Column: Hero & Banners */}
      <div className="w-1/2 flex flex-col gap-6">
         <div className="flex items-center gap-3 mb-2">
            <button onClick={onBack} className="mr-2 group hover:bg-white/10 rounded-full p-1 transition-colors">
                <ArrowLeft className="w-8 h-8 text-white/50 group-hover:text-white" />
            </button>
            <button 
               onClick={onBack} 
               className="group hover:bg-white/5 rounded-xl px-3 py-1 transition-colors"
            >
               <h2 className="text-4xl font-black text-white uppercase tracking-tight group-hover:text-purple-300 transition-colors">Shop</h2>
            </button>
         </div>

         {/* Main Hero Banner */}
         <div className="relative w-full flex-1 rounded-3xl overflow-hidden group shadow-2xl border border-white/10">
            <ImageWithFallback 
               src={prismGem} 
               alt="Prismatic Core" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 p-8">
               <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded-lg text-xs font-black uppercase tracking-widest">Rare</span>
               </div>
               <h3 className="text-5xl font-black text-white mb-2 leading-none">Prismatic Core</h3>
               <p className="text-white/80 mb-6 max-w-md">The ultimate power source. Unlocks full spectrum visuals.</p>
               <button className="px-8 py-3 bg-purple-500 hover:bg-purple-400 text-white font-black rounded-xl flex items-center gap-2 transition-colors">
                  <ShoppingBag className="w-5 h-5" /> Buy Now - 5000 Coins
               </button>
            </div>
         </div>

         {/* Secondary Banners */}
         <div className="h-48 grid grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden group border border-white/10 bg-black/40">
               <div className="absolute inset-0 flex items-center justify-center">
                   <p className="text-white/20 font-black uppercase">Coming Soon</p>
               </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group border border-white/10 bg-black/40">
                <div className="absolute inset-0 flex items-center justify-center">
                   <p className="text-white/20 font-black uppercase">Coming Soon</p>
               </div>
            </div>
         </div>
      </div>

      {/* Right Column: Gems Grid */}
      <div className="w-1/2 flex flex-col h-full">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Browse Gems</h2>
         </div>
         
         <div className="flex-1 grid grid-cols-3 gap-4 pb-4 overflow-y-auto pr-2">
            {gems.map((gem) => (
               <button
                  key={gem.name}
                  className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white/10 hover:border-white/40 transition-all duration-300 shadow-lg"
               >
                  <div className="absolute inset-0 bg-gray-900">
                     <ImageWithFallback 
                        src={gem.image} 
                        alt={gem.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                     />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col items-center justify-end text-center z-10">
                     <span className="text-lg font-black text-white uppercase tracking-tight leading-tight mb-1 group-hover:text-purple-200 transition-colors">{gem.name}</span>
                     <span className="text-sm font-bold text-yellow-400">{gem.price} Coins</span>
                  </div>
               </button>
            ))}
         </div>
      </div>
    </motion.div>
  );
}

function HighwaysShopView({ onBack }: { onBack: () => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  
  // Coin Icon Component
  const CoinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
      <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#FFD700" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="8" fill="url(#coinInnerGradient)" opacity="0.5"/>
      <text x="12" y="16" fontSize="12" fontWeight="bold" fill="#1A1A1A" textAnchor="middle" fontFamily="sans-serif">J</text>
      <defs>
        <linearGradient id="coinGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="50%" stopColor="#FFA500"/>
          <stop offset="100%" stopColor="#FF8C00"/>
        </linearGradient>
        <radialGradient id="coinInnerGradient" cx="12" cy="12" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFEB3B"/>
          <stop offset="100%" stopColor="#FFA500"/>
        </radialGradient>
      </defs>
    </svg>
  );
  
  const highways = [
    { name: "Neon Synthwave", price: 800, image: neonSynthwaveHighway, rotate: true },
    { name: "Cosmic Nebula", price: 850, image: cosmicNebulaHighway },
    { name: "Cyber Tunnel", price: 800, image: "https://images.unsplash.com/photo-1617478755490-e21232a5eeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlciUyMHR1bm5lbCUyMG5lb258ZW58MXx8fHwxNzY3Nzk4MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Quantum Stream", price: 800, image: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGxpZ2h0JTIwc3RyZWFtfGVufDF8fHx8MTc2Nzc5ODI1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Holographic Path", price: 1000, image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xvZ3JhcGhpYyUyMGxpZ2h0c3xlbnwxfHx8fDE3Njc3OTgyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Neon Grid", price: 750, image: "https://images.unsplash.com/photo-1532204307534-972519e4f93d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGxpZ2h0JTIwdHVubmVsJTIwc3BlZWR8ZW58MXx8fHwxNzY3Nzk4MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Starlight Lane", price: 900, image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFycyUyMG5pZ2h0JTIwc2t5fGVufDF8fHx8MTc2Nzc5ODI1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Electric Flow", price: 800, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGJsdWUlMjBsaWdodHxlbnwxfHx8fDE3Njc3OTgyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Retro Wave", price: 850, image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRybyUyMHdhdmUlMjBzdW5zZXR8ZW58MXx8fHwxNzY3Nzk4MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Digital Horizon", price: 950, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaG9yaXpvbnxlbnwxfHx8fDE3Njc3OTgyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Laser Highway", price: 1200, image: "https://images.unsplash.com/photo-1506606401543-2e73709cebb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXNlciUyMGxpZ2h0cyUyMG5lb258ZW58MXx8fHwxNzY3Nzk4MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  ];
  
  const totalPages = Math.ceil(highways.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentHighways = highways.slice(startIndex, startIndex + itemsPerPage);
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
         <button 
            onClick={onBack} 
            className="group hover:bg-white/5 rounded-xl px-4 py-2 transition-colors flex items-center gap-2"
         >
            <ArrowLeft className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
            <span className="text-xl font-black text-white/50 group-hover:text-white uppercase tracking-tight transition-colors">Back to Store</span>
         </button>
         
         <h2 className="text-5xl font-black text-white uppercase tracking-tight absolute left-1/2 -translate-x-1/2">Highways</h2>
         
         <div className="w-[200px]"></div>
      </div>

      {/* Content Area with Navigation */}
      <div className="flex-1 flex items-center gap-6">
         {/* Left Navigation Button */}
         <motion.button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            whileHover={{ scale: currentPage === 0 ? 1 : 1.1 }}
            whileTap={{ scale: currentPage === 0 ? 1 : 0.95 }}
            className={`flex-shrink-0 w-20 h-20 rounded-full bg-black/20 border border-white/5 backdrop-blur-md flex items-center justify-center transition-all ${
               currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-purple-600/40 hover:border-white/20 hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]'
            }`}
         >
            <ChevronLeft className="w-8 h-8 text-white" />
         </motion.button>

         {/* Highways List */}
         <div className="flex-1 flex flex-col gap-4">
            <AnimatePresence mode="wait">
               <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
               >
                  {currentHighways.map((highway) => (
                     <button
                        key={highway.name}
                        className="group relative h-32 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-white/40 transition-all duration-300 shadow-lg flex-shrink-0"
                     >
                        <div className="absolute inset-0 bg-gray-900">
                           <ImageWithFallback 
                              src={highway.image} 
                              alt={highway.name} 
                              className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ${highway.rotate ? 'rotate-90' : ''}`}
                           />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                        
                        <div className="absolute inset-y-0 left-0 px-8 flex items-center gap-6 z-10">
                           <div className="flex flex-col">
                              <span className="text-3xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-cyan-200 transition-colors">{highway.name}</span>
                              <span className="text-lg font-bold text-yellow-400 mt-1 flex items-center gap-2">
                                 <CoinIcon /> {highway.price} Coins
                              </span>
                           </div>
                        </div>
                        
                        <div className="absolute inset-y-0 right-0 px-8 flex items-center z-10">
                           <div className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500 border-2 border-cyan-500 rounded-xl text-cyan-400 group-hover:text-black font-black uppercase tracking-wide transition-all flex items-center gap-2">
                              <ShoppingBag className="w-5 h-5" /> Purchase
                           </div>
                        </div>
                     </button>
                  ))}
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Right Navigation Button */}
         <motion.button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            whileHover={{ scale: currentPage === totalPages - 1 ? 1 : 1.1 }}
            whileTap={{ scale: currentPage === totalPages - 1 ? 1 : 0.95 }}
            className={`flex-shrink-0 w-20 h-20 rounded-full bg-black/20 border border-white/5 backdrop-blur-md flex items-center justify-center transition-all ${
               currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-purple-600/40 hover:border-white/20 hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]'
            }`}
         >
            <ChevronRight className="w-8 h-8 text-white" />
         </motion.button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-3 py-6">
         {Array.from({ length: totalPages }).map((_, index) => (
            <motion.button
               key={index}
               onClick={() => setCurrentPage(index)}
               whileHover={{ scale: 1.2 }}
               whileTap={{ scale: 0.9 }}
               className={`transition-all duration-300 rounded-full ${
                  currentPage === index 
                     ? 'w-12 h-3 bg-gradient-to-r from-purple-500 to-cyan-500' 
                     : 'w-3 h-3 bg-white/20 hover:bg-white/40'
               }`}
            />
         ))}
      </div>
    </motion.div>
  );
}

// --- Components ---

// Piano Keys Icon Component
function PianoKeys({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* White keys */}
      <rect x="3" y="4" width="3" height="16" fill="currentColor" stroke="currentColor" strokeWidth="0.5" rx="0.5" />
      <rect x="7" y="4" width="3" height="16" fill="currentColor" stroke="currentColor" strokeWidth="0.5" rx="0.5" />
      <rect x="11" y="4" width="3" height="16" fill="currentColor" stroke="currentColor" strokeWidth="0.5" rx="0.5" />
      <rect x="15" y="4" width="3" height="16" fill="currentColor" stroke="currentColor" strokeWidth="0.5" rx="0.5" />
      <rect x="19" y="4" width="3" height="16" fill="currentColor" stroke="currentColor" strokeWidth="0.5" rx="0.5" />
      
      {/* Black keys */}
      <rect x="5.5" y="4" width="2" height="10" fill="currentColor" opacity="0.4" rx="0.5" />
      <rect x="9.5" y="4" width="2" height="10" fill="currentColor" opacity="0.4" rx="0.5" />
      <rect x="17" y="4" width="2" height="10" fill="currentColor" opacity="0.4" rx="0.5" />
    </svg>
  );
}

interface NavButtonProps {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  highlight?: boolean;
  onClick: () => void;
}

function NavButton({ children, label, active, highlight, onClick }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 min-w-[160px]
        ${active 
          ? "bg-gradient-to-br from-purple-600/60 to-blue-600/60 border border-white/30 shadow-[0_0_25px_rgba(124,58,237,0.4)] backdrop-blur-md" 
          : "hover:bg-white/5"}
        ${highlight && !active ? "bg-gradient-to-b from-purple-600/50 to-blue-600/50 border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]" : ""}
      `}
    >
      <div className={`p-2 rounded-xl transition-colors ${highlight && !active ? "bg-white/10" : "group-hover:bg-white/10"} ${active ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
        {children}
      </div>
      <span className={`text-xl font-bold tracking-wide ${active || highlight ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
        {label}
      </span>
    </motion.button>
  );
}