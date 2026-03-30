// ── Vuplex Bridge ──────────────────────────────────────
function sendToUnity(type, data) {
  var msg = JSON.stringify({ type: type, data: data });
  if (window.vuplex) {
    window.vuplex.postMessage(msg);
  } else {
    console.log('[Jamsesh→Unity]', msg);
  }
}

function initVuplexListener() {
  function attach() {
    window.vuplex.addEventListener('message', function(event) {
      try { handleUnityMessage(JSON.parse(event.data)); }
      catch(e) { console.warn('Failed to parse Unity message:', e); }
    });
  }
  if (window.vuplex) attach();
  else window.addEventListener('vuplexready', attach);
}

function handleUnityMessage(msg) {
  switch(msg.type) {
    case 'updateProfile': updateProfile(msg.data); break;
    case 'navigate': navigateTo(msg.data); break;
    case 'updateSongs': updateSongsFromBackend(msg.data); break;
    case 'updateLeaderboard': updateLeaderboardFromBackend(msg.data); break;
    case 'updateFriends': updateFriendsFromBackend(msg.data); break;
    case 'updateGroups': updateGroupsFromBackend(msg.data); break;
    case 'updateLobby': updateLobbyFromBackend(msg.data); break;
    case 'updateHubs': updateHubsFromBackend(msg.data); break;
    case 'updateCoins': updateCoinsFromBackend(msg.data); break;
    case 'gameResults': showGameResults(msg.data); break;
    case 'onboardProgress':
      // Unity sends PlayFab flags: {completedSteps: ['legal','perms_explainer'], legal_version: '1'}
      if (msg.data && msg.data.completedSteps) {
        for (var os = 0; os < msg.data.completedSteps.length; os++) {
          onboardFlags[msg.data.completedSteps[os]] = true;
        }
        if (msg.data.legal_version) onboardFlags.legal_version = msg.data.legal_version;
        _saveOnboardFlags();
        console.log('[Mode] Synced from PlayFab:', JSON.stringify(onboardFlags));
      }
      break;
    default: console.log('[Unity\u2192Jamsesh] Unhandled:', msg);
  }
}

// ── PlayFab Data Receivers ─────────────────────────────
// Unity sends these after fetching from PlayFab backend

function showPlayLoading(show) {
  var grid = document.getElementById('play-grid');
  if (!grid) return;
  if (show) {
    grid.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;width:100%;color:#666;font-size:28px">Loading songs\u2026</div>';
  }
}

function updateSongCover(index, fileUrl) {
  if (!allSongs[index]) return;
  allSongs[index].file = fileUrl;

  // Update the grid tile image directly (avoids full grid rebuild)
  var pages = document.querySelectorAll('.grid-page');
  var pageIdx = Math.floor(index / SONGS_PER_PAGE);
  var tileIdx = index % SONGS_PER_PAGE;
  if (pages[pageIdx]) {
    var imgs = pages[pageIdx].querySelectorAll('.song-tile > img');
    if (imgs[tileIdx]) imgs[tileIdx].src = fileUrl;
  }

  // Update setlist entries that reference this song and refresh the solo panel
  var needsRefresh = false;
  for (var i = 0; i < setlist.length; i++) {
    if (setlist[i] && setlist[i].title === allSongs[index].title) {
      setlist[i].file = fileUrl;
      needsRefresh = true;
    }
  }
  if (needsRefresh) {
    buildPlayGrid();
    buildRightPanel();
  }
}

// Called by Unity once the song list is available (covers load asynchronously after)
function songsReady() {
  buildPlayGrid();
  buildGrid(allSongs);
  buildRightPanel();
}

function updateSongsFromBackend(data) {
  // data: [{rank,title,artist,file,duration,bpm,genre,decade}, ...]
  if (data && data.length) {
    allSongs = data;
    showPlayLoading(false);
    buildGrid(allSongs);
    buildPlayPanel(allSongs);
  }
}

function updateLeaderboardFromBackend(data) {
  // data: {song,instrument,difficulty,type,entries:[{pos,name,score,avatar},...]}
  var list = document.getElementById('play-lb-list');
  if (!list || !data || !data.entries) return;
  list.innerHTML = '';
  for (var i = 0; i < data.entries.length; i++) {
    var lb = data.entries[i];
    var row = document.createElement('div');
    row.className = 'play-lb-row';
    row.innerHTML =
      '<span class="play-lb-pos">' + lb.pos + '</span>' +
      '<div class="play-lb-tile">' +
        '<img class="play-lb-avatar" src="' + lb.avatar + '" alt="">' +
        '<div class="play-lb-info">' +
          '<div class="play-lb-name">' + lb.name + '</div>' +
          '<div class="play-lb-score">' + lb.score.toLocaleString() + '</div>' +
        '</div>' +
      '</div>';
    list.appendChild(row);
  }
}

function updateFriendsFromBackend(data) {
  // data: [{name,online,avatar}, ...]
  if (!data) return;
  // Store and rebuild
  window._backendFriends = data;
  buildSocialPage();
}

function updateGroupsFromBackend(data) {
  // data: [{id,name,members,file}, ...]
  if (!data) return;
  window._backendGroups = data;
  buildSocialPage();
}

function updateGroupLogo(index, fileUrl) {
  if (!window._backendGroups || !window._backendGroups[index]) return;
  window._backendGroups[index].file = fileUrl;

  // Update the tile image directly (offset by 1 for the "Create New" tile)
  var groupGrid = document.getElementById('social-grid-groups');
  if (!groupGrid) return;
  var tiles = groupGrid.querySelectorAll('.space-tile');
  if (tiles[index]) {
    var img = tiles[index].querySelector('img');
    if (img) img.src = fileUrl;
  }
}

function updateGroupMembers(index, count) {
  if (!window._backendGroups || !window._backendGroups[index]) return;
  window._backendGroups[index].members = count;

  var groupGrid = document.getElementById('social-grid-groups');
  if (!groupGrid) return;
  var tiles = groupGrid.querySelectorAll('.space-tile');
  if (tiles[index]) {
    var memberEl = tiles[index].querySelector('.tile-info div:last-child');
    if (memberEl) memberEl.textContent = count + ' Members';
  }
}

function updateLobbyFromBackend(data) {
  // data: [{name,avatar,instrument,difficulty,ready}, ...]
  if (!data) return;
  for (var i = 0; i < data.length && i < lobbyPlayers.length; i++) {
    lobbyPlayers[i].name = data[i].name || lobbyPlayers[i].name;
    lobbyPlayers[i].avatar = data[i].avatar || lobbyPlayers[i].avatar;
    lobbyPlayers[i].instrument = data[i].instrument || lobbyPlayers[i].instrument;
    lobbyPlayers[i].difficulty = data[i].difficulty || lobbyPlayers[i].difficulty;
    lobbyPlayers[i].ready = data[i].ready !== undefined ? data[i].ready : lobbyPlayers[i].ready;
  }
  buildPlayGrid();
}

function updateHubsFromBackend(data) {
  // data: [{name,count,img}, ...]
  if (!data) return;
  window._backendHubs = data;
  buildSpacesGrid();
}

function updateCoinsFromBackend(data) {
  // data: {coins: number}
  if (data && data.coins !== undefined) {
    userCoins = data.coins;
    var profile = getActiveProfile();
    if (profile) profile.coins = data.coins;
  }
}

function showGameResults(data) {
  // data: {score,stars,accuracy,combo,perfect,notes,song:{title,artist,file}}
  if (!data) return;
  if (data.song) {
    var artEl = document.getElementById('results-album-art');
    var titleEl = document.getElementById('results-song-title');
    var artistEl = document.getElementById('results-song-artist');
    if (artEl && data.song.file) artEl.src = data.song.file;
    if (titleEl) titleEl.textContent = data.song.title || 'Unknown';
    if (artistEl) artistEl.textContent = data.song.artist || 'Unknown';
  }
  switchResultsTab('me');
  var black = document.getElementById('onboard-black');
  black.className = 'visible';
  setTimeout(function() {
    document.getElementById('screen-results1').classList.add('active');
    setTimeout(function() { black.className = ''; }, 50);
  }, 200);
}

function updateProfile(data) {
  if (data.name) document.querySelector('.profile-name').textContent = data.name;
  if (data.level != null) document.querySelector('.level-badge').textContent = data.level;
  if (data.xp != null && data.xpMax != null) {
    var pct = Math.min(100, Math.round((data.xp / data.xpMax) * 100));
    document.querySelector('.xp-bar-fill').style.width = pct + '%';
  }
  if (data.notes != null) document.querySelectorAll('.currency')[0].querySelector('span').textContent = data.notes.toLocaleString();
  if (data.coins != null) document.querySelectorAll('.currency')[1].querySelector('span').textContent = data.coins.toLocaleString();
}

// ── Navigation ─────────────────────────────────────────
// ── Multi-page navigation ──
function _getCurrentPage() {
  var path = window.location.pathname;
  var file = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
  if (!file || file === 'index') file = 'home';
  return file;
}

function _saveState() {
  try {
    localStorage.setItem('jamsesh_theme', currentTheme);
    localStorage.setItem('jamsesh_banner', currentBanner || '');
    localStorage.setItem('jamsesh_frame', currentFrame);
    localStorage.setItem('jamsesh_unlocked_themes', JSON.stringify(unlockedThemes));
    localStorage.setItem('jamsesh_unlocked_banners', JSON.stringify(unlockedBanners));
    localStorage.setItem('jamsesh_unlocked_frames', JSON.stringify(unlockedFrames));
    localStorage.setItem('jamsesh_coins', String(userCoins));
    localStorage.setItem('jamsesh_layout', String(currentLayout));
    localStorage.setItem('jamsesh_playmode', playMode);
    localStorage.setItem('jamsesh_instrument', selectedInstrument);
    localStorage.setItem('jamsesh_difficulty', selectedDifficulty);
    localStorage.setItem('jamsesh_profile', activeProfileId);
  } catch(e) {}
}

function _loadState() {
  try {
    var t = localStorage.getItem('jamsesh_theme');
    if (t) currentTheme = t;
    var b = localStorage.getItem('jamsesh_banner');
    if (b) currentBanner = b;
    var f = localStorage.getItem('jamsesh_frame');
    if (f) currentFrame = f;
    var ut = localStorage.getItem('jamsesh_unlocked_themes');
    if (ut) unlockedThemes = JSON.parse(ut);
    var ub = localStorage.getItem('jamsesh_unlocked_banners');
    if (ub) unlockedBanners = JSON.parse(ub);
    var uf = localStorage.getItem('jamsesh_unlocked_frames');
    if (uf) unlockedFrames = JSON.parse(uf);
    var c = localStorage.getItem('jamsesh_coins');
    if (c) userCoins = parseInt(c, 10);
    var l = localStorage.getItem('jamsesh_layout');
    if (l) currentLayout = parseInt(l, 10);
    var pm = localStorage.getItem('jamsesh_playmode');
    if (pm) playMode = pm;
    var si = localStorage.getItem('jamsesh_instrument');
    if (si) selectedInstrument = si;
    var sd = localStorage.getItem('jamsesh_difficulty');
    if (sd) selectedDifficulty = sd;
    var pr = localStorage.getItem('jamsesh_profile');
    if (pr) activeProfileId = pr;
  } catch(e) {}
}

function highlightCurrentNav() {
  var current = _getCurrentPage();
  var navItems = document.querySelectorAll('.nav-item');
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].classList.remove('active');
    if (navItems[i].getAttribute('data-page') === current) navItems[i].classList.add('active');
  }
}

function navigateTo(pageName, params) {
  _saveState();
  sendToUnity('navigate', pageName);
  var url = pageName + '.html';
  if (params) {
    var qs = [];
    for (var k in params) {
      if (params.hasOwnProperty(k)) qs.push(k + '=' + encodeURIComponent(params[k]));
    }
    if (qs.length) url += '?' + qs.join('&');
  }
  window.location.href = url;
}

function getUrlParam(name) {
  var params = window.location.search.substring(1).split('&');
  for (var i = 0; i < params.length; i++) {
    var kv = params[i].split('=');
    if (kv[0] === name) return decodeURIComponent(kv[1] || '');
  }
  return null;
}

// ── Song Grid ──────────────────────────────────────────
var currentPage = 0;
var totalPages = 0;
var SONGS_PER_PAGE = 20;
var pageHeight = 0;

function buildNavButtons(container, id) {
  container.innerHTML = '';

  // Top of list
  var top = document.createElement('button');
  top.className = 'grid-nav-btn';
  top.innerHTML = '<span>&#9650;</span><span>&#9650;</span>';
  top.onclick = function() { goToPage(0); };
  top.id = id + '-top';
  container.appendChild(top);

  // Up one page
  var prev = document.createElement('button');
  prev.className = 'grid-nav-btn';
  prev.innerHTML = '&#9650;';
  prev.onclick = function() { gridPage(-1); };
  prev.id = id + '-prev';
  container.appendChild(prev);

  // Down one page
  var next = document.createElement('button');
  next.className = 'grid-nav-btn';
  next.innerHTML = '&#9660;';
  next.onclick = function() { gridPage(1); };
  next.id = id + '-next';
  container.appendChild(next);

  // Bottom of list
  var bottom = document.createElement('button');
  bottom.className = 'grid-nav-btn';
  bottom.innerHTML = '<span>&#9660;</span><span>&#9660;</span>';
  bottom.onclick = function() { goToPage(totalPages - 1); };
  bottom.id = id + '-bottom';
  container.appendChild(bottom);
}

function buildGrid(songs) {
  var track = document.getElementById('grid-track');
  track.innerHTML = '';
  totalPages = Math.ceil(songs.length / SONGS_PER_PAGE);

  for (var p = 0; p < totalPages; p++) {
    var page = document.createElement('div');
    page.className = 'grid-page';
    var start = p * SONGS_PER_PAGE;
    var end = Math.min(start + SONGS_PER_PAGE, songs.length);

    for (var i = start; i < end; i++) {
      var song = songs[i];
      var tile = document.createElement('div');
      tile.className = 'song-tile';
      tile.onclick = (function(s) {
        return function() { selectPickerSong(s, this); };
      })(song);
      var dm = Math.floor(song.duration / 60);
      var ds = song.duration % 60;
      var durTxt = dm + ':' + (ds < 10 ? '0' : '') + ds;
      tile.innerHTML =
        '<img src="' + song.file + '" alt="" loading="lazy">' +
        '<span class="tile-rank">#' + song.rank + '</span>' +
        '<div class="tile-info">' +
          '<div class="tile-title">' + song.title + '</div>' +
          '<div class="tile-artist">' + song.artist + '</div>' +
          '<div class="tile-meta"><span>' + durTxt + '</span><span>' + song.bpm + ' BPM</span></div>' +
        '</div>' +
        '<div class="song-tile-actions">' +
          '<button class="song-tile-btn song-tile-preview">&#9654;</button>' +
          '<button class="song-tile-btn song-tile-add">+</button>' +
        '</div>';
      (function(s, t) {
        t.querySelector('.song-tile-preview').onclick = function(e) {
          e.stopPropagation();
          sendToUnity('previewSong', s.title);
        };
        t.querySelector('.song-tile-add').onclick = function(e) {
          e.stopPropagation();
          addSongToSetlist(s);
        };
      })(song, tile);
      page.appendChild(tile);
    }
    track.appendChild(page);
  }

  // Page height will be measured when picker is first opened
  buildNavButtons(document.getElementById('grid-nav-right'), 'right');
  updateNavState();
}

function goToPage(idx) {
  if (idx < 0 || idx >= totalPages) return;
  currentPage = idx;
  document.getElementById('grid-track').style.transform = 'translateY(-' + (currentPage * pageHeight) + 'px)';
  updateNavState();
}

function gridPage(dir) { goToPage(currentPage + dir); }

function updateNavState() {
  var navs = document.querySelectorAll('.grid-nav');
  for (var n = 0; n < navs.length; n++) {
    var atTop = (currentPage === 0);
    var atBottom = (currentPage === totalPages - 1);
    var top = navs[n].querySelector('[id$="-top"]');
    var prev = navs[n].querySelector('[id$="-prev"]');
    var next = navs[n].querySelector('[id$="-next"]');
    var bottom = navs[n].querySelector('[id$="-bottom"]');
    if (top) top.disabled = atTop;
    if (prev) prev.disabled = atTop;
    if (next) next.disabled = atBottom;
    if (bottom) bottom.disabled = atBottom;
  }
}

// ── Spaces Grid ─────────────────────────────────────────
var spaces = [
  {name:'Neon Stadium',     desc:'80,000 capacity arena',   file:'spaces/001.jpg'},
  {name:'Desert Festival',  desc:'Open air desert stage',   file:'spaces/002.jpg'},
  {name:'Underground Club', desc:'Intimate basement venue',  file:'spaces/003.jpg'},
  {name:'Rooftop Lounge',   desc:'City skyline views',      file:'spaces/004.jpg'},
  {name:'Jazz Basement',    desc:'Smoky speakeasy vibe',    file:'spaces/005.jpg'},
  {name:'Beach Stage',      desc:'Sunset oceanfront',       file:'spaces/006.jpg'},
  {name:'Arena Bowl',       desc:'Championship venue',      file:'spaces/007.jpg'},
  {name:'Forest Rave',      desc:'Deep woods party',        file:'spaces/008.jpg'},
  {name:'Vinyl Cafe',       desc:'Cozy record bar',         file:'spaces/009.jpg'},
  {name:'Warehouse Party',  desc:'Raw industrial space',    file:'spaces/010.jpg'},
  {name:'Opera House',      desc:'Grand classical hall',    file:'spaces/011.jpg'},
  {name:'Street Corner',    desc:'Open mic busking spot',   file:'spaces/012.jpg'},
  {name:'Skyline Terrace',  desc:'Penthouse party deck',    file:'spaces/013.jpg'},
  {name:'Retro Arcade',     desc:'80s synthwave den',       file:'spaces/014.jpg'},
  {name:'Ice Palace',       desc:'Frozen crystal stage',    file:'spaces/015.jpg'},
  {name:'Tropical Resort',  desc:'Poolside paradise',       file:'spaces/016.jpg'},
  {name:'Gothic Cathedral', desc:'Reverb-soaked stone',     file:'spaces/017.jpg'},
  {name:'Cyberpunk Alley',  desc:'Neon-lit back street',    file:'spaces/018.jpg'},
  {name:'Mountain Amp',     desc:'Alpine amphitheater',     file:'spaces/019.jpg'},
  {name:'Submarine Lounge', desc:'Deep sea listening room', file:'spaces/020.jpg'},
  {name:'Space Station',    desc:'Zero gravity club',       file:'spaces/021.jpg'},
  {name:'Pirate Ship',      desc:'High seas shanty deck',   file:'spaces/022.jpg'},
  {name:'Enchanted Garden', desc:'Fairy-lit grove',         file:'spaces/023.jpg'},
  {name:'Volcano Stage',    desc:'Molten rock arena',       file:'spaces/024.jpg'},
  {name:'Crystal Cavern',   desc:'Glowing gem grotto',      file:'spaces/025.jpg'}
];

function switchSocialTab(tab) {
  var tabs = document.getElementById('social-tabs').children;
  var names = ['groups', 'friends'];
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].className = 'play-mode-tab' + (names[i] === tab ? ' active' : '');
    document.getElementById('social-tab-' + names[i]).style.display = names[i] === tab ? 'flex' : 'none';
  }
}

function switchSpacesTab(tab) {
  var tabs = document.getElementById('spaces-tabs').children;
  var names = ['public', 'private'];
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].className = 'play-mode-tab' + (names[i] === tab ? ' active' : '');
    document.getElementById('spaces-tab-' + names[i]).style.display = names[i] === tab ? 'flex' : 'none';
  }
}

function buildSocialPage() {
  // ── Groups ──
  var groupGrid = document.getElementById('social-grid-groups');
  groupGrid.innerHTML = '';

  // Create New tile
  var createTile = document.createElement('div');
  createTile.className = 'space-tile-create';
  createTile.onclick = function() { openCreateGroup(); };
  createTile.innerHTML = '<div class="space-tile-create-plus">+</div><div class="space-tile-create-label">Create New</div>';
  groupGrid.appendChild(createTile);

  var groups = window._backendGroups || [
    { name: 'Jamsesh Hunters', members: '8/10', file: 'bandlogos/Gemini_Generated_Image_4aa5a04aa5a04aa5.jpg' },
    { name: 'Neon Phantoms', members: '10/10', file: 'bandlogos/Gemini_Generated_Image_7nxmb87nxmb87nxm.jpg' },
    { name: 'Electric Dreams', members: '6/10', file: 'bandlogos/Gemini_Generated_Image_8etd7p8etd7p8etd.jpg' },
    { name: 'Rhythm Rebels', members: '9/10', file: 'bandlogos/Gemini_Generated_Image_ds7ykeds7ykeds7y.jpg' },
    { name: 'Sonic Wolves', members: '7/10', file: 'bandlogos/Gemini_Generated_Image_dyvmgcdyvmgcdyvm.jpg' },
    { name: 'Bass Bandits', members: '5/10', file: 'bandlogos/Gemini_Generated_Image_g3jblgg3jblgg3jb.jpg' },
    { name: 'Velvet Crush', members: '10/10', file: 'bandlogos/Gemini_Generated_Image_wzsyntwzsyntwzsy.jpg' }
  ];
  for (var i = 0; i < groups.length; i++) {
    var g = groups[i];
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.onclick = (function(grp) {
      return function() {
        console.log('[Social] Band tile clicked: ' + grp.name + ' id=' + grp.id);
        if (grp.id) {
          sendToUnity('enterBandspace', { id: grp.id, name: grp.name });
        } else {
          sendToUnity('viewGroup', grp.name);
        }
      };
    })(g);
    tile.innerHTML =
      '<img src="' + g.file + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none" alt="">' +
      '<div class="tile-info" style="pointer-events:none;position:absolute;bottom:0;left:0;right:0;padding:48px 16px 16px;background:linear-gradient(0deg,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.9) 40%,rgba(0,0,0,0.6) 70%,transparent 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end">' +
        '<div style="font-size:28px;font-weight:800;color:#ffffff;text-align:center">' + g.name + '</div>' +
        '<div style="font-size:20px;color:#bbbbbb">' + g.members + ' Members</div>' +
      '</div>';
    groupGrid.appendChild(tile);
  }

  // ── Friends ──
  var friendsWrap = document.getElementById('social-friends-list');
  friendsWrap.innerHTML = '';
  friendsWrap.className = 'friends-list-wrap';
  // PLAYFAB HOOKUP: Replace with data from Unity via sendToUnity('getFriends') / updateFriends message
  var friends = [
    { name: 'Jooleeno', online: true, avatar: 'jooleeno.jpg' },
    { name: 'Ted', online: true, avatar: 'ted.png' },
    { name: 'Abbie', online: true, avatar: 'abbie.png' },
    { name: 'Arthen', online: false, avatar: 'arthen.jpg' },
    { name: 'xShadowPick', online: true, avatar: 'avatars/placeholder-9.png' },
    { name: 'MelodyQueen', online: false, avatar: 'avatars/placeholder-25.png' },
    { name: 'BeatDropper99', online: false, avatar: 'avatars/placeholder-44.png' },
    { name: 'FretNinja', online: true, avatar: 'avatars/placeholder-52.png' },
    { name: 'GrooveMonkey', online: false, avatar: 'avatars/placeholder-38.png' },
    { name: 'RiffLord420', online: true, avatar: 'avatars/placeholder-18.png' },
    { name: 'PickSlinger', online: false, avatar: 'avatars/placeholder-67.png' },
    { name: 'StarShredder', online: false, avatar: 'avatars/placeholder-11.png' }
  ];
  for (var i = 0; i < friends.length; i++) {
    var f = friends[i];
    var item = document.createElement('div');
    item.className = 'friend-item' + (f.online ? ' online' : '');
    item.style.setProperty('--friend-delay', (i * 0.06) + 's');
    item.innerHTML =
      '<div class="friend-avatar"><img src="' + f.avatar + '" alt=""></div>' +
      '<div class="friend-info">' +
        '<div class="friend-name">' + f.name + '</div>' +
        '<div class="friend-status' + (f.online ? ' online' : '') + '">' +
          '<span class="friend-dot' + (f.online ? ' online' : '') + '"></span>' +
          (f.online ? 'Online' : 'Offline') +
        '</div>' +
      '</div>';
    friendsWrap.appendChild(item);
  }
  var addBtn = document.createElement('button');
  addBtn.className = 'friend-add-btn';
  addBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>Add Friend';
  friendsWrap.appendChild(addBtn);
}

function buildSpacesGrid() {
  // ── Public (Hubs) ──
  var pubGrid = document.getElementById('spaces-grid-public');
  pubGrid.innerHTML = '';

  // Create New tile
  var createPub = document.createElement('div');
  createPub.className = 'space-tile-create';
  createPub.onclick = function() { openCreateSpace('public'); };
  createPub.innerHTML = '<div class="space-tile-create-plus">+</div><div class="space-tile-create-label">Create New</div>';
  pubGrid.appendChild(createPub);

  // PLAYFAB HOOKUP: Replace with data from Unity via sendToUnity('getHubs') / updateHubs message
  var hubs = [
    { name: '18+ Only', count: '18/25', img: 'social.png' },
    { name: 'Swifties', count: '22/25', img: 'stage.png' },
    { name: 'K-Pop Zone', count: '25/25', img: 'lobby.png' },
    { name: 'Jamsesh Hub', count: '8/25', img: 'social.png' },
    { name: 'Rock Legends', count: '15/25', img: 'stage.png' },
    { name: 'Indie Corner', count: '6/25', img: 'lobby.png' },
    { name: 'Hip-Hop Lounge', count: '19/25', img: 'social.png' },
    { name: 'Metal Pit', count: '12/25', img: 'stage.png' }
  ];
  for (var i = 0; i < hubs.length; i++) {
    var h = hubs[i];
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + h.img + ') center center / cover no-repeat';
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(hub) {
      return function() { sendToUnity('joinHub', hub.name); };
    })(h);
    tile.innerHTML =
      '<div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(0deg,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.9) 40%,rgba(0,0,0,0.6) 70%,transparent 100%);">' +
        '<div style="font-size:32px;font-weight:800;color:#ffffff;">' + h.name + '</div>' +
        '<div style="font-size:20px;color:rgba(255,255,255,0.7);">' + h.count + ' Jammers</div>' +
      '</div>';
    pubGrid.appendChild(tile);
  }

  // ── Private ──
  var privGrid = document.getElementById('spaces-grid-private');
  privGrid.innerHTML = '';

  // Create New tile
  var createPriv = document.createElement('div');
  createPriv.className = 'space-tile-create';
  createPriv.onclick = function() { openCreateSpace('private'); };
  createPriv.innerHTML = '<div class="space-tile-create-plus">+</div><div class="space-tile-create-label">Create New</div>';
  privGrid.appendChild(createPriv);

  var spaceItems = [
    { name: 'Stage', desc: 'Perform live on stage', img: 'stage.png' },
    { name: 'Social Hub', desc: 'Hang out with friends', img: 'social.png' },
    { name: 'Pre-Song Lobby', desc: 'Warm up before you play', img: 'lobby.png' }
  ];
  for (var i = 0; i < spaceItems.length; i++) {
    var s = spaceItems[i];
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + s.img + ') center center / cover no-repeat';
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(space) {
      return function() { sendToUnity('selectSpace', space.name); };
    })(s);
    tile.innerHTML =
      '<div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(0deg,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.9) 40%,rgba(0,0,0,0.6) 70%,transparent 100%);">' +
        '<div style="font-size:40px;font-weight:800;color:#ffffff;">' + s.name + '</div>' +
        '<div style="font-size:24px;color:rgba(255,255,255,0.7);">' + s.desc + '</div>' +
      '</div>';
    privGrid.appendChild(tile);
  }
}

// ── Create Group ────────────────────────────────────────
var createGroupMembers = [];
var createGroupLogo = '';

var groupLogoOptions = [
  'bandlogos/Gemini_Generated_Image_4aa5a04aa5a04aa5.jpg',
  'bandlogos/Gemini_Generated_Image_7nxmb87nxmb87nxm.jpg',
  'bandlogos/Gemini_Generated_Image_8etd7p8etd7p8etd.jpg',
  'bandlogos/Gemini_Generated_Image_ds7ykeds7ykeds7y.jpg',
  'bandlogos/Gemini_Generated_Image_dyvmgcdyvmgcdyvm.jpg',
  'bandlogos/Gemini_Generated_Image_g3jblgg3jblgg3jb.jpg',
  'bandlogos/Gemini_Generated_Image_wzsyntwzsyntwzsy.jpg'
];

var availableFriends = [
  { name: 'Jooleeno', avatar: 'jooleeno.jpg' },
  { name: 'Ted', avatar: 'ted.png' },
  { name: 'Abbie', avatar: 'abbie.png' },
  { name: 'Arthen', avatar: 'arthen.jpg' },
  { name: 'xShadowPick', avatar: 'avatars/placeholder-9.png' },
  { name: 'MelodyQueen', avatar: 'avatars/placeholder-25.png' },
  { name: 'BeatDropper99', avatar: 'avatars/placeholder-44.png' },
  { name: 'FretNinja', avatar: 'avatars/placeholder-52.png' },
  { name: 'GrooveMonkey', avatar: 'avatars/placeholder-38.png' },
  { name: 'RiffLord420', avatar: 'avatars/placeholder-18.png' }
];

