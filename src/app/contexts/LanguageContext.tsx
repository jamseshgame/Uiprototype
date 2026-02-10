import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ja';

interface Translations {
  [key: string]: {
    en: string;
    ja: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.store': { en: 'Store', ja: 'ストア' },
  'nav.play': { en: 'Play', ja: 'プレイ' },
  'nav.spaces': { en: 'Spaces', ja: 'スペース' },
  'nav.home': { en: 'Home', ja: 'ホーム' },
  'nav.career': { en: 'Career', ja: 'キャリア' },
  'nav.history': { en: 'History', ja: '履歴' },
  'nav.myVault': { en: 'Vault', ja: 'ボックス' },
  'nav.settings': { en: 'Settings', ja: '設定' },

  // Profile
  'profile.level': { en: 'Level', ja: 'レベル' },
  'profile.joined': { en: 'Joined', ja: '参加日' },
  'profile.vrRhythmMaster': { en: 'VR Rhythm Master', ja: 'VRリズムマスター' },
  
  // Home View
  'home.flashDeals': { en: 'Flash Deals', ja: 'フラッシュセール' },
  'home.recentVaultActivity': { en: 'Recent Vault Activity', ja: '最近のボックス活動' },
  'home.justUnlocked': { en: 'Just unlocked', ja: '解除済み' },
  'home.careerProgress': { en: 'Career Progress', ja: 'キャリア進捗' },
  'home.quickPlay': { en: 'Quick Play', ja: 'クイックプレイ' },
  'home.browseShop': { en: 'Browse Shop', ja: 'ショップを見る' },
  'home.bundle': { en: 'Bundle', ja: 'バンドル' },
  'home.exclusive': { en: 'Exclusive', ja: '限定' },
  
  // Career View
  'career.careerProgress': { en: 'Career Progress', ja: 'キャリア進捗' },
  'career.songsPlayed': { en: 'Songs Played', ja: 'プレイ曲数' },
  'career.avgAccuracy': { en: 'Avg Accuracy', ja: '平均精度' },
  'career.highestCombo': { en: 'Highest Combo', ja: '最高コンボ' },
  'career.totalScore': { en: 'Total Score', ja: '合計スコア' },
  'career.playTime': { en: 'Play Time', ja: 'プレイ時間' },
  'career.perfectSongs': { en: 'Perfect Songs', ja: 'パーフェクト曲' },
  'career.currentStreak': { en: 'Current Streak', ja: '現在の連続記録' },
  'career.friendsRank': { en: 'Friends Rank', ja: 'フレンドランク' },
  'career.nextMilestone': { en: 'Next Milestone', ja: '次のマイルストーン' },
  'career.reachLevel25': { en: 'Reach Level 25', ja: 'レベル25に到達' },
  'career.almostThere': { en: 'Almost there! Keep playing to unlock exclusive rewards and new content.', ja: 'もう少し！プレイを続けて限定報酬と新しいコンテンツを解除しましょう。' },
  
  // History View
  'history.playHistory': { en: 'Play History', ja: 'プレイ履歴' },
  'history.viewResults': { en: 'View Results', ja: '結果を見る' },
  'history.playAgain': { en: 'Play Again', ja: 'もう一度プレイ' },
  'history.expert': { en: 'Expert', ja: 'エキスパート' },
  'history.hard': { en: 'Hard', ja: 'ハード' },
  'history.medium': { en: 'Medium', ja: 'ミディアム' },
  'history.easy': { en: 'Easy', ja: 'イージー' },
  
  // Results Screen
  'results.youCrushedIt': { en: 'You crushed it', ja: '素晴らしい' },
  'results.score': { en: 'Score', ja: 'スコア' },
  'results.group': { en: 'Group', ja: 'グループ' },
  'results.me': { en: 'Me', ja: '自分' },
  'results.leaderboard': { en: 'Leaderboard', ja: 'リーダーボード' },
  'results.accuracy': { en: 'Accuracy', ja: '精度' },
  'results.maxCombo': { en: 'Max Combo', ja: '最大コンボ' },
  'results.perfectHits': { en: 'Perfect Hits', ja: 'パーフェクトヒット' },
  'results.notesHit': { en: 'Notes Hit', ja: 'ヒットノート' },
  'results.retry': { en: 'Retry', ja: 'リトライ' },
  'results.continue': { en: 'Continue', ja: '続ける' },
  
  // Settings View
  'settings.settings': { en: 'Settings', ja: '設定' },
  'settings.meetTheTeam': { en: 'Meet the Team', ja: 'チームを見る' },
  'settings.audio': { en: 'Audio', ja: 'オーディオ' },
  'settings.masterVolume': { en: 'Master Volume', ja: 'マスターボリューム' },
  'settings.musicVolume': { en: 'Music Volume', ja: '音楽ボリューム' },
  'settings.sfxVolume': { en: 'SFX Volume', ja: '効果音ボリューム' },
  'settings.voiceVolume': { en: 'Voice Volume', ja: 'ボイスボリューム' },
  'settings.language': { en: 'Language', ja: '言語' },
  'settings.support': { en: 'Support', ja: 'サポート' },
  'settings.reportBug': { en: 'Report Bug', ja: 'バグ報告' },
  'settings.feedback': { en: 'Feedback', ja: 'フィードバック' },
  'settings.accountActions': { en: 'Account Actions', ja: 'アカウント操作' },
  'settings.editProfile': { en: 'Edit Profile', ja: 'プロフィール編集' },
  'settings.signOut': { en: 'Sign Out', ja: 'サインアウト' },
  'settings.backToSettings': { en: 'Back to Settings', ja: '設定に戻る' },
  'settings.ourStory': { en: 'Our Story', ja: '私たちのストーリー' },
  'settings.teamDescription': { en: 'We\'re a passionate team of VR enthusiasts dedicated to creating the ultimate rhythm gaming experience.', ja: 'VR愛好家の情熱的なチームが、究極のリズムゲーム体験を作ることに専念しています。' },
  
  // Shop View
  'shop.instruments': { en: 'Instruments', ja: '楽器' },
  'shop.stages': { en: 'Stages', ja: 'ステージ' },
  'shop.avatars': { en: 'Avatars', ja: 'アバター' },
  'shop.musicPacks': { en: 'Music Packs', ja: '音楽パック' },
  'shop.effects': { en: 'Effects', ja: 'エフェクト' },
  'shop.nameplates': { en: 'Nameplates', ja: 'ネームプレート' },
  'shop.backToShop': { en: 'Back to Shop', ja: 'ショップに戻る' },
  
  // Vault View
  'vault.myVault': { en: 'My Vault', ja: 'マイボックス' },
  'vault.instruments': { en: 'Instruments', ja: '楽器' },
  'vault.stages': { en: 'Stages', ja: 'ステージ' },
  'vault.avatars': { en: 'Avatars', ja: 'アバター' },
  'vault.musicPacks': { en: 'Music Packs', ja: '音楽パック' },
  'vault.effects': { en: 'Effects', ja: 'エフェクト' },
  'vault.nameplates': { en: 'Nameplates', ja: 'ネームプレート' },
  'vault.owned': { en: 'Owned', ja: '所有' },
  'vault.equipped': { en: 'Equipped', ja: '装備中' },
  'vault.equip': { en: 'Equip', ja: '装備する' },
  
  // Solo Play View
  'solo.selectDifficulty': { en: 'Select Difficulty', ja: '難易度を選択' },
  'solo.selectInstrument': { en: 'Select Instrument', ja: '楽器を選択' },
  'solo.guitar': { en: 'Guitar', ja: 'ギター' },
  'solo.drums': { en: 'Drums', ja: 'ドラム' },
  'solo.vocals': { en: 'Vocals', ja: 'ボーカル' },
  'solo.bass': { en: 'Bass', ja: 'ベース' },
  'solo.keyboard': { en: 'Keyboard', ja: 'キーボード' },
  'solo.allInstruments': { en: 'All Instruments', ja: 'すべての楽器' },
  'solo.play': { en: 'Play', ja: 'プレイ' },
  
  // Spaces View
  'spaces.title': { en: 'Spaces', ja: 'スペース' },
  'spaces.private': { en: 'Private', ja: 'プライベート' },
  'spaces.social': { en: 'Social', ja: 'ソーシャル' },
  'spaces.band': { en: 'Band', ja: 'バンド' },
  
  // Time references
  'time.hoursAgo': { en: 'hours ago', ja: '時間前' },
  'time.yesterday': { en: 'Yesterday', ja: '昨日' },
  'time.daysAgo': { en: 'days ago', ja: '日前' },
  'time.weekAgo': { en: 'week ago', ja: '週間前' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language | string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language | string) => {
    // Only set if it's 'en' or 'ja', otherwise default to 'en'
    if (lang === 'ja') {
      setLanguageState('ja');
    } else {
      setLanguageState('en');
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}