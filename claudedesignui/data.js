// Fictional song catalog (original titles & artist names — no real music referenced)
window.SONG_CATALOG = [
  { id: 1,  title: "Static Bloom",        artist: "Neon Atlas",       art: "assets/art/01.jpg", duration: 218, bpm: 124, genre: "Pop",     decade: "2020s", plays: "9.2M" },
  { id: 2,  title: "Paper Saints",        artist: "Velour Hours",     art: "assets/art/02.jpg", duration: 196, bpm: 102, genre: "Indie",   decade: "2020s", plays: "4.1M" },
  { id: 3,  title: "Glass Highway",       artist: "Marlowe Quinn",    art: "assets/art/03.jpg", duration: 245, bpm: 96,  genre: "R&B",     decade: "2020s", plays: "2.8M" },
  { id: 4,  title: "Cathedral Mouth",     artist: "The Other Sister", art: "assets/art/04.jpg", duration: 187, bpm: 140, genre: "Rock",    decade: "2020s", plays: "6.5M" },
  { id: 5,  title: "Honey Dial Tone",     artist: "Saturn Field",     art: "assets/art/05.jpg", duration: 232, bpm: 88,  genre: "Pop",     decade: "2010s", plays: "11.4M" },
  { id: 6,  title: "Burn Stairwell",      artist: "Ivory Drift",      art: "assets/art/06.jpg", duration: 174, bpm: 132, genre: "Rock",    decade: "2020s", plays: "1.9M" },
  { id: 7,  title: "Salt Pillars",        artist: "Coast & Carrion",  art: "assets/art/07.jpg", duration: 211, bpm: 118, genre: "Country", decade: "2020s", plays: "3.3M" },
  { id: 8,  title: "Postcards From Aphasia", artist: "Lake Method",   art: "assets/art/08.jpg", duration: 263, bpm: 78,  genre: "Indie",   decade: "2010s", plays: "780K" },
  { id: 9,  title: "Microcassette",       artist: "JEAN-PHILIPPE",    art: "assets/art/09.jpg", duration: 156, bpm: 128, genre: "Pop",     decade: "2020s", plays: "5.0M" },
  { id: 10, title: "Iron Sundae",         artist: "Quarry Boys",      art: "assets/art/10.jpg", duration: 198, bpm: 115, genre: "Hip-Hop", decade: "2020s", plays: "8.7M" },
  { id: 11, title: "Mid-Atlantic Suite",  artist: "Helen Truthe",     art: "assets/art/11.jpg", duration: 289, bpm: 70,  genre: "Indie",   decade: "2010s", plays: "920K" },
  { id: 12, title: "Spider in the Glove", artist: "Collection 9",     art: "assets/art/12.jpg", duration: 167, bpm: 144, genre: "Rock",    decade: "2020s", plays: "2.2M" },
  { id: 13, title: "Cherry Forecast",     artist: "Marigold Tape",    art: "assets/art/13.jpg", duration: 205, bpm: 108, genre: "Pop",     decade: "2020s", plays: "4.8M" },
  { id: 14, title: "Yellowknife",         artist: "Ash Ferry",        art: "assets/art/14.jpg", duration: 241, bpm: 92,  genre: "R&B",     decade: "2010s", plays: "1.4M" },
  { id: 15, title: "Lighthouse Math",     artist: "Tidewater Joe",    art: "assets/art/15.jpg", duration: 219, bpm: 100, genre: "Country", decade: "2020s", plays: "2.6M" },
  { id: 16, title: "Bouquet for a Bandit",artist: "Plum & Pine",      art: "assets/art/16.jpg", duration: 192, bpm: 122, genre: "Indie",   decade: "2020s", plays: "1.1M" },
  { id: 17, title: "Triple Dare",         artist: "FRACTUR",          art: "assets/art/17.jpg", duration: 168, bpm: 150, genre: "Hip-Hop", decade: "2020s", plays: "7.0M" },
  { id: 18, title: "Glove Compartment",   artist: "Margot Verde",     art: "assets/art/18.jpg", duration: 226, bpm: 86,  genre: "Pop",     decade: "2020s", plays: "3.9M" },
];

window.LEADERBOARD = [
  { rank: 1, name: "Rael",     avatar: "assets/avatars/01.png", score: 1284500, you: false },
  { rank: 2, name: "You",      avatar: "assets/avatars/03.png", score: 1162300, you: true  },
  { rank: 3, name: "Jooleeno", avatar: "assets/avatars/02.jpg", score: 1098220, you: false },
  { rank: 4, name: "Abbie",    avatar: "assets/avatars/04.png", score:  991450, you: false },
  { rank: 5, name: "Arthen",   avatar: "assets/avatars/05.jpg", score:  877100, you: false },
];

window.INSTRUMENTS = [
  { id: "guitar", name: "Guitar", icon: "assets/instruments/guitar.png" },
  { id: "drums",  name: "Drums",  icon: "assets/instruments/drums.png" },
  { id: "vocals", name: "Vocals", icon: "assets/instruments/vocals.png" },
  { id: "bass",   name: "Bass",   icon: "assets/instruments/bass.png" },
  { id: "keys",   name: "Keys",   icon: "assets/instruments/keys.png", soon: true },
];

window.DIFFICULTIES = ["Easy", "Normal", "Hard", "Expert"];

window.GENRES = ["All", "Pop", "Rock", "Indie", "R&B", "Hip-Hop", "Country"];
window.DECADES = ["All", "2020s", "2010s"];
window.SORTS = ["Trending", "Newest", "BPM \u2191", "BPM \u2193", "A–Z"];

window.fmtDuration = function(s) {
  var m = Math.floor(s / 60);
  var ss = s % 60;
  return m + ":" + (ss < 10 ? "0" : "") + ss;
};
window.fmtScore = function(n) {
  return n.toLocaleString("en-US");
};