function openCreateGroup() {
  createGroupMembers = [];
  createGroupLogo = '';
  document.getElementById('create-group-name').value = '';
  var logoEl = document.getElementById('create-group-logo');
  logoEl.innerHTML = '<span class="logo-plus">+</span>';
  renderCreateGroupLists();
  document.getElementById('create-group-overlay').className = 'create-group-overlay active';
}

function closeCreateGroup(e) {
  if (e && e.target !== document.getElementById('create-group-overlay')) return;
  document.getElementById('create-group-overlay').className = 'create-group-overlay';
}

function renderCreateGroupLists() {
  var avail = document.getElementById('create-group-available');
  var members = document.getElementById('create-group-members');
  avail.innerHTML = '';
  members.innerHTML = '';

  var addedNames = {};
  for (var m = 0; m < createGroupMembers.length; m++) {
    addedNames[createGroupMembers[m].name] = true;
  }

  for (var i = 0; i < availableFriends.length; i++) {
    var f = availableFriends[i];
    if (addedNames[f.name]) continue;
    var row = document.createElement('div');
    row.className = 'create-group-friend';
    row.innerHTML =
      '<div class="create-group-friend-avatar"><img src="' + f.avatar + '" alt=""></div>' +
      '<div class="create-group-friend-name">' + f.name + '</div>';
    var btn = document.createElement('button');
    btn.className = 'create-group-friend-btn create-group-friend-btn-add';
    btn.textContent = 'Add';
    btn.onclick = (function(friend) {
      return function() { addFriendToGroup(friend); };
    })(f);
    row.appendChild(btn);
    avail.appendChild(row);
  }
  if (!avail.children.length) {
    avail.innerHTML = '<div class="create-group-empty">No more friends to add</div>';
  }

  for (var j = 0; j < createGroupMembers.length; j++) {
    var mf = createGroupMembers[j];
    var mrow = document.createElement('div');
    mrow.className = 'create-group-friend';
    mrow.innerHTML =
      '<div class="create-group-friend-avatar"><img src="' + mf.avatar + '" alt=""></div>' +
      '<div class="create-group-friend-name">' + mf.name + '</div>';
    var rbtn = document.createElement('button');
    rbtn.className = 'create-group-friend-btn create-group-friend-btn-remove';
    rbtn.textContent = 'Remove';
    rbtn.onclick = (function(idx) {
      return function() { removeFriendFromGroup(idx); };
    })(j);
    mrow.appendChild(rbtn);
    members.appendChild(mrow);
  }
  if (!createGroupMembers.length) {
    members.innerHTML = '<div class="create-group-empty">Add friends to your group</div>';
  }
}

function addFriendToGroup(friend) {
  createGroupMembers.push(friend);
  renderCreateGroupLists();
}

function removeFriendFromGroup(idx) {
  createGroupMembers.splice(idx, 1);
  renderCreateGroupLists();
}

function confirmCreateGroup() {
  var name = document.getElementById('create-group-name').value.trim();
  if (!name) return;
  sendToUnity('createGroup', {
    name: name,
    logo: createGroupLogo,
    members: createGroupMembers.map(function(f) { return f.name; })
  });
  closeCreateGroup();
}

// ── Logo Picker ─────────────────────────────────────────
function openLogoPicker() {
  var grid = document.getElementById('logo-picker-grid');
  grid.innerHTML = '';
  for (var i = 0; i < groupLogoOptions.length; i++) {
    var item = document.createElement('div');
    item.className = 'logo-picker-item' + (groupLogoOptions[i] === createGroupLogo ? ' selected' : '');
    item.innerHTML = '<img src="' + groupLogoOptions[i] + '" alt="">';
    item.onclick = (function(logo) {
      return function() { selectGroupLogo(logo); };
    })(groupLogoOptions[i]);
    grid.appendChild(item);
  }
  document.getElementById('logo-picker-overlay').className = 'logo-picker-overlay active';
}

function closeLogoPicker(e) {
  if (e && e.target !== document.getElementById('logo-picker-overlay')) return;
  document.getElementById('logo-picker-overlay').className = 'logo-picker-overlay';
}

function selectGroupLogo(logoFile) {
  createGroupLogo = logoFile;
  var logoEl = document.getElementById('create-group-logo');
  logoEl.innerHTML = '<img src="' + logoFile + '" alt="">';
  closeLogoPicker();
}

// ── Create Space ────────────────────────────────────────
var createSpaceType = 'public';
var createSpaceEnv = '';

var spaceEnvironments = [
  { id: 'stage',      name: 'Stage',       img: 'stage.png' },
  { id: 'social-hub', name: 'Social Hub',  img: 'social.png' },
  { id: 'lobby',      name: 'Lobby',       img: 'lobby.png' },
  { id: 'arena',      name: 'Arena',       img: 'stage.png' },
  { id: 'beach',      name: 'Beach',       img: 'social.png' },
  { id: 'forest',     name: 'Forest',      img: 'lobby.png' },
  { id: 'rooftop',    name: 'Rooftop',     img: 'stage.png' },
  { id: 'studio',     name: 'Studio',      img: 'social.png' },
  { id: 'stadium',    name: 'Stadium',     img: 'lobby.png' }
];

function openCreateSpace(type) {
  createSpaceType = type || 'public';
  createSpaceEnv = '';
  document.getElementById('create-space-name').value = '';
  updateCreateSpaceToggle();
  buildCreateSpaceEnvGrid();
  document.getElementById('create-space-overlay').className = 'create-space-overlay active';
}

function closeCreateSpace(e) {
  if (e && e.target !== document.getElementById('create-space-overlay')) return;
  document.getElementById('create-space-overlay').className = 'create-space-overlay';
}

function setCreateSpaceType(type) {
  createSpaceType = type;
  updateCreateSpaceToggle();
}

function updateCreateSpaceToggle() {
  var btns = document.getElementById('create-space-toggle').children;
  var types = ['public', 'private'];
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = 'create-space-toggle-btn' + (types[i] === createSpaceType ? ' active' : '');
  }
}

function buildCreateSpaceEnvGrid() {
  var grid = document.getElementById('create-space-env-grid');
  grid.innerHTML = '';
  for (var i = 0; i < spaceEnvironments.length; i++) {
    var env = spaceEnvironments[i];
    var card = document.createElement('div');
    card.className = 'create-space-env' + (createSpaceEnv === env.id ? ' selected' : '');
    card.innerHTML =
      '<img src="' + env.img + '" alt="">' +
      '<div class="create-space-env-label">' + env.name + '</div>';
    card.onclick = (function(envId) {
      return function() { selectSpaceEnv(envId); };
    })(env.id);
    grid.appendChild(card);
  }
}

function selectSpaceEnv(envId) {
  createSpaceEnv = envId;
  buildCreateSpaceEnvGrid();
}

function confirmCreateSpace() {
  var name = document.getElementById('create-space-name').value.trim();
  if (!name || !createSpaceEnv) return;
  sendToUnity('createSpace', {
    name: name,
    type: createSpaceType,
    environment: createSpaceEnv
  });
  closeCreateSpace();
}

// ── Play Panel ──────────────────────────────────────────
var allSongs = [];
var setlist = [];
var selectedInstrument = 'guitar';
var selectedDifficulty = 'medium';
var playMode = 'solo';
var songInstruments = {};
var songDiffs = {};
var songSpaces = {};
var savedSetlists = [];
var setlistCounter = 1;
var defaultIconStyle = 'position:absolute;bottom:0;right:0;height:80%;filter:brightness(0.3);pointer-events:none;object-fit:contain';

var spaceCategories = [
  {id:'stage', label:'Stage', options:[
    {id:'classic',   label:'Classic',   desc:'Traditional concert stage',  bg:'#1e3a5f'},
    {id:'arena',     label:'Arena',     desc:'Massive stadium platform',   bg:'#4a1942'},
    {id:'intimate',  label:'Intimate',  desc:'Small club feel',            bg:'#2d1b4e'},
    {id:'festival',  label:'Festival',  desc:'Open air main stage',        bg:'#1b4332'}
  ]},
  {id:'environment', label:'Environment', options:[
    {id:'city',      label:'City',      desc:'Urban skyline backdrop',     bg:'#1a1a3e'},
    {id:'nature',    label:'Nature',    desc:'Forests and mountains',      bg:'#14532d'},
    {id:'space',     label:'Space',     desc:'Cosmic starfield',           bg:'#0f172a'},
    {id:'fantasy',   label:'Fantasy',   desc:'Otherworldly dreamscape',    bg:'#4a1d6a'}
  ]},
  {id:'crowd', label:'Crowd', options:[
    {id:'packed',    label:'Packed',    desc:'Sold-out wall to wall',      bg:'#7c2d12'},
    {id:'moderate',  label:'Moderate',  desc:'Lively but room to move',    bg:'#713f12'},
    {id:'sparse',    label:'Sparse',    desc:'Small dedicated fans',       bg:'#1c4532'},
    {id:'none',      label:'Empty',     desc:'Just you and the music',     bg:'#1e293b'}
  ]},
  {id:'effects', label:'Stage Effects', options:[
    {id:'pyro',      label:'Pyro',      desc:'Flames and fireworks',       bg:'#9a3412'},
    {id:'lasers',    label:'Lasers',    desc:'Beams and light show',       bg:'#1e40af'},
    {id:'fog',       label:'Fog',       desc:'Haze and atmosphere',        bg:'#374151'},
    {id:'minimal',   label:'Minimal',   desc:'Clean and simple',           bg:'#1e293b'}
  ]}
];

var spaceDefaults = {stage:'classic', environment:'city', crowd:'packed', effects:'pyro'};

var instruments = [
  {id:'guitar', label:'Guitar', bg:'#1d4ed8', desc:'Lead melodies and riffs', icon:'instruments/guitar.png', iconStyle:'position:absolute;bottom:-20%;right:-25%;height:160%;filter:brightness(0.3);pointer-events:none;object-fit:contain;transform:rotate(-30deg)'},
  {id:'keys',   label:'Keys',   bg:'#7c3aed', desc:'Chords, synths and piano', icon:'instruments/keys.png'},
  {id:'drums',  label:'Drums',  bg:'#be185d', desc:'Keep the rhythm going', icon:'instruments/drums.png', iconStyle:'position:absolute;bottom:-60%;right:-15%;height:120%;filter:brightness(0.3);pointer-events:none;object-fit:contain'},
  {id:'vocals', label:'Vocals', bg:'#c026d3', desc:'Sing along to the lyrics', icon:'instruments/vocals.png', iconStyle:'position:absolute;bottom:-85%;right:-25%;height:150%;filter:brightness(0.3);pointer-events:none;object-fit:contain'},
  {id:'bass',   label:'Bass',   bg:'#15803d', desc:'Hold down the low end', icon:'instruments/bass.png', iconStyle:'position:absolute;bottom:-20%;right:-20%;height:160%;filter:brightness(0.3);pointer-events:none;object-fit:contain;transform:rotate(-30deg)'}
];

// lobbyPlayers uses np plates defined below (initialized in initLobbyPlates)
// PLAYFAB HOOKUP: Replace with data from Unity via sendToUnity('getLobby') / updateLobby message
var lobbyPlayers = [
  {name:'xShredMaster',  avatar:'art/001.jpg', plate:null, plateClass:null,            instrument:'guitar', difficulty:'expert', ready:true},
  {name:'BeatDropQueen', avatar:'art/002.jpg', plate:null, plateClass:'plate-holo',    instrument:'drums',  difficulty:'hard',   ready:true},
  {name:'NeonRiff',      avatar:'art/003.jpg', plate:null, plateClass:null,            instrument:'guitar', difficulty:'medium', ready:false},
  {name:'AxelStorm',     avatar:'art/004.jpg', plate:null, plateClass:null,            instrument:'keys',   difficulty:'expert', ready:true},
  {name:'VoxHunter',     avatar:'art/006.jpg', plate:null, plateClass:null,            instrument:'vocals', difficulty:'hard',   ready:true},
  {name:'FretBoss',      avatar:'art/007.jpg', plate:null, plateClass:'plate-radiate', instrument:'guitar', difficulty:'expert', ready:true},
  {name:'SynthWave99',   avatar:'art/008.jpg', plate:null, plateClass:null,            instrument:'keys',   difficulty:'medium', ready:false},
  {name:'PickSlinger',   avatar:'art/009.jpg', plate:null, plateClass:null,            instrument:'guitar', difficulty:'easy',   ready:true},
  {name:'CrashKid',      avatar:'art/011.jpg', plate:null, plateClass:null,            instrument:'drums',  difficulty:'hard',   ready:false}
];

var difficulties = [
  {id:'easy',   label:'Easy',   bg:'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)', desc:'Relaxed pace, fewer notes'},
  {id:'medium', label:'Medium', bg:'linear-gradient(135deg, #713f12 0%, #ca8a04 50%, #facc15 100%)', desc:'A balanced challenge'},
  {id:'hard',   label:'Hard',   bg:'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)', desc:'Fast patterns, more notes'},
  {id:'expert', label:'Expert', bg:'linear-gradient(135deg, #450a0a 0%, #dc2626 50%, #f87171 100%)', desc:'Full song, no mercy'}
];

function plateImg(file) {
  return 'linear-gradient(#1e1e1e,#1e1e1e),url(plates/' + file + ')';
}

var np = {
  galaxy:     plateImg('galaxy.jpg'),
  bamboo:     plateImg('bamboo.jpg'),
  garden:     plateImg('garden.jpg'),
  flames:     plateImg('flames.jpg'),
  drums:      plateImg('drums.jpg'),
  microphone: plateImg('microphone.jpg'),
  kpop:       plateImg('kpop.jpg'),
  sakura:
    'radial-gradient(8px 8px at 15% 30%, rgba(255,150,200,0.3), transparent),' +
    'radial-gradient(6px 6px at 45% 70%, rgba(255,160,210,0.25), transparent),' +
    'radial-gradient(10px 10px at 75% 25%, rgba(255,140,190,0.3), transparent),' +
    'radial-gradient(7px 7px at 90% 60%, rgba(255,170,220,0.2), transparent),' +
    'linear-gradient(135deg, #1a0815 0%, #2a1025 30%, #3a1535 50%, #2a1025 70%, #1a0815 100%)'
};

var swapTargetIdx = -1;

var diffLevels = ['easy','medium','hard','expert'];
var diffColors = {easy:'#059669', medium:'#ca8a04', hard:'#ea580c', expert:'#dc2626'};

// ── Mode Tabs ──────────────────────────────────────────
function buildModeTabs() {
  var container = document.getElementById('play-mode-tabs');
  container.innerHTML = '';
  var modes = ['Solo', 'Group', 'Battle'];
  var modeIds = ['solo', 'coop', 'battle'];
  for (var i = 0; i < modes.length; i++) {
    var btn = document.createElement('button');
    btn.className = 'play-mode-tab' + (modeIds[i] === playMode ? ' active' : '');
    btn.textContent = modes[i];
    btn.onclick = (function(id) { return function() { setPlayMode(id); }; })(modeIds[i]);
    container.appendChild(btn);
  }
}

function setPlayMode(mode) {
  playMode = mode;
  buildModeTabs();
  buildPlayGrid();
  sendToUnity('playMode', mode);
}

// ── Song Column ────────────────────────────────────────
function buildSongColumn() {
  var col = document.getElementById('play-song-col');
  col.innerHTML = '';
  for (var i = 0; i < setlist.length; i++) {
    if (!setlist[i]) continue;
    var slot = document.createElement('div');
    slot.className = 'play-song-slot';
    var pos = document.createElement('div');
    pos.className = 'play-song-pos';
    pos.textContent = (i + 1);
    slot.appendChild(pos);

    var tile = document.createElement('div');
    tile.className = 'play-tile';
    tile.innerHTML =
      '<img src="' + setlist[i].file + '" alt="">' +
      '<div class="tile-info">' +
        '<div class="tile-title">' + setlist[i].title + '</div>' +
        '<div class="tile-artist">' + setlist[i].artist + '</div>' +
      '</div>' +
      '<div class="setlist-actions">' +
        '<button class="setlist-btn setlist-btn-swap" data-idx="' + i + '">&#8635;</button>' +
        '<button class="setlist-btn setlist-btn-remove" data-idx="' + i + '">&#10005;</button>' +
      '</div>';
    (function(idx) {
      tile.querySelector('.setlist-btn-swap').onclick = function(e) { e.stopPropagation(); swapSetlistSong(idx); };
      tile.querySelector('.setlist-btn-remove').onclick = function(e) { e.stopPropagation(); removeFromSetlist(idx); };
    })(i);
    slot.appendChild(tile);
    col.appendChild(slot);
  }
  // Always show a + tile at the end
  var addSlot = document.createElement('div');
  addSlot.className = 'play-song-slot';
  var spacer = document.createElement('div');
  spacer.className = 'play-song-pos';
  spacer.textContent = (setlist.length + 1);
  addSlot.appendChild(spacer);
  var addTile = document.createElement('div');
  addTile.className = 'play-tile play-add-tile';
  addTile.innerHTML = '+';
  addTile.onclick = showPlayPicker;
  addSlot.appendChild(addTile);
  col.appendChild(addSlot);
  updateDuration();
}

// ── Right Panel Dispatch ───────────────────────────────
function buildRightPanel() {
  var panel = document.getElementById('play-right-panel');
  var songCol = document.getElementById('play-song-col');
  panel.innerHTML = '';
  if (playMode === 'solo') {
    songCol.style.display = 'none';
    buildSoloPanel(panel);
  } else {
    songCol.style.display = '';
    buildCoopPanel(panel);
  }
}

// ── Solo Panel (row-based, paginated) ──────────────────
var soloPage = 0;
var soloScrollDir = '';
var SOLO_PER_PAGE = 3;

function soloTotalPages() {
  var count = setlist.length + 1; // +1 for the add row
  return Math.max(1, Math.ceil(count / SOLO_PER_PAGE));
}

function buildSoloPanel(panel) {
  var wrapper = document.createElement('div');
  wrapper.className = 'play-solo-wrapper';

  var container = document.createElement('div');
  container.className = 'play-solo-rows' + (soloScrollDir ? ' slide-' + soloScrollDir : '');
  soloScrollDir = '';

  // Clamp soloPage if songs were removed
  var tp = soloTotalPages();
  if (soloPage >= tp) soloPage = tp - 1;

  var totalSlots = setlist.length + 1; // songs + 1 add row
  var start = soloPage * SOLO_PER_PAGE;
  var end = Math.min(start + SOLO_PER_PAGE, totalSlots);

  for (var i = start; i < end; i++) {
    var row = document.createElement('div');
    var isAddRow = (i >= setlist.length);
    var isEmpty = isAddRow;
    row.className = 'play-solo-row';

    // Inner row wrapper (holds num, cover, buttons horizontally)
    var inner = document.createElement('div');
    inner.className = 'play-solo-row-inner';

    // Number
    var num = document.createElement('div');
    num.className = 'play-solo-num';
    num.textContent = (i + 1);
    inner.appendChild(num);

    // Cover art / add button
    var cover = document.createElement('div');
    cover.className = 'play-solo-cover';
    if (!isAddRow && setlist[i]) {
      cover.innerHTML =
        '<img src="' + setlist[i].file + '" alt="">' +
        '<div class="setlist-actions">' +
          '<button class="setlist-btn setlist-btn-preview" data-idx="' + i + '">' + (previewIdx === i ? '<svg width="14" height="16" viewBox="0 0 14 16" style="vertical-align:middle"><rect x="0" y="0" width="5" height="16" rx="1" fill="currentColor"/><rect x="9" y="0" width="5" height="16" rx="1" fill="currentColor"/></svg>' : '&#9654;') + '</button>' +
          '<button class="setlist-btn setlist-btn-swap" data-idx="' + i + '">&#8635;</button>' +
          '<button class="setlist-btn setlist-btn-remove" data-idx="' + i + '">&#10005;</button>' +
        '</div>';
      (function(idx) {
        cover.querySelector('.setlist-btn-preview').onclick = function(e) { e.stopPropagation(); togglePreview(idx); };
        cover.querySelector('.setlist-btn-swap').onclick = function(e) { e.stopPropagation(); swapSetlistSong(idx); };
        cover.querySelector('.setlist-btn-remove').onclick = function(e) { e.stopPropagation(); removeFromSetlist(idx); };
      })(i);
    } else {
      cover.className = 'play-solo-cover play-solo-cover-add';
      cover.innerHTML = '+';
      cover.onclick = showPlayPicker;
    }
    inner.appendChild(cover);

    // Instrument button
    var selInst = songInstruments[i] || 'guitar';
    var instObj = null;
    for (var j = 0; j < instruments.length; j++) {
      if (instruments[j].id === selInst) { instObj = instruments[j]; break; }
    }
    if (!instObj) instObj = instruments[0];

    var instBtn = document.createElement('div');
    instBtn.className = 'play-solo-btn' + (isEmpty ? ' empty' : '');
    instBtn.setAttribute('data-inst', instObj.id);
    instBtn.style.background = instObj.bg;
    var iconHtml = instObj.icon ? '<img class="solo-btn-icon" src="' + instObj.icon + '" style="' + (instObj.iconStyle || defaultIconStyle) + '">' : '';
    instBtn.innerHTML = '<span class="solo-btn-label">' + instObj.label + '</span>' + iconHtml;
    instBtn.onclick = (function(songIdx) {
      return function() { openSoloPopup(songIdx, 'instrument'); };
    })(i);
    inner.appendChild(instBtn);

    // Difficulty button
    var selDiff = songDiffs[i] || 'medium';
    var diffObj = null;
    for (var d = 0; d < difficulties.length; d++) {
      if (difficulties[d].id === selDiff) { diffObj = difficulties[d]; break; }
    }
    if (!diffObj) diffObj = difficulties[0];

    var diffBtn = document.createElement('div');
    diffBtn.className = 'play-solo-btn' + (isEmpty ? ' empty' : '');
    diffBtn.setAttribute('data-diff', diffObj.id);
    diffBtn.style.background = diffObj.bg;
    diffBtn.innerHTML = '<span class="solo-btn-label">' + diffObj.label + '</span>';
    diffBtn.onclick = (function(songIdx) {
      return function() { openSoloPopup(songIdx, 'difficulty'); };
    })(i);
    inner.appendChild(diffBtn);

    // Space button
    var spaceBtn = document.createElement('div');
    spaceBtn.className = 'play-solo-btn' + (isEmpty ? ' empty' : '');
    spaceBtn.setAttribute('data-role', 'space');
    spaceBtn.style.background = '#1a1a3e';
    var spaceConf = songSpaces[i] || {};
    var stageName = getSpaceOptionLabel('stage', spaceConf.stage || spaceDefaults.stage);
    spaceBtn.innerHTML = '<span class="solo-btn-label">' + stageName + '</span>';
    spaceBtn.onclick = (function(songIdx) {
      return function() { openSpacePopup(songIdx); };
    })(i);
    inner.appendChild(spaceBtn);

    // Loadout button
    var loadBtn = document.createElement('div');
    loadBtn.className = 'play-solo-btn' + (isEmpty ? ' empty' : '');
    loadBtn.setAttribute('data-role', 'loadout');
    loadBtn.style.background = '#374151';
    loadBtn.innerHTML = '<span class="solo-btn-label">Loadout</span>';
    loadBtn.onclick = (function(songIdx) {
      return function() { openLoadoutPopup(songIdx); };
    })(i);
    inner.appendChild(loadBtn);

    row.appendChild(inner);

    // Song meta bubbles underneath the row
    var meta = document.createElement('div');
    meta.className = 'play-solo-row-meta';
    if (!isAddRow && setlist[i]) {
      var s = setlist[i];
      var durMins = Math.floor(s.duration / 60);
      var durSecs = s.duration % 60;
      var durStr = durMins + ':' + (durSecs < 10 ? '0' : '') + durSecs;
      meta.innerHTML =
        '<span class="meta-bubble meta-bubble-title">' + s.title + '</span>' +
        '<span class="meta-bubble meta-bubble-artist">' + s.artist + '</span>' +
        '<span class="meta-bubble meta-bubble-dur">' + durStr + '</span>' +
        (s.bpm ? '<span class="meta-bubble meta-bubble-bpm">' + s.bpm + ' BPM</span>' : '');
    }
    row.appendChild(meta);

    container.appendChild(row);
  }

  wrapper.appendChild(container);

  // Navigation arrows
  var nav = document.createElement('div');
  nav.className = 'play-solo-nav';
  var onlyOnePage = (tp <= 1);

  var btnTop = document.createElement('button');
  btnTop.className = 'play-solo-nav-btn';
  btnTop.innerHTML = '<span>&#9650;</span><span>&#9650;</span>';
  btnTop.disabled = onlyOnePage || (soloPage === 0);
  btnTop.onclick = function() { soloScrollDir = 'down'; soloPage = 0; buildRightPanel(); };
  nav.appendChild(btnTop);

  var btnUp = document.createElement('button');
  btnUp.className = 'play-solo-nav-btn';
  btnUp.innerHTML = '&#9650;';
  btnUp.disabled = onlyOnePage || (soloPage === 0);
  btnUp.onclick = function() { if (soloPage > 0) { soloScrollDir = 'down'; soloPage--; buildRightPanel(); } };
  nav.appendChild(btnUp);

  var btnDown = document.createElement('button');
  btnDown.className = 'play-solo-nav-btn';
  btnDown.innerHTML = '&#9660;';
  btnDown.disabled = onlyOnePage || (soloPage >= tp - 1);
  btnDown.onclick = function() { if (soloPage < tp - 1) { soloScrollDir = 'up'; soloPage++; buildRightPanel(); } };
  nav.appendChild(btnDown);

  var btnBottom = document.createElement('button');
  btnBottom.className = 'play-solo-nav-btn';
  btnBottom.innerHTML = '<span>&#9660;</span><span>&#9660;</span>';
  btnBottom.disabled = onlyOnePage || (soloPage >= tp - 1);
  btnBottom.onclick = function() { soloScrollDir = 'up'; soloPage = tp - 1; buildRightPanel(); };
  nav.appendChild(btnBottom);

  wrapper.appendChild(nav);
  panel.appendChild(wrapper);

}

function openSoloPopup(songIdx, type) {
  var overlay = document.getElementById('solo-popup-overlay');
  var popup = document.getElementById('solo-popup');

  popup.className = 'solo-popup';
  popup.innerHTML = '';
  popup.style.position = 'relative';

  var closeBtn = document.createElement('button');
  closeBtn.className = 'popup-close-btn';
  closeBtn.innerHTML = '&#10005;';
  closeBtn.onclick = function(e) { e.stopPropagation(); closeSoloPopup(); };
  popup.appendChild(closeBtn);

  var title = document.createElement('div');
  title.className = 'solo-popup-title';
  title.textContent = type === 'instrument' ? 'Choose Instrument' : 'Choose Difficulty';
  popup.appendChild(title);

  var options = type === 'instrument' ? instruments : difficulties;
  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    var card = document.createElement('div');
    card.className = 'solo-popup-option';
    card.setAttribute('data-' + type, opt.id);
    card.style.background = opt.bg;
    card.innerHTML = '<div class="solo-popup-option-label">' + opt.label + '</div>' +
                     '<div class="solo-popup-option-desc">' + (opt.desc || '') + '</div>';
    card.onclick = (function(sIdx, t, optId) {
      return function() { selectSoloOption(sIdx, t, optId); };
    })(songIdx, type, opt.id);
    popup.appendChild(card);
  }

  overlay.className = 'solo-popup-overlay active';
}

function closeSoloPopup() {
  document.getElementById('solo-popup-overlay').className = 'solo-popup-overlay';
  document.getElementById('solo-popup').className = 'solo-popup';
}

function selectSoloOption(songIdx, type, optionId) {
  if (type === 'instrument') {
    songInstruments[songIdx] = optionId;
    sendToUnity('songInstrument', songIdx + ':' + optionId);
  } else {
    songDiffs[songIdx] = optionId;
    sendToUnity('songDifficulty', songIdx + ':' + optionId);
  }
  closeSoloPopup();
  buildRightPanel();
}

// ── Space Popup ────────────────────────────────────────
function getSpaceOptionLabel(catId, optId) {
  for (var c = 0; c < spaceCategories.length; c++) {
    if (spaceCategories[c].id === catId) {
      for (var o = 0; o < spaceCategories[c].options.length; o++) {
        if (spaceCategories[c].options[o].id === optId) return spaceCategories[c].options[o].label;
      }
    }
  }
  return '';
}

function openSpacePopup(songIdx) {
  var overlay = document.getElementById('solo-popup-overlay');
  var popup = document.getElementById('solo-popup');

  var spaceConf = songSpaces[songIdx] || {};

  popup.innerHTML = '';
  popup.style.position = 'relative';

  var closeBtn = document.createElement('button');
  closeBtn.className = 'popup-close-btn';
  closeBtn.innerHTML = '&#10005;';
  closeBtn.onclick = function(e) { e.stopPropagation(); closeSoloPopup(); };
  popup.appendChild(closeBtn);

  var title = document.createElement('div');
  title.className = 'space-popup-title';
  title.textContent = 'Customise Space';
  popup.appendChild(title);

  for (var c = 0; c < spaceCategories.length; c++) {
    var cat = spaceCategories[c];
    var section = document.createElement('div');
    section.className = 'space-popup-category';

    var catLabel = document.createElement('div');
    catLabel.className = 'space-popup-cat-label';
    catLabel.textContent = cat.label;
    section.appendChild(catLabel);

    var optGrid = document.createElement('div');
    optGrid.className = 'space-popup-cat-options';

    var currentSel = spaceConf[cat.id] || spaceDefaults[cat.id];
    for (var o = 0; o < cat.options.length; o++) {
      var opt = cat.options[o];
      var card = document.createElement('div');
      card.className = 'space-popup-opt' + (opt.id === currentSel ? ' selected' : '');
      card.style.background = opt.bg;
      card.innerHTML = '<div class="space-popup-opt-label">' + opt.label + '</div>' +
                       '<div class="space-popup-opt-desc">' + opt.desc + '</div>';
      card.onclick = (function(sIdx, catId, optId) {
        return function() { selectSpaceOption(sIdx, catId, optId); };
      })(songIdx, cat.id, opt.id);
      optGrid.appendChild(card);
    }
    section.appendChild(optGrid);
    popup.appendChild(section);
  }

  popup.className = 'space-popup';
  overlay.className = 'solo-popup-overlay active';
}

function selectSpaceOption(songIdx, catId, optId) {
  if (!songSpaces[songIdx]) songSpaces[songIdx] = {};
  songSpaces[songIdx][catId] = optId;
  sendToUnity('songSpace', songIdx + ':' + catId + ':' + optId);
  openSpacePopup(songIdx);
}

// ── Loadout Popup ──────────────────────────────────────
var songLoadouts = {};

var loadoutSkins = {
  guitar: [
    {id:'classic',  label:'Classic Strat',  desc:'The timeless original',       bg:'#b45309'},
    {id:'fire',     label:'Fire Burst',     desc:'Blazing sunburst finish',     bg:'#991b1b'},
    {id:'neon',     label:'Neon Pulse',     desc:'Glowing electric vibes',      bg:'#6b21a8'},
    {id:'ice',      label:'Ice Crystal',    desc:'Cool translucent body',       bg:'#0e7490'}
  ],
  bass: [
    {id:'classic',  label:'Jazz Bass',      desc:'Deep warm tone',              bg:'#0e7490'},
    {id:'thunder',  label:'Thunder',        desc:'Heavy rumbling power',        bg:'#991b1b'},
    {id:'midnight', label:'Midnight',       desc:'Sleek matte black',           bg:'#1a1a4e'},
    {id:'slap',     label:'Funk Slap',      desc:'Bright snappy punch',         bg:'#b45309'}
  ],
  keys: [
    {id:'grand',    label:'Grand Piano',    desc:'Concert hall classic',        bg:'#1a1a4e'},
    {id:'synth',    label:'Synth Board',    desc:'Retro analog waves',          bg:'#6b21a8'},
    {id:'organ',    label:'Retro Organ',    desc:'Warm vintage tones',          bg:'#b45309'},
    {id:'electric', label:'Electric Piano',  desc:'Smooth Rhodes sound',        bg:'#0e7490'}
  ],
  drums: [
    {id:'pearl',    label:'Pearl Kit',      desc:'Crisp acoustic shells',       bg:'#991b1b'},
    {id:'rock',     label:'Rock Kit',       desc:'Punchy stadium sound',        bg:'#b45309'},
    {id:'electric', label:'Electronic',     desc:'Synthetic drum machine',      bg:'#6b21a8'},
    {id:'jazz',     label:'Jazz Brushes',   desc:'Soft brush technique',        bg:'#1a1a4e'}
  ],
  vocals: [
    {id:'classic',  label:'Classic Mic',    desc:'Studio condenser',            bg:'#6b21a8'},
    {id:'gold',     label:'Gold Mic',       desc:'Premium vintage finish',      bg:'#b45309'},
    {id:'neon',     label:'Neon Mic',       desc:'Light-up stage mic',          bg:'#0e7490'},
    {id:'retro',    label:'50s Chrome',     desc:'Old school crooner style',    bg:'#991b1b'}
  ]
};

var loadoutHighways = [
  {id:'neon',     label:'Neon',       desc:'Glowing neon rails',      bg:'#6b21a8', symbol:'\u2261'},
  {id:'classic',  label:'Classic',    desc:'Clean standard lane',     bg:'#1a1a4e', symbol:'\u2503'},
  {id:'holo',     label:'Hologram',   desc:'Translucent light beams', bg:'#0e7490', symbol:'\u25C7'},
  {id:'minimal',  label:'Minimal',    desc:'Stripped back design',    bg:'#374151', symbol:'\u2500'}
];

var loadoutGems = [
  {id:'standard', label:'Standard',   desc:'Default gem shapes',      bg:'#0e7490', symbol:'\u25C6'},
  {id:'crystal',  label:'Crystal',    desc:'Faceted gem stones',      bg:'#6b21a8', symbol:'\u2666'},
  {id:'fire',     label:'Fire',       desc:'Burning ember notes',     bg:'#991b1b', symbol:'\u2738'},
  {id:'neon',     label:'Neon',       desc:'Bright glow orbs',        bg:'#b45309', symbol:'\u25CF'}
];

var loadoutEffects = [
  {id:'sparks',   label:'Sparks',     desc:'Electric spark bursts',   bg:'#b45309', symbol:'\u2607'},
  {id:'fireworks',label:'Fireworks',  desc:'Colourful explosions',    bg:'#991b1b', symbol:'\u2734'},
  {id:'shatter',  label:'Shatter',    desc:'Glass break particles',   bg:'#0e7490', symbol:'\u2756'},
  {id:'glow',     label:'Glow',       desc:'Soft radiant pulses',     bg:'#6b21a8', symbol:'\u2600'}
];

var loadoutDefaults = {skin:'classic', highway:'neon', gems:'standard', effects:'sparks'};
var currentLoadoutSongIdx = -1;

function openLoadoutPopup(songIdx) {
  currentLoadoutSongIdx = songIdx;
  var overlay = document.getElementById('loadout-overlay');
  var popup = document.getElementById('loadout-popup');
  popup.innerHTML = '';

  var instId = songInstruments[songIdx] || 'guitar';
  var instObj = null;
  for (var j = 0; j < instruments.length; j++) {
    if (instruments[j].id === instId) { instObj = instruments[j]; break; }
  }
  if (!instObj) instObj = instruments[0];

  var title = document.createElement('div');
  title.className = 'loadout-popup-title';
  title.textContent = instObj.label + ' Loadout';
  popup.appendChild(title);

  var loadout = songLoadouts[songIdx] || {};
  var skins = loadoutSkins[instId] || loadoutSkins.guitar;

  var categories = [
    {id:'skin',    label:'Instrument Skin', options: skins,            icon: instObj.icon},
    {id:'highway', label:'Highway',         options: loadoutHighways,  icon: null},
    {id:'gems',    label:'Gems',            options: loadoutGems,      icon: null},
    {id:'effects', label:'Hit Effects',     options: loadoutEffects,   icon: null}
  ];

  for (var c = 0; c < categories.length; c++) {
    var cat = categories[c];
    var section = document.createElement('div');
    section.className = 'loadout-category';

    var catLabel = document.createElement('div');
    catLabel.className = 'loadout-cat-label';
    catLabel.textContent = cat.label;
    section.appendChild(catLabel);

    var optGrid = document.createElement('div');
    optGrid.className = 'loadout-cat-options';

    var currentSel = loadout[cat.id] || loadoutDefaults[cat.id];
    for (var o = 0; o < cat.options.length; o++) {
      var opt = cat.options[o];
      var card = document.createElement('div');
      card.className = 'loadout-opt' + (opt.id === currentSel ? ' selected' : '');
      card.style.background = opt.bg;
      var graphicHtml = '';
      if (cat.icon) {
        graphicHtml = '<img class="loadout-opt-icon" src="' + cat.icon + '" alt="">';
      } else if (opt.symbol) {
        graphicHtml = '<span class="loadout-opt-symbol">' + opt.symbol + '</span>';
      }
      card.innerHTML = '<div class="loadout-opt-label">' + opt.label + '</div>' +
                       '<div class="loadout-opt-desc">' + opt.desc + '</div>' +
                       graphicHtml;
      card.onclick = (function(catId, optId) {
        return function() { selectLoadoutOption(catId, optId); };
      })(cat.id, opt.id);
      optGrid.appendChild(card);
    }
    section.appendChild(optGrid);
    popup.appendChild(section);
  }

  var closeBtn = document.createElement('button');
  closeBtn.className = 'loadout-close-btn';
  closeBtn.textContent = 'Done';
  closeBtn.onclick = closeLoadoutPopup;
  popup.appendChild(closeBtn);

  overlay.className = 'loadout-overlay active';
}

function selectLoadoutOption(catId, optId) {
  var idx = currentLoadoutSongIdx;
  if (!songLoadouts[idx]) songLoadouts[idx] = {};
  songLoadouts[idx][catId] = optId;
  sendToUnity('loadout', idx + ':' + catId + ':' + optId);
  openLoadoutPopup(idx);
}

function closeLoadoutPopup(e) {
  if (e && e.target && e.target === document.getElementById('loadout-popup')) return;
  document.getElementById('loadout-overlay').className = 'loadout-overlay';
}

// ── Co-op / Battle Panel ───────────────────────────────
function buildCoopPanel(panel) {
  // Instrument section
  var instHeader = document.createElement('div');
  instHeader.className = 'play-coop-section-header';
  instHeader.textContent = 'Instrument';
  panel.appendChild(instHeader);
  buildCoopOptionRow(panel, instruments, selectedInstrument, function(id) {
    selectedInstrument = id;
    buildRightPanel();
    sendToUnity('selectInstrument', id);
  });

  // Difficulty section
  var diffHeader = document.createElement('div');
  diffHeader.className = 'play-coop-section-header';
  diffHeader.textContent = 'Difficulty';
  panel.appendChild(diffHeader);
  buildCoopOptionRow(panel, difficulties, selectedDifficulty, function(id) {
    selectedDifficulty = id;
    buildRightPanel();
    sendToUnity('selectDifficulty', id);
  });

  // Players section
  var playersHeader = document.createElement('div');
  playersHeader.className = 'play-coop-section-header';
  playersHeader.textContent = 'Players';
  panel.appendChild(playersHeader);

  var grid = document.createElement('div');
  grid.className = 'play-players-grid';
  for (var i = 0; i < 9; i++) {
    var player = lobbyPlayers[i];
    if (player) {
      grid.appendChild(buildNameplate(player));
    }
  }
  panel.appendChild(grid);
}

function buildCoopOptionRow(container, options, selectedId, onSelect) {
  var row = document.createElement('div');
  row.className = 'play-coop-row';
  for (var i = 0; i < options.length; i++) {
    var o = options[i];
    var tile = document.createElement('div');
    tile.className = 'play-coop-tile' + (o.id === selectedId ? ' selected' : '');
    tile.style.background = o.bg;
    var iconHtml = o.icon ? '<img src="' + o.icon + '" style="' + (o.iconStyle || defaultIconStyle) + '">' : '';
    tile.innerHTML = '<span class="play-opt-label">' + o.label + '</span>' + iconHtml;
    tile.onclick = (function(opt) {
      return function() { onSelect(opt.id); };
    })(o);
    row.appendChild(tile);
  }
  container.appendChild(row);
}

function buildNameplate(player) {
  var plate = document.createElement('div');
  plate.className = 'play-nameplate';
  if (player.plateClass) {
    plate.classList.add(player.plateClass);
  } else if (player.plate) {
    plate.style.background = player.plate;
    if (player.plate.indexOf('url(') !== -1) plate.classList.add('plate-img');
  }

  var avatar = document.createElement('img');
  avatar.className = 'play-np-avatar';
  avatar.src = player.avatar;
  avatar.alt = '';
  plate.appendChild(avatar);

  var info = document.createElement('div');
  info.className = 'play-np-info';

  var name = document.createElement('div');
  name.className = 'play-np-name';
  name.textContent = player.name;
  info.appendChild(name);

  if (player.ready) {
    var badges = document.createElement('div');
    badges.className = 'play-np-badges';
    var instBadge = document.createElement('span');
    instBadge.className = 'play-np-badge';
    instBadge.textContent = (player.instrument || 'guitar').charAt(0).toUpperCase() + (player.instrument || 'guitar').slice(1, 3);
    badges.appendChild(instBadge);
    var diffBadge = document.createElement('span');
    diffBadge.className = 'play-np-badge';
    diffBadge.textContent = (player.difficulty || 'medium').charAt(0).toUpperCase();
    badges.appendChild(diffBadge);
    info.appendChild(badges);
  } else {
    var hg = document.createElement('div');
    hg.className = 'play-np-hourglass';
    hg.innerHTML = '&#9203;';
    info.appendChild(hg);
  }

  plate.appendChild(info);
  return plate;
}

var songDurations = {};

function getSongDuration(song) {
  if (!songDurations[song.title]) {
    songDurations[song.title] = 180 + Math.floor(Math.random() * 120);
  }
  return songDurations[song.title];
}

function updateDuration() {
  var total = 0;
  var count = 0;
  for (var i = 0; i < setlist.length; i++) {
    if (setlist[i]) {
      total += getSongDuration(setlist[i]);
      count++;
    }
  }
  var mins = Math.floor(total / 60);
  var secs = total % 60;
  document.getElementById('play-duration').textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
  document.getElementById('play-song-count').textContent = count + ' song' + (count !== 1 ? 's' : '');
}

var resultsScoreTab = 'group';
var resultsLbTab = 'group';

var groupScoreData = { score: '987,654', stars: 4, accuracy: '98.5%', combo: '342', perfect: '98.5%', notes: '98.5%' };
var meScoreData = { score: '245,890', stars: 3, accuracy: '92.1%', combo: '187', perfect: '88.3%', notes: '94.7%' };

function switchResultsTab(tab) {
  resultsScoreTab = tab;
  resultsLbTab = tab;

  // Update title
  document.getElementById('results-group-name').textContent = tab === 'group' ? 'Jamsesh Hunters' : 'Rael';

  // Update score tabs
  var scoreTabs = document.getElementById('score-tabs').children;
  for (var i = 0; i < scoreTabs.length; i++) scoreTabs[i].className = 'results-tab';
  scoreTabs[tab === 'group' ? 0 : 1].className = 'results-tab active';

  // Update score data
  var data = tab === 'group' ? groupScoreData : meScoreData;
  document.getElementById('results-big-score').textContent = data.score;

  var starsEl = document.getElementById('results-stars');
  var starsHtml = '';
  for (var s = 0; s < 5; s++) {
    if (s < data.stars) starsHtml += '<div class="results-star">&#9733;</div>';
    else starsHtml += '<div class="results-star empty">&#9734;</div>';
  }
  starsEl.innerHTML = starsHtml;

  var statsEl = document.getElementById('results-stats');
  statsEl.innerHTML =
    '<div class="results-stat accuracy"><div class="stat-label">Accuracy</div><div class="stat-value">' + data.accuracy + '</div></div>' +
    '<div class="results-stat combo"><div class="stat-label">Max Combo</div><div class="stat-value">' + data.combo + '</div></div>' +
    '<div class="results-stat perfect"><div class="stat-label">Perfect Hits</div><div class="stat-value">' + data.perfect + '</div></div>' +
    '<div class="results-stat notes"><div class="stat-label">Notes Hit</div><div class="stat-value">' + data.notes + '</div></div>';

  // Update leaderboard tabs
  var lbTabs = document.getElementById('lb-tabs').children;
  for (var i = 0; i < lbTabs.length; i++) lbTabs[i].className = 'results-tab';
  lbTabs[tab === 'group' ? 0 : 1].className = 'results-tab active';

  document.getElementById('lb-group').style.display = tab === 'group' ? 'flex' : 'none';
  document.getElementById('lb-me').style.display = tab === 'me' ? 'flex' : 'none';
}

function startGame() {
  var titles = [];
  for (var i = 0; i < setlist.length; i++) {
    titles.push(setlist[i].title);
  }
  sendToUnity('startGame', {instrument: selectedInstrument, difficulty: selectedDifficulty, setlist: titles});
  // Reset tabs to group
  switchResultsTab('group');
  // Populate results with first setlist song if available
  if (setlist.length > 0) {
    var song = setlist[0];
    var artEl = document.getElementById('results-album-art');
    var titleEl = document.getElementById('results-song-title');
    var artistEl = document.getElementById('results-song-artist');
    if (artEl && song.file) artEl.src = song.file;
    if (titleEl) titleEl.textContent = song.title || 'Unknown';
    if (artistEl) artistEl.textContent = song.artist || 'Unknown';
  }
  // Fade straight to results screen (no gameplay mockup)
  var black = document.getElementById('onboard-black');
  black.className = 'visible';
  setTimeout(function() {
    document.getElementById('screen-results1').classList.add('active');
    setTimeout(function() { black.className = ''; }, 50);
  }, 200);
}

function showResults2() {
  var black = document.getElementById('onboard-black');
  black.className = 'visible';
  setTimeout(function() {
    document.getElementById('screen-results1').classList.remove('active');
    document.getElementById('screen-results2').classList.add('active');
    setTimeout(function() { black.className = ''; }, 50);
  }, 200);
}

function backToResults1() {
  var black = document.getElementById('onboard-black');
  black.className = 'visible';
  setTimeout(function() {
    document.getElementById('screen-results2').classList.remove('active');
    document.getElementById('screen-results1').classList.add('active');
    setTimeout(function() { black.className = ''; }, 50);
  }, 200);
}

function retryGame() {
  startGame();
}

function exitResults() {
  var black = document.getElementById('onboard-black');
  black.className = 'visible';
  setTimeout(function() {
    document.getElementById('screen-results2').classList.remove('active');
    setTimeout(function() { black.className = ''; }, 50);
  }, 200);
}

// ── Save/Load Setlist ──────────────────────────────────
function openSaveSetlist() {
  var input = document.getElementById('save-setlist-input');
  input.value = 'My Playlist #' + setlistCounter;
  document.getElementById('save-overlay').className = 'save-overlay active';
}

function closeSaveOverlay(e) {
  if (e && e.target !== document.getElementById('save-overlay')) return;
  document.getElementById('save-overlay').className = 'save-overlay';
}

function confirmSaveSetlist() {
  var name = document.getElementById('save-setlist-input').value.trim();
  if (!name) name = 'My Playlist #' + setlistCounter;
  savedSetlists.push({
    name: name,
    songs: setlist.map(function(s) { return s ? {title: s.title, artist: s.artist, file: s.file, duration: s.duration} : null; }).filter(Boolean)
  });
  setlistCounter++;
  document.getElementById('save-overlay').className = 'save-overlay';
}

function openLoadSetlist() {
  buildLoadList();
  document.getElementById('load-overlay').className = 'load-overlay active';
}

function closeLoadOverlay(e) {
  if (e && e.target !== document.getElementById('load-overlay')) return;
  document.getElementById('load-overlay').className = 'load-overlay';
}

var lessonSetlists = [
  { name: 'Jamsesh Basic Lessons', level: 'Basic', songs: tutorialSongs },
  { name: 'Jamsesh Advanced Lessons', level: 'Advanced', songs: tutorialSongs },
  { name: 'Jamsesh Expert Lessons', level: 'Expert', songs: tutorialSongs }
];

function buildLoadList() {
  var list = document.getElementById('load-list');
  list.innerHTML = '';

  // Lesson setlists at top
  for (var l = 0; l < lessonSetlists.length; l++) {
    var ls = lessonSetlists[l];
    var item = document.createElement('div');
    item.className = 'load-item';

    var grid = document.createElement('div');
    grid.className = 'load-art-grid';
    buildArtGrid(ls.songs, grid);
    item.appendChild(grid);

    var info = document.createElement('div');
    info.className = 'load-item-info';
    info.innerHTML = '<div class="load-item-name">' + ls.name + '</div>' +
      '<div class="load-item-count">' + ls.songs.length + ' song' + (ls.songs.length !== 1 ? 's' : '') + '</div>';
    item.appendChild(info);

    // 3x picks reward
    var rewards = document.createElement('div');
    rewards.style.cssText = 'display:flex;gap:12px;align-items:center;margin-left:auto;margin-right:24px';
    for (var p = 0; p < 3; p++) {
      var pick = document.createElement('div');
      pick.style.cssText = 'display:flex;align-items:center;gap:4px';
      pick.innerHTML = '<img src="JamPick.png" style="width:36px;height:36px;object-fit:contain">' +
        '<span style="font-size:20px;font-weight:700;color:#FFD700">x1000</span>';
      rewards.appendChild(pick);
    }
    item.appendChild(rewards);

    var loadBtn = document.createElement('button');
    loadBtn.className = 'load-item-btn load-item-btn-load';
    loadBtn.textContent = 'Load';
    (function(lesson) {
      loadBtn.onclick = function() {
        setlist = lesson.songs.slice();
        buildPlayGrid();
        closeLoadOverlay();
      };
    })(ls);
    item.appendChild(loadBtn);

    list.appendChild(item);
  }

  if (savedSetlists.length === 0 && lessonSetlists.length > 0) {
    // Lessons shown, no need for empty message
  } else if (savedSetlists.length === 0) {
    list.innerHTML += '<div class="load-empty">No saved setlists</div>';
  }
  for (var i = 0; i < savedSetlists.length; i++) {
    var sl = savedSetlists[i];
    var item = document.createElement('div');
    item.className = 'load-item';

    var grid = document.createElement('div');
    grid.className = 'load-art-grid';
    buildArtGrid(sl.songs, grid);
    item.appendChild(grid);

    var info = document.createElement('div');
    info.className = 'load-item-info';
    info.innerHTML = '<div class="load-item-name">' + sl.name + '</div>' +
      '<div class="load-item-count">' + sl.songs.length + ' song' + (sl.songs.length !== 1 ? 's' : '') + '</div>';
    item.appendChild(info);

    var loadBtn = document.createElement('button');
    loadBtn.className = 'load-item-btn load-item-btn-load';
    loadBtn.textContent = 'Load';
    (function(idx) { loadBtn.onclick = function() { loadSetlist(idx); }; })(i);
    item.appendChild(loadBtn);

    var delBtn = document.createElement('button');
    delBtn.className = 'load-item-btn load-item-btn-delete';
    delBtn.textContent = 'Delete';
    (function(idx) { delBtn.onclick = function() { deleteSetlist(idx); }; })(i);
    item.appendChild(delBtn);

    list.appendChild(item);
  }
}

function buildArtGrid(songs, container) {
  for (var i = 0; i < 4; i++) {
    if (songs[i] && songs[i].file) {
      var img = document.createElement('img');
      img.src = songs[i].file;
      img.alt = '';
      container.appendChild(img);
    } else {
      var empty = document.createElement('div');
      empty.className = 'art-empty';
      container.appendChild(empty);
    }
  }
}

function loadSetlist(idx) {
  var sl = savedSetlists[idx];
  setlist = [];
  songInstruments = {};
  songDiffs = {};
  songSpaces = {};
  for (var i = 0; i < sl.songs.length; i++) {
    var saved = sl.songs[i];
    var match = null;
    for (var j = 0; j < allSongs.length; j++) {
      if (allSongs[j].title === saved.title && allSongs[j].artist === saved.artist) {
        match = allSongs[j];
        break;
      }
    }
    if (match) {
      setlist.push(match);
      songInstruments[i] = selectedInstrument;
      songDiffs[i] = selectedDifficulty;
    }
  }
  document.getElementById('load-overlay').className = 'load-overlay';
  buildSongColumn();
  buildRightPanel();
  syncSetlistToUnity();
}

function deleteSetlist(idx) {
  savedSetlists.splice(idx, 1);
  buildLoadList();
}


function removeFromSetlist(idx) {
  setlist.splice(idx, 1);
  // Shift per-song instruments, difficulties and spaces
  var newInst = {};
  var newDiff = {};
  var newSpace = {};
  for (var i = 0; i < setlist.length + 1; i++) {
    if (i < idx) {
      newInst[i] = songInstruments[i];
      newDiff[i] = songDiffs[i];
      newSpace[i] = songSpaces[i];
    } else {
      newInst[i] = songInstruments[i + 1];
      newDiff[i] = songDiffs[i + 1];
      newSpace[i] = songSpaces[i + 1];
    }
  }
  songInstruments = newInst;
  songDiffs = newDiff;
  songSpaces = newSpace;
  buildPlayGrid();
  syncSetlistToUnity();
}

function swapSetlistSong(idx) {
  swapTargetIdx = idx;
  showPlayPicker();
}

// ── Preview Audio ──────────────────────────────────────
var previewAudio = null;
var previewIdx = -1;

function togglePreview(idx) {
  if (previewIdx === idx && previewAudio && !previewAudio.paused) {
    previewAudio.pause();
    previewIdx = -1;
    buildRightPanel();
    return;
  }
  if (previewAudio) { previewAudio.pause(); }
  var song = setlist[idx];
  if (!song || !song.file) return;
  var audioSrc = song.file.replace(/\.[^.]+$/, '.mp3');
  previewAudio = new Audio(audioSrc);
  previewAudio.volume = 0.5;
  previewAudio.play().catch(function() {});
  previewIdx = idx;
  previewAudio.onended = function() { previewIdx = -1; buildRightPanel(); };
  buildRightPanel();
}

var lbTypes = [
  {label: 'Worldwide', icon: '\u{1F30D}'},
  {label: 'Local',     icon: '\u{1F4CD}'},
  {label: 'Friends',   icon: '\u{1F465}'}
];
var currentLbType = 0;

var pickerSelectedSong = null;

var lbNamePool = [
  'xShredMaster','BeatDropQueen','NeonRiff','AxelStorm','VoxHunter',
  'FretBoss','SynthWave99','PickSlinger','CrashKid','LoopMachine',
  'WahPedal','TrebleMaker','RiffRider','BassCanon','TempoTitan',
  'ChordCrusher','MelodyMaven','GrooveGuru','HarmonyHero','SonicBlaze',
  'VibeCheck','EchoStrike','PulseRider','WaveBreaker','ToneShifter',
  'AmpliFire','DropZone','MixMaster','ClefKing','OctaveOwl'
];
var lbPlatePool = [np.galaxy, np.bamboo, np.garden, np.flames, np.drums, np.microphone, np.kpop, np.sakura];
var lbPlateClasses = ['plate-holo', 'plate-radiate'];

function lbHash(str) {
  var h = 5381;
  for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateLeaderboard(songTitle, instId, diffId, lbType) {
  var seed = lbHash(songTitle + '|' + instId + '|' + diffId + '|' + lbType);
  function rng() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  var names = lbNamePool.slice();
  for (var i = names.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = names[i]; names[i] = names[j]; names[j] = tmp;
  }
  var entries = [];
  var baseScore = Math.floor(rng() * 200000) + 800000;
  for (var i = 0; i < 8; i++) {
    var score = baseScore - Math.floor(rng() * 12000 + 3000) * i;
    if (score < 100000) score = 100000 + Math.floor(rng() * 50000);
    var avatarNum = String(Math.floor(rng() * 40) + 1).padStart(3, '0');
    var entry = {
      pos: i + 1,
      name: names[i],
      score: score,
      avatar: 'art/' + avatarNum + '.jpg'
    };
    if (rng() > 0.7) {
      entry.plateClass = lbPlateClasses[Math.floor(rng() * lbPlateClasses.length)];
    } else {
      entry.plate = lbPlatePool[Math.floor(rng() * lbPlatePool.length)];
    }
    entries.push(entry);
  }
  entries.sort(function(a, b) { return b.score - a.score; });
  // Insert Jooleeno at a random position
  var jooleenoScore = entries.length > 0 ? entries[Math.floor(rng() * entries.length)].score + Math.floor(rng() * 5000) - 2500 : 500000;
  var jooleenoIdx = Math.floor(rng() * (entries.length + 1));
  entries.splice(jooleenoIdx, 0, {
    pos: 0,
    name: 'Jooleeno',
    score: jooleenoScore,
    avatar: 'julie.jpg'
  });
  // Insert A_Peach at a random position
  var peachScore = entries.length > 0 ? entries[Math.floor(rng() * entries.length)].score + Math.floor(rng() * 5000) - 2500 : 500000;
  var peachIdx = Math.floor(rng() * (entries.length + 1));
  entries.splice(peachIdx, 0, {
    pos: 0,
    name: 'A_Peach',
    score: peachScore,
    avatar: 'peach.png'
  });
  entries.sort(function(a, b) { return b.score - a.score; });
  if (lbType === 'Worldwide') {
    var startPos = Math.floor(rng() * 500) + 1;
    for (var i = 0; i < entries.length; i++) entries[i].pos = startPos + i;
  } else {
    for (var i = 0; i < entries.length; i++) entries[i].pos = i + 1;
  }
  return entries;
}

function rotateLbType() {
  currentLbType = (currentLbType + 1) % lbTypes.length;
  var t = lbTypes[currentLbType];
  document.getElementById('lb-type-btn').innerHTML = '<span>' + t.icon + '</span> ' + t.label;
  buildLeaderboard();
  sendToUnity('leaderboardType', t.label);
}

var pickerInstIdx = 0;
var pickerDiffIdx = 1; // default Medium

var instIcons = {guitar:'&#127928;', keys:'&#127929;', drums:'&#129345;', vocals:'&#127908;', bass:'&#127928;'};
var diffIcons = {easy:'&#127922;', medium:'&#127919;', hard:'&#128293;', expert:'&#128128;'};

function rotatePickerInstrument() {
  pickerInstIdx = (pickerInstIdx + 1) % instruments.length;
  var inst = instruments[pickerInstIdx];
  selectedInstrument = inst.id;
  document.getElementById('picker-inst-btn').innerHTML = (instIcons[inst.id] || '') + ' ' + inst.label;
  buildLeaderboard();
  sendToUnity('selectInstrument', inst.id);
}

function rotatePickerDifficulty() {
  pickerDiffIdx = (pickerDiffIdx + 1) % difficulties.length;
  var diff = difficulties[pickerDiffIdx];
  selectedDifficulty = diff.id;
  document.getElementById('picker-diff-btn').innerHTML = (diffIcons[diff.id] || '') + ' ' + diff.label;
  buildLeaderboard();
  sendToUnity('selectDifficulty', diff.id);
}

function shortPos(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return '' + n;
}

function buildLeaderboard() {
  var list = document.getElementById('play-lb-list');
  list.innerHTML = '';
  var typeName = lbTypes[currentLbType].label;
  var songTitle = pickerSelectedSong ? pickerSelectedSong.title : 'default';
  var instId = instruments[pickerInstIdx].id;
  var diffId = difficulties[pickerDiffIdx].id;
  var entries = generateLeaderboard(songTitle, instId, diffId, typeName);
  var starHtml = '<div class="play-lb-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>';
  for (var i = 0; i < 8 && i < entries.length; i++) {
    var lb = entries[i];
    var row = document.createElement('div');
    row.className = 'play-lb-row';
    var tile = document.createElement('div');
    tile.className = 'play-lb-tile';
    row.innerHTML = '<span class="play-lb-pos">' + shortPos(lb.pos) + '</span>';
    tile.innerHTML =
      '<img class="play-lb-avatar" src="' + lb.avatar + '" alt="">' +
      '<div class="play-lb-info">' +
        starHtml +
        '<div class="play-lb-name">' + lb.name + '</div>' +
        '<div class="play-lb-score">' + lb.score.toLocaleString() + '</div>' +
      '</div>';
    row.appendChild(tile);
    list.appendChild(row);
  }
}

function selectPickerSong(song, tileEl) {
  pickerSelectedSong = song;
  var tiles = document.querySelectorAll('.song-tile');
  for (var i = 0; i < tiles.length; i++) tiles[i].classList.remove('active');
  if (tileEl) tileEl.classList.add('active');
  buildLeaderboard();
}

function addSongToSetlist(song) {
  if (swapTargetIdx >= 0) {
    setlist[swapTargetIdx] = song;
    swapTargetIdx = -1;
  } else {
    setlist.push(song);
  }
  buildPlayGrid();
  buildPickerSetlist();
  syncSetlistToUnity();
}

var PICKER_SETLIST_SLOTS = 6;
var pickerSetlistPage = 0;

function buildPickerSetlist() {
  var container = document.getElementById('picker-setlist-tiles');
  var nav = document.getElementById('picker-setlist-nav');
  if (!container) return;
  container.innerHTML = '';
  if (nav) nav.innerHTML = '';
  var total = setlist.length;
  var maxPage = Math.max(0, Math.ceil(total / PICKER_SETLIST_SLOTS) - 1);
  if (pickerSetlistPage > maxPage) pickerSetlistPage = maxPage;
  var startIdx = pickerSetlistPage * PICKER_SETLIST_SLOTS;
  var needsPaging = total > PICKER_SETLIST_SLOTS;

  for (var i = 0; i < PICKER_SETLIST_SLOTS; i++) {
    var songIdx = startIdx + i;
    var tile = document.createElement('div');
    if (songIdx < total) {
      tile.className = 'picker-setlist-tile';
      tile.innerHTML =
        '<img src="' + setlist[songIdx].file + '" alt="">' +
        '<div class="picker-setlist-remove">&#10005;</div>';
      (function(idx) {
        tile.querySelector('.picker-setlist-remove').onclick = function(e) {
          e.stopPropagation();
          removeFromSetlist(idx);
          buildPickerSetlist();
        };
      })(songIdx);
    } else {
      tile.className = 'picker-setlist-tile picker-setlist-empty';
    }
    container.appendChild(tile);
  }

  // Pagination arrows below tiles
  if (needsPaging && nav) {
    var left = document.createElement('button');
    left.className = 'picker-setlist-arrow';
    left.innerHTML = '&#9664;';
    left.disabled = pickerSetlistPage === 0;
    left.onclick = function() { pickerSetlistPage--; buildPickerSetlist(); };
    nav.appendChild(left);

    var right = document.createElement('button');
    right.className = 'picker-setlist-arrow';
    right.innerHTML = '&#9654;';
    right.disabled = pickerSetlistPage >= maxPage;
    right.onclick = function() { pickerSetlistPage++; buildPickerSetlist(); };
    nav.appendChild(right);
  }
}

function constrainGridNav() {
  var tile = document.querySelector('.song-tile');
  var navEl = document.getElementById('grid-nav-right');
  if (tile && navEl) {
    var tileH = tile.offsetHeight;
    var page = document.querySelector('.grid-page');
    var gap = page ? parseFloat(getComputedStyle(page).gap) || 10 : 10;
    var contentH = Math.ceil(4 * tileH + 3 * gap);
    navEl.style.maxHeight = contentH + 'px';
  }
}

function showPlayPicker() {
  document.getElementById('play-main-layout').style.display = 'none';
  document.getElementById('play-picker').className = 'play-picker active';
  // Reset filters
  pickerFilterGenre = '';
  pickerFilterDecade = '';
  pickerFilterDuration = '';
  pickerFilterSort = 'rank';
  updateFilterButtons();
  pickerSetlistPage = 0;
  // Rebuild grid with all songs
  buildGrid(allSongs);
  // Measure page height now that picker is visible
  var vp = document.querySelector('.grid-viewport');
  if (vp) {
    pageHeight = vp.clientHeight;
    var gridPages = document.querySelectorAll('.grid-page');
    for (var i = 0; i < gridPages.length; i++) {
      gridPages[i].style.height = pageHeight + 'px';
    }
  }
  constrainGridNav();
  currentPage = 0;
  goToPage(0);
  if (totalPages > 0) {
    buildNavButtons(document.getElementById('grid-nav-right'), 'right');
    updateNavState();
  }
  var gridNavs = document.querySelectorAll('.grid-nav');
  for (var i = 0; i < gridNavs.length; i++) gridNavs[i].style.display = 'flex';
  // Auto-select first song tile
  pickerSelectedSong = null;
  var firstTile = document.querySelector('.song-tile');
  if (firstTile) firstTile.click();
  buildPickerSetlist();
}

function hidePlayPicker() {
  document.getElementById('play-main-layout').style.display = 'flex';
  document.getElementById('play-picker').className = 'play-picker';
  swapTargetIdx = -1;
  pickerSelectedSong = null;
  var gridNavs = document.querySelectorAll('.grid-nav');
  for (var i = 0; i < gridNavs.length; i++) gridNavs[i].style.display = 'none';
}

function resetPlayPicker() {
  var picker = document.getElementById('play-picker');
  if (picker) picker.className = 'play-picker';
  var layout = document.getElementById('play-main-layout');
  if (layout) layout.style.display = 'flex';
  swapTargetIdx = -1;
  pickerSelectedSong = null;
  var gridNavs = document.querySelectorAll('.grid-nav');
  for (var i = 0; i < gridNavs.length; i++) gridNavs[i].style.display = 'none';
}

function initLobbyPlates() {
  lobbyPlayers[0].plate = np.flames;
  lobbyPlayers[2].plate = np.galaxy;
  lobbyPlayers[3].plate = np.kpop;
  lobbyPlayers[4].plate = np.bamboo;
  lobbyPlayers[6].plate = np.microphone;
  lobbyPlayers[7].plate = np.garden;
  lobbyPlayers[8].plate = np.drums;
}

var songGenres = ['Pop','Hip-Hop','Rock','R&B','Country','Electronic','Latin','Indie'];
var songDecades = ['2020s','2010s','2000s','90s','80s','Classic'];


var pickerFilterGenre = '';
var pickerFilterDecade = '';
var pickerFilterDuration = '';
var pickerFilterSort = 'rank';

var filterDefs = {
  genre: {
    title: 'Genre',
    btnId: 'filter-genre-btn',
    items: [
      {id: '', label: 'All Genres'},
      {id: 'Pop', label: 'Pop'},
      {id: 'Hip-Hop', label: 'Hip-Hop'},
      {id: 'Rock', label: 'Rock'},
      {id: 'R&B', label: 'R&B'},
      {id: 'Country', label: 'Country'},
      {id: 'Electronic', label: 'Electronic'},
      {id: 'Latin', label: 'Latin'},
      {id: 'Indie', label: 'Indie'}
    ]
  },
  decade: {
    title: 'Decade',
    btnId: 'filter-decade-btn',
    items: [
      {id: '', label: 'All Decades'},
      {id: '2020s', label: '2020s'},
      {id: '2010s', label: '2010s'},
      {id: '2000s', label: '2000s'},
      {id: '90s', label: '90s'},
      {id: '80s', label: '80s'},
      {id: 'Classic', label: 'Classic'}
    ]
  },
  duration: {
    title: 'Song Length',
    btnId: 'filter-duration-btn',
    items: [
      {id: '', label: 'Any Length'},
      {id: 'short', label: 'Under 3 min'},
      {id: 'medium', label: '3\u20134 min'},
      {id: 'long', label: 'Over 4 min'}
    ]
  },
  sort: {
    title: 'Sort By',
    btnId: 'filter-sort-btn',
    items: [
      {id: 'rank', label: 'Popularity'},
      {id: 'title', label: 'Title A\u2013Z'},
      {id: 'artist', label: 'Artist A\u2013Z'},
      {id: 'duration', label: 'Duration'},
      {id: 'recent', label: 'Recently Added'}
    ]
  }
};

function openFilterPicker(type) {
  var def = filterDefs[type];
  var currentVal;
  if (type === 'genre') currentVal = pickerFilterGenre;
  else if (type === 'decade') currentVal = pickerFilterDecade;
  else if (type === 'duration') currentVal = pickerFilterDuration;
  else currentVal = pickerFilterSort;

  var overlay = document.getElementById('option-picker-overlay');
  var panel = document.getElementById('option-picker-panel');
  overlay.style.display = 'flex';
  panel.innerHTML = '';

  var title = document.createElement('div');
  title.className = 'option-picker-title';
  title.textContent = def.title;
  panel.appendChild(title);

  var choices = document.createElement('div');
  choices.className = 'option-picker-choices';
  for (var i = 0; i < def.items.length; i++) {
    var item = def.items[i];
    var choice = document.createElement('div');
    choice.className = 'option-picker-choice' + (item.id === currentVal ? ' selected' : '');
    choice.innerHTML =
      '<div style="flex:1">' +
        '<div class="option-picker-choice-label">' + item.label + '</div>' +
      '</div>';
    choice.onclick = (function(t, it) {
      return function() {
        if (t === 'genre') pickerFilterGenre = it.id;
        else if (t === 'decade') pickerFilterDecade = it.id;
        else if (t === 'duration') pickerFilterDuration = it.id;
        else pickerFilterSort = it.id;
        updateFilterButtons();
        closeOptionPicker();
        applyPickerFilters();
      };
    })(type, item);
    choices.appendChild(choice);
  }
  panel.appendChild(choices);
}

function updateFilterButtons() {
  var types = ['genre', 'decade', 'duration', 'sort'];
  var vals = [pickerFilterGenre, pickerFilterDecade, pickerFilterDuration, pickerFilterSort];
  for (var i = 0; i < types.length; i++) {
    var def = filterDefs[types[i]];
    var btn = document.getElementById(def.btnId);
    if (!btn) continue;
    var val = vals[i];
    var label = '';
    for (var j = 0; j < def.items.length; j++) {
      if (def.items[j].id === val) { label = def.items[j].label; break; }
    }
    btn.innerHTML = label + ' <span class="picker-filter-arrow">&#9662;</span>';
    if (val && types[i] !== 'sort') {
      btn.className = 'picker-filter filter-active';
    } else {
      btn.className = 'picker-filter';
    }
  }
}

function applyPickerFilters() {
  var genre = pickerFilterGenre;
  var decade = pickerFilterDecade;
  var dur = pickerFilterDuration;
  var sort = pickerFilterSort;
  var filtered = allSongs.filter(function(s) {
    if (genre && s.genre !== genre) return false;
    if (decade && s.decade !== decade) return false;
    if (dur === 'short' && s.duration >= 180) return false;
    if (dur === 'medium' && (s.duration < 180 || s.duration > 240)) return false;
    if (dur === 'long' && s.duration <= 240) return false;
    return true;
  });
  if (sort === 'title') {
    filtered.sort(function(a, b) { return a.title.localeCompare(b.title); });
  } else if (sort === 'artist') {
    filtered.sort(function(a, b) { return a.artist.localeCompare(b.artist); });
  } else if (sort === 'duration') {
    filtered.sort(function(a, b) { return a.duration - b.duration; });
  } else if (sort === 'recent') {
    filtered.sort(function(a, b) { return b.dateAdded - a.dateAdded; });
  } else {
    filtered.sort(function(a, b) { return a.rank - b.rank; });
  }
  buildGrid(filtered);
  // Re-measure page heights and reset
  var vp = document.querySelector('.grid-viewport');
  if (vp) {
    pageHeight = vp.clientHeight;
    var gridPages = document.querySelectorAll('.grid-page');
    for (var i = 0; i < gridPages.length; i++) gridPages[i].style.height = pageHeight + 'px';
  }
  constrainGridNav();
  currentPage = 0;
  goToPage(0);
  updateNavState();
  // Auto-select first tile
  pickerSelectedSong = null;
  var firstTile = document.querySelector('.song-tile');
  if (firstTile) firstTile.click();
}

function buildPlayPanel(songs) {
  allSongs = songs;
  // Pick 3 random songs for the setlist
  var shuffled = songs.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
  }
  setlist = shuffled.slice(0, 3);
  generateDefaultSetlists();
  initLobbyPlates();
  buildModeTabs();
  buildPlayGrid();
  buildLeaderboard();

  // Push initial config state so Unity config matches the UI defaults
  sendToUnity('selectInstrument', selectedInstrument);
  sendToUnity('selectDifficulty', selectedDifficulty);
  syncSetlistToUnity();
}

function syncSetlistToUnity() {
  var titles = [];
  for (var i = 0; i < setlist.length; i++) {
    titles.push(setlist[i].title);
  }
  sendToUnity('setlistUpdated', titles);
}

var soloGridPage = 0;
var SOLO_SONGS_PER_PAGE = 3;
var selectedExperience = 'Stage';

function buildPlayGrid() {
  var grid = document.getElementById('play-grid');
  if (!grid) return;
  grid.innerHTML = '';
  grid.className = 'play-grid';
  var goBar = document.querySelector('.play-go-bar');
  if (playMode === 'solo') {
    grid.className = 'play-grid play-grid--solo';
    if (goBar) goBar.style.display = 'flex';
    buildSoloGrid(grid);
  } else {
    grid.className = 'play-grid play-grid--coop';
    if (goBar) goBar.style.display = 'none';
    buildCoopGrid(grid);
  }
}

function buildSoloGrid(grid) {
  // Songs row with pagination
  var songsRow = document.createElement('div');
  songsRow.className = 'play-grid-songs-row';

  var totalPages = Math.max(1, Math.ceil(setlist.length / SOLO_SONGS_PER_PAGE));
  if (soloGridPage >= totalPages) soloGridPage = totalPages - 1;
  var start = soloGridPage * SOLO_SONGS_PER_PAGE;
  var end = Math.min(start + SOLO_SONGS_PER_PAGE, setlist.length);

  for (var i = start; i < start + SOLO_SONGS_PER_PAGE; i++) {
    var tile = document.createElement('div');
    tile.className = 'play-grid-song';
    if (i < setlist.length && setlist[i]) {
      var s = setlist[i];
      var mins = Math.floor((s.duration || 0) / 60);
      var secs = (s.duration || 0) % 60;
      var dur = mins + ':' + (secs < 10 ? '0' : '') + secs;
      tile.onclick = (function(idx) { return function() { showPlayPicker(); }; })(i);
      tile.innerHTML =
        '<div class="play-grid-song-art">' +
          '<img src="' + (s.file || '') + '" alt="" style="' + (s.file ? '' : 'display:none') + '">' +
          '<div class="song-pos">' + (i + 1) + '</div>' +
        '</div>' +
        '<div class="play-grid-song-info">' +
          '<div class="song-title">' + (s.title || 'Unknown') + '</div>' +
          '<div class="song-artist">' + (s.artist || 'Unknown') + '</div>' +
          '<div class="song-meta">' + dur + '  &#183;  ' + (s.genre || '') + '  &#183;  ' + (s.bpm || '') + ' BPM</div>' +
        '</div>';
    } else {
      tile.style.border = '2px dashed #333333';
      tile.style.background = 'transparent';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.onclick = function() { showPlayPicker(); };
      tile.innerHTML = '<div style="font-size:48px;color:#444444">+</div><div style="font-size:20px;color:#444444">Add Song</div>';
    }
    songsRow.appendChild(tile);
  }
  grid.appendChild(songsRow);

  // Pagination row
  if (totalPages > 1) {
    var pagRow = document.createElement('div');
    pagRow.className = 'play-grid-pagination';
    var prevBtn = document.createElement('button');
    prevBtn.className = 'play-grid-nav-btn';
    prevBtn.innerHTML = '&#9664;';
    prevBtn.disabled = soloGridPage === 0;
    prevBtn.onclick = function() { soloGridPage--; buildPlayGrid(); };
    var label = document.createElement('div');
    label.className = 'page-label';
    label.textContent = (soloGridPage + 1) + ' / ' + totalPages;
    var nextBtn = document.createElement('button');
    nextBtn.className = 'play-grid-nav-btn';
    nextBtn.innerHTML = '&#9654;';
    nextBtn.disabled = soloGridPage >= totalPages - 1;
    nextBtn.onclick = function() { soloGridPage++; buildPlayGrid(); };
    pagRow.appendChild(prevBtn);
    pagRow.appendChild(label);
    pagRow.appendChild(nextBtn);
    grid.appendChild(pagRow);
  }

  // Setlist summary row
  var totalSecs = 0;
  for (var i = 0; i < setlist.length; i++) {
    if (setlist[i]) totalSecs += (setlist[i].duration || 0);
  }
  var tMins = Math.floor(totalSecs / 60);
  var tSecs = totalSecs % 60;
  var summary = document.createElement('div');
  summary.className = 'play-grid-summary';
  summary.innerHTML =
    '<div class="play-grid-summary-item"><span>Songs</span> ' + setlist.length + '</div>' +
    '<div class="play-grid-summary-item"><span>Total</span> ' + tMins + ':' + (tSecs < 10 ? '0' : '') + tSecs + '</div>';
  grid.appendChild(summary);

  // Options row
  buildOptionsRow(grid);
}

function buildOptionsRow(container) {
  var instNames = ['Guitar', 'Drums', 'Vocals', 'Bass'];
  var diffNames = ['Easy', 'Normal', 'Hard', 'Expert'];

  var instIdx = instNames.indexOf(selectedInstrument.charAt(0).toUpperCase() + selectedInstrument.slice(1));
  if (instIdx < 0) instIdx = 0;
  var diffIdx = diffNames.indexOf(selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1));
  if (diffIdx < 0) diffIdx = 1;

  var optionsRow = document.createElement('div');
  optionsRow.className = 'play-grid-options-row';

  var optData = [
    {
      label: 'Instrument', value: instNames[instIdx],
      icon: '<svg viewBox="0 0 24 24"><path d="M19.59 3.41c-.8-.8-2.1-.8-2.9 0L12 8.1 9.59 5.69c-.8-.8-2.1-.8-2.9 0-.8.8-.8 2.1 0 2.9L9.1 11 3.41 16.69c-.8.8-.8 2.1 0 2.9.4.4.93.59 1.45.59s1.05-.2 1.45-.59L12 13.9l2.41 2.41c.4.4.93.59 1.45.59s1.05-.2 1.45-.59c.8-.8.8-2.1 0-2.9L14.9 11l5.69-5.69c.8-.8.8-2.1 0-2.9z"/></svg>',
      onclick: function() { openOptionPicker('instrument'); }
    },
    {
      label: 'Difficulty', value: diffNames[diffIdx],
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>',
      onclick: function() { openOptionPicker('difficulty'); }
    },
    {
      label: 'Experience', value: selectedExperience,
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      onclick: function() { openOptionPicker('experience'); }
    }
  ];

  for (var i = 0; i < optData.length; i++) {
    var opt = optData[i];
    var tile = document.createElement('div');
    tile.className = 'play-grid-option';
    tile.onclick = opt.onclick;
    tile.innerHTML = opt.icon +
      '<div class="play-grid-option-label">' + opt.label + '</div>' +
      '<div class="play-grid-option-value">' + opt.value + '</div>';
    optionsRow.appendChild(tile);
  }
  container.appendChild(optionsRow);
}

var coopGridPage = 0;
var COOP_SONGS_PER_PAGE = 2;

function buildCoopGrid(grid) {
  // Songs area with friend grids
  var songsArea = document.createElement('div');
  songsArea.className = 'coop-songs-area';

  var totalPages = Math.max(1, Math.ceil(setlist.length / COOP_SONGS_PER_PAGE));
  if (coopGridPage >= totalPages) coopGridPage = totalPages - 1;
  var start = coopGridPage * COOP_SONGS_PER_PAGE;

  for (var i = start; i < start + COOP_SONGS_PER_PAGE; i++) {
    var row = document.createElement('div');
    row.className = 'coop-song-row';

    if (i < setlist.length && setlist[i]) {
      var s = setlist[i];
      // Song tile (left)
      var songTile = document.createElement('div');
      songTile.className = 'coop-song-tile';
      songTile.onclick = (function(idx) { return function() { showPlayPicker(); }; })(i);
      songTile.innerHTML =
        '<img src="' + (s.file || 'art/001.jpg') + '" alt="">' +
        '<div class="coop-song-info">' +
          '<div class="song-title">' + (s.title || 'Unknown') + '</div>' +
          '<div class="song-artist">' + (s.artist || 'Unknown') + '</div>' +
        '</div>';
      row.appendChild(songTile);

      // Friend grid (right) — 3x3 with lobbyPlayers
      var friendGrid = document.createElement('div');
      friendGrid.className = 'coop-friend-grid';
      for (var j = 0; j < 9; j++) {
        var p = lobbyPlayers[j];
        var cell = document.createElement('div');
        cell.className = 'coop-friend-cell';
        if (p) {
          cell.innerHTML =
            '<img src="' + p.avatar + '" alt="">' +
            '<div class="friend-name">' + p.name + '</div>';
        }
        friendGrid.appendChild(cell);
      }
      row.appendChild(friendGrid);
    } else {
      // Empty add-song row
      var addTile = document.createElement('div');
      addTile.className = 'coop-song-tile';
      addTile.style.cursor = 'pointer';
      addTile.style.justifyContent = 'center';
      addTile.style.alignItems = 'center';
      addTile.style.border = '2px dashed #444444';
      addTile.style.background = 'transparent';
      addTile.innerHTML = '<div style="font-size:48px;color:#444444">+</div>';
      addTile.onclick = function() { showPlayPicker(); };
      row.appendChild(addTile);
      var emptyGrid = document.createElement('div');
      emptyGrid.className = 'coop-friend-grid';
      for (var k = 0; k < 9; k++) {
        var emptyCell = document.createElement('div');
        emptyCell.className = 'coop-friend-cell';
        emptyGrid.appendChild(emptyCell);
      }
      row.appendChild(emptyGrid);
    }
    songsArea.appendChild(row);
  }
  grid.appendChild(songsArea);

  // Pagination row
  if (totalPages > 1) {
    var pagRow = document.createElement('div');
    pagRow.className = 'play-grid-pagination';
    var prevBtn = document.createElement('button');
    prevBtn.className = 'play-grid-nav-btn';
    prevBtn.innerHTML = '&#9664;';
    prevBtn.disabled = coopGridPage === 0;
    prevBtn.onclick = function() { coopGridPage--; buildPlayGrid(); };
    var label = document.createElement('div');
    label.className = 'page-label';
    label.textContent = (coopGridPage + 1) + ' / ' + totalPages;
    var nextBtn = document.createElement('button');
    nextBtn.className = 'play-grid-nav-btn';
    nextBtn.innerHTML = '&#9654;';
    nextBtn.disabled = coopGridPage >= totalPages - 1;
    nextBtn.onclick = function() { coopGridPage++; buildPlayGrid(); };
    pagRow.appendChild(prevBtn);
    pagRow.appendChild(label);
    pagRow.appendChild(nextBtn);
    grid.appendChild(pagRow);
  }

  // Bottom bar: options row + go-bar row
  var bottomBar = document.createElement('div');
  bottomBar.className = 'coop-bottom-bar';

  // Options row
  buildOptionsRow(bottomBar);

  // Go bar row (Save / Start / Load)
  var goRow = document.createElement('div');
  goRow.className = 'coop-bottom-row';
  goRow.innerHTML =
    '<button class="play-bar-btn" onclick="openSaveSetlist()"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>Save</button>' +
    '<button class="play-go-btn" onclick="startGame()"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Start</button>' +
    '<button class="play-bar-btn" onclick="openLoadSetlist()"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>Load</button>';
  bottomBar.appendChild(goRow);
  grid.appendChild(bottomBar);
}

// ── Option Picker Popup ──
var expPickerTab = 'stage';
var selectedExpItems = {
  stage: 'Main Stage',
  gem: 'Ruby',
  highway: 'Neon Highway',
  skin: 'Default',
  skybox: 'Sunset'
};

function openOptionPicker(type) {
  var overlay = document.getElementById('option-picker-overlay');
  var panel = document.getElementById('option-picker-panel');
  overlay.style.display = 'flex';
  panel.innerHTML = '';

  var title = document.createElement('div');
  title.className = 'option-picker-title';

  if (type === 'instrument') {
    title.textContent = 'Select Instrument';
    panel.appendChild(title);
    buildSimplePickerChoices(panel, 'instrument', [
      {id: 'guitar', label: 'Guitar', desc: 'Lead and rhythm guitar'},
      {id: 'drums', label: 'Drums', desc: 'Full drum kit'},
      {id: 'vocals', label: 'Vocals', desc: 'Sing along'},
      {id: 'bass', label: 'Bass', desc: 'Hold down the groove'}
    ], selectedInstrument);
  } else if (type === 'difficulty') {
    title.textContent = 'Select Difficulty';
    panel.appendChild(title);
    buildSimplePickerChoices(panel, 'difficulty', [
      {id: 'easy', label: 'Easy', desc: 'Relaxed pace, fewer notes'},
      {id: 'normal', label: 'Normal', desc: 'A balanced challenge'},
      {id: 'hard', label: 'Hard', desc: 'Fast patterns, more notes'},
      {id: 'expert', label: 'Expert', desc: 'Full song, no mercy'}
    ], selectedDifficulty);
  } else if (type === 'experience') {
    title.textContent = 'Experience';
    panel.appendChild(title);
    buildExpPickerTabs(panel);
    buildExpPickerContent(panel);
  }
}

function buildSimplePickerChoices(panel, type, items, currentVal) {
  var choices = document.createElement('div');
  choices.className = 'option-picker-choices';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var choice = document.createElement('div');
    choice.className = 'option-picker-choice' + (item.id === currentVal ? ' selected' : '');
    choice.innerHTML =
      '<div style="flex:1">' +
        '<div class="option-picker-choice-label">' + item.label + '</div>' +
        '<div class="option-picker-choice-desc">' + item.desc + '</div>' +
      '</div>';
    choice.onclick = (function(t, it) {
      return function() {
        if (t === 'instrument') {
          selectedInstrument = it.id;
          sendToUnity('instrument', it.id);
        } else if (t === 'difficulty') {
          selectedDifficulty = it.id;
          sendToUnity('difficulty', it.id);
        }
        closeOptionPicker();
        buildPlayGrid();
      };
    })(type, item);
    choices.appendChild(choice);
  }
  panel.appendChild(choices);
}

function buildExpPickerTabs(panel) {
  var tabsDef = [
    {id: 'stage', label: 'Stage'},
    {id: 'gem', label: 'Gem'},
    {id: 'highway', label: 'Highway'},
    {id: 'skin', label: 'Inst. Skin'},
    {id: 'skybox', label: 'Skybox'}
  ];
  var tabsRow = document.createElement('div');
  tabsRow.className = 'option-picker-tabs';
  tabsRow.id = 'exp-picker-tabs';
  for (var i = 0; i < tabsDef.length; i++) {
    var t = tabsDef[i];
    var btn = document.createElement('button');
    btn.className = 'option-picker-tab' + (t.id === expPickerTab ? ' active' : '');
    btn.textContent = t.label;
    btn.onclick = (function(tabId) {
      return function() {
        expPickerTab = tabId;
        // Rebuild tabs + content
        var p = document.getElementById('option-picker-panel');
        var oldTabs = document.getElementById('exp-picker-tabs');
        var oldContent = document.getElementById('exp-picker-content');
        if (oldTabs) p.removeChild(oldTabs);
        if (oldContent) p.removeChild(oldContent);
        buildExpPickerTabs(p);
        buildExpPickerContent(p);
      };
    })(t.id);
    tabsRow.appendChild(btn);
  }
  panel.appendChild(tabsRow);
}

function buildExpPickerContent(panel) {
  var allExpItems = {
    stage: [
      {id: 'Main Stage', label: 'Main Stage', icon: '&#127926;'},
      {id: 'Neon Arena', label: 'Neon Arena', icon: '&#127760;'},
      {id: 'Desert Stage', label: 'Desert Stage', icon: '&#127964;'},
      {id: 'Beach Party', label: 'Beach Party', icon: '&#127958;'},
      {id: 'Crystal Platform', label: 'Crystal Platform', icon: '&#128142;'},
      {id: 'Fire Stage', label: 'Fire Stage', icon: '&#128293;'},
      {id: 'Ice Rink', label: 'Ice Rink', icon: '&#10052;'},
      {id: 'Cloud Stage', label: 'Cloud Stage', icon: '&#9729;'},
      {id: 'Club Basement', label: 'Club Basement', icon: '&#127911;'}
    ],
    gem: [
      {id: 'Ruby', label: 'Ruby', icon: '&#128308;'},
      {id: 'Sapphire', label: 'Sapphire', icon: '&#128309;'},
      {id: 'Emerald', label: 'Emerald', icon: '&#128994;'},
      {id: 'Diamond', label: 'Diamond', icon: '&#128142;'},
      {id: 'Topaz', label: 'Topaz', icon: '&#128993;'},
      {id: 'Amethyst', label: 'Amethyst', icon: '&#128995;'}
    ],
    highway: [
      {id: 'Neon Highway', label: 'Neon Highway', icon: '&#128739;'},
      {id: 'Rainbow Road', label: 'Rainbow Road', icon: '&#127752;'},
      {id: 'Dark Highway', label: 'Dark Highway', icon: '&#127753;'},
      {id: 'Lava Highway', label: 'Lava Highway', icon: '&#128293;'},
      {id: 'Crystal Road', label: 'Crystal Road', icon: '&#128142;'},
      {id: 'Starlight Path', label: 'Starlight Path', icon: '&#11088;'}
    ],
    skin: [
      {id: 'Default', label: 'Default', icon: '&#127928;'},
      {id: 'Gold Finish', label: 'Gold Finish', icon: '&#129689;'},
      {id: 'Neon Glow', label: 'Neon Glow', icon: '&#128161;'},
      {id: 'Chrome', label: 'Chrome', icon: '&#129717;'},
      {id: 'Flame Wrap', label: 'Flame Wrap', icon: '&#128293;'},
      {id: 'Holographic', label: 'Holographic', icon: '&#127752;'}
    ],
    skybox: [
      {id: 'Sunset', label: 'Sunset', icon: '&#127748;'},
      {id: 'Galaxy', label: 'Galaxy', icon: '&#127756;'},
      {id: 'Northern Lights', label: 'Northern Lights', icon: '&#127776;'},
      {id: 'Storm', label: 'Storm', icon: '&#9889;'},
      {id: 'Deep Space', label: 'Deep Space', icon: '&#128640;'},
      {id: 'Tropical', label: 'Tropical', icon: '&#127796;'}
    ]
  };

  var items = allExpItems[expPickerTab] || [];
  var currentVal = selectedExpItems[expPickerTab] || '';

  var grid = document.createElement('div');
  grid.className = 'option-picker-grid';
  grid.id = 'exp-picker-content';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var choice = document.createElement('div');
    choice.className = 'option-picker-choice' + (item.id === currentVal ? ' selected' : '');
    choice.style.flexDirection = 'column';
    choice.style.alignItems = 'center';
    choice.style.justifyContent = 'center';
    choice.style.textAlign = 'center';
    choice.style.padding = '24px 16px';
    choice.innerHTML =
      '<div style="font-size:48px;line-height:1;margin-bottom:8px">' + item.icon + '</div>' +
      '<div class="option-picker-choice-label" style="font-size:22px">' + item.label + '</div>';
    choice.onclick = (function(it) {
      return function() {
        selectedExpItems[expPickerTab] = it.id;
        selectedExperience = it.id;
        sendToUnity('experience', {tab: expPickerTab, id: it.id});
        closeOptionPicker();
        buildPlayGrid();
      };
    })(item);
    grid.appendChild(choice);
  }
  panel.appendChild(grid);
}

function closeOptionPicker() {
  document.getElementById('option-picker-overlay').style.display = 'none';
  var panel = document.getElementById('option-picker-panel');
  panel.style.width = '';
  panel.style.maxHeight = '';
}

function generateDefaultSetlists() {
  var names = ['Rock Classics', 'Chill Vibes', 'Party Mix', 'Throwbacks', 'Hot Hits'];
  var shuffled = allSongs.slice();
  for (var n = 0; n < 5; n++) {
    // Shuffle
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    var count = 3 + Math.floor(Math.random() * 4); // 3-6 songs
    var picked = shuffled.slice(0, count).map(function(s) {
      return {title: s.title, artist: s.artist, file: s.file, duration: s.duration};
    });
    savedSetlists.push({name: names[n], songs: picked});
  }
  setlistCounter = 6;
}

// ── Vault Grid ──────────────────────────────────────────
var vaultItems = [
  {name:'Neon Arena',      cat:'Spaces',      file:'vault/001.jpg'},
  {name:'Desert Stage',    cat:'Spaces',      file:'vault/002.jpg'},
  {name:'Club Basement',   cat:'Spaces',      file:'vault/003.jpg'},
  {name:'Beach Party',     cat:'Spaces',      file:'vault/004.jpg'},
  {name:'Crystal Platform',cat:'Stages',      file:'vault/005.jpg'},
  {name:'Fire Stage',      cat:'Stages',      file:'vault/006.jpg'},
  {name:'Ice Rink',        cat:'Stages',      file:'vault/007.jpg'},
  {name:'Cloud Stage',     cat:'Stages',      file:'vault/008.jpg'},
  {name:'Avatar',          cat:'Avatar',      file:'vault/009.jpg'},
  {name:'Electric Guitar', cat:'Instruments', file:'vault/010.jpg'},
  {name:'Synthesizer',     cat:'Instruments', file:'vault/011.jpg'},
  {name:'Drum Kit',        cat:'Instruments', file:'vault/012.jpg'},
  {name:'Gold Mic',        cat:'Instruments', file:'vault/013.jpg'},
  {name:'Ruby',            cat:'Gem',         file:'vault/014.jpg'},
  {name:'Sapphire',        cat:'Gem',         file:'vault/015.jpg'},
  {name:'Emerald',         cat:'Gem',         file:'vault/016.jpg'},
  {name:'Diamond',         cat:'Gem',         file:'vault/017.jpg'},
  {name:'Neon Highway',    cat:'Highway',     file:'vault/018.jpg'},
  {name:'Rainbow Road',    cat:'Highway',     file:'vault/019.jpg'},
  {name:'Dark Highway',    cat:'Highway',     file:'vault/020.jpg'},
  {name:'Lava Highway',    cat:'Highway',     file:'vault/021.jpg'},
  {name:'Sunset',          cat:'Skybox',      file:'vault/022.jpg'},
  {name:'Galaxy',          cat:'Skybox',      file:'vault/023.jpg'},
  {name:'Northern Lights', cat:'Skybox',      file:'vault/024.jpg'},
  {name:'Storm',           cat:'Skybox',      file:'vault/025.jpg'}
];

function buildVaultGrid() {
  var grid = document.getElementById('vault-grid');
  grid.innerHTML = '';
  // Pick 9 items for 3x3 grid
  var shown = [];
  var seenCats = {};
  for (var i = 0; i < vaultItems.length && shown.length < 9; i++) {
    var v = vaultItems[i];
    if (!seenCats[v.cat]) {
      seenCats[v.cat] = true;
      shown.push(v);
    }
  }
  // Fill remaining slots if less than 9 categories
  for (var i = 0; i < vaultItems.length && shown.length < 9; i++) {
    var found = false;
    for (var j = 0; j < shown.length; j++) { if (shown[j].name === vaultItems[i].name) { found = true; break; } }
    if (!found) shown.push(vaultItems[i]);
  }
  for (var i = 0; i < shown.length; i++) {
    var v = shown[i];
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + v.file + ') center center / cover no-repeat #1a1a1a';
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(item) {
      return function() { sendToUnity('selectVaultItem', {name: item.name, cat: item.cat}); };
    })(v);
    tile.innerHTML =
      '<div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 100%);">' +
        '<div style="font-size:32px;font-weight:800;color:#ffffff;">' + v.name + '</div>' +
        '<div style="font-size:20px;color:rgba(255,255,255,0.7);">' + v.cat + '</div>' +
      '</div>';
    grid.appendChild(tile);
  }

  // ── Creator grid ──
  var creatorGrid = document.getElementById('vault-creator-grid');
  creatorGrid.innerHTML = '';
  var shapes = [
    { name: 'Portrait', desc: '3:4 ratio', cssClass: 'portrait' },
    { name: 'Wide', desc: '16:9 ratio', cssClass: 'wide' },
    { name: 'Square', desc: '1:1 ratio', cssClass: 'square' },
    { name: 'Circle', desc: 'Round crop', cssClass: 'circle' }
  ];
  var plusSvg = '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
  for (var i = 0; i < shapes.length; i++) {
    var s = shapes[i];
    var tile = document.createElement('div');
    tile.className = 'creator-tile';
    tile.onclick = (function(shape) {
      return function() { sendToUnity('createAsset', shape.name); };
    })(s);
    tile.innerHTML =
      '<div class="creator-tile-shape ' + s.cssClass + '">' + plusSvg + '</div>' +
      '<div class="creator-tile-label">' + s.name + '</div>' +
      '<div class="creator-tile-desc">' + s.desc + '</div>';
    creatorGrid.appendChild(tile);
  }
}

// ── Creator ──────────────────────────────────────────────

var creatorPhotosPage = 0;
var creatorArtPage = 0;
var CREATOR_PER_PAGE = 9;
var creatorSelectedShape = 'wide';
var creatorSelectedWords = {};

var creatorPhotos = [
  'photos/carkey.jfif', 'photos/jumping.jpg', 'photos/doublebed.webp',
  'photos/steak.jfif', 'photos/guitar.jpg', 'photos/houseplant.jpg'
];

var creatorArtLogos = [
  'bandlogos/Gemini_Generated_Image_4aa5a04aa5a04aa5.jpg',
  'bandlogos/Gemini_Generated_Image_7nxmb87nxmb87nxm.jpg',
  'bandlogos/Gemini_Generated_Image_8etd7p8etd7p8etd.jpg',
  'bandlogos/Gemini_Generated_Image_ds7ykeds7ykeds7y.jpg',
  'bandlogos/Gemini_Generated_Image_dyvmgcdyvmgcdyvm.jpg',
  'bandlogos/Gemini_Generated_Image_g3jblgg3jblgg3jb.jpg',
  'bandlogos/Gemini_Generated_Image_wzsyntwzsyntwzsy.jpg',
  'art/002.jpg', 'art/013.jpg', 'art/024.jpg', 'art/035.jpg',
  'art/046.jpg', 'art/057.jpg', 'art/068.jpg', 'art/079.jpg',
  'art/090.jpg', 'art/003.jpg', 'art/014.jpg', 'art/025.jpg',
  'art/036.jpg'
];

var creatorWords = [
  {label:'Rock', bg:'#4a2020'}, {label:'Pop', bg:'#4a204a'}, {label:'Hip-Hop', bg:'#2a2a40'},
  {label:'Jazz', bg:'#3a3020'}, {label:'Electronic', bg:'#103040'}, {label:'Metal', bg:'#2a2a2a'},
  {label:'Punk', bg:'#4a2040'}, {label:'Classical', bg:'#2a3020'}, {label:'R&B', bg:'#302040'},
  {label:'Country', bg:'#3a3020'}, {label:'Reggae', bg:'#1a3a1a'}, {label:'Blues', bg:'#1a2a4a'},
  {label:'Neon', bg:'#0a3a3a'}, {label:'Grunge', bg:'#2a2020'}, {label:'Retro', bg:'#3a2a10'},
  {label:'Minimalist', bg:'#2a2a2a'}, {label:'Abstract', bg:'#30204a'}, {label:'Psychedelic', bg:'#2a1040'},
  {label:'Graffiti', bg:'#20302a'}, {label:'Pixel Art', bg:'#1a2a3a'}
];

function switchCreatorTab(tab) {
  var tabs = document.getElementById('creator-tabs').children;
  var names = ['photos', 'art', 'songs'];
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].className = 'play-mode-tab' + (names[i] === tab ? ' active' : '');
    document.getElementById('creator-tab-' + names[i]).style.display = names[i] === tab ? 'flex' : 'none';
  }
}

function buildCreatorGrids() {
  buildCreatorPhotosGrid();
  buildCreatorArtGrid();
}

function buildCreatorPhotosGrid() {
  var grid = document.getElementById('creator-photos-grid');
  grid.innerHTML = '';
  var totalPages = Math.max(1, Math.ceil((creatorPhotos.length + 1) / CREATOR_PER_PAGE));
  if (creatorPhotosPage >= totalPages) creatorPhotosPage = totalPages - 1;
  var start = creatorPhotosPage * CREATOR_PER_PAGE;

  // First tile on first page is the + button
  var offset = 0;
  if (creatorPhotosPage === 0) {
    var addTile = document.createElement('div');
    addTile.className = 'space-tile';
    addTile.style.background = '#1a1a1a';
    addTile.style.display = 'flex';
    addTile.style.flexDirection = 'column';
    addTile.style.alignItems = 'center';
    addTile.style.justifyContent = 'center';
    addTile.style.gap = '12px';
    addTile.style.cursor = 'pointer';
    addTile.style.border = '2px dashed #444444';
    addTile.onclick = function() { openCreatorCamera(); };
    addTile.innerHTML = '<div style="font-size:64px;color:#ffffff">+</div><div style="font-size:24px;font-weight:700;color:#888888">Take Photo</div>';
    grid.appendChild(addTile);
    offset = 1;
    start = 0;
  } else {
    start = creatorPhotosPage * CREATOR_PER_PAGE - 1;
  }

  var count = CREATOR_PER_PAGE - offset;
  for (var i = start; i < start + count && i < creatorPhotos.length; i++) {
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + creatorPhotos[i] + ') center center / cover no-repeat #1a1a1a';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(src) {
      return function() { openPhotoPreview(src); };
    })(creatorPhotos[i]);
    grid.appendChild(tile);
  }

  // Pagination
  var pagDiv = document.getElementById('creator-photos-pagination');
  pagDiv.innerHTML = '';
  if (totalPages > 1) {
    var prevBtn = document.createElement('button');
    prevBtn.className = 'play-grid-nav-btn';
    prevBtn.innerHTML = '&#9664;';
    prevBtn.disabled = creatorPhotosPage === 0;
    prevBtn.onclick = function() { creatorPhotosPage--; buildCreatorPhotosGrid(); };
    var label = document.createElement('div');
    label.style.cssText = 'font-size:24px;font-weight:700;color:#ffffff';
    label.textContent = (creatorPhotosPage + 1) + ' / ' + totalPages;
    var nextBtn = document.createElement('button');
    nextBtn.className = 'play-grid-nav-btn';
    nextBtn.innerHTML = '&#9654;';
    nextBtn.disabled = creatorPhotosPage >= totalPages - 1;
    nextBtn.onclick = function() { creatorPhotosPage++; buildCreatorPhotosGrid(); };
    pagDiv.appendChild(prevBtn);
    pagDiv.appendChild(label);
    pagDiv.appendChild(nextBtn);
  }
}

function buildCreatorArtGrid() {
  var grid = document.getElementById('creator-art-grid');
  grid.innerHTML = '';
  var totalPages = Math.max(1, Math.ceil((creatorArtLogos.length + 1) / CREATOR_PER_PAGE));
  if (creatorArtPage >= totalPages) creatorArtPage = totalPages - 1;

  var offset = 0;
  var start;
  if (creatorArtPage === 0) {
    var addTile = document.createElement('div');
    addTile.className = 'space-tile';
    addTile.style.background = '#1a1a1a';
    addTile.style.display = 'flex';
    addTile.style.flexDirection = 'column';
    addTile.style.alignItems = 'center';
    addTile.style.justifyContent = 'center';
    addTile.style.gap = '12px';
    addTile.style.cursor = 'pointer';
    addTile.style.border = '2px dashed #444444';
    addTile.onclick = function() { openArtPhotoPicker(); };
    addTile.innerHTML = '<div style="font-size:64px;color:#ffffff">+</div><div style="font-size:24px;font-weight:700;color:#888888">Create Art</div>';
    grid.appendChild(addTile);
    offset = 1;
    start = 0;
  } else {
    start = creatorArtPage * CREATOR_PER_PAGE - 1;
  }

  var count = CREATOR_PER_PAGE - offset;
  for (var i = start; i < start + count && i < creatorArtLogos.length; i++) {
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + creatorArtLogos[i] + ') center center / cover no-repeat #1a1a1a';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(src) {
      return function() { openArtPreview(src); };
    })(creatorArtLogos[i]);
    grid.appendChild(tile);
  }

  var pagDiv = document.getElementById('creator-art-pagination');
  pagDiv.innerHTML = '';
  if (totalPages > 1) {
    var prevBtn = document.createElement('button');
    prevBtn.className = 'play-grid-nav-btn';
    prevBtn.innerHTML = '&#9664;';
    prevBtn.disabled = creatorArtPage === 0;
    prevBtn.onclick = function() { creatorArtPage--; buildCreatorArtGrid(); };
    var label = document.createElement('div');
    label.style.cssText = 'font-size:24px;font-weight:700;color:#ffffff';
    label.textContent = (creatorArtPage + 1) + ' / ' + totalPages;
    var nextBtn = document.createElement('button');
    nextBtn.className = 'play-grid-nav-btn';
    nextBtn.innerHTML = '&#9654;';
    nextBtn.disabled = creatorArtPage >= totalPages - 1;
    nextBtn.onclick = function() { creatorArtPage++; buildCreatorArtGrid(); };
    pagDiv.appendChild(prevBtn);
    pagDiv.appendChild(label);
    pagDiv.appendChild(nextBtn);
  }
}

function openCreatorCamera() {
  if (isDemoMode()) {
    document.getElementById('creator-camera-screen').className = 'creator-screen active';
  } else {
    // Normal mode: skip camera screen, add random photo directly
    takeCreatorPhoto();
  }
}

function closeCreatorScreen() {
  var screens = document.querySelectorAll('.creator-screen');
  for (var i = 0; i < screens.length; i++) screens[i].className = 'creator-screen';
}

var creatorCameraReturnTo = 'photos';

var stockPhotos = ['photos/carkey.jfif','photos/jumping.jpg','photos/doublebed.webp','photos/steak.jfif','photos/guitar.jpg','photos/houseplant.jpg'];

function takeCreatorPhoto() {
  closeCreatorScreen();
  // Simulate adding a new photo at position 0
  creatorPhotos.unshift(stockPhotos[Math.floor(Math.random() * stockPhotos.length)]);
  sendToUnity('creatorPhoto', {});
  if (creatorCameraReturnTo === 'artpicker') {
    openArtPhotoPicker();
  } else {
    buildCreatorPhotosGrid();
  }
}

function openArtPhotoPicker() {
  var screen = document.getElementById('creator-art-pick-screen');
  screen.className = 'creator-screen active';
  var grid = document.getElementById('creator-art-photo-grid');
  grid.innerHTML = '';

  // + New tile
  var addTile = document.createElement('div');
  addTile.className = 'space-tile';
  addTile.style.background = '#1a1a1a';
  addTile.style.display = 'flex';
  addTile.style.flexDirection = 'column';
  addTile.style.alignItems = 'center';
  addTile.style.justifyContent = 'center';
  addTile.style.gap = '12px';
  addTile.style.cursor = 'pointer';
  addTile.style.border = '2px dashed #444444';
  addTile.onclick = function() { creatorCameraReturnTo = 'artpicker'; closeCreatorScreen(); openCreatorCamera(); };
  addTile.innerHTML = '<div style="font-size:64px;color:#ffffff">+</div><div style="font-size:24px;font-weight:700;color:#888888">New Photo</div>';
  grid.appendChild(addTile);

  for (var i = 0; i < Math.min(8, creatorPhotos.length); i++) {
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + creatorPhotos[i] + ') center center / cover no-repeat #1a1a1a';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(photo) {
      return function() { openArtConfig(photo); };
    })(creatorPhotos[i]);
    grid.appendChild(tile);
  }
}

function usePhotoForArt() {
  if (creatorPreviewSrc) {
    openArtConfig(creatorPreviewSrc);
  }
}

function openArtConfig(photoSrc) {
  closeCreatorScreen();
  var screen = document.getElementById('creator-art-config-screen');
  screen.className = 'creator-screen active';

  // Shapes
  var shapesGrid = document.getElementById('creator-art-shapes');
  shapesGrid.innerHTML = '';
  var shapes = [
    {id: 'wide', label: 'Wide', cssClass: 'wide', uses: 'Stage Backdrops, Social Area Frames'},
    {id: 'portrait', label: 'Portrait', cssClass: 'portrait', uses: 'Highways, Stage Backdrops, Social Area Frames'},
    {id: 'square', label: 'Square', cssClass: 'square', uses: 'Album Art, Profile Pics, Group Logos'},
    {id: 'circle', label: 'Circle', cssClass: 'circle', uses: 'Avatars, Gems, Profile Frames'}
  ];
  for (var i = 0; i < shapes.length; i++) {
    var s = shapes[i];
    var tile = document.createElement('div');
    tile.className = 'creator-art-shape-tile' + (s.id === creatorSelectedShape ? ' selected' : '');
    tile.innerHTML =
      '<div class="creator-tile-shape ' + s.cssClass + '"></div>' +
      '<div class="creator-tile-label">' + s.label + '</div>' +
      '<div style="font-size:24px;color:#888888;text-align:center;margin-top:8px">Used in: ' + s.uses + '</div>';
    tile.onclick = (function(shape) {
      return function() {
        creatorSelectedShape = shape.id;
        openArtConfig(photoSrc);
      };
    })(s);
    shapesGrid.appendChild(tile);
  }

  // Word cloud
  var cloud = document.getElementById('creator-word-cloud');
  cloud.innerHTML = '';
  for (var i = 0; i < creatorWords.length; i++) {
    var w = creatorWords[i];
    var word = document.createElement('div');
    word.className = 'creator-word' + (creatorSelectedWords[w.label] ? ' active' : '');
    word.textContent = w.label;
    word.style.background = w.bg;
    word.onclick = (function(wrd) {
      return function() {
        creatorSelectedWords[wrd.label] = !creatorSelectedWords[wrd.label];
        openArtConfig(photoSrc);
      };
    })(w);
    cloud.appendChild(word);
  }

  document.getElementById('creator-prompt-input').value = '';
}

function createArt() {
  closeCreatorScreen();
  var screen = document.getElementById('creator-art-results-screen');
  screen.className = 'creator-screen active';

  var grid = document.getElementById('creator-results-grid');
  grid.innerHTML = '';
  // Show loading spinners first
  var resultImages = ['art/003.jpg','art/015.jpg','art/027.jpg','art/039.jpg'];
  for (var i = 0; i < 4; i++) {
    var tile = document.createElement('div');
    tile.className = 'creator-result-tile';
    tile.id = 'cr-tile-' + i;
    tile.innerHTML =
      '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:2;background:#1a1a1a" id="cr-loading-' + i + '">' +
        '<div style="width:60px;height:60px;border:5px solid #333;border-top-color:#ffffff;border-radius:50%;animation:spin 1s linear infinite"></div>' +
        '<div style="font-size:24px;font-weight:600;color:#888">Generating...</div>' +
      '</div>';
    grid.appendChild(tile);
  }

  // After 5 seconds, reveal the art
  setTimeout(function() {
    for (var j = 0; j < 4; j++) {
      var t = document.getElementById('cr-tile-' + j);
      if (!t) continue;
      var loading = document.getElementById('cr-loading-' + j);
      if (loading) loading.parentNode.removeChild(loading);
      t.innerHTML =
        '<img src="' + resultImages[j] + '" alt="">' +
        '<div class="creator-result-check" id="cr-check-' + j + '">&#10003;</div>';
      t.onclick = (function(idx) {
        return function() {
          var check = document.getElementById('cr-check-' + idx);
          if (check.className.indexOf('checked') !== -1) {
            check.className = 'creator-result-check';
          } else {
            check.className = 'creator-result-check checked';
          }
        };
      })(j);
    }
  }, 5000);
}

function saveCreatorResults() {
  closeCreatorScreen();
  sendToUnity('creatorSave', {});
}

var creatorPreviewSrc = '';
var creatorPreviewType = 'art';

var creatorPreviewIndex = 0;

function openArtPreview(src) {
  creatorPreviewSrc = src;
  creatorPreviewType = 'art';
  for (var i = 0; i < creatorArtLogos.length; i++) {
    if (creatorArtLogos[i] === src) { creatorPreviewIndex = i; break; }
  }
  document.getElementById('creator-art-preview-img').src = src;
  document.getElementById('creator-art-preview-screen').className = 'creator-screen active';
}

function openPhotoPreview(src) {
  creatorPreviewSrc = src;
  creatorPreviewType = 'photo';
  for (var i = 0; i < creatorPhotos.length; i++) {
    if (creatorPhotos[i] === src) { creatorPreviewIndex = i; break; }
  }
  document.getElementById('creator-art-preview-img').src = src;
  document.getElementById('creator-art-preview-screen').className = 'creator-screen active';
}

function previewNav(dir) {
  var list = creatorPreviewType === 'photo' ? creatorPhotos : creatorArtLogos;
  if (!list.length) return;
  creatorPreviewIndex = creatorPreviewIndex + dir;
  if (creatorPreviewIndex < 0) creatorPreviewIndex = list.length - 1;
  if (creatorPreviewIndex >= list.length) creatorPreviewIndex = 0;
  creatorPreviewSrc = list[creatorPreviewIndex];
  document.getElementById('creator-art-preview-img').src = creatorPreviewSrc;
}

function deleteCreatorArt() {
  if (creatorPreviewType === 'photo') {
    for (var i = 0; i < creatorPhotos.length; i++) {
      if (creatorPhotos[i] === creatorPreviewSrc) {
        creatorPhotos.splice(i, 1);
        break;
      }
    }
    closeCreatorScreen();
    buildCreatorPhotosGrid();
    sendToUnity('creatorDeletePhoto', {src: creatorPreviewSrc});
  } else {
    for (var i = 0; i < creatorArtLogos.length; i++) {
      if (creatorArtLogos[i] === creatorPreviewSrc) {
        creatorArtLogos.splice(i, 1);
        break;
      }
    }
    closeCreatorScreen();
    buildCreatorArtGrid();
    sendToUnity('creatorDeleteArt', {src: creatorPreviewSrc});
  }
}

var creatorSelectedName = 'Rael';
var creatorNameType = 'solo';

function openCreatorNamePicker() {
  var overlay = document.getElementById('option-picker-overlay');
  var panel = document.getElementById('option-picker-panel');
  overlay.style.display = 'flex';
  panel.innerHTML = '';
  panel.style.width = '1700px';
  panel.style.maxHeight = '1600px';

  var title = document.createElement('div');
  title.className = 'option-picker-title';
  title.textContent = 'Create for';
  panel.appendChild(title);

  var grid = document.createElement('div');
  grid.className = 'spaces-grid';
  grid.style.width = '100%';
  grid.style.height = '1200px';

  var profileName = 'Rael';
  var profileEl = document.querySelector('.topbar-username');
  if (profileEl) profileName = profileEl.textContent;
  var profileAvatar = 'rael_new.png';
  var profileImg = document.querySelector('.profile-avatar img');
  if (profileImg) profileAvatar = profileImg.src;

  var currentId = creatorNameType + ':' + creatorSelectedName;

  var groups = window._backendGroups || [
    { name: 'Jamsesh Hunters', file: 'bandlogos/Gemini_Generated_Image_4aa5a04aa5a04aa5.jpg' },
    { name: 'Neon Phantoms', file: 'bandlogos/Gemini_Generated_Image_7nxmb87nxmb87nxm.jpg' },
    { name: 'Electric Dreams', file: 'bandlogos/Gemini_Generated_Image_8etd7p8etd7p8etd.jpg' },
    { name: 'Rhythm Rebels', file: 'bandlogos/Gemini_Generated_Image_ds7ykeds7ykeds7y.jpg' },
    { name: 'Sonic Wolves', file: 'bandlogos/Gemini_Generated_Image_dyvmgcdyvmgcdyvm.jpg' },
    { name: 'Bass Bandits', file: 'bandlogos/Gemini_Generated_Image_g3jblgg3jblgg3jb.jpg' },
    { name: 'Velvet Crush', file: 'bandlogos/Gemini_Generated_Image_wzsyntwzsyntwzsy.jpg' }
  ];

  // Build tiles: Solo + groups + None = up to 9
  var items = [];
  items.push({ name: profileName, type: 'solo', img: profileAvatar, desc: 'Solo' });
  for (var i = 0; i < groups.length; i++) {
    items.push({ name: groups[i].name, type: 'group', img: groups[i].file, desc: 'Group' });
  }
  items.push({ name: 'None', type: 'none', img: '', desc: 'No name overlay' });

  for (var t = 0; t < items.length; t++) {
    var item = items[t];
    var itemId = item.type + ':' + item.name;
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.cursor = 'pointer';
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';
    tile.style.display = 'flex';
    tile.style.flexDirection = 'column';
    tile.style.alignItems = 'center';
    tile.style.justifyContent = 'flex-end';
    tile.style.padding = '20px';
    if (item.img) {
      tile.style.background = 'url(' + item.img + ') center center / cover no-repeat #1a1a1a';
    } else {
      tile.style.background = '#2a2a2a';
    }
    if (itemId === currentId || (item.type === 'none' && creatorNameType === 'none')) {
      tile.style.boxShadow = '0 0 0 3px #ffffff, 0 0 12px rgba(255,255,255,0.4)';
    }
    tile.innerHTML =
      '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.8) 100%);z-index:1"></div>' +
      '<div style="position:relative;z-index:2;text-align:center">' +
        '<div style="font-size:28px;font-weight:800;color:#ffffff">' + item.name + '</div>' +
        '<div style="font-size:18px;color:#aaaaaa">' + item.desc + '</div>' +
      '</div>';
    tile.onclick = (function(it) {
      return function() {
        creatorSelectedName = it.type === 'none' ? '' : it.name;
        creatorNameType = it.type;
        updateCreatorNameBtn();
        closeOptionPicker();
      };
    })(item);
    grid.appendChild(tile);
  }

  panel.appendChild(grid);
}

function updateCreatorNameBtn() {
  var label = document.getElementById('creator-name-label');
  if (!label) return;
  if (creatorNameType === 'none') {
    label.textContent = 'No name selected';
  } else if (creatorNameType === 'group') {
    label.textContent = 'Group - ' + creatorSelectedName;
  } else {
    label.textContent = 'Solo - ' + creatorSelectedName;
  }
}

// ── Store ──────────────────────────────────────────────

function switchStoreTab(tab) {
  var tabs = document.getElementById('store-tabs').children;
  var names = ['songs', 'packs', 'items', 'vault'];
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].className = 'play-mode-tab' + (names[i] === tab ? ' active' : '');
    document.getElementById('store-tab-' + names[i]).style.display = names[i] === tab ? 'flex' : 'none';
  }
}

function buildStoreGrid() {
  // ── Songs tab: 9 random songs with $2.99 price ──
  var songsGrid = document.getElementById('store-songs-grid');
  songsGrid.innerHTML = '';
  var shuffled = allSongs.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
  }
  var storeSongs = shuffled.slice(0, 9);
  for (var i = 0; i < storeSongs.length; i++) {
    var s = storeSongs[i];
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + (s.file || 'art/001.jpg') + ') center center / cover no-repeat #1a1a1a';
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(song) {
      return function() { sendToUnity('storeBuySong', {title: song.title, artist: song.artist}); };
    })(s);
    tile.innerHTML =
      '<div class="store-price">$2.99</div>' +
      '<div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 100%);">' +
        '<div style="font-size:32px;font-weight:800;color:#ffffff;">' + (s.title || 'Unknown') + '</div>' +
        '<div style="font-size:20px;color:rgba(255,255,255,0.7);">' + (s.artist || 'Unknown') + '</div>' +
      '</div>';
    songsGrid.appendChild(tile);
  }

  // ── Packs tab: 6 random packs + 3 empty slots ──
  var packsGrid = document.getElementById('store-packs-grid');
  packsGrid.innerHTML = '';
  var packData = [
    {name:'Starter Bundle', picks:500, items:['Neon Arena','Electric Guitar'], price:'$4.99', color:'#1a3a5c'},
    {name:'Rock Legend Pack', picks:1200, items:['Fire Stage','Gold Mic'], price:'$9.99', color:'#4a1a1a'},
    {name:'Party Pack', picks:800, items:['Beach Party','Drum Kit'], price:'$7.99', color:'#1a4a2a'},
    {name:'Premium Bundle', picks:2500, items:['Diamond','Rainbow Road'], price:'$14.99', color:'#3a1a4a'},
    {name:'Galaxy Pack', picks:1000, items:['Galaxy Skybox','Synthesizer'], price:'$8.99', color:'#1a2a4a'},
    {name:'Seasonal Pass', picks:3000, items:['Northern Lights','Cloud Stage'], price:'$19.99', color:'#4a3a1a'}
  ];
  for (var i = 0; i < 9; i++) {
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';
    if (i < packData.length) {
      var p = packData[i];
      tile.style.background = p.color;
      tile.style.cursor = 'pointer';
      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.padding = '24px';
      tile.style.gap = '12px';
      tile.onclick = (function(pack) {
        return function() { sendToUnity('storeBuyPack', {name: pack.name}); };
      })(p);
      tile.innerHTML =
        '<div class="store-price">' + p.price + '</div>' +
        '<div style="font-size:64px;line-height:1">&#127873;</div>' +
        '<div style="font-size:32px;font-weight:800;color:#ffffff;text-align:center">' + p.name + '</div>' +
        '<div style="font-size:24px;color:#ffffff;text-align:center">' + p.picks + ' Picks</div>' +
        '<div style="font-size:20px;color:rgba(255,255,255,0.6);text-align:center">' + p.items[0] + ' + ' + p.items[1] + '</div>';
    } else {
      var unlockDates = ['Unlocks on 9/28', 'Unlocks on 10/15', 'Unlocks on 11/1'];
      tile.style.background = '#1a1a1a';
      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.gap = '12px';
      tile.innerHTML =
        '<div style="font-size:48px;line-height:1">&#128274;</div>' +
        '<div style="font-size:28px;font-weight:700;color:#ffffff">' + unlockDates[i - 6] + '</div>';
    }
    packsGrid.appendChild(tile);
  }

  // ── Items tab: category sections ──
  var itemsGrid = document.getElementById('store-items-grid');
  itemsGrid.innerHTML = '';
  var storeCategories = [
    {cat:'Spaces',      icon:'&#127760;', file:'art/010.jpg'},
    {cat:'Stages',      icon:'&#127926;', file:'art/020.jpg'},
    {cat:'Avatar',      icon:'&#128100;', file:'art/030.jpg'},
    {cat:'Instruments', icon:'&#127928;', file:'art/040.jpg'},
    {cat:'Gem',         icon:'&#128142;', file:'art/050.jpg'},
    {cat:'Highway',     icon:'&#128739;', file:'art/060.jpg'},
    {cat:'Skybox',      icon:'&#127748;', file:'art/070.jpg'},
    {cat:'Theme',       icon:'&#127912;', file:'art/080.jpg'},
    {cat:'Frame',       icon:'&#128247;', file:'art/090.jpg'}
  ];
  for (var i = 0; i < storeCategories.length; i++) {
    var c = storeCategories[i];
    var tile = document.createElement('div');
    tile.className = 'space-tile';
    tile.style.background = 'url(' + c.file + ') center center / cover no-repeat #1a1a1a';
    tile.style.position = 'relative';
    tile.style.overflow = 'hidden';
    tile.style.cursor = 'pointer';
    tile.onclick = (function(cat) {
      return function() { sendToUnity('storeCategory', {cat: cat.cat}); };
    })(c);
    tile.innerHTML =
      '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">' +
        '<div style="font-size:64px;line-height:1">' + c.icon + '</div>' +
        '<div style="font-size:36px;font-weight:800;color:#ffffff">' + c.cat + '</div>' +
      '</div>';
    itemsGrid.appendChild(tile);
  }
}

// ── Themes ──────────────────────────────────────────────
var themes = [
  { id: 'wireframe-light', name: 'Wireframe Light', bg: '#fafafa', panel: '#fafafa', tile: '#ebebeb', tileHover: '#e0e0e0', accent: '#000000', cssClass: 'theme-wireframe' },
  { id: 'wireframe-dark',  name: 'Wireframe Dark',  bg: '#000000', panel: '#0a0a0a', tile: '#141414', tileHover: '#1e1e1e', accent: '#ffffff', cssClass: 'theme-wireframe' },
  { id: 'neon-pink',    name: 'Neon Pink',    bg: '#0d0d1a', panel: '#1a1a2e', tile: '#222238', tileHover: '#2c2c44', accent: '#db2777' },
  { id: 'cyber-cyan',   name: 'Cyber Cyan',   bg: '#051a1f', panel: '#0a2a32', tile: '#10343e', tileHover: '#18404c', accent: '#0891b2' },
  { id: 'sunset-blaze', name: 'Sunset Blaze', bg: '#1a0d08', panel: '#2e1a10', tile: '#3a2218', tileHover: '#482c20', accent: '#ea580c' },
  { id: 'light-mode',   name: 'Light Mode',   bg: '#e8e8f0', panel: '#f8f8fc', tile: '#eeeef4', tileHover: '#e2e2ec', accent: '#c0206a' },
  { id: 'rainforest',   name: 'Rainforest',   bg: '#e8e8f0', panel: '#f8f8fc', tile: '#eeeef4', tileHover: '#e2e2ec', accent: '#16a368', bgImage: 'themes/rainforest-bg.jpg' },
  { id: 'dracula',      name: 'Dracula',      bg: '#1e1f29', panel: '#282a36', tile: '#2e3040', tileHover: '#363848', accent: '#ff79c6', locked: true, price: 1000 },
  { id: 'nord',         name: 'Nord',         bg: '#2e3440', panel: '#3b4252', tile: '#434c5e', tileHover: '#4c566a', accent: '#88c0d0', locked: true, price: 1000 },
  { id: 'monokai',      name: 'Monokai',      bg: '#1e1f1c', panel: '#272822', tile: '#30302a', tileHover: '#3a3a32', accent: '#f92672', locked: true, price: 1000 },
  { id: 'gruvbox',      name: 'Gruvbox',      bg: '#1d2021', panel: '#282828', tile: '#323232', tileHover: '#3c3c3c', accent: '#fb4934', locked: true, price: 1000 },
  { id: 'solarized',    name: 'Solarized',    bg: '#002b36', panel: '#073642', tile: '#0e404e', tileHover: '#164a58', accent: '#2aa198', locked: true, price: 1000 },
  { id: 'tokyo-night',  name: 'Tokyo Night',  bg: '#16161e', panel: '#1a1b26', tile: '#222330', tileHover: '#2a2b3a', accent: '#f7768e', locked: true, price: 1000 },
  { id: 'catppuccin',   name: 'Catppuccin',   bg: '#1e1e2e', panel: '#24243e', tile: '#2e2e4a', tileHover: '#383856', accent: '#cba6f7', locked: true, price: 1000 },
  { id: 'rose-pine',    name: 'Rose Pine',    bg: '#191724', panel: '#1f1d2e', tile: '#28263a', tileHover: '#322f46', accent: '#eb6f92', locked: true, price: 1000 },
  { id: 'neon-arcade',  name: 'Neon Arcade',  bg: '#0a0a1a', panel: '#12122a', tile: '#1a1a3e', tileHover: '#242454', accent: '#ff2d78', cssClass: 'theme-arcade' },
  { id: 'hunter',       name: 'Hunter',       bg: '#ede5f5', panel: '#f5f0fc', tile: '#e8dff4', tileHover: '#ddd2ee', accent: '#d946a8', cssClass: 'theme-hunter' },
  { id: 'nebula',       name: 'Nebula',       bg: '#080c1a', panel: '#0e1528', tile: '#162040', tileHover: '#1e2c52', accent: '#7c5bf5', cssClass: 'theme-nebula' },
  { id: 'liquid-glass', name: 'Liquid Glass', bg: '#ffffff', panel: '#f0edf6', tile: '#e8e4f0', tileHover: '#ddd8ea', accent: '#2563eb', cssClass: 'theme-liquid' },
  { id: 'prism',        name: 'Prism',        bg: '#0a0e1a', panel: '#161c2e', tile: '#1c2438', tileHover: '#242e46', accent: '#60a5fa', cssClass: 'theme-prism' }
];

var currentTheme = 'light-mode';
var userCoins = 5000;
var allTilings = [];
var currentLayout = 283;
var unlockedThemes = ['wireframe-light', 'wireframe-dark', 'neon-pink', 'cyber-cyan', 'sunset-blaze', 'light-mode', 'rainforest', 'neon-arcade', 'hunter', 'nebula', 'liquid-glass'];
var pendingPurchaseId = null;

var banners = [
  { id: 'space1', name: 'Space 1', file: 'banners/Space 1.png' },
  { id: 'daisies', name: 'Daisies', file: 'banners/Daisies.png' },
  { id: 'space2', name: 'Space 2', file: 'banners/Space 2.png', locked: true, price: 500 },
  { id: 'gothic1', name: 'Gothic 1', file: 'banners/Gothic 1.png', locked: true, price: 750 },
  { id: 'sully', name: 'Sully', file: 'banners/Sully.png', locked: true, price: 1000 },
  { id: 'cracked-desert', name: 'Cracked Desert', file: 'banners/Cracked Desert.png' },
  { id: 'butterfly', name: 'Butterfly', file: 'banners/Butterfly.png' },
  { id: 'comic', name: 'Comic', file: 'banners/Comic.png', locked: true, price: 500 },
  { id: 'gothic2', name: 'Gothic 2', file: 'banners/Gothic 2.png', locked: true, price: 750 },
  { id: 'swirls', name: 'Swirls', file: 'banners/Swirls.png', locked: true, price: 1000 },
  { id: 'magic', name: 'Magic', file: 'banners/Magic.png', locked: true, price: 1000 }
];
var currentBanner = null;
var unlockedBanners = ['space1', 'daisies', 'cracked-desert', 'butterfly'];
var pendingBannerPurchaseId = null;

var frames = [
  { id: 'none', name: 'None', color1: 'transparent', color2: 'transparent' },
  { id: 'blue-pink', name: 'Blue Pink', color1: '#2563eb', color2: '#d946a8' },
  { id: 'blue-green', name: 'Blue Green', color1: '#3b82f6', color2: '#22c55e' },
  { id: 'gold-orange', name: 'Gold Orange', color1: '#f59e0b', color2: '#f97316', locked: true, price: 500 },
  { id: 'green-teal', name: 'Green Teal', color1: '#10b981', color2: '#14b8a6', locked: true, price: 500 },
  { id: 'red-pink', name: 'Red Pink', color1: '#ef4444', color2: '#ec4899', locked: true, price: 750 },
  { id: 'purple-blue', name: 'Purple Blue', color1: '#8b5cf6', color2: '#6366f1', locked: true, price: 750 },
  { id: 'rainbow', name: 'Rainbow', color1: '#ff0080', color2: '#00d4ff', locked: true, price: 1000 },
  { id: 'fire', name: 'Fire', color1: '#ff4500', color2: '#ffd700', locked: true, price: 1000 }
];
var currentFrame = 'blue-pink';
var unlockedFrames = ['none', 'blue-pink', 'blue-green'];
var pendingFramePurchaseId = null;

function isThemeUnlocked(id) {
  return unlockedThemes.indexOf(id) >= 0;
}

function isBannerUnlocked(id) {
  return unlockedBanners.indexOf(id) >= 0;
}

function isFrameUnlocked(id) {
  return unlockedFrames.indexOf(id) >= 0;
}

function applyFrame(frameId) {
  var frame = null;
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].id === frameId) { frame = frames[i]; break; }
  }
  if (!frame) return;
  if (frame.locked && !isFrameUnlocked(frameId)) {
    openFramePurchasePopup(frameId);
    return;
  }
  currentFrame = frameId;
  var root = document.documentElement;
  root.style.setProperty('--frame-color-1', frame.color1);
  root.style.setProperty('--frame-color-2', frame.color2);
  buildFrameGrid();
  sendToUnity('frameChanged', frameId);
}

function applyBanner(bannerId) {
  var banner = null;
  for (var i = 0; i < banners.length; i++) {
    if (banners[i].id === bannerId) { banner = banners[i]; break; }
  }
  if (!banner) return;
  if (banner.locked && !isBannerUnlocked(bannerId)) {
    openBannerPurchasePopup(bannerId);
    return;
  }
  currentBanner = bannerId;

  // Create a style rule for the banner that targets ::before
  var styleId = 'banner-style';
  var existingStyle = document.getElementById(styleId);
  if (existingStyle) existingStyle.parentNode.removeChild(existingStyle);

  var style = document.createElement('style');
  style.id = styleId;
  style.textContent = '.topbar::before { background-image: url(' + banner.file + ') !important; }';
  document.head.appendChild(style);

  buildBannerGrid();
  sendToUnity('bannerChanged', bannerId);
}

function hexLum(hex) {
  hex = hex.replace('#', '');
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function themeSwatches(t) {
  return [t.accent, t.tileHover, t.tile, t.panel, t.bg];
}

function applyTheme(themeId) {
  var theme = null;
  for (var i = 0; i < themes.length; i++) {
    if (themes[i].id === themeId) { theme = themes[i]; break; }
  }
  if (!theme) return;
  if (theme.locked && !isThemeUnlocked(themeId)) {
    openPurchasePopup(themeId);
    return;
  }
  currentTheme = themeId;
  var root = document.documentElement;
  var light = hexLum(theme.bg) > 0.4;

  root.style.setProperty('--bg-body', theme.bg);
  root.style.setProperty('--bg-panel', theme.panel);
  root.style.setProperty('--bg-surface', theme.tile);
  root.style.setProperty('--bg-surface-hover', theme.tileHover);
  root.style.setProperty('--pink', theme.accent);

  if (theme.bgImage) {
    root.style.setProperty('--bg-image', 'url(' + theme.bgImage + ')');
    root.style.setProperty('--bg-image-visible', '1');
    root.style.setProperty('--bg-image-brightness', '0.5');
  } else {
    root.style.setProperty('--bg-image', 'none');
    root.style.setProperty('--bg-image-visible', '0');
    root.style.setProperty('--bg-image-brightness', '1');
  }

  root.style.setProperty('--cyan', light ? '#d946a8' : '#f472b6');
  root.style.setProperty('--gold', light ? '#22c55e' : '#4ade80');
  root.style.setProperty('--orange', light ? '#e85d8a' : '#f9a8d4');
  root.style.setProperty('--mint', light ? '#16a34a' : '#34d399');
  root.style.setProperty('--purple', light ? '#7c3aed' : '#a78bfa');

  // Update pink opacity variants for glow effects
  var acc = theme.accent;
  root.style.setProperty('--pink-15', acc + '26');
  root.style.setProperty('--pink-30', acc + '4d');
  root.style.setProperty('--pink-40', acc + '66');
  root.style.setProperty('--pink-50', acc + '80');

  root.style.setProperty('--text-primary', light ? '#1a1a2e' : '#f8f8fc');
  root.style.setProperty('--text-secondary', light ? 'rgba(26,26,46,0.5)' : 'rgba(248,248,252,0.5)');
  root.style.setProperty('--text-muted', light ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)');
  root.style.setProperty('--border-strong', light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)');
  root.style.setProperty('--border-subtle', light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)');
  root.style.setProperty('--overlay-light', light ? '#f2f2f2' : '#303030');
  root.style.setProperty('--scrollbar-color', light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)');

  // cssClass theme handling: remove old, add new
  var vp = document.querySelector('.viewport');
  for (var j = 0; j < themes.length; j++) {
    if (themes[j].cssClass) vp.classList.remove(themes[j].cssClass);
  }
  if (theme.cssClass) {
    vp.classList.add(theme.cssClass);
  }
  document.body.style.fontFamily = "";

  // Wireframe light: force pure black text & icons
  if (themeId === 'wireframe-light') {
    root.style.setProperty('--text-primary', '#000000');
    root.style.setProperty('--text-secondary', '#000000');
    root.style.setProperty('--text-muted', '#000000');
  }

  buildThemeGrid();
  sendToUnity('themeChanged', themeId);

  // Liquid glass: clean up and re-init specular elements
  if (typeof liquidActiveEl !== 'undefined' && liquidActiveEl) {
    liquidActiveEl.classList.remove('liquid-hover');
    liquidActiveEl.style.transform = '';
    liquidActiveEl = null;
  }
  initLiquidSpecular();
}

// ── Liquid Glass: Specular Highlight Injection ─────────
var liquidSpecularEls = [];

function initLiquidSpecular() {
  return; // DISABLED: short-circuited to eliminate GPU cost; re-enable by removing this line
  // Clean up existing specular elements
  for (var i = 0; i < liquidSpecularEls.length; i++) {
    if (liquidSpecularEls[i].parentNode) {
      liquidSpecularEls[i].parentNode.removeChild(liquidSpecularEls[i]);
    }
  }
  liquidSpecularEls = [];

  // Only inject when liquid theme is active
  var vp = document.querySelector('.viewport');
  if (!vp || !vp.classList.contains('theme-liquid')) return;

  // Tier 1 + Tier 2 elements get specular highlights
  var selectors = [
    '.nav-item', '.play-go-btn', '.play-mode-tab',
    '.solo-popup-option', '.space-popup-opt', '.loadout-opt',
    '.play-coop-tile', '.song-tile', '.space-tile',
    '.vault-tile', '.settings-tile', '.theme-card:not(.locked)',
    '.play-solo-btn', '.play-bar-btn', '.back-btn',
    '.purchase-btn', '.lb-type-btn', '.picker-filter',
    '.setlist-btn', '.key', '.key-wide', '.season-tile',
    '.play-tile', '.play-solo-cover-add', '.play-solo-add'
  ];

  for (var s = 0; s < selectors.length; s++) {
    var els = document.querySelectorAll(selectors[s]);
    for (var e = 0; e < els.length; e++) {
      // Ensure position:relative for absolute children
      var pos = window.getComputedStyle(els[e]).position;
      if (pos === 'static') els[e].style.position = 'relative';

      // Skip if already has a specular child
      if (els[e].querySelector('.liquid-specular')) continue;

      var spec = document.createElement('div');
      spec.className = 'liquid-specular';
      var inner = document.createElement('div');
      inner.className = 'liquid-specular-inner';
      spec.appendChild(inner);
      els[e].appendChild(spec);
      liquidSpecularEls.push(spec);
    }
  }
}

// ── Liquid Glass: Pointer Tracking ─────────────────────
var liquidLastTime = 0;
var LIQUID_THROTTLE_MS = 33; // ~30fps
var liquidActiveEl = null;

var LIQUID_TIER1_SEL = '.nav-item, .play-go-btn, .play-mode-tab, .solo-popup-option, .space-popup-opt, .loadout-opt';
var LIQUID_ALL_SEL = '.nav-item, .play-go-btn, .play-mode-tab, .solo-popup-option, .space-popup-opt, .loadout-opt, .play-coop-tile, .song-tile, .space-tile, .vault-tile, .settings-tile, .theme-card, .play-solo-btn, .play-bar-btn, .back-btn, .purchase-btn, .lb-type-btn, .picker-filter, .setlist-btn, .key, .key-wide, .season-tile, .play-tile, .play-solo-cover-add, .play-solo-add';

function findLiquidTarget(el, selector) {
  var node = el;
  for (var d = 0; d < 5; d++) {
    if (!node || node === document) return null;
    if (node.matches && node.matches(selector)) return node;
    node = node.parentNode;
  }
  return null;
}

function handleLiquidPointerMove(evt) {
  return; // DISABLED: short-circuited to eliminate GPU cost; re-enable by removing this line
  var now = Date.now();
  if (now - liquidLastTime < LIQUID_THROTTLE_MS) return;
  liquidLastTime = now;

  var vp = document.querySelector('.viewport');
  if (!vp || !vp.classList.contains('theme-liquid')) return;

  var target = findLiquidTarget(evt.target, LIQUID_ALL_SEL);
  if (!target) {
    if (liquidActiveEl) {
      liquidActiveEl.classList.remove('liquid-hover');
      liquidActiveEl.style.transform = '';
      liquidActiveEl = null;
    }
    return;
  }

  // New target — clean up old one
  if (liquidActiveEl && liquidActiveEl !== target) {
    liquidActiveEl.classList.remove('liquid-hover');
    liquidActiveEl.style.transform = '';
  }
  liquidActiveEl = target;
  target.classList.add('liquid-hover');

  var rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  var relX = evt.clientX - rect.left;
  var relY = evt.clientY - rect.top;
  var normX = relX / rect.width;
  var normY = relY / rect.height;

  // Update specular highlight position
  var specInner = target.querySelector('.liquid-specular-inner');
  if (specInner) {
    specInner.style.left = relX + 'px';
    specInner.style.top = relY + 'px';
  }

  // Elastic deformation (Tier 1 only)
  var isTier1 = findLiquidTarget(target, LIQUID_TIER1_SEL);
  if (isTier1) {
    var baseScale = 1.05;
    var dx = (normX - 0.5) * 6;
    var dy = (normY - 0.5) * 4;
    var sx = baseScale + (0.5 - Math.abs(normX - 0.5)) * 0.02;
    var sy = baseScale + (0.5 - Math.abs(normY - 0.5)) * 0.02;
    isTier1.style.transform = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scaleX(' + sx.toFixed(3) + ') scaleY(' + sy.toFixed(3) + ')';
  }
}

function handleLiquidPointerLeave() {
  if (liquidActiveEl) {
    liquidActiveEl.classList.remove('liquid-hover');
    liquidActiveEl.style.transform = '';
    liquidActiveEl = null;
  }
}

function initLiquidPointerTracking() {
  var vp = document.querySelector('.viewport');
  if (!vp) return;

  // Event delegation on viewport
  vp.addEventListener('mousemove', handleLiquidPointerMove, false);
  vp.addEventListener('mouseleave', handleLiquidPointerLeave, false);

  // Touch support for VR pointer
  vp.addEventListener('touchmove', function(evt) {
    if (evt.touches && evt.touches.length > 0) {
      var touch = evt.touches[0];
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        handleLiquidPointerMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
          target: el
        });
      }
    }
  }, false);
  vp.addEventListener('touchend', handleLiquidPointerLeave, false);
}

function resetPurchasePreview() {
  var p = document.getElementById('purchase-preview');
  if (!p) return;
  p.style.background = '';
  p.style.backgroundImage = '';
  p.style.backgroundSize = '';
  p.style.backgroundPosition = '';
  p.style.border = '';
  p.style.borderRadius = '';
  p.style.animation = '';
  p.style.removeProperty('--frame-color-1');
  p.style.removeProperty('--frame-color-2');
}

function openPurchasePopup(themeId) {
  resetPurchasePreview();
  var theme = null;
  for (var i = 0; i < themes.length; i++) {
    if (themes[i].id === themeId) { theme = themes[i]; break; }
  }
  if (!theme) return;
  pendingPurchaseId = themeId;
  document.getElementById('purchase-preview').style.background = buildSlantedGradient(themeSwatches(theme));
  document.getElementById('purchase-title').textContent = theme.name;
  document.getElementById('purchase-cost').textContent = theme.price.toLocaleString() + ' Coins';
  var balEl = document.getElementById('purchase-balance');
  balEl.textContent = 'Your balance: ' + userCoins.toLocaleString() + ' Coins';
  var canAfford = userCoins >= theme.price;
  balEl.className = 'purchase-balance' + (canAfford ? '' : ' insufficient');
  var btn = document.getElementById('purchase-confirm-btn');
  btn.disabled = !canAfford;
  btn.textContent = canAfford ? 'Unlock' : 'Not enough coins';
  document.getElementById('purchase-overlay').className = 'purchase-overlay active';
}

function closePurchasePopup(e) {
  if (e && e.target !== document.getElementById('purchase-overlay')) return;
  document.getElementById('purchase-overlay').className = 'purchase-overlay';
  pendingPurchaseId = null;
  pendingBannerPurchaseId = null;
  pendingFramePurchaseId = null;
}

function confirmPurchase() {
  if (!pendingPurchaseId) return;
  if (pendingBannerPurchaseId) {
    confirmBannerPurchase();
    return;
  }
  if (pendingFramePurchaseId) {
    confirmFramePurchase();
    return;
  }
  var theme = null;
  for (var i = 0; i < themes.length; i++) {
    if (themes[i].id === pendingPurchaseId) { theme = themes[i]; break; }
  }
  if (!theme || userCoins < theme.price) return;
  userCoins -= theme.price;
  unlockedThemes.push(pendingPurchaseId);
  closePurchasePopup();
  applyTheme(pendingPurchaseId);
  buildThemeGrid();
  sendToUnity('themePurchased', pendingPurchaseId);
}

function openBannerPurchasePopup(bannerId) {
  resetPurchasePreview();
  var banner = null;
  for (var i = 0; i < banners.length; i++) {
    if (banners[i].id === bannerId) { banner = banners[i]; break; }
  }
  if (!banner) return;
  pendingBannerPurchaseId = bannerId;
  pendingPurchaseId = bannerId;
  var preview = document.getElementById('purchase-preview');
  preview.style.background = '';
  preview.style.backgroundImage = 'url(' + banner.file + ')';
  preview.style.backgroundSize = 'cover';
  preview.style.backgroundPosition = 'center';
  document.getElementById('purchase-title').textContent = banner.name;
  document.getElementById('purchase-cost').textContent = banner.price.toLocaleString() + ' Coins';
  var balEl = document.getElementById('purchase-balance');
  balEl.textContent = 'Your balance: ' + userCoins.toLocaleString() + ' Coins';
  var canAfford = userCoins >= banner.price;
  balEl.className = 'purchase-balance' + (canAfford ? '' : ' insufficient');
  var btn = document.getElementById('purchase-confirm-btn');
  btn.disabled = !canAfford;
  btn.textContent = canAfford ? 'Unlock' : 'Not enough coins';
  document.getElementById('purchase-overlay').className = 'purchase-overlay active';
}

function confirmBannerPurchase() {
  if (!pendingBannerPurchaseId) return;
  var banner = null;
  for (var i = 0; i < banners.length; i++) {
    if (banners[i].id === pendingBannerPurchaseId) { banner = banners[i]; break; }
  }
  if (!banner || userCoins < banner.price) return;
  userCoins -= banner.price;
  unlockedBanners.push(pendingBannerPurchaseId);
  var bannerId = pendingBannerPurchaseId;
  pendingBannerPurchaseId = null;
  pendingPurchaseId = null;
  closePurchasePopup();
  applyBanner(bannerId);
  buildBannerGrid();
  sendToUnity('bannerPurchased', bannerId);
}

function openFramePurchasePopup(frameId) {
  resetPurchasePreview();
  var frame = null;
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].id === frameId) { frame = frames[i]; break; }
  }
  if (!frame) return;
  pendingFramePurchaseId = frameId;
  pendingPurchaseId = frameId;
  var preview = document.getElementById('purchase-preview');
  preview.style.background = '';
  preview.style.backgroundImage = 'none';
  preview.style.border = '8px solid ' + frame.color1;
  preview.style.borderRadius = '50%';
  preview.style.animation = 'frameGlow 3s ease-in-out infinite';
  preview.style.setProperty('--frame-color-1', frame.color1);
  preview.style.setProperty('--frame-color-2', frame.color2);
  document.getElementById('purchase-title').textContent = frame.name;
  document.getElementById('purchase-cost').textContent = frame.price.toLocaleString() + ' Coins';
  var balEl = document.getElementById('purchase-balance');
  balEl.textContent = 'Your balance: ' + userCoins.toLocaleString() + ' Coins';
  var canAfford = userCoins >= frame.price;
  balEl.className = 'purchase-balance' + (canAfford ? '' : ' insufficient');
  var btn = document.getElementById('purchase-confirm-btn');
  btn.disabled = !canAfford;
  btn.textContent = canAfford ? 'Unlock' : 'Not enough coins';
  document.getElementById('purchase-overlay').className = 'purchase-overlay active';
}

function confirmFramePurchase() {
  if (!pendingFramePurchaseId) return;
  var frame = null;
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].id === pendingFramePurchaseId) { frame = frames[i]; break; }
  }
  if (!frame || userCoins < frame.price) return;
  userCoins -= frame.price;
  unlockedFrames.push(pendingFramePurchaseId);
  var frameId = pendingFramePurchaseId;
  pendingFramePurchaseId = null;
  pendingPurchaseId = null;
  closePurchasePopup();
  applyFrame(frameId);
  buildFrameGrid();
  sendToUnity('framePurchased', frameId);
}

function buildSlantedGradient(swatches) {
  var bandWidth = 100 / swatches.length;
  var stops = [];
  for (var i = 0; i < swatches.length; i++) {
    stops.push(swatches[i] + ' ' + (i * bandWidth) + '%');
    stops.push(swatches[i] + ' ' + ((i + 1) * bandWidth) + '%');
  }
  return 'linear-gradient(135deg, ' + stops.join(', ') + ')';
}

function buildThemeGrid() {
  var grid = document.getElementById('theme-grid');
  grid.innerHTML = '';
  for (var i = 0; i < themes.length; i++) {
    var t = themes[i];
    var isLocked = t.locked && !isThemeUnlocked(t.id);
    var card = document.createElement('div');
    card.className = 'theme-card' + (t.id === currentTheme ? ' selected' : '') + (isLocked ? ' locked' : '');
    card.setAttribute('data-theme', t.id);
    card.onclick = (function(id) { return function() { applyTheme(id); }; })(t.id);
    card.style.background = buildSlantedGradient(themeSwatches(t));
    var html = '<div class="tile-info"><div class="tile-title">' + t.name + '</div></div>';
    if (isLocked) {
      html += '<div class="theme-lock-banner">&#128274; Unlock for ' + t.price.toLocaleString() + ' Coins</div>';
    }
    card.innerHTML = html;
    grid.appendChild(card);
  }
  // Also set the Themes settings tile background
  var themesTile = document.getElementById('themes-tile');
  if (themesTile) {
    var active = null;
    for (var j = 0; j < themes.length; j++) {
      if (themes[j].id === currentTheme) { active = themes[j]; break; }
    }
    if (active) themesTile.style.background = buildSlantedGradient(themeSwatches(active));
  }
  // Re-inject liquid specular elements on rebuilt theme cards
  if (typeof initLiquidSpecular === 'function') initLiquidSpecular();
}

function buildBannerGrid() {
  var grid = document.getElementById('banner-grid');
  grid.innerHTML = '';
  for (var i = 0; i < banners.length; i++) {
    var b = banners[i];
    var isLocked = b.locked && !isBannerUnlocked(b.id);
    var card = document.createElement('div');
    card.className = 'banner-card' + (b.id === currentBanner ? ' selected' : '') + (isLocked ? ' locked' : '');
    card.setAttribute('data-banner', b.id);
    card.onclick = (function(id) { return function() { applyBanner(id); }; })(b.id);
    card.style.backgroundImage = 'url(' + b.file + ')';
    var html = '<div class="tile-info"><div class="tile-title">' + b.name + '</div></div>';
    if (isLocked) {
      html += '<div class="theme-lock-banner">&#128274; Unlock for ' + b.price.toLocaleString() + ' Coins</div>';
    }
    card.innerHTML = html;
    grid.appendChild(card);
  }
  // Also set the Banners settings tile background
  var bannersTile = document.getElementById('banners-tile');
  if (bannersTile && currentBanner) {
    var active = null;
    for (var j = 0; j < banners.length; j++) {
      if (banners[j].id === currentBanner) { active = banners[j]; break; }
    }
    if (active) {
      bannersTile.style.backgroundImage = 'url(' + active.file + ')';
      bannersTile.style.backgroundSize = 'cover';
      bannersTile.style.backgroundPosition = 'center';
    }
  }
  // Re-inject liquid specular elements on rebuilt banner cards
  if (typeof initLiquidSpecular === 'function') initLiquidSpecular();
}

function buildFrameGrid() {
  var grid = document.getElementById('frame-grid');
  grid.innerHTML = '';
  for (var i = 0; i < frames.length; i++) {
    var f = frames[i];
    var isLocked = f.locked && !isFrameUnlocked(f.id);
    var card = document.createElement('div');
    card.className = 'frame-card' + (f.id === currentFrame ? ' selected' : '') + (isLocked ? ' locked' : '');
    card.setAttribute('data-frame', f.id);
    card.onclick = (function(id) { return function() { applyFrame(id); }; })(f.id);
    card.style.borderColor = f.color1;
    card.style.setProperty('--frame-color-1', f.color1);
    card.style.setProperty('--frame-color-2', f.color2);
    card.style.boxShadow = '0 0 20px ' + f.color1 + ', 0 0 40px ' + f.color2;
    var html = '<div class="tile-title">' + f.name + '</div>';
    if (isLocked) {
      html += '<div class="theme-lock-banner">&#128274; ' + f.price.toLocaleString() + '</div>';
    }
    card.innerHTML = html;
    grid.appendChild(card);
  }
  // Re-inject liquid specular elements on rebuilt frame cards
  if (typeof initLiquidSpecular === 'function') initLiquidSpecular();
}

var activeLegalEl = null;

function hideSettingsSub() {
  document.getElementById('settings-main').style.display = 'flex';
  document.getElementById('theme-section').className = 'theme-section';
  document.getElementById('banner-section').className = 'banner-section';
  document.getElementById('frame-section').className = 'frame-section';
  document.getElementById('tos-section').className = 'legal-section';
  document.getElementById('pp-section').className = 'legal-section';
  activeLegalEl = null;
  var gridNavs = document.querySelectorAll('.grid-nav');
  for (var i = 0; i < gridNavs.length; i++) gridNavs[i].style.display = 'none';
}

function showThemes() {
  document.getElementById('settings-main').style.display = 'none';
  document.getElementById('theme-section').className = 'theme-section active';
}

function showBanners() {
  document.getElementById('settings-main').style.display = 'none';
  document.getElementById('banner-section').className = 'banner-section active';
  buildBannerGrid();
}

function showFrames() {
  document.getElementById('settings-main').style.display = 'none';
  document.getElementById('frame-section').className = 'frame-section active';
  buildFrameGrid();
}

function showTos() {
  document.getElementById('settings-main').style.display = 'none';
  document.getElementById('tos-section').className = 'legal-section active';
  activeLegalEl = document.getElementById('tos-content');
  activeLegalEl.scrollTop = 0;
  buildScrollNav();
}

function showPrivacy() {
  document.getElementById('settings-main').style.display = 'none';
  document.getElementById('pp-section').className = 'legal-section active';
  activeLegalEl = document.getElementById('pp-content');
  activeLegalEl.scrollTop = 0;
  buildScrollNav();
}

/* ── Profile Switcher ─────────────────────────────── */
var profiles = [
  { id: 'rael', name: 'Rael', avatar: 'rael_new.png', level: 24, xp: 6500, xpMax: 10000, coins: 5000 },
  { id: 'jooleeno', name: 'Jooleeno', avatar: 'jooleeno.jpg', level: 12, xp: 2100, xpMax: 5000, coins: 3200 },
  { id: 'ted', name: 'Ted', avatar: 'ted.png', level: 37, xp: 8200, xpMax: 12000, coins: 7800 },
  { id: 'abbie', name: 'Abbie', avatar: 'abbie.png', level: 19, xp: 3400, xpMax: 7000, coins: 4500 },
  { id: 'arthen', name: 'Arthen', avatar: 'arthen.jpg', level: 42, xp: 9800, xpMax: 15000, coins: 12400 }
];
var activeProfileId = 'rael';

function showProfilesPanel() {
  document.getElementById('career-main').style.display = 'none';
  document.getElementById('profile-section-career').className = 'profile-section active';
  buildProfileGrid();
}

function hideProfilePanel() {
  document.getElementById('career-main').style.display = 'flex';
  document.getElementById('profile-section-career').className = 'profile-section';
}

function buildProfileGrid() {
  var grid = document.getElementById('profile-grid-career');
  grid.innerHTML = '';
  for (var i = 0; i < profiles.length; i++) {
    var p = profiles[i];
    var card = document.createElement('div');
    card.className = 'profile-card' + (p.id === activeProfileId ? ' active' : '');
    card.setAttribute('data-profile', p.id);
    card.onclick = (function(pid) { return function() { switchProfile(pid); }; })(p.id);
    var img = document.createElement('img');
    img.className = 'profile-card-avatar';
    img.src = p.avatar;
    img.alt = p.name;
    var info = document.createElement('div');
    info.className = 'profile-card-info';
    var name = document.createElement('div');
    name.className = 'profile-card-name';
    name.textContent = p.name;
    var level = document.createElement('div');
    level.className = 'profile-card-level';
    level.textContent = 'Level ' + p.level;
    info.appendChild(name);
    info.appendChild(level);
    card.appendChild(img);
    card.appendChild(info);
    grid.appendChild(card);
  }
  // Add profile tile
  var addCard = document.createElement('div');
  addCard.className = 'profile-card-add';
  addCard.innerHTML = '<div class="profile-card-add-silhouette"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="36" r="18" fill="#fff"/><ellipse cx="50" cy="82" rx="30" ry="22" fill="#fff"/></svg></div>' +
    '<div class="profile-card-add-info">' +
    '<div class="profile-card-add-label">New Profile</div>' +
    '<div class="profile-card-add-cost">100 Coins</div>' +
    '</div>';
  grid.appendChild(addCard);
}

function switchProfile(profileId) {
  var profile = null;
  for (var i = 0; i < profiles.length; i++) {
    if (profiles[i].id === profileId) { profile = profiles[i]; break; }
  }
  if (!profile) return;
  activeProfileId = profileId;
  userCoins = profile.coins;

  // Update topbar
  document.querySelector('.profile-name').textContent = profile.name;
  var avatarImg = document.querySelector('.profile-avatar img');
  avatarImg.src = profile.avatar;
  avatarImg.alt = profile.name;
  var fill = Math.round((profile.xp / profile.xpMax) * 100);
  document.querySelector('.xp-bar-fill').style.width = fill + '%';

  // Rebuild ticker with new profile data
  var ticker = document.getElementById('stat-ticker');
  ticker.innerHTML = '';
  var stats = [
    'Level ' + profile.level,
    profile.xp.toLocaleString() + ' / ' + profile.xpMax.toLocaleString() + ' XP',
    profile.coins.toLocaleString() + ' Jamsesh Picks',
    getSeasonPercent() + '% Season Complete'
  ];
  for (var s = 0; s < stats.length; s++) {
    var el = document.createElement('div');
    el.className = 'xp-text' + (s === 0 ? ' ticker-active' : '');
    el.textContent = stats[s];
    ticker.appendChild(el);
  }

  // Update active card
  buildProfileGrid();
}

function buildScrollNav() {
  var nav = document.getElementById('grid-nav-right');
  nav.innerHTML = '';
  var up = document.createElement('button');
  up.className = 'grid-nav-btn';
  up.id = 'scroll-up';
  up.innerHTML = '&#9650;';
  up.onclick = function() { scrollLegal(-1); };
  nav.appendChild(up);

  var down = document.createElement('button');
  down.className = 'grid-nav-btn';
  down.id = 'scroll-down';
  down.innerHTML = '&#9660;';
  down.onclick = function() { scrollLegal(1); };
  nav.appendChild(down);

  nav.style.display = 'flex';
  updateScrollNavState();
  if (activeLegalEl) {
    activeLegalEl.onscroll = updateScrollNavState;
  }
}

function scrollLegal(dir) {
  if (!activeLegalEl) return;
  var amount = activeLegalEl.clientHeight * 0.8;
  activeLegalEl.scrollBy({top: dir * amount, behavior: 'smooth'});
}

function updateScrollNavState() {
  if (!activeLegalEl) return;
  var up = document.getElementById('scroll-up');
  var down = document.getElementById('scroll-down');
  if (up) up.disabled = (activeLegalEl.scrollTop <= 0);
  if (down) down.disabled = (activeLegalEl.scrollTop + activeLegalEl.clientHeight >= activeLegalEl.scrollHeight - 5);
}

// ── Init ───────────────────────────────────────────────
// ── Season Grid ──────────────────────────────────────────
var seasonData = [
  {label: 'Solo', rewards: [
    {icon: '\uD83C\uDFB8', name: 'Flame Guitar',   xp: 500,  xpEarned: 500,  reward: 'cosmetic', unlocked: true},
    {icon: '\uD83E\uDE99', name: '200 Coins',       xp: 1200, xpEarned: 1200, reward: 'coins',    unlocked: true},
    {icon: '\uD83C\uDFB5', name: 'Neon Strings',    xp: 2000, xpEarned: 1650, reward: 'cosmetic', unlocked: false},
    {icon: '\uD83D\uDC8E', name: 'Crystal Pick',    xp: 3500, xpEarned: 0,    reward: 'cosmetic', unlocked: false},
    {icon: '\uD83E\uDE99', name: '500 Coins',       xp: 5000, xpEarned: 0,    reward: 'coins',    unlocked: false}
  ]},
  {label: 'Band', rewards: [
    {icon: '\uD83E\uDE99', name: '150 Coins',       xp: 800,  xpEarned: 800,  reward: 'coins',    unlocked: true},
    {icon: '\uD83C\uDFB6', name: 'Gold Stage',      xp: 1500, xpEarned: 1500, reward: 'cosmetic', unlocked: true},
    {icon: '\uD83C\uDFC6', name: 'Band Trophy',     xp: 2500, xpEarned: 2500, reward: 'cosmetic', unlocked: true},
    {icon: '\uD83E\uDE99', name: '400 Coins',       xp: 4000, xpEarned: 2800, reward: 'coins',    unlocked: false},
    {icon: '\uD83C\uDF1F', name: 'Star Highway',    xp: 6000, xpEarned: 0,    reward: 'cosmetic', unlocked: false}
  ]},
  {label: 'Guitar', rewards: [
    {icon: '\uD83D\uDD25', name: 'Fire Fretboard',  xp: 600,  xpEarned: 600,  reward: 'cosmetic', unlocked: true},
    {icon: '\uD83E\uDE99', name: '250 Coins',       xp: 1400, xpEarned: 1400, reward: 'coins',    unlocked: true},
    {icon: '\u26A1',       name: 'Lightning Riff',  xp: 2200, xpEarned: 1900, reward: 'cosmetic', unlocked: false},
    {icon: '\uD83C\uDFB8', name: 'Holo Guitar',     xp: 3800, xpEarned: 0,    reward: 'cosmetic', unlocked: false},
    {icon: '\uD83E\uDE99', name: '600 Coins',       xp: 5500, xpEarned: 0,    reward: 'coins',    unlocked: false}
  ]},
  {label: 'Drums', rewards: [
    {icon: '\uD83E\uDD41', name: 'Chrome Sticks',   xp: 700,  xpEarned: 700,  reward: 'cosmetic', unlocked: true},
    {icon: '\uD83E\uDE99', name: '200 Coins',       xp: 1300, xpEarned: 1300, reward: 'coins',    unlocked: true},
    {icon: '\uD83E\uDE99', name: '350 Coins',       xp: 2400, xpEarned: 0,    reward: 'coins',    unlocked: false},
    {icon: '\uD83D\uDCA5', name: 'Shockwave Kit',   xp: 3600, xpEarned: 0,    reward: 'cosmetic', unlocked: false},
    {icon: '\uD83C\uDF1F', name: 'Platinum Drums',  xp: 5200, xpEarned: 0,    reward: 'cosmetic', unlocked: false}
  ]},
  {label: 'Keys', rewards: [
    {icon: '\uD83C\uDFB9', name: 'Synth Wave',      xp: 500,  xpEarned: 500,  reward: 'cosmetic', unlocked: true},
    {icon: '\uD83E\uDE99', name: '300 Coins',       xp: 1100, xpEarned: 900,  reward: 'coins',    unlocked: false},
    {icon: '\uD83C\uDF0C', name: 'Galaxy Keys',     xp: 2100, xpEarned: 0,    reward: 'cosmetic', unlocked: false},
    {icon: '\uD83E\uDE99', name: '450 Coins',       xp: 3400, xpEarned: 0,    reward: 'coins',    unlocked: false},
    {icon: '\uD83C\uDFB9', name: 'Crystal Piano',   xp: 5000, xpEarned: 0,    reward: 'cosmetic', unlocked: false}
  ]},
  {label: 'Vocals', rewards: [
    {icon: '\uD83C\uDFA4', name: 'Retro Mic',       xp: 600,  xpEarned: 600,  reward: 'cosmetic', unlocked: true},
    {icon: '\uD83E\uDE99', name: '200 Coins',       xp: 1200, xpEarned: 1200, reward: 'coins',    unlocked: true},
    {icon: '\uD83C\uDFA4', name: 'Neon Mic',        xp: 2300, xpEarned: 1800, reward: 'cosmetic', unlocked: false},
    {icon: '\uD83D\uDC8E', name: 'Diamond Mic',     xp: 3700, xpEarned: 0,    reward: 'cosmetic', unlocked: false},
    {icon: '\uD83E\uDE99', name: '700 Coins',       xp: 5500, xpEarned: 0,    reward: 'coins',    unlocked: false}
  ]}
];

function buildSeasonGrid() {
  var container = document.getElementById('season-grid');
  if (!container) return;
  container.innerHTML = '';
  for (var c = 0; c < seasonData.length; c++) {
    var cat = seasonData[c];
    var section = document.createElement('div');
    section.className = 'season-category';

    var label = document.createElement('div');
    label.className = 'season-label';
    label.textContent = cat.label;
    section.appendChild(label);

    var row = document.createElement('div');
    row.className = 'season-row';
    for (var i = 0; i < cat.rewards.length; i++) {
      var r = cat.rewards[i];
      var tile = document.createElement('div');
      tile.className = 'season-tile' + (r.unlocked ? ' unlocked' : ' locked');

      var progress = r.xpEarned > 0 && !r.unlocked ? Math.min(r.xpEarned / r.xp * 100, 100) : (r.unlocked ? 100 : 0);

      tile.innerHTML =
        '<div class="season-reward">' + r.icon + '</div>' +
        '<div class="season-reward-name">' + r.name + '</div>' +
        '<div class="season-xp">' + r.xp.toLocaleString() + ' XP</div>' +
        '<div class="season-xp-bar"><div class="season-xp-fill" style="width:' + progress + '%"></div></div>';
      row.appendChild(tile);
    }
    section.appendChild(row);
    container.appendChild(section);
  }
}

// ── Home Grid Layout System ──────────────────────────────────────
function generateAllTilings() {
  var results = [];
  var grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  function findEmpty() {
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        if (grid[r][c] === 0) return { r: r, c: c };
      }
    }
    return null;
  }

  function canPlace(r, c, w, h) {
    if (r + h > 3 || c + w > 3) return false;
    for (var dr = 0; dr < h; dr++) {
      for (var dc = 0; dc < w; dc++) {
        if (grid[r + dr][c + dc] !== 0) return false;
      }
    }
    return true;
  }

  function place(r, c, w, h, val) {
    for (var dr = 0; dr < h; dr++) {
      for (var dc = 0; dc < w; dc++) {
        grid[r + dr][c + dc] = val;
      }
    }
  }

  function solve(tiles) {
    var cell = findEmpty();
    if (!cell) {
      results.push(tiles.slice());
      return;
    }
    var r = cell.r, c = cell.c;
    for (var w = 1; w <= 3 - c; w++) {
      for (var h = 1; h <= 3 - r; h++) {
        if (canPlace(r, c, w, h)) {
          place(r, c, w, h, 1);
          tiles.push({ r: r, c: c, w: w, h: h });
          solve(tiles);
          tiles.pop();
          place(r, c, w, h, 0);
        }
      }
    }
  }

  solve([]);
  return results;
}

function buildHomeGrid(layoutIndex) {
  var container = document.getElementById('home-grid');
  container.innerHTML = '';
  var tiling = allTilings[layoutIndex];
  var singleIdx = 0;
  var homeTiles = [
    { title: 'Store', sub: 'Golden Stratocaster', detail: '10,000 Picks - 7 days left', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="140" height="140"><path d="M37 38l-5 60c0 4 3 7 7 7h50c4 0 7-3 7-7l-5-60z" fill="#f48fb1" stroke="#000" stroke-width="3"/><path d="M37 38l-5 60c0 4 3 7 7 7h25V38z" fill="#ec407a" stroke="#000" stroke-width="3"/><path d="M64 18c-12 0-22 10-22 22v6h10v-6c0-7 5-12 12-12s12 5 12 12v6h10v-6c0-12-10-22-22-22z" fill="#424242" stroke="#000" stroke-width="3"/></svg>', bgImage: 'Gemini_Generated_Image_qjcpmnqjcpmnqjcp.jfif', action: function() { navigateTo('store'); } },
    { title: 'Vault', sub: '2 New Items Unlocked', detail: 'Check out your new gear', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="140" height="140"><rect x="20" y="50" width="88" height="50" rx="6" fill="#8B5E3C" stroke="#000" stroke-width="3"/><rect x="20" y="50" width="88" height="20" fill="#A0522D" stroke="#000" stroke-width="3"/><path d="M20 50 Q64 20 108 50" fill="#C4884D" stroke="#000" stroke-width="3"/><rect x="54" y="58" width="20" height="16" rx="3" fill="#FFD700" stroke="#000" stroke-width="2"/><circle cx="64" cy="66" r="3" fill="#8B5E3C"/></svg>', bgImage: 'neon-drum-kit-stockcake.webp', action: function() { navigateTo('store', {tab: 'vault'}); } },
    { title: 'Creator', sub: 'Your Creations', detail: 'Build and share content', icon: '&#127912;', bgImage: groupLogoOptions[Math.floor(Math.random() * groupLogoOptions.length)], action: function() { navigateTo('creator'); } },
    { title: 'Spaces', sub: 'K-Pop Zone', detail: '20/25 Jammers online!', icon: '&#127760;', bgImage: 'Gemini_Generated_Image_jvosmrjvosmrjvos.jfif', action: function() { navigateTo('spaces'); } },
    { title: 'News', sub: 'Update v0.25', detail: 'New battle mode added!', icon: '&#128240;', bgImage: 'Gemini_Generated_Image_lj9j18lj9j18lj9j.jfif', action: function() { navigateTo('career'); } },
    { title: 'Social', sub: '8 Friends Online', detail: 'Jump in and jam together', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="140" height="140"><circle cx="46" cy="38" r="18" fill="#42A5F5" stroke="#000" stroke-width="3"/><path d="M16 95c0-20 13-33 30-33s30 13 30 33" fill="#1E88E5" stroke="#000" stroke-width="3"/><circle cx="82" cy="38" r="18" fill="#AB47BC" stroke="#000" stroke-width="3"/><path d="M52 95c0-20 13-33 30-33s30 13 30 33" fill="#8E24AA" stroke="#000" stroke-width="3"/></svg>', socialAvatars: true, action: function() { navigateTo('social', {tab: 'friends'}); } }
  ];
  /* All tiles = octagon with unique glow color */
  var octa = 'polygon(28px 0%, calc(100% - 28px) 0%, 100% 28px, 100% calc(100% - 28px), calc(100% - 28px) 100%, 28px 100%, 0% calc(100% - 28px), 0% 28px)';
  var clips = [octa, octa, octa, octa, octa, octa];
  var glowColors = [
    { c: 'rgba(255,200,0,0.4)',  h: 'rgba(255,200,0,0.6)',
      f:  'drop-shadow(0 0 6px rgba(255,200,0,0.8)) drop-shadow(0 0 20px rgba(255,200,0,0.4))',
      fh: 'drop-shadow(0 0 10px rgba(255,200,0,1)) drop-shadow(0 0 30px rgba(255,200,0,0.5))' },
    { c: 'rgba(168,85,247,0.4)', h: 'rgba(168,85,247,0.6)',
      f:  'drop-shadow(0 0 6px rgba(168,85,247,0.8)) drop-shadow(0 0 20px rgba(168,85,247,0.4))',
      fh: 'drop-shadow(0 0 10px rgba(168,85,247,1)) drop-shadow(0 0 30px rgba(168,85,247,0.5))' },
    { c: 'rgba(0,255,180,0.4)',  h: 'rgba(0,255,180,0.6)',
      f:  'drop-shadow(0 0 6px rgba(0,255,180,0.8)) drop-shadow(0 0 20px rgba(0,255,180,0.4))',
      fh: 'drop-shadow(0 0 10px rgba(0,255,180,1)) drop-shadow(0 0 30px rgba(0,255,180,0.5))' },
    { c: 'rgba(255,80,200,0.4)', h: 'rgba(255,80,200,0.6)',
      f:  'drop-shadow(0 0 6px rgba(255,80,200,0.8)) drop-shadow(0 0 20px rgba(255,80,200,0.4))',
      fh: 'drop-shadow(0 0 10px rgba(255,80,200,1)) drop-shadow(0 0 30px rgba(255,80,200,0.5))' },
    { c: 'rgba(0,224,255,0.4)',  h: 'rgba(0,224,255,0.6)',
      f:  'drop-shadow(0 0 6px rgba(0,224,255,0.8)) drop-shadow(0 0 20px rgba(0,224,255,0.4))',
      fh: 'drop-shadow(0 0 10px rgba(0,224,255,1)) drop-shadow(0 0 30px rgba(0,224,255,0.5))' },
    { c: 'rgba(60,130,255,0.4)', h: 'rgba(60,130,255,0.6)',
      f:  'drop-shadow(0 0 6px rgba(60,130,255,0.8)) drop-shadow(0 0 20px rgba(60,130,255,0.4))',
      fh: 'drop-shadow(0 0 10px rgba(60,130,255,1)) drop-shadow(0 0 30px rgba(60,130,255,0.5))' }
  ];
  /* Season banner — wide octagon */
  var bannerClip = 'polygon(28px 0%, calc(100% - 28px) 0%, 100% 28px, 100% calc(100% - 28px), calc(100% - 28px) 100%, 28px 100%, 0% calc(100% - 28px), 0% 28px)';
  /* Icon position per tile — all top-right corner */
  var iconPos = [
    { top: '-18px', right: '-14px' },
    { top: '-18px', right: '-14px' },
    { top: '-18px', right: '-14px' },
    { top: '-18px', right: '-14px' },
    { top: '-18px', right: '-14px' },
    { top: '-18px', right: '-14px' }
  ];
  /* Shadow panel offsets — alternating directions for depth variety */
  var shadowOff = [
    { top: '8px', left: '8px', right: '-8px', bottom: '-8px' },
    { top: '8px', left: '-8px', right: '8px', bottom: '-8px' },
    { top: '10px', left: '6px', right: '-6px', bottom: '-10px' },
    { top: '-6px', left: '8px', right: '-8px', bottom: '6px' },
    { top: '8px', left: '-10px', right: '10px', bottom: '-8px' },
    { top: '10px', left: '8px', right: '-8px', bottom: '-10px' }
  ];
  var delays = [0, 0.4, 0.8, 0.2, 0.6, 1.0, 0.3, 0.7, 1.1];

  for (var i = 0; i < tiling.length; i++) {
    var t = tiling[i];
    var delay = delays[i % delays.length];

    /* Wrapper — grid child, glow host */
    var wrap = document.createElement('div');
    wrap.className = 'home-tile-wrap';
    wrap.style.gridColumn = (t.c + 1) + ' / span ' + t.w;
    wrap.style.gridRow = (t.r + 1) + ' / span ' + t.h;

    /* Shadow panel — offset depth layer */
    var shadow = document.createElement('div');
    shadow.className = 'home-tile-shadow';

    /* Tile */
    var tile = document.createElement('div');
    tile.className = 'home-tile';
    tile.style.animationDelay = delay + 's';
    tile.style.setProperty('--tile-delay', delay + 's');

    if (t.w === 3 && t.h === 1) {
      /* Banner — angled parallelogram, amber glow */
      wrap.className = 'home-tile-wrap glow-amber';
      wrap.style.setProperty('--glow-color', 'rgba(255,180,80,0.3)');
      wrap.style.setProperty('--glow-hover', 'rgba(255,180,80,0.5)');
      tile.style.webkitClipPath = bannerClip;
      tile.style.clipPath = bannerClip;
      shadow.style.webkitClipPath = bannerClip;
      shadow.style.clipPath = bannerClip;
      shadow.style.top = '8px';
      shadow.style.left = '8px';
      shadow.style.right = '-8px';
      shadow.style.bottom = '-8px';

      tile.innerHTML = '<div class="home-banner">'
        + '<img class="home-banner-bg" src="grammys.jpg" alt="">'
        + '<div class="home-banner-overlay"></div>'
        + '<div class="home-banner-content">'
        + '<img class="home-banner-logo" src="Logo (1080 x 1080 px).png" alt="Jamsesh">'
        + '<div class="home-banner-text">'
        + '<div class="home-banner-title">Grammys Season</div>'
        + '<div class="home-banner-sub">8 Days Left</div>'
        + '<div class="home-banner-progress">40% Complete</div>'
        + '</div></div></div>';

      wrap.appendChild(shadow);
      wrap.appendChild(tile);
    } else if (t.w === 1 && t.h === 1 && singleIdx < homeTiles.length) {
      var ht = homeTiles[singleIdx];
      var ci = singleIdx % clips.length;
      var cp = clips[ci];

      /* Per-tile glow — filter on WRAPPER (not tile, since clip-path clips filter) */
      var gc = glowColors[singleIdx % glowColors.length];
      wrap.className = 'home-tile-wrap';
      tile.style.setProperty('--glow-color', gc.c);
      tile.style.setProperty('--glow-hover', gc.h);
      wrap.style.filter = gc.f;

      /* Hover: swap wrapper filter to brighter glow (no pulse) */
      (function(el, normal, hover) {
        el.addEventListener('mouseenter', function() {
          el.style.filter = hover;
        }, false);
        el.addEventListener('mouseleave', function() {
          el.style.filter = normal;
        }, false);
      })(wrap, gc.f, gc.fh);

      /* Unique clip-path per tile */
      tile.style.webkitClipPath = cp;
      tile.style.clipPath = cp;

      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.justifyContent = 'flex-end';
      tile.style.padding = '28px';
      tile.style.gap = '6px';

      var bgHtml = '';
      if (ht.bgImage) {
        var overlayColor = gc.c.replace(/[\d.]+\)$/, '0.25)');
        var overlayMid = gc.c.replace(/[\d.]+\)$/, '0.4)');
        bgHtml = '<img src="' + ht.bgImage + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0">'
          + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;background:linear-gradient(180deg,' + overlayColor + ' 0%,' + overlayMid + ' 40%,rgba(0,0,0,0.7) 100%)"></div>';
      }
      tile.style.position = 'relative';
      tile.innerHTML = bgHtml
        + '<div style="font-size:48px;font-weight:900;color:#ffffff;text-shadow:-2px -2px 0 rgba(0,0,0,0.8),2px -2px 0 rgba(0,0,0,0.8),-2px 2px 0 rgba(0,0,0,0.8),2px 2px 0 rgba(0,0,0,0.8);position:relative;z-index:3;letter-spacing:1px;text-transform:uppercase">' + ht.title + '</div>'
        + '<div style="font-size:34px;font-weight:700;color:rgba(255,255,255,0.9);text-shadow:-1px -1px 0 rgba(0,0,0,0.7),1px -1px 0 rgba(0,0,0,0.7),-1px 1px 0 rgba(0,0,0,0.7),1px 1px 0 rgba(0,0,0,0.7);position:relative;z-index:3">' + ht.sub + '</div>'
        + '<div style="font-size:24px;font-weight:600;color:rgba(255,255,255,0.7);text-shadow:-1px -1px 0 rgba(0,0,0,0.6),1px -1px 0 rgba(0,0,0,0.6),-1px 1px 0 rgba(0,0,0,0.6),1px 1px 0 rgba(0,0,0,0.6);position:relative;z-index:3">' + ht.detail + '</div>';

      /* Floating icon — sits in wrapper, partially outside tile clip */
      var icon = document.createElement('div');
      icon.className = 'home-tile-icon';
      icon.innerHTML = ht.icon;
      var isSvgIcon = ht.icon.indexOf('<svg') !== -1;
      var ip = iconPos[singleIdx % iconPos.length];
      if (isSvgIcon) {
        icon.style.top = '-48px';
        icon.style.right = '-44px';
      } else {
        if (ip.top) icon.style.top = ip.top;
        if (ip.right) icon.style.right = ip.right;
        if (ip.bottom) icon.style.bottom = ip.bottom;
        if (ip.left) icon.style.left = ip.left;
      }
      if (ip.ml) icon.style.marginLeft = ip.ml;

      wrap.onclick = (function(a) { return function() { a(); }; })(ht.action);

      wrap.appendChild(tile);
      wrap.appendChild(icon);

      // Floating social avatars
      if (ht.socialAvatars) {
        var avatarData = [
          { src: 'ted.png', size: 200, left: '15%', top: '10%', dur: '8s', delay: '0s' },
          { src: 'abbie.png', size: 140, left: '65%', top: '8%', dur: '10s', delay: '-3s' },
          { src: 'arthen.jpg', size: 170, left: '55%', top: '45%', dur: '9s', delay: '-5s' },
          { src: 'jooleeno.jpg', size: 120, left: '20%', top: '50%', dur: '11s', delay: '-7s' }
        ];
        for (var av = 0; av < avatarData.length; av++) {
          var a = avatarData[av];
          var bubble = document.createElement('div');
          bubble.className = 'home-tile-avatar';
          bubble.style.width = a.size + 'px';
          bubble.style.height = a.size + 'px';
          bubble.style.left = a.left;
          bubble.style.top = a.top;
          bubble.style.animationDuration = a.dur;
          bubble.style.animationDelay = a.delay;
          bubble.innerHTML = '<img src="' + a.src + '" alt="">';
          tile.appendChild(bubble);
        }
      }

      singleIdx++;
    } else {
      /* Fallback tile */
      var cp = clips[i % clips.length];
      tile.style.webkitClipPath = cp;
      tile.style.clipPath = cp;

      wrap.appendChild(tile);
    }

    container.appendChild(wrap);
  }
  updateLayoutBtn(layoutIndex);
}

function buildLayoutBrowser() {
  var browser = document.getElementById('layout-browser');
  browser.innerHTML = '';
  document.getElementById('layout-count').textContent = allTilings.length + ' layouts';
  for (var i = 0; i < allTilings.length; i++) {
    var wrap = document.createElement('div');
    wrap.className = 'layout-thumb-wrap';
    var thumb = document.createElement('div');
    thumb.className = 'layout-thumb' + (i === currentLayout ? ' selected' : '');
    thumb.setAttribute('data-layout-index', i);
    thumb.onclick = (function(idx) {
      return function() { selectLayout(idx); };
    })(i);

    var tiling = allTilings[i];
    for (var j = 0; j < tiling.length; j++) {
      var t = tiling[j];
      var cell = document.createElement('div');
      cell.className = 'layout-thumb-tile';
      cell.style.gridColumn = (t.c + 1) + ' / span ' + t.w;
      cell.style.gridRow = (t.r + 1) + ' / span ' + t.h;
      thumb.appendChild(cell);
    }

    wrap.appendChild(thumb);
    browser.appendChild(wrap);
  }
}

function updateLayoutBtn(layoutIndex) {
  var btn = document.getElementById('home-layout-btn');
  if (!btn) return;
  btn.innerHTML = '';
  var tiling = allTilings[layoutIndex];
  for (var j = 0; j < tiling.length; j++) {
    var t = tiling[j];
    var cell = document.createElement('div');
    cell.className = 'home-layout-btn-tile';
    cell.style.gridColumn = (t.c + 1) + ' / span ' + t.w;
    cell.style.gridRow = (t.r + 1) + ' / span ' + t.h;
    btn.appendChild(cell);
  }
}

function selectLayout(index) {
  currentLayout = index;
  buildHomeGrid(index);
  updateLayoutBtn(index);
  var thumbs = document.querySelectorAll('.layout-thumb');
  for (var i = 0; i < thumbs.length; i++) {
    var idx = parseInt(thumbs[i].getAttribute('data-layout-index'), 10);
    if (idx === index) {
      thumbs[i].className = 'layout-thumb selected';
    } else {
      thumbs[i].className = 'layout-thumb';
    }
  }
}

function openLayoutPicker() {
  buildLayoutBrowser();
  document.getElementById('layout-overlay').className = 'layout-overlay active';
}

function closeLayoutPicker(e) {
  if (e && e.target !== document.getElementById('layout-overlay')) return;
  document.getElementById('layout-overlay').className = 'layout-overlay';
}

/* ══════════════ ONBOARDING FLOW ══════════════ */

function onboardFadeToBlack(hideEl, showEl, callback) {
  var black = document.getElementById('onboard-black');
  black.className = 'visible';
  setTimeout(function() {
    hideEl.className = hideEl.className.replace(/fading-\w+/g, '') + ' hidden';
    if (showEl) {
      showEl.className = showEl.className.replace(' hidden', '');
    }
    if (callback) callback();
    setTimeout(function() {
      black.className = '';
    }, 50);
  }, 200);
}

function onboardInitLegal() {
  var body = document.getElementById('legal-agree-body');
  var src = document.getElementById('tos-content');
  if (src && body) {
    body.innerHTML = src.innerHTML;
  }
  // Reset tabs
  document.getElementById('legal-tab-tos').className = 'legal-agree-tab active';
  document.getElementById('legal-tab-pp').className = 'legal-agree-tab';
}

function onboardSwitchTab(tab) {
  var body = document.getElementById('legal-agree-body');
  var tosTab = document.getElementById('legal-tab-tos');
  var ppTab = document.getElementById('legal-tab-pp');
  if (tab === 'tos') {
    tosTab.className = 'legal-agree-tab active';
    ppTab.className = 'legal-agree-tab';
    var src = document.getElementById('tos-content');
    if (src && body) body.innerHTML = src.innerHTML;
  } else {
    tosTab.className = 'legal-agree-tab';
    ppTab.className = 'legal-agree-tab active';
    var src2 = document.getElementById('pp-content');
    if (src2 && body) body.innerHTML = src2.innerHTML;
  }
  body.scrollTop = 0;
}

function onboardToggleAgree() {
  var cb = document.getElementById('legal-checkbox');
  var ok = document.getElementById('legal-ok');
  var isChecked = cb.className.indexOf('checked') !== -1;
  if (isChecked) {
    cb.className = 'legal-agree-checkbox';
    cb.textContent = '';
    ok.className = 'legal-agree-ok';
  } else {
    cb.className = 'legal-agree-checkbox checked';
    cb.textContent = '\u2713';
    ok.className = 'legal-agree-ok enabled';
  }
}

function onboardComplete() {
  var ok = document.getElementById('legal-ok');
  if (ok.className.indexOf('enabled') === -1) return;
  var beep = new Audio('UIBeep-Generate_a_very_shor-Elevenlabs.mp3');
  beep.play();
  completeOnboardStep('legal');

  // Next: perms explainer (demo always shows it, normal/onboard checks flag)
  if (isDemoMode() || !isStepComplete('perms_explainer')) {
    onboardFadeToBlack(
      document.getElementById('onboard-legal'),
      document.getElementById('onboard-perms-explain')
    );
  } else {
    onboardFadeToBlack(
      document.getElementById('onboard-legal'),
      null,
      function() { _showMainUI(); }
    );
  }
}

function onboardPermsOk() {
  completeOnboardStep('perms_explainer');
  if (isDemoMode()) {
    // Demo: show OS camera permission popup next
    onboardFadeToBlack(
      document.getElementById('onboard-perms-explain'),
      document.getElementById('onboard-perm-camera')
    );
  } else {
    onboardFadeToBlack(
      document.getElementById('onboard-perms-explain'),
      null,
      function() { _showMainUI(); }
    );
  }
}

// Demo-only: Meta Store → Quest home → Boot splash → Legal
function onboardAdvance(fromScreen) {
  if (fromScreen === 'metastore') {
    onboardFadeToBlack(
      document.getElementById('onboard-meta-store'),
      document.getElementById('onboard-quest')
    );
    updateQuestTime();
    setInterval(updateQuestTime, 60000);
  } else if (fromScreen === 'quest') {
    onboardFadeToBlack(
      document.getElementById('onboard-quest'),
      document.getElementById('onboard-boot')
    );
  } else if (fromScreen === 'boot') {
    // Boot splash → Early Access (every session, all modes)
    onboardFadeToBlack(
      document.getElementById('onboard-boot'),
      null,
      function() {
        var ea = document.getElementById('early-access-overlay');
        if (ea) ea.className = 'early-access-overlay';
      }
    );
  }
}

// Demo-only: OS permission popups → main UI
function onboardPermNext(which) {
  if (which === 'camera') {
    onboardFadeToBlack(
      document.getElementById('onboard-perm-camera'),
      document.getElementById('onboard-perm-mic')
    );
  } else if (which === 'mic') {
    onboardFadeToBlack(
      document.getElementById('onboard-perm-mic'),
      null,
      function() { _showMainUI(); }
    );
  }
}

// Demo-only: Quest home clock
function updateQuestTime() {
  var el = document.getElementById('quest-time');
  if (!el) return;
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  el.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

// ===========================================================================
// Mode System: demo / onboard / normal
// URL params: ?mode=demo | ?mode=onboard | ?step=N | ?reset
// Flags version: bump LEGAL_VERSION when TOS/PP changes to re-show legal
// ===========================================================================
var LEGAL_VERSION = '1';
var demoEnabled = false;     // ?demo — show demo-only screens
var onboardEnabled = false;  // ?onboard — force onboarding even if completed
var onboardFlags = {};       // { legal: true, perms_explainer: true }

function parseMode() {
  var params = window.location.search.substring(1).split('&');
  var map = {};
  for (var i = 0; i < params.length; i++) {
    var kv = params[i].split('=');
    if (kv[0]) map[kv[0]] = kv[1] || '';
  }

  // ?reset — clear all progress
  if ('reset' in map) {
    try { localStorage.removeItem('jamsesh_onboard'); } catch(e) {}
    console.log('[Mode] Reset — cleared onboarding progress');
  }

  // Independent flags
  demoEnabled = 'demo' in map;
  onboardEnabled = 'onboard' in map;

  // ?onboard clears saved flags to force re-run
  if (onboardEnabled) {
    try { localStorage.removeItem('jamsesh_onboard'); } catch(e) {}
  }

  // Load saved flags from localStorage (dev) or Vuplex (prod)
  onboardFlags = _loadOnboardFlags();

  // ?step=N or ?step=name — override: mark all steps before N as complete
  // Named steps: legal, perms, tutorial, menu (or numbers 1-4)
  if (map.step) {
    var stepOrder = ['legal', 'perms_explainer', 'tutorial_play'];
    var stepNames = {legal: 1, perms: 2, tutorial: 3, menu: 4};
    var stepNum = stepNames[map.step] || parseInt(map.step, 10) || 1;
    for (var s = 0; s < stepOrder.length; s++) {
      if (s < stepNum - 1) {
        onboardFlags[stepOrder[s]] = true;
      } else {
        delete onboardFlags[stepOrder[s]];
      }
    }
    if (onboardFlags.legal) onboardFlags.legal_version = LEGAL_VERSION;
    _saveOnboardFlags();
  }

  console.log('[Mode] demo=' + demoEnabled + ', onboard=' + onboardEnabled + ', flags=' + JSON.stringify(onboardFlags));
}

function _loadOnboardFlags() {
  try {
    var raw = localStorage.getItem('jamsesh_onboard');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {};
}

function _saveOnboardFlags() {
  try {
    localStorage.setItem('jamsesh_onboard', JSON.stringify(onboardFlags));
  } catch(e) {}
}

function completeOnboardStep(step) {
  onboardFlags[step] = true;
  if (step === 'legal') onboardFlags.legal_version = LEGAL_VERSION;
  _saveOnboardFlags();
  sendToUnity('onboardStepComplete', { step: step, flags: onboardFlags });
  console.log('[Mode] Completed: ' + step);
}

function isStepComplete(step) {
  if (step === 'legal') {
    // Re-show if legal version changed
    return onboardFlags.legal && onboardFlags.legal_version === LEGAL_VERSION;
  }
  return !!onboardFlags[step];
}

function isDemoMode() {
  return demoEnabled;
}

function isOnboardMode() {
  return onboardEnabled;
}

// Entry point: kicks off the first screen
function startFlow() {
  if (isDemoMode()) {
    // Demo screens first: Meta Store → Quest Home → Boot → Early Access → ...
    _showOnboardScreen('onboard-meta-store');
    return;
  }

  // Non-demo: Early Access → onboarding steps → Main UI
  var ea = document.getElementById('early-access-overlay');
  if (ea) ea.className = 'early-access-overlay';
}

// After early access OK — route to next onboarding step or main UI
function onboardAfterEarlyAccess() {
  if (isDemoMode()) {
    // Demo: always show legal next
    _showOnboardScreen('onboard-legal');
    return;
  }

  // Normal / onboard: skip completed steps
  if (!isStepComplete('legal')) {
    _showOnboardScreen('onboard-legal');
    return;
  }

  if (!isStepComplete('perms_explainer')) {
    _showOnboardScreen('onboard-perms-explain');
    return;
  }

  // All steps complete — go straight to main UI
  _showMainUI();
}

function _showOnboardScreen(id) {
  var el = document.getElementById(id);
  if (el) el.className = el.className.replace(' hidden', '');
}

function _showMainUI() {
  var topbar = document.querySelector('.topbar');
  var navbar = document.querySelector('.navbar');
  if (topbar) topbar.style.display = '';
  if (navbar) navbar.style.display = '';
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) pages[i].style.visibility = '';

  // Onboarding step 1: first play tutorial
  if (!isStepComplete('tutorial_play')) {
    startTutorialPlay();
  }
}

var tutorialSongs = [
  { rank: 1, title: 'Guitar Basics', artist: 'Jamsesh Tutorial', file: 'instruments/guitar.png', duration: 120, bpm: 100, genre: 'Tutorial', decade: '2020s' },
  { rank: 2, title: 'Drum Basics', artist: 'Jamsesh Tutorial', file: 'instruments/drums.png', duration: 120, bpm: 100, genre: 'Tutorial', decade: '2020s' },
  { rank: 3, title: 'Vocal Basics', artist: 'Jamsesh Tutorial', file: 'instruments/vocals.png', duration: 120, bpm: 100, genre: 'Tutorial', decade: '2020s' }
];

function startTutorialPlay() {
  // Navigate to play tab
  navigateTo('play');

  // Grey out navbar items except play
  var navItems = document.querySelectorAll('.nav-item');
  for (var i = 0; i < navItems.length; i++) {
    var page = navItems[i].getAttribute('data-page');
    if (page !== 'play') {
      navItems[i].style.opacity = '0.25';
      navItems[i].style.pointerEvents = 'none';
    }
  }

  // Grey out topbar
  var topbar = document.querySelector('.topbar');
  if (topbar) {
    topbar.style.opacity = '0.25';
    topbar.style.pointerEvents = 'none';
  }

  // Override setlist with tutorial songs
  setlist = tutorialSongs.slice();
  buildPlayGrid();

  // Grey out Save/Load, keep Start highlighted
  var goBar = document.querySelector('.play-go-bar');
  if (goBar) {
    var btns = goBar.querySelectorAll('.play-bar-btn');
    for (var b = 0; b < btns.length; b++) {
      btns[b].style.opacity = '0.25';
      btns[b].style.pointerEvents = 'none';
    }
  }

  // Grey out mode tabs
  var modeTabs = document.querySelectorAll('.play-mode-tab');
  for (var m = 0; m < modeTabs.length; m++) {
    modeTabs[m].style.opacity = '0.25';
    modeTabs[m].style.pointerEvents = 'none';
  }

  // Override Start button to complete tutorial
  var startBtn = document.getElementById('play-go-btn');
  if (startBtn) {
    startBtn.onclick = function() {
      completeTutorialPlay();
    };
  }
}

function tutorialAdvance(step) {
  var black = document.getElementById('onboard-black');
  if (step === 1) {
    // Tutorial screen 1 → Tutorial screen 2
    black.className = 'visible';
    setTimeout(function() {
      document.getElementById('screen-tutorial-1').classList.remove('active');
      document.getElementById('screen-tutorial-2').classList.add('active');
      setTimeout(function() { black.className = ''; }, 50);
    }, 200);
  } else if (step === 2) {
    // Tutorial screen 2 → Results
    black.className = 'visible';
    setTimeout(function() {
      document.getElementById('screen-tutorial-2').classList.remove('active');
      showResults1();
      setTimeout(function() { black.className = ''; }, 50);
    }, 200);
  }
}

function completeTutorialPlay() {
  completeOnboardStep('tutorial_play');

  // Restore navbar
  var navItems = document.querySelectorAll('.nav-item');
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].style.opacity = '';
    navItems[i].style.pointerEvents = '';
  }

  // Restore topbar
  var topbar = document.querySelector('.topbar');
  if (topbar) {
    topbar.style.opacity = '';
    topbar.style.pointerEvents = '';
  }

  // Restore Save/Load buttons
  var goBar = document.querySelector('.play-go-bar');
  if (goBar) {
    var btns = goBar.querySelectorAll('.play-bar-btn');
    for (var b = 0; b < btns.length; b++) {
      btns[b].style.opacity = '';
      btns[b].style.pointerEvents = '';
    }
  }

  // Restore mode tabs
  var modeTabs = document.querySelectorAll('.play-mode-tab');
  for (var m = 0; m < modeTabs.length; m++) {
    modeTabs[m].style.opacity = '';
    modeTabs[m].style.pointerEvents = '';
  }

  // Restore start button to normal
  var startBtn = document.getElementById('play-go-btn');
  if (startBtn) {
    startBtn.onclick = function() { startGame(); };
  }

  // Demo mode: show tutorial gameplay screens with narration
  // Normal mode: go straight to the game
  if (isDemoMode()) {
    var black = document.getElementById('onboard-black');
    black.className = 'visible';
    setTimeout(function() {
      document.getElementById('screen-tutorial-1').classList.add('active');
      // Play narration audio
      try {
        var narration = new Audio('tutorial-guitar-intro.mp3');
        narration.play();
      } catch(e) {}
      setTimeout(function() { black.className = ''; }, 50);
    }, 200);
  } else {
    startGame();
  }
}

function dismissEarlyAccess() {
  var overlay = document.getElementById('early-access-overlay');
  if (overlay) overlay.classList.add('hidden');
  onboardAfterEarlyAccess();
}

function init() {
  // Load persisted state from localStorage
  _loadState();

  // Parse URL mode and load onboarding flags
  parseMode();

  var currentPageName = _getCurrentPage();

  // On home page: handle onboarding flow
  if (currentPageName === 'home') {
    var topbar = document.querySelector('.topbar');
    var navbar = document.querySelector('.navbar');
    if (topbar) topbar.style.display = 'none';
    if (navbar) navbar.style.display = 'none';
    var allPages = document.querySelectorAll('.page');
    for (var p = 0; p < allPages.length; p++) allPages[p].style.visibility = 'hidden';
  }

  // Highlight correct nav item
  highlightCurrentNav();

  // Hide grid nav on start
  var gridNavs = document.querySelectorAll('.grid-nav');
  for (var i = 0; i < gridNavs.length; i++) gridNavs[i].style.display = 'none';

  // ── Per-page builders ──
  if (currentPageName === 'home') {
    allTilings = generateAllTilings();
    buildHomeGrid(currentLayout);
  }

  if (currentPageName === 'play') {
    buildPlayPanel([]);
    if (typeof showPlayLoading === 'function') showPlayLoading(true);
    if (!window.vuplex) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'songs.json', true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            updateSongsFromBackend(data);
          } catch (e) {}
        }
      };
      xhr.send();
    }
    // Check for tutorial param
    if (getUrlParam('tutorial') === '1' && !isStepComplete('tutorial_play')) {
      startTutorialPlay();
    }
  }

  if (currentPageName === 'social') { buildSocialPage(); }
  if (currentPageName === 'spaces') { buildSpacesGrid(); }

  if (currentPageName === 'store') {
    buildVaultGrid();
    if (!window.vuplex) {
      var xhrStore = new XMLHttpRequest();
      xhrStore.open('GET', 'songs.json', true);
      xhrStore.onreadystatechange = function() {
        if (xhrStore.readyState === 4 && xhrStore.status === 200) {
          try {
            var data = JSON.parse(xhrStore.responseText);
            allSongs = data;
            buildStoreGrid();
          } catch (e) {}
        }
      };
      xhrStore.send();
    } else {
      buildStoreGrid();
    }
    var storeTab = getUrlParam('tab');
    if (storeTab) switchStoreTab(storeTab);
  }

  if (currentPageName === 'creator') { buildCreatorGrids(); }
  if (currentPageName === 'season') { buildSeasonGrid(); }
  if (currentPageName === 'settings') {
    // Settings page needs theme/banner/frame grids built in sub-sections
  }

  // ── Shared init ──
  applyTheme(currentTheme);

  // Apply banner
  if (currentBanner) {
    applyBanner(currentBanner);
  } else {
    var availableBanners = [];
    for (var b = 0; b < banners.length; b++) {
      if (!banners[b].locked || isBannerUnlocked(banners[b].id)) {
        availableBanners.push(banners[b].id);
      }
    }
    if (availableBanners.length > 0) {
      var randomIdx = Math.floor(Math.random() * availableBanners.length);
      applyBanner(availableBanners[randomIdx]);
    }
  }

  applyFrame(currentFrame);
  initVuplexListener();
  initStatTicker();

  // Initialize legal screen content on startup (home page only)
  if (currentPageName === 'home') {
    if (typeof onboardInitLegal === 'function') onboardInitLegal();
    startFlow();
  }

  // Handle social/spaces tab params
  if (currentPageName === 'social') {
    var socialTab = getUrlParam('tab');
    if (socialTab) switchSocialTab(socialTab);
  }
  if (currentPageName === 'spaces') {
    var spacesTab = getUrlParam('tab');
    if (spacesTab) switchSpacesTab(spacesTab);
  }
}

/* ── Stat Ticker ──────────────────────────────────── */
function getSeasonPercent() {
  var total = 0;
  var unlocked = 0;
  for (var c = 0; c < seasonData.length; c++) {
    var rewards = seasonData[c].rewards;
    for (var r = 0; r < rewards.length; r++) {
      total++;
      if (rewards[r].unlocked) unlocked++;
    }
  }
  return total > 0 ? Math.round((unlocked / total) * 100) : 0;
}

function getActiveProfile() {
  for (var i = 0; i < profiles.length; i++) {
    if (profiles[i].id === activeProfileId) return profiles[i];
  }
  return profiles[0];
}

function openNameEditor() {
  var profile = getActiveProfile();
  var overlay = document.getElementById('option-picker-overlay');
  var panel = document.getElementById('option-picker-panel');
  overlay.style.display = 'flex';
  panel.innerHTML = '';

  var title = document.createElement('div');
  title.className = 'option-picker-title';
  title.textContent = 'Edit Name';
  panel.appendChild(title);

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'name-editor-input';
  input.value = profile.name;
  input.maxLength = 20;
  input.placeholder = 'Enter your name';
  panel.appendChild(input);

  var saveBtn = document.createElement('button');
  saveBtn.className = 'name-editor-save';
  saveBtn.textContent = 'Save';
  saveBtn.onclick = function() {
    var newName = input.value.replace(/^\s+|\s+$/g, '');
    if (!newName) return;
    profile.name = newName;
    document.querySelector('.profile-name').textContent = newName;
    sendToUnity('updateName', newName);
    closeOptionPicker();
  };
  panel.appendChild(saveBtn);

  setTimeout(function() { input.focus(); }, 100);
}

function initStatTicker() {
  var ticker = document.getElementById('stat-ticker');
  var p = getActiveProfile();
  var stats = [
    'Level ' + p.level,
    p.xp.toLocaleString() + ' / ' + p.xpMax.toLocaleString() + ' XP',
    p.coins.toLocaleString() + ' Jamsesh Picks',
    getSeasonPercent() + '% Season Complete'
  ];
  var idx = 0;

  for (var i = 0; i < stats.length; i++) {
    var el = document.createElement('div');
    el.className = 'xp-text' + (i === 0 ? ' ticker-active' : '');
    el.textContent = stats[i];
    ticker.appendChild(el);
  }

  var coinBody = document.querySelector('.coin-body');
  setInterval(function() {
    var lines = ticker.querySelectorAll('.xp-text');
    if (lines.length === 0) return;
    var curr = idx;
    var next = (idx + 1) % lines.length;

    lines[curr].className = 'xp-text ticker-exit';
    lines[next].className = 'xp-text ticker-active';

    // Spin coin once per ticker rotation
    if (coinBody) {
      coinBody.className = 'coin-body';
      void coinBody.offsetWidth; // force reflow to restart animation
      coinBody.className = 'coin-body spinning';
    }

    idx = next;
  }, 5000);
}
