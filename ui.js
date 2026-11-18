/* ================= UI LAYER ================= */
(function(){
  if (window.__siteKey !== 'ok') {
    return;
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s=>document.querySelector(s), $$ = s=>Array.from(document.querySelectorAll(s));

  /* ===== project data (real screenshots + real live links) ===== */
const PROJECTS = [
  {id:"PRJ_001", name:"MyDaksha Browser", cat:"dev", badge:"In dev", badgeCls:"dev",
   desc:"An AI-supported browser that doesn't just display pages — it understands them. Built for people who want the web to move at their speed.",
   feats:["AI copilot that summarizes any page in one click","Smart tab clustering — tabs that organize themselves","Voice command mode: \u201cDaksha, find me the answer\u201d","Focus mode that mutes the noise and keeps the signal"],
   meta:[["Role","Design + Build"],["Type","AI Browser"],["Year","2025\u201326"]], live:null, img:null},
  {id:"PRJ_002", name:"Chatbot AURA", cat:"dev", badge:"In beta", badgeCls:"beta",
   desc:"A presence that listens. Pick an open weight model, paste your API key, and talk to Aura with a live voice agent \u2014 she speaks her answers out loud, like a human.",
   feats:["Select an open weight model","Paste your API key","Talk with a live voice agent","Aura 3D orb effect","Speak out responses like a human","More coming soon\u2026 in beta phase"],
   meta:[["Type","Voice AI"],["Model","Open weight"],["Year","2026"]], live:null, img:"assets/projects/proj-1.webp"},
  {id:"PRJ_003", name:"CYBER/UI Kit", cat:"live", badge:"Live", badgeCls:"live",
   desc:"A cyberpunk component library — the exact design system powering this page. Glitch headings, HUD cards, neon terminals: all packaged and reusable.",
   feats:["40+ components, zero dependencies","CSS-only glitch, scanline & HUD effects","Dark-first tokens, fully themeable"],
   meta:[["Type","Design System"],["Scope","40+ components"]], live:"https://shresthaxcoder.github.io/ui/", img:"assets/projects/proj-2.webp", file:"ui/index.html"},
  {id:"PRJ_004", name:"Daksha Studio", cat:"dev", badge:"In beta", badgeCls:"beta",
   desc:"An AI-assisted design playground for frontend devs. Describe a layout, get a live, editable, neon-styled prototype in seconds.",
   feats:["Prompt-to-UI generation with live preview","Code export as clean HTML / CSS","Real-time theme morphing engine"],
   meta:[["Type","AI Design Tool"],["Year","2026"]], live:null, img:"assets/projects/proj-3.webp"},
  {id:"PRJ_005", name:"Weather.Now", cat:"live", badge:"Live", badgeCls:"live",
   desc:"Pick your city and the sky rebuilds itself around the real numbers — sun and drifting clouds on a clear day, rain, lightning, snow and fog.",
   feats:["Real temperature, humidity and wind, updated live","Animated sky that reacts to actual conditions","24-hour & 7-day forecasts, day and night scenes"],
   meta:[["Type","Weather App"],["Year","2026"]], live:"https://shresthaxcoder.github.io/weather/", img:"assets/projects/proj-4.webp", file:"weather/index.html"},
  {id:"PRJ_006", name:"Mission Control", cat:"live", badge:"Live", badgeCls:"live",
   desc:"A ground-station console for India's space programme — upcoming launches with countdowns ticking to the second, and an archive of the missions that made history.",
   feats:["Live launch feed with day / hour / minute / second countdowns","Filterable archive of real ISRO missions and vehicles","IST ground-station clock with an offline archive mode"],
   meta:[["Type","Live Dashboard"],["Year","2026"]], live:"https://shresthaxcoder.github.io/isro/", img:"assets/projects/proj-5.webp", file:"isro/index.html"},
  {id:"PRJ_007", name:"Cube 2047", cat:"live", badge:"Live", badgeCls:"live",
   desc:"A full 3D Rubik's Cube in the browser. The AI scrambles it, you drag the stickers to turn the layers and solve it by hand — smart hints step in when you get stuck.",
   feats:["Real 3D cube you can orbit and turn, face by face","AI scramble with instant solve-detection","10 hints per game that nudge the cube toward solved"],
   meta:[["Type","3D Puzzle"],["Year","2026"]], live:"https://shresthaxcoder.github.io/rubik/", img:"assets/projects/proj-6.webp", file:"rubik/index.html"}
];
window.__PROJECTS = PROJECTS;

  /* loader — the logo draws itself, then the world appears */
  (function(){
    const l = $('#loader');
    if(!l) return;
    const line = l.querySelector('.splash-draw');
    const rest = l.querySelector('.splash-rest');
    const word = l.querySelector('.splash-name');

    // The heavy 3D build waits on this promise, so the main thread stays free
    // while the logo is drawing. That is what keeps the animation smooth.
    let freeTheWorld = null;
    window.__splashDone = new Promise(function(resolve){ freeTheWorld = resolve; });
    function releaseWorld(){ if(freeTheWorld) freeTheWorld(); }

    function beginDraw(){
      if(line && line.getTotalLength){
        const len = line.getTotalLength();
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.getBoundingClientRect();
        line.classList.add('draw');
      }
      setTimeout(function(){ if(rest) rest.classList.add('in'); }, 900);
      setTimeout(function(){ if(word) word.classList.add('in'); }, 1120);
      // let the world start building while the splash is still on screen
      setTimeout(releaseWorld, 1150);
    }

    function hideLoader(){
      const el = $('#loader');
      if(el){
        el.classList.add('done');
        // once it has faded, take it out of the page completely so it can never
        // sit on top of anything or leave a haze behind
        setTimeout(function(){ el.style.display = 'none'; }, 700);
      }
      releaseWorld();
    }

    // begin on a clean frame rather than mid-parse
    requestAnimationFrame(function(){ requestAnimationFrame(beginDraw); });

    // fixed timing, so a slow download can never leave the splash stuck open
    setTimeout(hideLoader, 2350);
    setTimeout(hideLoader, 6000);
  })();

  const HI_MAP = {
    "Core": "कोर",
    "AI & Backend": "AI और बैकएंड",
    "Toolkit": "टूलकिट",
    "UI / UX Design": "UI / UX डिज़ाइन",
    "LLM API Integration": "LLM API इंटीग्रेशन",
    "AI Workflows": "AI वर्कफ़्लो",
    "Discovered code": "खोजा गया कोड",
    "Started building with AI": "AI के साथ निर्माण शुरू किया",
    "Building the future": "भविष्य का निर्माण",
    "Opened DevTools on a website out of curiosity. Changed a color. Watched the whole page change.": "उत्सुकतावश एक वेबसाइट पर DevTools खोले। रंग बदला। पूरा पेज बदलते देखा।",
    "Months of building bad websites on purpose. Every broken layout taught something.": "जानबूझकर महीनों तक खराब वेबसाइट बनाईं। हर टूटे लेआउट ने कुछ सिखाया।",
    "Built my first chatbot, then realized AI could live inside everything I make.": "अपना पहला चैटबॉट बनाया, फिर एहसास हुआ कि AI मेरी बनाई हर चीज़ के अंदर रह सकता है।",
    "Developing MyDaksha, the AI-supported browser, and designing the interfaces I want to use in 2047.": "MyDaksha, AI-समर्थित ब्राउज़र विकसित करना, और उन इंटरफेस को डिज़ाइन करना जिनका मैं 2047 में उपयोग करना चाहता हूँ।",
    "MyDaksha Browser": "MyDaksha ब्राउज़र",
    "Chatbot AURA": "चैटबॉट AURA",
    "Daksha Studio": "Daksha स्टूडियो",
    "Mission Control": "मिशन कंट्रोल",
    "In dev": "dev में",
    "In beta": "beta में",
    "Live": "लाइव",
    "An AI-supported browser that doesn't just display pages — it understands them. Built for people who want the web to move at their speed.": "एक AI-समर्थित ब्राउज़र जो सिर्फ पेज नहीं दिखाता — बल्कि उन्हें समझता है। उन लोगों के लिए बनाया गया है जो चाहते हैं कि वेब उनकी गति से चले।",
    "एक आवाज़ जो सुनती है। कोई भी ओपन वेट मॉडल चुनें, अपनी API की डालें, और AURA से लाइव वॉइस एजेंट की तरह बात करें — वह जवाब बोलकर देती है, इंसान की तरह।": "MyDaksha यूनिवर्स के अंदर AI असिस्टेंट — इसे कुछ भी पूछें, कोई तस्वीर दें, या जब आप चाय पी रहे हों तो इसे किसी विषय पर गहराई से रिसर्च करने दें।",
    "A cyberpunk component library — the exact design system powering this page. Glitch headings, HUD cards, neon terminals: all packaged and reusable.": "एक साइबरपंक कंपोनेंट लाइब्रेरी — यह पेज जिस डिज़ाइन सिस्टम से चल रहा है, बिल्कुल वही। ग्लिच हेडिंग्स, HUD कार्ड्स, नियॉन टर्मिनल्स: सब पैक और दोबारा इस्तेमाल लायक।",
    "An AI-assisted design playground for frontend devs. Describe a layout, get a live, editable, neon-styled prototype in seconds.": "फ्रंटएंड डेवलपर्स के लिए एक AI-सहायता प्राप्त डिज़ाइन प्लेग्राउंड। एक लेआउट बताएं, और कुछ ही सेकंड में लाइव, एडिट करने योग्य, नियॉन-स्टाइल वाला प्रोटोटाइप पाएं।",
    "Pick your city and the sky rebuilds itself around the real numbers — sun and drifting clouds on a clear day, rain, lightning, snow and fog.": "अपना शहर चुनें और आसमान असली डेटा के आधार पर खुद को फिर से बनाता है — साफ दिन में सूरज और उड़ते बादल, बारिश, बिजली, बर्फ और कोहरा।",
    "A ground-station console for India's space programme — upcoming launches with countdowns ticking to the second, and an archive of the missions that made history.": "भारत के अंतरिक्ष कार्यक्रम के लिए एक ग्राउंड-स्टेशन कंसोल — आने वाले लॉन्च सेकंड-दर-सेकंड काउंटडाउन के साथ, और इतिहास रचने वाले मिशनों का संग्रह।",
    "A full 3D Rubik's Cube in the browser. The AI scrambles it, you drag the stickers to turn the layers and solve it by hand.": "ब्राउज़र में एक पूरा 3D Rubik's Cube। AI इसे मिला देता है, आप लेयर्स मोड़ने के लिए स्टिकर्स खींचते हैं और इसे हाथ से सॉल्व करते हैं।",
    "Say hello": "हैलो कहें",
    "Cat person": "बिल्ली प्रेमी",
    "Laser master": "लेज़र मास्टर",
    "Time traveller": "टाइम ट्रैवलर",
    "Model": "मॉडल",
    "Photographer": "फोटोग्राफर",
    "Zen": "ज़ेन",
    "Show off": "दिखावा करें",
    "Player one": "प्लेयर वन",
    "Musician": "संगीतकार",
    "Be yourself": "जैसे हैं वैसे रहें",
    "Double-tap the screen": "स्क्रीन को डबल-टैप करें",
    "Pet the cat ten times": "बिल्ली को दस बार सहलाएं",
    "Turn on the laser pointer": "लेज़र पॉइंटर चालू करें",
    "Move the time machine": "टाइम मशीन घुमाएं",
    "Change the boy's pose": "लड़के का पोज़ बदलें",
    "Save a photo of the boy": "लड़के की फोटो सेव करें",
    "Enter focus mode": "फोकस मोड में जाएं",
    "Share a view of the world": "दुनिया का नज़ारा शेयर करें",
    "Open the tower defence": "टावर डिफेंस खोलें",
    "Open the voxel piano": "वोक्सेल पियानो खोलें",
    "Build your own avatar": "अपना अवतार बनाएं",
    "Time of day": "दिन का समय",
    "Time machine": "टाइम मशीन",
    "Weather": "मौसम",
    "Display": "डिस्प्ले",
    "Clear": "साफ़",
    "Rain": "बारिश",
    "Snow": "बर्फ",
    "Reduce motion": "मोशन कम करें",
    "High contrast": "हाई कॉन्ट्रास्ट",
    "Voxel cursor": "वोक्सेल कर्सर",
    "Ambient sound": "एम्बिएंट साउंड",
    "Focus mode": "फोकस मोड",
    "Watermark": "वॉटरमार्क",
    "Wave": "हाथ हिलाएं",
    "Arms up": "हाथ ऊपर",
    "Sideways": "बगल में",
    "Relaxed": "आराम से",
    "Looking away": "दूसरी तरफ",
    "Save photo": "फोटो सेव करें",
    "Role": "भूमिका",
    "Focus": "फोकस",
    "Base": "आधार",
    "Status": "स्थिति",
    "Building": "निर्माण",
    "Home": "होम",
    "About": "बारे में",
    "Work": "काम",
    "Skills": "स्किल्स",
    "Journey": "सफर",
    "Contact": "संपर्क",
    "Open for projects": "प्रोजेक्ट्स के लिए उपलब्ध",
    "07 builds · live links": "07 बिल्ड्स · लाइव लिंक",
    "See the work": "काम देखें",
    "Get in touch": "संपर्क करें",
    "Let's talk": "चलिए बात करते हैं",
    "HTML / CSS": "HTML / CSS",
    "JavaScript": "JavaScript",
    "React": "React",
    "Python": "Python",
    "Node.js": "Node.js",
    "Three.js": "Three.js",
    "Responsive": "रेस्पॉन्सिव",
    "Animation": "एनिमेशन",
    "Design Systems": "डिज़ाइन सिस्टम",
    "Prompt Engineering": "प्रॉम्प्ट इंजीनियरिंग",
    "Prompt-driven": "प्रॉम्प्ट-चालित",
  };

  /* Translate every text node on the page using the dictionary above.
     This catches the content that JavaScript renders, like project cards. */
  const originalText = new WeakMap();
  let translating = false;

  function translateTree(){
    if(translating) return;
    translating = true;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while(node){
      if(!originalText.has(node)){ originalText.set(node, node.nodeValue); }
      const raw = originalText.get(node);
      const key = raw.trim();
      if(key && HI_MAP[key]){ node.nodeValue = raw.replace(key, HI_MAP[key]); }
      node = walker.nextNode();
    }
    translating = false;
  }

  function restoreTree(){
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();
    while(node){
      if(originalText.has(node)){ node.nodeValue = originalText.get(node); }
      node = walker.nextNode();
    }
  }

  /* ---------- settings: the Hindi toggle ---------- */
  (function(){
    const panel = $('#settingsPanel');
    const btn = $('#settingsBtn');
    if(!panel || !btn) return;

    let lang = 'en';
    try { lang = window.localStorage.getItem('shrestha-lang') || 'en'; } catch(e){ lang = 'en'; }

    function applyLang(next){
      lang = next;
      document.documentElement.lang = next === 'hi' ? 'hi' : 'en';
      document.body.classList.toggle('lang-hi', next === 'hi');
      document.querySelectorAll('[data-hi]').forEach(function(el){
        if(!el.dataset.en){ el.dataset.en = el.innerHTML; }
        el.innerHTML = next === 'hi' ? el.dataset.hi : el.dataset.en;
      });
      if(next === 'hi'){ translateTree(); } else { restoreTree(); }
      panel.querySelectorAll('[data-lang]').forEach(function(b){
        b.classList.toggle('on', b.getAttribute('data-lang') === next);
      });
      try { window.localStorage.setItem('shrestha-lang', next); } catch(e){}
    }

    btn.addEventListener('click', function(){ panel.classList.add('show'); });
    if($('#settingsClose')) $('#settingsClose').addEventListener('click', function(){ panel.classList.remove('show'); });
    panel.addEventListener('click', function(e){
      const choice = e.target.closest('[data-lang]');
      if(choice){
        applyLang(choice.getAttribute('data-lang'));
        toast(choice.getAttribute('data-lang') === 'hi' ? 'भाषा: हिन्दी' : 'language: english');
        return;
      }
      if(e.target === panel){ panel.classList.remove('show'); }
    });

    if(lang === 'hi'){ applyLang('hi'); }

    // anything rendered later (a project card, the modal) gets translated too
    const watcher = new MutationObserver(function(){ if(lang === 'hi'){ translateTree(); } });
    watcher.observe(document.body, { childList: true, subtree: true });
  })();

  /* ---------- badges: little things to find ---------- */
  const BADGES = [
    { id: 'hello',  ico: '\u2726', title: 'Say hello',      hint: 'Double-tap the screen' },
    { id: 'laser',  ico: '\u25C9', title: 'Laser master',   hint: 'Turn on the laser pointer' },
    { id: 'travel', ico: '\u25F7', title: 'Time traveller', hint: 'Move the time machine' },
    { id: 'pose',   ico: '\u270E', title: 'Model',          hint: 'Change the boy\u2019s pose' },
    { id: 'photo',  ico: '\u25A3', title: 'Photographer',   hint: 'Save a photo of the boy' },
    { id: 'focus',  ico: '\u25CE', title: 'Zen',            hint: 'Enter focus mode' },
    { id: 'share',  ico: '\u2197', title: 'Show off',       hint: 'Share a view of the world' },
    { id: 'game',   ico: '\u25B6', title: 'Player one',     hint: 'Open the tower defence' },
    { id: 'piano',  ico: '\u266B', title: 'Musician',       hint: 'Open the voxel piano' },
    { id: 'avatar', ico: '\u263A', title: 'Be yourself',    hint: 'Build your own avatar' }
  ];
  const BADGE_KEY = 'shrestha-badges';
  let earned = [];
  try { earned = JSON.parse(window.localStorage.getItem(BADGE_KEY) || '[]'); } catch(e){ earned = []; }
  if(!Array.isArray(earned)){ earned = []; }

  const badgeList = $('#badgeList');
  const badgeCount = $('#badgeCount');
  const badgeTally = $('#badgeTally');
  const badgePanel = $('#badgePanel');

  function paintBadges(){
    if(badgeCount) badgeCount.textContent = String(earned.length);
    if(badgeTally) badgeTally.textContent = earned.length + ' / ' + BADGES.length;
    if(!badgeList) return;
    badgeList.innerHTML = BADGES.map(function(b){
      const got = earned.indexOf(b.id) !== -1;
      return '<li class="' + (got ? 'got' : '') + '">'
        + '<span class="badge-ico">' + b.ico + '</span>'
        + '<span class="badge-txt"><b>' + b.title + '</b><span>' + b.hint + '</span></span></li>';
    }).join('');
  }

  let badgeToastTimer = null;
  function showBadgeToast(b){
    let el = $('#badgeToast');
    if(!el){
      el = document.createElement('div');
      el.className = 'badge-toast';
      el.id = 'badgeToast';
      document.body.appendChild(el);
    }
    el.innerHTML = '<em>' + b.ico + '</em><span><i>Badge unlocked</i><b>' + b.title + '</b></span>';
    el.classList.add('show');
    if(badgeToastTimer) clearTimeout(badgeToastTimer);
    badgeToastTimer = setTimeout(function(){ el.classList.remove('show'); }, 2800);
  }

  function unlockBadge(id){
    if(earned.indexOf(id) !== -1) return;
    const b = BADGES.filter(function(x){ return x.id === id; })[0];
    if(!b) return;
    earned.push(id);
    try { window.localStorage.setItem(BADGE_KEY, JSON.stringify(earned)); } catch(e){}
    paintBadges();
    showBadgeToast(b);
  }
  paintBadges();

  if($('#badgeBtn')) $('#badgeBtn').addEventListener('click', function(){
    if(badgePanel) badgePanel.classList.add('show');
  });
  if($('#badgeClose')) $('#badgeClose').addEventListener('click', function(){
    if(badgePanel) badgePanel.classList.remove('show');
  });
  if(badgePanel) badgePanel.addEventListener('click', function(e){
    if(e.target === badgePanel) badgePanel.classList.remove('show');
  });

  /* ---------- a little cat that chases the cursor ---------- */
  (function(){
    const cat = $('#petCat');
    if(!cat) return;
    const dot = $('#laserDot');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let facing = 1, started = true, idle = 30, still = 0;
    let halfW = 14, halfH = 12;
    let laserOn = false;
    let purrCtx = null;

    function measure(){
      halfW = cat.offsetWidth / 2;
      halfH = cat.offsetHeight / 2;
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    // park him on the page straight away, so he is always easy to spot
    cx = Math.round(window.innerWidth * 0.72);
    cy = Math.round(window.innerHeight * 0.78);
    tx = cx;
    ty = cy;
    cat.classList.add('on', 'sitting');

    function aim(e){
      const p = (e.touches && e.touches[0]) ? e.touches[0] : e;
      if(!p || typeof p.clientX !== 'number') return;
      if(p.clientX === 0 && p.clientY === 0) return;
      tx = p.clientX; ty = p.clientY;
      if(dot && laserOn){
        dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
      }
      if(!started){ started = true; cat.classList.add('on'); }
    }
    window.addEventListener('pointermove', aim, {passive:true});
    window.addEventListener('touchmove', aim, {passive:true});
    window.addEventListener('touchstart', aim, {passive:true});

    /* ---------- petting ---------- */
    let pets = 0;
    try { pets = parseInt(window.localStorage.getItem('shrestha-pets') || '0', 10) || 0; } catch(e){ pets = 0; }

    function purr(){
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if(!AC) return;
        if(!purrCtx) purrCtx = new AC();
        if(purrCtx.state === 'suspended') purrCtx.resume();
        const t0 = purrCtx.currentTime;
        const osc = purrCtx.createOscillator();
        const gain = purrCtx.createGain();
        const lfo = purrCtx.createOscillator();
        const lfoGain = purrCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 44;
        lfo.type = 'sine';
        lfo.frequency.value = 26;
        lfoGain.gain.value = 0.035;
        gain.gain.value = 0.045;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        osc.connect(gain);
        gain.connect(purrCtx.destination);
        osc.start(t0);
        lfo.start(t0);
        gain.gain.setTargetAtTime(0, t0 + 0.55, 0.22);
        osc.stop(t0 + 1.7);
        lfo.stop(t0 + 1.7);
      } catch(e){}
    }

    function popHearts(){
      const r = cat.getBoundingClientRect();
      let i = 0;
      while(i < 5){
        const h = document.createElement('span');
        h.className = 'pet-heart';
        h.textContent = '\u2665';
        h.style.left = (r.left + r.width / 2 + (Math.random() - 0.5) * 22) + 'px';
        h.style.top = (r.top + r.height / 2) + 'px';
        h.style.animationDelay = (i * 0.06) + 's';
        document.body.appendChild(h);
        setTimeout(function(){ h.remove(); }, 1500);
        i = i + 1;
      }
    }

    cat.addEventListener('pointerdown', function(e){
      e.preventDefault();
      e.stopPropagation();
      pets = pets + 1;
      try { window.localStorage.setItem('shrestha-pets', String(pets)); } catch(err){}
      popHearts();
      purr();
      cat.classList.add('pouncing');
      setTimeout(function(){ cat.classList.remove('pouncing'); }, 470);
      toast('petted ' + pets + ' time' + (pets === 1 ? '' : 's'));
      if(pets >= 10){ unlockBadge('pet'); }
    });

    /* ---------- the laser pointer ---------- */
    const laserBtn = $('#laserBtn');
    if(laserBtn){
      laserBtn.addEventListener('click', function(){
        laserOn = !laserOn;
        laserBtn.classList.toggle('on', laserOn);
        if(dot){
          dot.classList.toggle('on', laserOn);
          dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
        }
        if(laserOn){
          unlockBadge('laser');
          toast('laser on \u2014 here kitty');
        } else {
          toast('laser off');
        }
      });
    }

    function chase(){
      requestAnimationFrame(chase);
      if(!started) return;
      const dx = tx - cx;
      const dy = ty - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const keepAway = laserOn ? 5 : 30;
      if(dist > keepAway + 0.5){
        const closing = dist - keepAway;
        const step = Math.min(closing, closing * (laserOn ? 0.32 : 0.22) + 1.6);
        cx = cx + (dx / dist) * step;
        cy = cy + (dy / dist) * step;
        if(Math.abs(dx) > 0.7){ facing = dx > 0 ? 1 : -1; }
        idle = 0;
      } else {
        idle = idle + 1;
      }
      const running = dist > keepAway + (laserOn ? 3 : 8);
      if(laserOn && dist < keepAway + 4){ still = still + 1; } else { still = 0; }
      if(laserOn && still === 26){
        cat.classList.add('pouncing');
        setTimeout(function(){ cat.classList.remove('pouncing'); }, 470);
      }
      cat.style.transform = 'translate3d(' + (cx - halfW) + 'px,' + (cy - halfH) + 'px,0) scaleX(' + facing + ')';
      cat.classList.toggle('running', running);
      cat.classList.toggle('sitting', !laserOn && idle > 22);
    }
    requestAnimationFrame(chase);
  })();

  /* ---------- the voxel piano ---------- */
  (function(){
    const bar = $('#piano');
    const btn = $('#pianoBtn');
    if(!bar || !btn) return;
    let ctx = null;

    function note(freq){
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if(!AC) return;
        if(!ctx) ctx = new AC();
        if(ctx.state === 'suspended') ctx.resume();
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const shimmer = ctx.createOscillator();
        const gain = ctx.createGain();
        const shimmerGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        shimmer.type = 'sine';
        shimmer.frequency.value = freq * 2;
        shimmerGain.gain.value = 0.26;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.95);
        osc.connect(gain);
        shimmer.connect(shimmerGain);
        shimmerGain.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        shimmer.start(t0);
        osc.stop(t0 + 1);
        shimmer.stop(t0 + 1);
      } catch(e){}
    }

    bar.querySelectorAll('.pkey').forEach(function(k, i){
      k.style.setProperty('--kc', 'hsl(' + ((i * 29) % 360) + ' 72% 58%)');
    });

    btn.addEventListener('click', function(){
      const open = !bar.classList.contains('show');
      bar.classList.toggle('show', open);
      btn.classList.toggle('on', open);
      if(open){ unlockBadge('piano'); }
    });

    bar.addEventListener('pointerdown', function(e){
      const k = e.target.closest('.pkey');
      if(!k) return;
      const f = parseFloat(k.getAttribute('data-freq'));
      if(f){ note(f); }
      k.classList.add('hit');
      setTimeout(function(){ k.classList.remove('hit'); }, 220);
    });
  })();

  /* ---------- build your avatar ---------- */
  (function(){
    const panel = $('#avatarPanel');
    const btn = $('#avatarBtn');
    if(!panel || !btn) return;

    const PALETTE = {
      skin: ['#f0c9a4', '#e0ab7d', '#c98d5a', '#9c6438'],
      hair: ['#241c16', '#4a3421', '#8a5a2b', '#d8b26a', '#b03a3a'],
      shirt: ['#ff5a3c', '#3a7bd5', '#63b96a', '#ffb03a', '#8f7bff', '#2b3a55'],
      pants: ['#2b3a55', '#3d4a5c', '#5a4632', '#1f2937']
    };

    let picked = { skin: PALETTE.skin[1], hair: PALETTE.hair[0], shirt: PALETTE.shirt[0], pants: PALETTE.pants[0] };
    try {
      const saved = JSON.parse(window.localStorage.getItem('shrestha-avatar') || 'null');
      if(saved && saved.skin){ picked = saved; }
    } catch(e){}

    const preview = $('#avatarPreview');

    function paint(){
      if(preview){
        preview.querySelectorAll('.av-skin').forEach(function(el){ el.setAttribute('fill', picked.skin); });
        preview.querySelectorAll('.av-hair').forEach(function(el){ el.setAttribute('fill', picked.hair); });
        preview.querySelectorAll('.av-shirt').forEach(function(el){ el.setAttribute('fill', picked.shirt); });
        preview.querySelectorAll('.av-arm').forEach(function(el){ el.setAttribute('fill', picked.shirt); });
        preview.querySelectorAll('.av-leg').forEach(function(el){ el.setAttribute('fill', picked.pants); });
      }
      panel.querySelectorAll('.sw').forEach(function(sw){
        const part = sw.parentNode.getAttribute('data-part');
        sw.classList.toggle('on', sw.getAttribute('data-colour') === picked[part]);
      });
    }

    panel.querySelectorAll('.sw-row').forEach(function(row){
      const part = row.getAttribute('data-part');
      row.innerHTML = '';
      PALETTE[part].forEach(function(col){
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sw';
        b.style.background = col;
        b.setAttribute('data-colour', col);
        b.setAttribute('aria-label', part);
        row.appendChild(b);
      });
    });
    paint();

    panel.addEventListener('click', function(e){
      const sw = e.target.closest('.sw');
      if(sw){
        const part = sw.parentNode.getAttribute('data-part');
        picked[part] = sw.getAttribute('data-colour');
        paint();
        return;
      }
      if(e.target === panel){ panel.classList.remove('show'); }
    });

    btn.addEventListener('click', function(){ panel.classList.add('show'); });
    if($('#avatarClose')) $('#avatarClose').addEventListener('click', function(){ panel.classList.remove('show'); });
    if($('#avatarDone')) $('#avatarDone').addEventListener('click', function(){
      try { window.localStorage.setItem('shrestha-avatar', JSON.stringify(picked)); } catch(e){}
      if(window.__setAvatar){
        window.__setAvatar({ skin: picked.skin, hair: picked.hair, shirt: picked.shirt, pants: picked.pants });
        unlockBadge('avatar');
        toast('your avatar is on the island');
      } else {
        toast('the island is still loading \u2014 try again in a moment');
      }
      panel.classList.remove('show');
    });

    window.__pendingAvatar = picked;
  })();

  /* opening the game earns a badge */
  const playLink = document.querySelector('.play-btn');
  if(playLink){
    playLink.addEventListener('click', function(){ unlockBadge('game'); });
  }

  /* nav */
  const nav = $('#nav');
  const progress = $('#progress');
  if(progress){ for(let i=0;i<28;i++) progress.appendChild(document.createElement('i')); }
  const railFill = $('#railFill'), timeline = $('#timeline');
  function onScroll(){
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y>30);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h>0 ? y/h : 0;
    if(progress) progress.style.width = (p*100)+'%';
    const dock = $('#dock'); if(dock) dock.classList.toggle('show', y > window.innerHeight*0.7);
    if(railFill && timeline){
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.max(0, Math.min(1, (vh*0.75 - r.top) / r.height));
      railFill.style.height = (prog*100)+'%';
    }
    // active nav link
    let cur=''; $$('main section, header.hero').forEach(sec=>{
      const r = sec.getBoundingClientRect();
      if(r.top <= vh*0.4 && r.bottom > vh*0.4) cur = sec.id;
    });
    $$('#navLinks a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+cur));
  }
  let vh = window.innerHeight;
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', ()=>{ vh=window.innerHeight; onScroll(); });
  onScroll();

  const toggle = $('#navToggle');
  toggle && toggle.addEventListener('click', ()=> nav.classList.toggle('open'));
  $$('#navLinks a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  /* theme */
  const themeBtn = $('#themeBtn');
  const saved = (function(){ try{ return localStorage.getItem('shrestha-theme'); }catch(e){ return null; } })();
  if(saved) document.documentElement.setAttribute('data-theme', saved);
  themeBtn && themeBtn.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme')==='dark' ? 'light':'dark';
    document.documentElement.setAttribute('data-theme', cur);
    try{ localStorage.setItem('shrestha-theme', cur); }catch(e){}
    toast(cur==='dark' ? 'dark mode' : 'light mode');
  });

  /* clock */
  const clockEl = $('#clock');
  function tick(){ if(!clockEl) return;
    const d = new Date(Date.now() + (new Date().getTimezoneOffset()+330)*60000);
    clockEl.textContent = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' IST'; }
  tick(); setInterval(tick, 20000);

  /* reveal */
  const io = new IntersectionObserver(es=>{ es.forEach((e,i)=>{ if(e.isIntersecting){
    e.target.style.transitionDelay = Math.min(i,6)*65+'ms'; e.target.classList.add('in'); io.unobserve(e.target); } }); },
    {threshold:0.12, rootMargin:'0px 0px -6% 0px'});
  $$('.reveal, .tl-item').forEach(el=>io.observe(el));

  /* terminal typing */
  const termBody = $('#termBody');
  if(termBody){
    const lines = [
      ['whoami','shrestha — frontend designer & AI builder'],
      ['cat mission.txt','\u201cDesign interfaces that feel alive.\u201d'],
      ['uptime --human','14 years \u00b7 coding since age 11 \u00b7 zero brakes'],
      ['ls projects/','mydaksha-browser  chatbot-aura  cyber-ui  daksha-studio  weather.now  mission-control  cube-2047'],
      ['status','building MyDaksha browser // v0.4 dev']
    ];
    let li=0;
    function typeLine(){
      if(li>=lines.length){ const c=document.createElement('div'); c.innerHTML='<span class="caret"></span>'; termBody.appendChild(c); return; }
      const [cmd,out] = lines[li];
      const row = document.createElement('div'); row.className='row';
      const c = document.createElement('div'); c.className='cmd'; row.appendChild(c);
      const o = document.createElement('div'); o.className='out'+(li===4?' ok':(li===3?' amber':'')); row.appendChild(o);
      termBody.appendChild(row);
      let i=0;
      (function type(){ if(i<=cmd.length){ c.textContent = cmd.slice(0,i); i++; setTimeout(type, 42); }
        else { o.textContent = out; li++; setTimeout(typeLine, 340); } })();
    }
    const tio = new IntersectionObserver(es=>{ if(es[0].isIntersecting){ tio.disconnect(); typeLine(); } }, {threshold:0.3});
    tio.observe(termBody);
  }

  /* projects */
  const projects = $('#projects');
  const DATA = PROJECTS;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  function shotHTML(p){
    if(p.img) return '<div class="shot"><div class="chrome"><i></i><i></i><i></i><span>'+p.file+'</span></div><img src="'+p.img+'" alt="'+p.name+' screenshot" loading="lazy"></div>';
    return '<div class="shot"><div class="ph"><span class="cube"></span><span>in development</span></div></div>';
  }
  if(projects){
    projects.innerHTML = DATA.map(p=>{
      const live = p.live ? '<a class="mini solid" href="'+p.live+'" target="_blank" rel="noopener">Live site'+arrow+'</a>' : '';
      return '<article class="card'+(p.id==='PRJ_001'?' flagship':'')+'" data-cat="'+p.cat+'">'
        + shotHTML(p)
        + '<div class="card-body"><div class="card-head"><span class="card-id">'+p.id+(p.id==='PRJ_001'?' \u00b7 Flagship':'')+'</span>'
        + '<span class="badge '+p.badgeCls+'">'+p.badge+'</span></div>'
        + '<h3>'+p.name+'</h3><p>'+p.desc+'</p>'
        + '<ul>'+p.feats.slice(0,6).map(f=>'<li>'+f+'</li>').join('')+'</ul>'
        + '<div class="card-meta">'+p.meta.map(m=>'<span>'+m[0]+'<b>'+m[1]+'</b></span>').join('')+'</div>'
        + '<div class="card-actions"><button class="mini" data-open="'+p.id+'">Details'+arrow+'</button>'+live+'</div>'
        + '</div></article>';
    }).join('');
  }

  /* filters */
  const filters = $('#filters');
  filters && filters.addEventListener('click', e=>{
    const b = e.target.closest('button'); if(!b) return;
    $$('#filters button').forEach(x=>x.classList.toggle('on', x===b));
    const f = b.dataset.f;
    $$('#projects .card').forEach(c=>c.classList.toggle('hide', !(f==='all' || c.dataset.cat===f)));
  });

  /* modal */
  const modal = $('#modal');
  function openModal(id){
    const p = DATA.find(x=>x.id===id); if(!p) return;
    $('#mShot').innerHTML = p.img ? '<img src="'+p.img+'" alt="'+p.name+'">' : '<div class="ph" style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.5);font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase">in development</div>';
    $('#mId').textContent = p.id + ' \u00b7 ' + p.badge;
    $('#mTitle').textContent = p.name;
    $('#mDesc').textContent = p.desc;
    $('#mList').innerHTML = p.feats.map(f=>'<li>'+f+'</li>').join('');
    $('#mMeta').innerHTML = p.meta.map(m=>'<span>'+m[0]+'<b>'+m[1]+'</b></span>').join('');
    $('#mActions').innerHTML = (p.live ? '<a class="mini solid" href="'+p.live+'" target="_blank" rel="noopener">Open live site'+arrow+'</a>' : '<span class="mini" style="cursor:default">Coming soon</span>')
      + (CASES[p.id] ? '<button class="mini solid" data-case="'+p.id+'">Read the case study</button>' : '')
      + '<button class="mini" data-close>Close</button>';
    modal.classList.add('open'); document.body.classList.add('locked');
  }
  function closeModal(){ modal.classList.remove('open'); document.body.classList.remove('locked'); }
  /* ---------- the About character: boy or girl ---------- */
  let wantedChar = 'boy';
  let charApplied = false;

  function applyChar(kind){
    wantedChar = kind === 'girl' ? 'girl' : 'boy';
    charApplied = false;
    if (window.__boyVariant) {
      window.__boyVariant(wantedChar === 'girl' ? 'girl' : 'boy2');
      charApplied = true;
    }
    const opts = document.querySelectorAll('[data-char]');
    Array.prototype.forEach.call(opts, function(b){
      b.classList.toggle('on', b.getAttribute('data-char') === wantedChar);
    });
  }

  /* the 3D scene loads late, so keep trying until it is there */
  const charTimer = setInterval(function(){
    if (!charApplied && window.__boyVariant) {
      window.__boyVariant(wantedChar === 'girl' ? 'girl' : 'boy2');
      charApplied = true;
      clearInterval(charTimer);
    }
  }, 500);

  document.addEventListener('click', function(e){
    const b = e.target.closest('[data-char]');
    if (!b) { return; }
    applyChar(b.getAttribute('data-char'));
    toast(wantedChar === 'girl' ? 'she is on the island now' : 'he is on the island now');
  });

  /* ---------- views and likes, counted for everyone ----------
     Uses a public hit-counter so the numbers are shared by every visitor
     on every device. If it cannot be reached, the page falls back to a
     count kept on this device so nothing ever shows a broken zero. */
  /* Point this at your own worker (see counter-worker.js) once it is deployed.
     Leave it empty and the page falls back to a public hit counter. */
  const COUNTER_URL = '';
  const COUNTER_BASE = 'https://abacus.jasoncameron.dev';
  const COUNTER_NS = 'shresthaxcoder-github-io';
  const VIEW_KEY = 'shrestha-views';
  const LIKE_KEY = 'shrestha-likes';
  const LIKED_KEY = 'shrestha-liked';
  const SESSION_KEY = 'shrestha-counted';

  function readNum(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      const n = parseInt(raw === null ? '' : raw, 10);
      return isNaN(n) ? fallback : n;
    } catch (e) { return fallback; }
  }
  function writeNum(key, value){
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }

  function counter(path, key){
    let url;
    if (COUNTER_URL) {
      url = COUNTER_URL + '?key=' + encodeURIComponent(key) + (path === 'hit' ? '&hit=1' : '');
    } else {
      url = COUNTER_BASE + '/' + path + '/' + COUNTER_NS + '/' + key;
    }
    return fetch(url, { cache: 'no-store' })
      .then(function(r){ return r.json(); })
      .then(function(d){ return typeof d.value === 'number' ? d.value : null; })
      .catch(function(){ return null; });
  }

  let views = readNum(VIEW_KEY, 0);
  let likes = readNum(LIKE_KEY, 0);
  let liked = (function(){ try { return localStorage.getItem(LIKED_KEY) === '1'; } catch (e) { return false; } })();

  function paintStats(){
    const vc = $('#viewCount');
    if (vc) { vc.textContent = views.toLocaleString('en-IN'); }
    const lc = $('#likeCount');
    if (lc) { lc.textContent = likes.toLocaleString('en-IN'); }
    const lb = $('#likeBtn');
    if (lb) { lb.classList.toggle('liked', liked); }
  }

  function countView(){
    /* one view per device: the first time this browser opens the site it is
       counted, after that it only reads the shared number */
    const SEEN_KEY = 'shrestha-view-counted';
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}

    if (seen) {
      counter('get', 'views').then(function(n){
        if (n !== null) { views = n; writeNum(VIEW_KEY, n); }
        paintStats();
      });
      return;
    }

    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    counter('hit', 'views').then(function(n){
      if (n !== null) {
        views = n;
        writeNum(VIEW_KEY, n);
      } else {
        views = readNum(VIEW_KEY, 0) + 1;
        writeNum(VIEW_KEY, views);
      }
      paintStats();
    });
  }

  paintStats();
  countView();

  counter('get', 'likes').then(function(n){
    if (n !== null) { likes = n; writeNum(LIKE_KEY, n); paintStats(); }
  });

  const likeBtn = $('#likeBtn');
  if (likeBtn) {
    likeBtn.addEventListener('click', function(){
      liked = !liked;
      try { localStorage.setItem(LIKED_KEY, liked ? '1' : '0'); } catch (e) {}
      if (liked) {
        likes += 1;
        paintStats();
        counter('hit', 'likes').then(function(n){
          if (n !== null) { likes = n; writeNum(LIKE_KEY, n); paintStats(); }
        });
        toast('thanks for the like');
      } else {
        likes = Math.max(0, likes - 1);
        paintStats();
        toast('like removed');
      }
    });
  }

  /* ---------- build your own ---------- */
  const buildEl = $('#build');
  const BUILD_STEPS = [
    { q: 'What is your name?', hint: 'This becomes the big word floating over the island. Up to 10 letters.',
      type: 'text', ph: 'Your name', max: 10, min: 1, count: true },
    { q: 'How old are you?', hint: 'It goes into the About section and the terminal. 5 or older.',
      type: 'number', ph: '14', minAge: 5, maxAge: 120 },
    { q: 'Male or female?', hint: 'The little character in the About section changes to match you.',
      type: 'choice', ph: '' },
    { q: 'Describe yourself in one line', hint: 'This replaces the tagline under the world. Between 40 and 50 characters.',
      type: 'text', ph: 'I build strange things on the internet.', max: 50, min: 40, count: true }
  ];
  let bStep = 0;
  const bValues = ['', '', '', ''];
  const ORIGINAL = {};

  function bPaint(){
    const s = BUILD_STEPS[bStep];
    $('#bQ').textContent = s.q;
    $('#bHint').textContent = s.hint;
    const inp = $('#bInput');
    const choices = $('#bChoices');
    if (s.type === 'choice') {
      inp.classList.add('hide');
      choices.classList.add('on');
      Array.prototype.forEach.call(choices.children, function(c){
        c.classList.toggle('sel', c.getAttribute('data-gender') === bValues[bStep]);
      });
    } else {
      inp.classList.remove('hide');
      choices.classList.remove('on');
      inp.type = s.type;
      inp.placeholder = s.ph;
      inp.value = bValues[bStep] || '';
      if (s.max) { inp.setAttribute('maxlength', String(s.max)); } else { inp.removeAttribute('maxlength'); }
      if (s.type === 'number') {
        inp.setAttribute('min', String(s.minAge));
        inp.setAttribute('max', String(s.maxAge));
      } else {
        inp.removeAttribute('min');
        inp.removeAttribute('max');
      }
      bUpdateCount();
    }
    Array.prototype.forEach.call($('#bDots').children, function(d, i){
      d.classList.toggle('on', i <= bStep);
    });
    $('#bBack').style.visibility = bStep === 0 ? 'hidden' : 'visible';
    $('#bNext').textContent = bStep === BUILD_STEPS.length - 1 ? 'Build it' : 'Next';
    if (s.type !== 'choice') { setTimeout(function(){ inp.focus(); }, 80); }
  }

  function bUpdateCount(){
    const s = BUILD_STEPS[bStep];
    const inp = $('#bInput');
    const count = $('#bCount');
    const warn = $('#bWarn');
    if (!count || !warn || !inp) { return; }
    if (!s.count) {
      count.classList.remove('on');
      warn.classList.remove('on');
      return;
    }
    const n = inp.value.length;
    count.classList.add('on');
    count.textContent = n + ' / ' + s.max + (s.min > 1 ? ('  \u00b7  at least ' + s.min) : '');
    if (n > 0 && n < s.min) {
      warn.classList.add('on');
      warn.textContent = 'needs ' + (s.min - n) + ' more character' + ((s.min - n) === 1 ? '' : 's');
    } else {
      warn.classList.remove('on');
    }
  }

  function openBuild(){
    bStep = 0;
    bPaint();
    buildEl.classList.add('open');
    document.body.classList.add('locked');
  }

  function closeBuild(){
    buildEl.classList.remove('open');
    document.body.classList.remove('locked');
  }

  function remember(el, key){
    if (!el) { return; }
    if (!(key in ORIGINAL)) { ORIGINAL[key] = el.innerHTML; }
  }

  function applyIdentity(name, age, desc, gender){
    const nm = (name || '').trim() || 'Shrestha';
    const yr = (age || '').toString().trim();
    const ds = (desc || '').trim();

    const brand = document.querySelector('.brand');
    if (brand) {
      remember(brand, 'brand');
      brand.innerHTML = '<span class="cube"><i></i><i></i><i></i><i></i></span> ' + nm;
    }

    document.title = nm;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) { metaDesc.setAttribute('content', nm + ' — frontend designer and AI builder.'); }

    const kicker = document.querySelector('.hero-kicker');
    if (kicker) {
      remember(kicker, 'kicker');
      kicker.textContent = yr ? (yr + ' years old \u00b7 building things') : 'building things on the internet';
    }

    if (ds) {
      const foot = document.querySelector('.hero-foot p');
      if (foot) {
        remember(foot, 'foot');
        foot.innerHTML = ds;
      }
    }

    const aboutEyebrow = document.querySelector('#about .eyebrow');
    if (aboutEyebrow) {
      remember(aboutEyebrow, 'aboutEyebrow');
      aboutEyebrow.innerHTML = '01 &mdash; Identity';
    }

    const aboutTitle = document.querySelector('#about .title');
    if (aboutTitle) {
      remember(aboutTitle, 'aboutTitle');
      aboutTitle.innerHTML = (yr ? ('Age ' + yr + '.') : 'Hello.') +
        '<br><span class="thin">Not just a number.</span>';
    }

    const aboutP = document.querySelector('#about p');
    if (aboutP) {
      remember(aboutP, 'aboutP');
      aboutP.innerHTML = 'I am <b>' + nm + '</b>' + (yr ? (', ' + yr + ' years old') : '') +
        '. ' + (ds ? ds : 'This page has been rebuilt with my own name on it.');
    }

    const term = document.querySelector('.term-bar .name');
    if (term) {
      remember(term, 'term');
      term.textContent = nm.toLowerCase().replace(/\s+/g, '') + '@daksha: ~/about';
    }

    const w = SC();
    if (w && w.setName) { w.setName(nm); }

    if (gender === 'girl' || gender === 'boy') { applyChar(gender); }

    const boyCaption = document.querySelector('.about-boy .boy-tag');
    if (boyCaption) {
      remember(boyCaption, 'boyTag');
      boyCaption.textContent = gender === 'girl' ? 'This is me!!' : 'This is me!!';
    }

    toast('this page is yours now');
  }

  if ($('#buildBtn')) {
    $('#buildBtn').addEventListener('click', openBuild);
  }
  if (buildEl) {
    $('#bNext').addEventListener('click', function(){
      const step = BUILD_STEPS[bStep];
      const warn = $('#bWarn');
      if (step.type !== 'choice') {
        bValues[bStep] = $('#bInput').value.trim();
      }
      function fail(msg){
        if (warn) { warn.classList.add('on'); warn.textContent = msg; }
        $('#bInput').focus();
      }
      if (bStep === 0) {
        if (!bValues[0]) { fail('a name is needed'); return; }
        if (bValues[0].length > 10) { fail('10 letters at most'); return; }
      }
      if (bStep === 1) {
        const age = parseInt(bValues[1], 10);
        if (isNaN(age) || age < 5) { fail('5 or older, please'); return; }
        if (age > 120) { fail('that is a bit too old'); return; }
        bValues[1] = String(age);
      }
      if (bStep === 2 && !bValues[2]) { return; }
      if (bStep === 3) {
        const len = bValues[3].length;
        if (len < 40) { fail('a little longer \u2014 40 characters at least'); return; }
        if (len > 50) { fail('50 characters at most'); return; }
      }
      if (warn) { warn.classList.remove('on'); }
      if (bStep < BUILD_STEPS.length - 1) { bStep += 1; bPaint(); return; }
      applyIdentity(bValues[0], bValues[1], bValues[3], bValues[2]);
      closeBuild();
    });
    $('#bBack').addEventListener('click', function(){
      if (bStep > 0) { bStep -= 1; bPaint(); }
    });
    $('#bChoices').addEventListener('click', function(e){
      const b = e.target.closest('[data-gender]');
      if (!b) { return; }
      bValues[2] = b.getAttribute('data-gender');
      Array.prototype.forEach.call(this.children, function(c){ c.classList.toggle('sel', c === b); });
      setTimeout(function(){ $('#bNext').click(); }, 220);
    });
    $('#bInput').addEventListener('input', bUpdateCount);
    $('#bInput').addEventListener('keydown', function(e){
      if (e.key === 'Enter') { e.preventDefault(); $('#bNext').click(); }
    });
    buildEl.addEventListener('click', function(e){
      if (e.target.closest('[data-bclose]')) { closeBuild(); }
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && buildEl.classList.contains('open')) { closeBuild(); }
    });
  }

  /* ---------- reviews ----------
     REVIEW_URL: your worker (see counter-worker.js). Leave it empty and
     reviews are kept on this device only. */
  const REVIEW_URL = '';
  const REVIEW_KEY = 'shrestha-reviews';
  const REVIEW_EMAIL = 'iamshresthax@gmail.com';
  const rvForm = $('#reviewForm');
  let rvStars = 0;

  function rvLocal(){
    try { return JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]'); } catch (e) { return []; }
  }
  function rvSaveLocal(list){
    try { localStorage.setItem(REVIEW_KEY, JSON.stringify(list.slice(0, 100))); } catch (e) {}
  }

  function rvLoad(){
    if (REVIEW_URL) {
      return fetch(REVIEW_URL + '?reviews=1', { cache: 'no-store' })
        .then(function(r){ return r.json(); })
        .then(function(d){ return Array.isArray(d.value) ? d.value : rvLocal(); })
        .catch(function(){ return rvLocal(); });
    }
    return Promise.resolve(rvLocal());
  }

  function rvPost(review){
    if (REVIEW_URL) {
      return fetch(REVIEW_URL + '?review=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      })
        .then(function(r){ return r.json(); })
        .then(function(d){ return Array.isArray(d.value) ? d.value : null; })
        .catch(function(){ return null; });
    }
    const list = rvLocal();
    list.unshift(review);
    rvSaveLocal(list);
    return Promise.resolve(list);
  }

  /* opens the visitor's own mail app with everything filled in,
     so one tap on Send and it reaches the inbox */
  function mailReview(review){
    const stars = rvStarsText(review.stars);
    const lines = [
      'Name: ' + review.name,
      'Rating: ' + stars + '  (' + review.stars + ' / 5)'
    ];
    if (review.text) {
      lines.push('');
      lines.push('Review:');
      lines.push(review.text);
    } else {
      lines.push('');
      lines.push('(they left stars only, no words)');
    }
    lines.push('');
    lines.push('Sent from shresthaxcoder.github.io');
    const subject = 'New review from ' + review.name + ' \u2014 ' + stars;
    const body = lines.join('\n');

    const mailtoUrl = 'mailto:' + REVIEW_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    // phones have a mail app; desktops often do not, so send them to Gmail
    const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    if (touch) {
      window.location.href = mailtoUrl;
    } else {
      const gmail = 'https://mail.google.com/mail/?view=cm&fs=1' +
        '&to=' + encodeURIComponent(REVIEW_EMAIL) +
        '&su=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      const win = window.open(gmail, '_blank', 'noopener');
      if (!win) { window.location.href = mailtoUrl; }
    }

    return mailtoUrl;
  }

  function rvStarsText(n){
    let s = '';
    for (let i = 1; i <= 5; i++) { s += i <= n ? '\u2605' : '\u2606'; }
    return s;
  }

  function rvPaint(list){
    const ul = $('#reviewList');
    const avgEl = $('#reviewAvg');
    const noteEl = $('#rvNote');
    if (noteEl) {
      noteEl.textContent = REVIEW_URL ? 'shared with everyone' : (window.matchMedia && window.matchMedia('(pointer: coarse)').matches ? 'opens your mail app' : 'opens Gmail, ready to send');
    }
    if (avgEl) {
      if (!list.length) {
        avgEl.textContent = 'no reviews yet';
      } else {
        const total = list.reduce(function(a, r){ return a + (r.stars || 0); }, 0);
        const avg = (total / list.length).toFixed(1);
        avgEl.innerHTML = '<b>' + avg + '</b> \u00b7 ' + rvStarsText(Math.round(avg)) + ' \u00b7 ' +
          list.length + (list.length === 1 ? ' review' : ' reviews');
      }
    }
    if (!ul) { return; }
    ul.innerHTML = list.slice(0, 12).map(function(r){
      const when = r.ts ? new Date(r.ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      const text = r.text ? '<div class="txt">' + escapeXML(r.text) + '</div>' : '';
      return '<li class="review-item"><div class="who">' +
        '<span class="nm">' + escapeXML(r.name || 'Someone') + '</span>' +
        '<span class="st">' + rvStarsText(r.stars || 0) + '</span>' +
        (when ? '<span class="when">' + when + '</span>' : '') +
        '</div>' + text + '</li>';
    }).join('');
  }

  function rvRefresh(){
    rvLoad().then(rvPaint);
  }

  if (rvForm) {
    const starBtns = document.querySelectorAll('#rvStars button');

    function paintStars(n){
      Array.prototype.forEach.call(starBtns, function(b){
        b.classList.toggle('on', parseInt(b.getAttribute('data-star'), 10) <= n);
      });
    }

    Array.prototype.forEach.call(starBtns, function(b){
      const val = parseInt(b.getAttribute('data-star'), 10);
      b.addEventListener('mouseenter', function(){ paintStars(val); });
      b.addEventListener('click', function(){
        rvStars = val;
        paintStars(val);
      });
    });

    $('#rvStars').addEventListener('mouseleave', function(){ paintStars(rvStars); });

    rvForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = $('#rvName').value.trim();
      const text = $('#rvText').value.trim();
      if (!name) { $('#rvName').focus(); toast('a name first'); return; }
      if (!rvStars) { toast('pick a star rating'); return; }
      const btn = $('#rvSend');
      btn.disabled = true;
      btn.textContent = 'Posting\u2026';
      const review = { name: name.slice(0, 24), stars: rvStars, text: text.slice(0, 240), ts: Date.now() };
      rvPost(review)
        .then(function(list){
          btn.disabled = false;
          btn.textContent = 'Post review';
          if (list) { rvPaint(list); } else { rvRefresh(); }
          $('#rvText').value = '';
          rvStars = 0;
          paintStars(0);
          toast('opening your mail app \u2014 just hit send');
          setTimeout(function(){ mailReview(review); }, 400);
        });
    });

    rvRefresh();
  }

  /* ---------- "this is me, arriving" ---------- */
  (function () {
    const card = $('#meCard');
    if (!card) { return; }
    const stage = $('#meStage');
    const btn = $('#meButton');
    const cap = $('#meCaption');
    const fx = $('#meFx');
    const stars = $('#meStars');
    let started = false;
    let blown = false;

    // a scatter of stars, so the sky is not empty
    if (stars) {
      let s = '';
      for (let i = 0; i < 46; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 210;
        const r = Math.random() * 1.1 + 0.3;
        s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + r.toFixed(1) + '" opacity="' + (0.25 + Math.random() * 0.6).toFixed(2) + '"/>';
      }
      stars.innerHTML = s;
    }

    function play() {
      if (started) { return; }
      started = true;
      if (cap) { cap.textContent = 'The door is opening.'; }
      stage.classList.add('open');
      setTimeout(function () {
        stage.classList.add('walk');
        if (cap) { cap.textContent = 'He came out to say hello.'; }
      }, 820);
      setTimeout(function () {
        if (cap) { cap.textContent = 'Your call.'; }
        if (btn && !blown) { btn.classList.add('armed'); }
      }, 2400);
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function fire() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const cx = w * 0.5;
      const cy = h * 0.70;

      // 1. embers — fast, bright, thrown far
      for (let i = 0; i < 60; i++) {
        const el = document.createElement('div');
        el.className = 'me-ember';
        const size = rand(3, 11);
        const hot = Math.random();
        const col = hot > 0.72 ? '#fff6cc' : (hot > 0.4 ? '#ffb23a' : '#ff5a1f');
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.background = 'radial-gradient(circle, ' + col + ' 0%, rgba(255,120,30,.65) 55%, rgba(255,90,20,0) 100%)';
        el.style.left = cx + 'px';
        el.style.top = cy + 'px';
        fx.appendChild(el);
        const ang = rand(0, Math.PI * 2);
        const dist = rand(70, 260);
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist - rand(30, 120);
        el.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + dx * 0.55 + 'px), calc(-50% + ' + dy * 0.55 + 'px)) scale(.75)', opacity: .95, offset: 0.45 },
          { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + (dy + 140) + 'px)) scale(.15)', opacity: 0 }
        ], { duration: rand(800, 1600), easing: 'cubic-bezier(.15,.72,.25,1)' })
          .onfinish = function () { el.remove(); };
      }

      // 2. chunks of the house, spinning away
      for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.className = 'me-shard';
        const ww = rand(6, 20);
        const hh = rand(5, 16);
        el.style.width = ww + 'px';
        el.style.height = hh + 'px';
        el.style.background = i % 3 === 0 ? '#8f2f24' : (i % 3 === 1 ? '#d9c9ae' : '#efe3cd');
        el.style.left = (cx + rand(-90, 90)) + 'px';
        el.style.top = (cy - rand(20, 90)) + 'px';
        fx.appendChild(el);
        const dx = rand(-260, 260);
        const dy = -rand(60, 200);
        el.animate([
          { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + (dy + 210) + 'px)) rotate(' + rand(-900, 900) + 'deg)', opacity: 0 }
        ], { duration: rand(950, 1700), easing: 'cubic-bezier(.2,.6,.35,1)' })
          .onfinish = function () { el.remove(); };
      }

      // 3. a column of smoke that keeps rising
      for (let i = 0; i < 16; i++) {
        const el = document.createElement('div');
        el.className = 'me-puff';
        const size = rand(50, 130);
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.left = (cx + rand(-40, 40)) + 'px';
        el.style.top = (cy - 40) + 'px';
        fx.appendChild(el);
        const dx = rand(-70, 70);
        el.animate([
          { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
          { transform: 'translate(calc(-50% + ' + dx * 0.5 + 'px), calc(-50% - 60px)) scale(1)', opacity: .8, offset: 0.35 },
          { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% - 210px)) scale(1.7)', opacity: 0 }
        ], { duration: rand(1700, 2900), easing: 'ease-out', delay: rand(0, 220) })
          .onfinish = function () { el.remove(); };
      }
    }

    if (btn) {
      btn.addEventListener('click', function () {
        if (!started) { play(); return; }
        if (blown) {
          blown = false;
          stage.classList.remove('boom', 'walk', 'open');
          if (cap) { cap.textContent = 'He is not here to talk.'; }
          btn.textContent = 'Blow it up';
          btn.classList.remove('armed');
          started = false;
          setTimeout(play, 80);
          return;
        }
        blown = true;
        btn.classList.remove('armed');
        btn.textContent = 'Again';
        stage.classList.add('boom');
        if (cap) { cap.textContent = 'Dhurandhar.'; }
        fire();
      });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { play(); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(stage);
    } else {
      play();
    }
  })();

  /* ---------- the Rubik's cube cursor ---------- */
  const voxelCur = $('#voxelCursor');
  if (voxelCur && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('vc-on');

    const svg = $('#vcSvg');
    const SOLVED = ['#f4f4f4', '#3fa34d', '#d43d2f'];   // top, left, right
    const SCRAMBLE = ['#f4f4f4', '#3fa34d', '#d43d2f', '#f2c14e', '#2f6fd0', '#ef7f2a'];
    const U = 11;      // half width of the top diamond
    const V = 6.4;     // half height
    const D = 13;      // depth of the side faces
    const OX = 23, OY = 23;

    // project a point on a 3x3x3 grid into the isometric view
    function proj(i, j, k) {
      return [
        OX + (i - k) * (U / 3),
        OY + (i + k) * (V / 3) - j * (D / 3)
      ];
    }

    const stickers = [];
    function face(kind, colour) {
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          let quad;
          if (kind === 'top') {
            // the top face sits at j = 3
            quad = [proj(a, 3, b), proj(a + 1, 3, b), proj(a + 1, 3, b + 1), proj(a, 3, b + 1)];
          } else if (kind === 'left') {
            // the left face is k = 3 (the one facing the camera, not the back)
            quad = [proj(a, b, 3), proj(a + 1, b, 3), proj(a + 1, b + 1, 3), proj(a, b + 1, 3)];
          } else {
            // the right face is i = 3
            quad = [proj(3, b, a), proj(3, b, a + 1), proj(3, b + 1, a + 1), proj(3, b + 1, a)];
          }
          const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          el.setAttribute('points', quad.map(function (p) {
            return p[0].toFixed(1) + ',' + p[1].toFixed(1);
          }).join(' '));
          el.setAttribute('fill', colour);
          el.setAttribute('stroke', 'rgba(12,20,32,.55)');
          el.setAttribute('stroke-width', '0.7');
          el.setAttribute('stroke-linejoin', 'round');
          svg.appendChild(el);
          stickers.push({
            el: el,
            solved: colour,
            mixed: SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)],
            th: Math.random() * 0.7,
            cur: colour
          });
        }
      }
    }

    face('top', SOLVED[0]);
    face('left', SOLVED[1]);
    face('right', SOLVED[2]);

    function hexToRgb(h) {
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    }
    function mixHex(a, b, t) {
      const A = hexToRgb(a), B = hexToRgb(b);
      return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' +
                      Math.round(A[1] + (B[1] - A[1]) * t) + ',' +
                      Math.round(A[2] + (B[2] - A[2]) * t) + ')';
    }

    let curX = window.innerWidth / 2;
    let curY = window.innerHeight / 2;
    let aimX = curX;
    let aimY = curY;
    let tilt = 0;
    let seen = false;
    let scramble = 0;        // 0 = solved, 1 = fully scrambled

    window.addEventListener('mousemove', function (e) {
      aimX = e.clientX;
      aimY = e.clientY;
      if (!seen) {
        seen = true;
        curX = aimX;
        curY = aimY;
        voxelCur.classList.add('on');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () { voxelCur.classList.remove('on'); });
    document.addEventListener('mouseenter', function () { if (seen) { voxelCur.classList.add('on'); } });

    document.addEventListener('mouseover', function (e) {
      const hot = e.target.closest('a, button, input, textarea, [data-open], [data-case], [data-gender], [data-char]');
      voxelCur.classList.toggle('hot', !!hot);
    });

    function vcLoop() {
      const dx = aimX - curX;
      const dy = aimY - curY;
      curX += dx * 0.3;
      curY += dy * 0.3;

      const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 60);

      // moving scrambles it, standing still solves it again
      const target = Math.min(speed / 14, 1);
      scramble += (target - scramble) * (target > scramble ? 0.16 : 0.055);

      // a gentle lean with the movement — never a full spin, or the
      // isometric cube turns into a skewed wedge and loses its faces
      const wantTilt = Math.max(-11, Math.min(11, dx * 0.35));
      tilt += (wantTilt - tilt) * 0.18;

      const scale = (voxelCur.classList.contains('hot') ? 1.18 : 1) + Math.min(speed / 90, 0.35);

      voxelCur.style.transform =
        'translate3d(' + curX.toFixed(1) + 'px,' + curY.toFixed(1) + 'px,0)' +
        ' rotate(' + tilt.toFixed(1) + 'deg)' +
        ' scale(' + scale.toFixed(2) + ')';

      // paint each sticker between its solved and scrambled colour
      for (let i = 0; i < stickers.length; i++) {
        const s = stickers[i];
        let t = (scramble - s.th * 0.55) / 0.45;
        if (t < 0) { t = 0; }
        if (t > 1) { t = 1; }
        const fill = mixHex(s.solved, s.mixed, t);
        if (fill !== s.cur) {
          s.cur = fill;
          s.el.setAttribute('fill', fill);
        }
      }

      requestAnimationFrame(vcLoop);
    }
    requestAnimationFrame(vcLoop);
  }

  /* ---------- the dev test and its certificate ---------- */
  const DEV_QUESTIONS = [
    { t: 'Python', q: 'What does len("hello") return?', o: ['4', '5', '6', 'It errors'], a: 1 },
    { t: 'Python', q: 'Which keyword defines a function in Python?', o: ['function', 'def', 'func', 'lambda'], a: 1 },
    { t: 'Python', q: 'In Python 3, what type is the result of 7 / 2?', o: ['int', 'float', 'str', 'bool'], a: 1 },
    { t: 'Java', q: 'Which keyword makes one class inherit from another?', o: ['implements', 'inherits', 'extends', 'super'], a: 2 },
    { t: 'Java', q: 'Which is the correct entry point for a Java program?', o: ['public void main()', 'static main(String args)', 'public static void main(String[] args)', 'void main(String args)'], a: 2 },
    { t: 'AI', q: 'What does LLM stand for?', o: ['Large Language Model', 'Linear Learning Machine', 'Long Layer Memory', 'Low Latency Model'], a: 0 },
    { t: 'AI', q: 'In a language model, what is a "token"?', o: ['A password', 'A small chunk of text', 'A GPU core', 'A whole sentence'], a: 1 },
    { t: 'AI', q: 'What does fine-tuning do?', o: ['Trains a model from nothing', 'Adapts a pretrained model to your own task', 'Deletes the model weights', 'Compresses the model'], a: 1 },
    { t: 'Web', q: 'In JavaScript, what does === check?', o: ['Value only', 'Type only', 'Value and type', 'Neither'], a: 2 },
    { t: 'Web', q: 'What does display: flex do to a container?', o: ['Hides it', 'Lays its children out in one direction', 'Makes it scroll', 'Turns it into a grid'], a: 1 }
  ];

  const DT_KEY = 'shrestha-devtest-best';
  const dtModal = $('#devTestModal');
  const dtStage = $('#dtStage');
  const dtCount = $('#dtCount');
  const dtBar = $('#dtBar');
  let dtIndex = 0;
  let dtScore = 0;
  let dtName = '';

  function dtBest(){
    try {
      const n = parseInt(localStorage.getItem(DT_KEY) || '', 10);
      return isNaN(n) ? null : n;
    } catch (e) { return null; }
  }

  function paintBest(){
    const el = $('#devTestBest');
    if (!el) { return; }
    const b = dtBest();
    el.textContent = (b === null) ? '' : ('your best so far: ' + b + ' / 10');
  }
  paintBest();

  function dtOpen(){
    dtIndex = 0;
    dtScore = 0;
    dtName = '';
    dtModal.classList.add('open');
    document.body.classList.add('locked');
    dtIntro();
  }
  function dtClose(){
    dtModal.classList.remove('open');
    document.body.classList.remove('locked');
  }

  function dtIntro(){
    dtCount.textContent = 'Before you start';
    dtBar.style.width = '0%';
    dtStage.innerHTML =
      '<div class="dt-intro">' +
        '<p>Ten questions on Python, Java, AI and the web. No timer, no tricks. ' +
        'Whatever you score goes on the certificate \u2014 the better the score, the better the wording.</p>' +
        '<input id="dtName" placeholder="Your name for the certificate" autocomplete="off">' +
        '<div class="dt-actions"><button class="btn btn-primary" id="dtStart">Start the test</button></div>' +
      '</div>';
    const inp = $('#dtName');
    if (inp) { inp.focus(); }
    $('#dtStart').addEventListener('click', function(){
      dtName = (inp.value || '').trim() || 'A curious visitor';
      dtQuestion();
    });
    if (inp) {
      inp.addEventListener('keydown', function(e){
        if (e.key === 'Enter') { $('#dtStart').click(); }
      });
    }
  }

  function dtQuestion(){
    if (dtIndex >= DEV_QUESTIONS.length) { dtResult(); return; }
    const q = DEV_QUESTIONS[dtIndex];
    dtCount.textContent = 'Question ' + (dtIndex + 1) + ' of ' + DEV_QUESTIONS.length + ' \u00b7 ' + q.t;
    dtBar.style.width = (dtIndex / DEV_QUESTIONS.length * 100) + '%';
    dtStage.innerHTML =
      '<div class="dt-q">' + q.q + '</div>' +
      '<div class="dt-opts">' +
        q.o.map(function(o, i){ return '<button class="dt-opt" data-i="' + i + '">' + o + '</button>'; }).join('') +
      '</div>';
    const opts = dtStage.querySelectorAll('.dt-opt');
    Array.prototype.forEach.call(opts, function(btn){
      btn.addEventListener('click', function(){
        const picked = parseInt(btn.getAttribute('data-i'), 10);
        Array.prototype.forEach.call(opts, function(b){ b.disabled = true; });
        if (picked === q.a) { btn.classList.add('right'); dtScore += 1; }
        else {
          btn.classList.add('wrong');
          opts[q.a].classList.add('right');
        }
        setTimeout(function(){ dtIndex += 1; dtQuestion(); }, 620);
      });
    });
  }

  function dtTier(score){
    if (score >= 8) {
      return { key: 'excellent', label: 'Excellent', colour: '#d4a017',
        line: 'You are a complete developer.' };
    }
    if (score >= 5) {
      return { key: 'good', label: 'Good', colour: '#9aa7b4',
        line: 'A solid foundation \u2014 keep building and it becomes excellent.' };
    }
    return { key: 'bronze', label: 'Bronze', colour: '#b06a3b',
      line: 'Try hard to get a good score in your certificate.' };
  }

  function certificateSVG(name, score, tier){
    const W = 900, H = 620;
    const gold = tier.colour;
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    let out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">';
    out += '<defs>' +
      '<linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#0d1b2e"/><stop offset="0.55" stop-color="#132a45"/><stop offset="1" stop-color="#08111d"/>' +
      '</linearGradient>' +
      '<linearGradient id="cmedal" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + gold + '"/><stop offset="1" stop-color="#7a5a1a"/>' +
      '</linearGradient></defs>';
    out += '<rect width="' + W + '" height="' + H + '" fill="url(#cbg)"/>';
    out += '<rect x="26" y="26" width="' + (W - 52) + '" height="' + (H - 52) + '" rx="10" fill="none" stroke="' + gold + '" stroke-width="2.5"/>';
    out += '<rect x="38" y="38" width="' + (W - 76) + '" height="' + (H - 76) + '" rx="6" fill="none" stroke="' + gold + '" stroke-width="0.9" opacity="0.55"/>';

    out += '<text x="' + (W / 2) + '" y="112" text-anchor="middle" fill="' + gold + '" font-family="ui-monospace, monospace" font-size="15" letter-spacing="6">CERTIFICATE OF ACHIEVEMENT</text>';
    out += '<text x="' + (W / 2) + '" y="150" text-anchor="middle" fill="#8fa6c0" font-family="ui-monospace, monospace" font-size="11.5" letter-spacing="3.5">SHRESTHAXCODER.GITHUB.IO \u00b7 DEV TEST</text>';

    out += '<text x="' + (W / 2) + '" y="256" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="50" font-weight="700">' + escapeXML(name) + '</text>';
    out += '<line x1="' + (W / 2 - 150) + '" y1="286" x2="' + (W / 2 + 150) + '" y2="286" stroke="' + gold + '" stroke-width="1.2" opacity="0.6"/>';

    out += '<text x="' + (W / 2) + '" y="336" text-anchor="middle" fill="#cfe0f2" font-family="Georgia, serif" font-size="20">scored</text>';
    out += '<text x="' + (W / 2) + '" y="412" text-anchor="middle" fill="' + gold + '" font-family="Georgia, serif" font-size="72" font-weight="700">' + score + ' / 10</text>';

    out += '<text x="' + (W / 2) + '" y="466" text-anchor="middle" fill="' + gold + '" font-family="ui-monospace, monospace" font-size="17" letter-spacing="5">' + tier.label.toUpperCase() + '</text>';
    out += '<text x="' + (W / 2) + '" y="498" text-anchor="middle" fill="#9fb4cb" font-family="Georgia, serif" font-size="16">' + escapeXML(tier.line) + '</text>';

    out += '<circle cx="' + (W - 132) + '" cy="' + (H - 132) + '" r="52" fill="url(#cmedal)"/>';
    out += '<circle cx="' + (W - 132) + '" cy="' + (H - 132) + '" r="42" fill="none" stroke="#0d1b2e" stroke-width="1.5" opacity="0.5"/>';
    out += '<text x="' + (W - 132) + '" y="' + (H - 122) + '" text-anchor="middle" fill="#0d1b2e" font-family="Georgia, serif" font-size="26" font-weight="700">' + score + '</text>';
    out += '<text x="' + (W - 132) + '" y="' + (H - 102) + '" text-anchor="middle" fill="#0d1b2e" font-family="ui-monospace, monospace" font-size="10" letter-spacing="1.5">/ 10</text>';

    out += '<text x="70" y="' + (H - 74) + '" fill="#7d93ab" font-family="ui-monospace, monospace" font-size="11.5" letter-spacing="2">' + date + '</text>';
    out += '<text x="70" y="' + (H - 52) + '" fill="#5f7a92" font-family="ui-monospace, monospace" font-size="10" letter-spacing="1.5">shresthaxcoder.github.io</text>';
    out += '</svg>';
    return out;
  }

  function escapeXML(s){
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function dtResult(){
    dtBar.style.width = '100%';
    dtCount.textContent = 'Your result';
    const tier = dtTier(dtScore);
    const best = dtBest();
    if (best === null || dtScore > best) {
      try { localStorage.setItem(DT_KEY, String(dtScore)); } catch (e) {}
    }
    paintBest();

    dtStage.innerHTML =
      '<div class="dt-result">' +
        '<div class="dt-score">' + dtScore + ' / 10</div>' +
        '<div class="dt-tier" style="color:' + tier.colour + '">' + tier.label + ' achievement</div>' +
        '<p class="dt-msg">' + escapeXML(tier.line) + '</p>' +
        '<div class="dt-cert" id="dtCert">' + certificateSVG(dtName, dtScore, tier) + '</div>' +
        '<div class="dt-actions">' +
          '<button class="mini solid" id="dtDownload">Save the certificate</button>' +
          '<button class="mini" id="dtAgain">Try again</button>' +
          '<button class="mini" data-dclose>Close</button>' +
        '</div>' +
      '</div>';

    $('#dtDownload').addEventListener('click', function(){
      const svgEl = dtStage.querySelector('#dtCert svg');
      if (!svgEl) { return; }
      const src = new XMLSerializer().serializeToString(svgEl);
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
      const img = new Image();
      img.onload = function(){
        const cv = document.createElement('canvas');
        cv.width = 1800;
        cv.height = 1240;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(function(blob){
          if (!blob) { return; }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'dev-test-certificate.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
          toast('certificate saved');
        }, 'image/png');
      };
      img.src = url;
    });

    $('#dtAgain').addEventListener('click', function(){
      dtIndex = 0;
      dtScore = 0;
      dtIntro();
    });
  }

  if ($('#devTestBtn')) {
    $('#devTestBtn').addEventListener('click', dtOpen);
  }
  if (dtModal) {
    dtModal.addEventListener('click', function(e){
      if (e.target.closest('[data-dclose]')) { dtClose(); }
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && dtModal.classList.contains('open')) { dtClose(); }
    });
  }

  /* ---------- case studies ---------- */
  const CASES = {
    PRJ_001: {
      problem: 'Every browser treats a page as a picture of text. You still have to read it, skim it and remember it yourself — tabs pile up and nothing understands what the page is actually about.',
      approach: [
        'Started from the interaction, not the engine: what should the browser do when you ask it something?',
        'Made the copilot a sidebar that can see the page you are on, instead of a separate chat window.',
        'Grouped tabs by what a page is about rather than by its title.'
      ],
      shipped: [
        'One-click summaries of any page',
        'Tab clustering that organises itself',
        'Voice commands — "Daksha, find me the answer"',
        'A focus mode that mutes the noise and keeps the signal'
      ],
      change: 'I designed the AI panel before I designed the empty state. If I started again, the first thing you would see is a prompt, not a blank sidebar.'
    },
    PRJ_002: {
      problem: 'Most chat apps lock you to one model and one company. If you already use an open weight model, you want to bring it with you \u2014 and you want to talk to it, not type at it.',
      approach: [
        'Made the model and the API key the user\u2019s own choice, instead of shipping one fixed backend.',
        'Built the interface around voice first: press live, speak, and the answer comes back spoken.',
        'Gave her a presence \u2014 a 3D orb that reacts while she listens and talks.'
      ],
      shipped: [
        'Select an open weight model',
        'Paste your API key',
        'Talk with a live voice agent',
        'Aura 3D orb effect',
        'Speak out responses like a human',
        'More coming soon\u2026 in beta phase'
      ],
      change: 'The orb should react to her actual audio, not to a timer. Right now it moves while she talks; it should move with her.'
    },
    PRJ_003: {
      problem: 'I kept rebuilding the same glitch headings, HUD cards and neon terminals on every project. The design work was repeating itself.',
      approach: [
        'Pulled the repeating parts out into a system instead of copy-pasting them.',
        'Kept it dependency-free — CSS does the glitch, the scanlines and the HUD, with no JavaScript effects.',
        'Built it dark-first, then made the tokens themeable.'
      ],
      shipped: [
        '40+ components with zero dependencies',
        'CSS-only glitch, scanline and HUD effects',
        'Dark-first tokens, fully themeable'
      ],
      change: 'I would document it as I build it. Right now half the components are explained only by their class names.'
    },
    PRJ_004: {
      problem: 'Going from an idea to a layout still means an hour of scaffolding before you can see anything on screen.',
      approach: [
        'Made the prompt the starting point and the prototype the first thing you see.',
        'Kept everything editable in place, so the first version is a draft rather than a result.'
      ],
      shipped: [
        'Describe a layout, get a working prototype in seconds',
        'Neon-styled components that match the rest of the kit',
        'Editable in the browser, no build step'
      ],
      change: 'I would make the first output deliberately rough, so people feel invited to change it instead of accepting it.'
    },
    PRJ_005: {
      problem: 'Weather apps give you numbers. You wanted to know whether to take an umbrella — and a list of temperatures does not answer that.',
      approach: [
        'Rebuilt the sky rather than the data: clouds, rain, lightning, snow and fog all driven by real numbers.',
        'Let the city be the input, so the first action is choosing where you are.'
      ],
      shipped: [
        'Pick a city and the sky rebuilds itself around the real numbers',
        'Sun and drifting clouds on a clear day',
        'Rain, lightning, snow and fog'
      ],
      change: 'The transition between weather states should be much slower. Right now it snaps and you lose the moment where the sky changes.'
    },
    PRJ_006: {
      problem: 'Launch information for India\u2019s space programme is scattered across press releases, PDFs and news posts. Following a mission means checking five places.',
      approach: [
        'Built it as a ground-station console rather than a news feed — the countdown is the centre of the screen.',
        'Kept an archive alongside the upcoming launches, so a mission does not disappear once it flies.'
      ],
      shipped: [
        'Upcoming launches with countdowns ticking to the second',
        'An archive of the missions that made history',
        'A console layout built for glancing, not reading'
      ],
      change: 'I would add a plain-language summary above the telemetry. Not everyone reads T-minus.'
    },
    PRJ_007: {
      problem: 'Almost every Rubik\u2019s cube on the web is a 2D grid pretending to be 3D. You cannot see the layers turn, so the puzzle stops making sense.',
      approach: [
        'Built the cube in real 3D so turning a layer looks like turning a layer.',
        'Let you drag the stickers directly instead of learning a control scheme.',
        'Added hints that step in only when you are actually stuck.'
      ],
      shipped: [
        'A full 3D cube in the browser',
        'Drag stickers to turn layers and solve it by hand',
        'AI scramble, plus hints when you get stuck'
      ],
      change: 'The hint system should teach the method, not just hand you the next move. Right now it solves the cube for you one step at a time.'
    }
  };

  const caseEl = $('#case');
  function openCase(id){
    const p = DATA.find(x => x.id === id);
    const c = CASES[id];
    if (!p || !c || !caseEl) { return; }
    closeModal();
    $('#cId').textContent = p.id + ' \u00b7 ' + p.badge;
    $('#cTitle').textContent = p.name;
    $('#cDesc').textContent = p.desc;
    $('#cProblem').textContent = c.problem;
    $('#cApproach').innerHTML = c.approach.map(x => '<li>' + x + '</li>').join('');
    $('#cShipped').innerHTML = c.shipped.map(x => '<li>' + x + '</li>').join('');
    $('#cChange').textContent = c.change;
    $('#cMeta').innerHTML = p.meta.map(m => '<span>' + m[0] + '<b>' + m[1] + '</b></span>').join('');
    $('#cActions').innerHTML =
      (p.live ? '<a class="mini solid" href="' + p.live + '" target="_blank" rel="noopener">Open live site' + arrow + '</a>' : '<span class="mini" style="cursor:default">In development</span>') +
      '<button class="mini" data-cclose>Close</button>';
    caseEl.classList.add('open');
    document.body.classList.add('locked');
    caseEl.querySelector('.case-panel').scrollTop = 0;
  }
  function closeCase(){
    if (!caseEl) { return; }
    caseEl.classList.remove('open');
    document.body.classList.remove('locked');
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-case]')) { openCase(e.target.closest('[data-case]').dataset.case); return; }
    if (e.target.closest('[data-cclose]')) { closeCase(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && caseEl && caseEl.classList.contains('open')) { closeCase(); }
  });

  document.addEventListener('click', e=>{
    const o = e.target.closest('[data-open]'); if(o){ openModal(o.dataset.open); return; }
    if(e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  /* isometric voxel stack */
  const iso = $('#isoStack');
  if(iso){
    const S=66, D=34;
    const parts = [
      {cx:0,cy:0,s:S,d:D,top:'#7ed08a',left:'#4f9e5c',right:'#3f8550'},
      {cx:0,cy:-D,s:S,d:D,top:'#ff8a6f',left:'#e04b2f',right:'#bf3a20'},
      {cx:0,cy:-2*D,s:S,d:D,top:'#ffc266',left:'#e8a13a',right:'#c9861f'},
      {cx:0,cy:-3*D,s:S,d:D,top:'#9dbbf2',left:'#5f8fd6',right:'#4a76b8'},
      {cx:S*1.02,cy:-2*D,s:S*0.76,d:D*0.76,top:'#2a3f60',left:'#12203a',right:'#0a1526'}
    ];
    let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9; const polys=[];
    function face(pts,fill){ pts.forEach(p=>{ minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]); });
      polys.push('<polygon points="'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'" fill="'+fill+'"/>'); }
    parts.forEach(c=>{ const w=c.s/2,h=c.s/4,x=c.cx,y=c.cy,d=c.d;
      face([[x,y-h],[x+w,y],[x,y+h],[x-w,y]],c.top);
      face([[x-w,y],[x,y+h],[x,y+h+d],[x-w,y+d]],c.left);
      face([[x+w,y],[x,y+h],[x,y+h+d],[x+w,y+d]],c.right); });
    const pad=12;
    iso.innerHTML='<svg viewBox="'+(minX-pad).toFixed(1)+' '+(minY-pad).toFixed(1)+' '+(maxX-minX+pad*2).toFixed(1)+' '+(maxY-minY+pad*2).toFixed(1)+'" preserveAspectRatio="xMidYMid meet">'+polys.join('')+'</svg>';
  }
  /* floating cubes */
  const stack = $('#voxelStack');
  if(stack){ const colors=['#ff5a3c','#63b96a','#ffb03a','#1f6feb','#0e1b2e'];
    [{t:'6%',l:'8%',s:44,r:'12deg'},{t:'62%',l:'2%',s:30,r:'-10deg'},{t:'14%',l:'74%',s:34,r:'18deg'},
     {t:'70%',l:'80%',s:52,r:'-14deg'},{t:'40%',l:'88%',s:22,r:'8deg'}].forEach((p,i)=>{
      const d=document.createElement('span'); d.className='cube-float';
      d.style.top=p.t; d.style.left=p.l; d.style.width=d.style.height=p.s+'px';
      d.style.background='linear-gradient(145deg,'+colors[i%colors.length]+',rgba(0,0,0,.18))';
      d.style.setProperty('--r',p.r); d.style.animationDelay=(i*0.6)+'s'; stack.appendChild(d); }); }

  /* marquee */
  const mq = $('#marquee');
  if(mq){ const items=['HTML','CSS','JavaScript','React','Three.js','UI / UX','Prompt Engineering','LLM APIs','Python','Node.js','Design Systems','Animation'];
    const one = items.map(x=>'<span>'+x+'</span>').join('');
    mq.innerHTML = one + one; }

  /* toast */
  const toastEl = $('#toast'); let toastT;
  function toast(msg){ if(!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(()=>toastEl.classList.remove('show'), 1900); }

  /* copy email */
  const copyMail = $('#copyMail');
  copyMail && copyMail.addEventListener('click', ()=>{
    const mail='iamshresthax@gmail.com';
    const done=()=>toast('email copied \u2014 '+mail);
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(done).catch(done);
    else done();
  });

  /* magnetic buttons */
  if(matchMedia('(pointer:fine)').matches && !reduce){
    $$('.btn, .mini.solid, .nav-cta').forEach(b=>{
      b.addEventListener('pointermove', e=>{ const r=b.getBoundingClientRect();
        b.style.transform='translate('+((e.clientX-r.left-r.width/2)*0.16)+'px,'+((e.clientY-r.top-r.height/2)*0.22)+'px)'; });
      b.addEventListener('pointerleave', ()=>{ b.style.transform=''; });
    });
    /* card tilt */
    const projEl = $('#projects');
    if(projEl){
      projEl.addEventListener('pointermove', e=>{
        const c = e.target.closest('.card'); if(!c) return;
        const r = c.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        c.style.transform='perspective(1000px) rotateX('+((0.5-py)*4)+'deg) rotateY('+((px-0.5)*5)+'deg) translateY(-4px)';
      });
      projEl.addEventListener('pointerleave', e=>{ const c=e.target.closest && e.target.closest('.card'); if(c) c.style.transform=''; });
    }
  }

  /* confetti */
  const confetti = $('#confetti');
  function burst(x,y){
    if(!confetti || reduce) return;
    const cols=['#ff5a3c','#63b96a','#ffb03a','#1f6feb','#0e1b2e','#7ed08a'];
    for(let i=0;i<34;i++){
      const d=document.createElement('i'); d.style.left=x+'px'; d.style.top=y+'px';
      d.style.background=cols[i%cols.length]; confetti.appendChild(d);
      const ang=Math.random()*Math.PI*2, sp=4+Math.random()*9;
      const vx=Math.cos(ang)*sp, vy=Math.sin(ang)*sp-6;
      let px=0,py=0,life=0;
      const anim=()=>{ life+=1; px+=vx; py+=vy+life*0.5;
        d.style.transform='translate('+px+'px,'+py+'px) rotate('+(life*9)+'deg)';
        d.style.opacity=String(Math.max(0,1-life/48));
        if(life<48) requestAnimationFrame(anim); else d.remove(); };
      requestAnimationFrame(anim);
    }
  }
  document.addEventListener('click', e=>{ const t=e.target.closest('[data-confetti]');
    if(t){ const r=t.getBoundingClientRect(); burst(r.left+r.width/2, r.top+r.height/2); } });

  /* konami easter egg */
  const seq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kpos=0;
  document.addEventListener('keydown', e=>{
    kpos = (e.key===seq[kpos]) ? kpos+1 : (e.key===seq[0]?1:0);
    if(kpos===seq.length){ kpos=0; voxelRain(); toast('voxel rain unlocked'); }
  });
  function voxelRain(){
    if(reduce) return;
    const cols=['#ff5a3c','#63b96a','#ffb03a','#1f6feb','#7ed08a'];
    for(let i=0;i<60;i++){
      const d=document.createElement('i'); d.style.left=(Math.random()*100)+'vw'; d.style.top='-20px';
      d.style.background=cols[i%cols.length]; d.style.width=d.style.height=(8+Math.random()*14)+'px';
      confetti.appendChild(d);
      let y=-20, vy=2+Math.random()*5, x=0;
      const anim=()=>{ y+=vy; vy+=0.14; x+=Math.sin(y*0.02)*0.8;
        d.style.transform='translate('+x+'px,'+y+'px) rotate('+(y*0.6)+'deg)';
        if(y < innerHeight+60) requestAnimationFrame(anim); else d.remove(); };
      requestAnimationFrame(anim);
    }
  }

  /* keyboard: press G to cycle sections */
  let gpos=0;
  document.addEventListener('keydown', e=>{
    if(e.key==='g' && !e.metaKey && !e.ctrlKey && document.activeElement===document.body){
      const ids=['#top','#about','#work','#skills','#journey','#contact'];
      gpos=(gpos+1)%ids.length; location.hash=ids[gpos];
    }
  });
  /* ==================== v4: UI FEATURE LAYER ==================== */
  const SC = ()=> window.__scene || null;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%$&@*+=';

  /* ---------- 1. chapter rail ---------- */
  const SECS = [['top','Home'],['about','About'],['work','Work'],['skills','Skills'],['journey','Journey'],['resume','R&eacute;sum&eacute;'],['contact','Contact']];
  const chaptersEl = $('#chapters');
  if(chaptersEl){
    chaptersEl.innerHTML = SECS.map((s,i)=>'<button data-goto="#'+s[0]+'" data-i="'+i+'"><span>'+s[1]+'</span><i></i></button>').join('');
    chaptersEl.addEventListener('click', e=>{ const b=e.target.closest('[data-goto]'); if(b) location.hash=b.dataset.goto; });
  }
  function syncChapters(){
    const els = SECS.map(s=>document.getElementById(s[0]));
    let cur = 0;
    els.forEach((el,i)=>{ if(el && el.getBoundingClientRect().top <= window.innerHeight*0.42) cur = i; });
    $$('#chapters button').forEach(b=>b.classList.toggle('on', +b.dataset.i === cur));
  }

  /* ---------- 2. availability ribbon ---------- */
  const ribbon = $('#ribbon');
  $('#ribbonClose') && $('#ribbonClose').addEventListener('click', ()=>{ ribbon.classList.remove('show'); try{localStorage.setItem('shrestha-ribbon','1');}catch(e){} });
  let ribbonHidden = false; try{ ribbonHidden = localStorage.getItem('shrestha-ribbon')==='1'; }catch(e){}

  /* ---------- 3. stats HUD ---------- */
  const hud = $('#hud');
  let hudOn = false, frames = 0, fpsT = performance.now(), fps = 0;
  function toggleHud(){ hudOn = !hudOn; hud.classList.toggle('show', hudOn); }
  (function fpsLoop(){
    frames++; const now = performance.now();
    if(now - fpsT >= 1000){
      fps = Math.round(frames*1000/(now-fpsT)); frames = 0; fpsT = now;
      if(hudOn){
        $('#hudFps').textContent = fps;
        const s = SC();
        if(s && s.renderer && s.renderer.info){
          const r = s.renderer.info.render;
          $('#hudTris').textContent = (r.triangles>1000 ? (r.triangles/1000).toFixed(1)+'k' : r.triangles);
          const hc=$('#hudCalls'); if(hc) hc.textContent = r.calls;
          $('#hudVox').textContent = s.voxels || 0;
        }
      }
    }
    requestAnimationFrame(fpsLoop);
  })();

  /* ---------- 4. world control panel ---------- */
  const wpanel = $('#wpanel');
  $('#wpanelToggle') && $('#wpanelToggle').addEventListener('click', ()=> wpanel.classList.toggle('open'));
  const wpTime = $('#wpTime'), wpTimeVal = $('#wpTimeVal');
  wpTime && wpTime.addEventListener('input', ()=>{
    const v = +wpTime.value/100;
    wpTimeVal.textContent = v < .15 ? 'Day' : v < .45 ? 'Golden' : v < .75 ? 'Dusk' : 'Night';
    const s = SC(); if(s && s.setNight) s.setNight(v);
  });
  const wpWeather = $('#wpWeather');
  wpWeather && wpWeather.addEventListener('click', e=>{
    const b = e.target.closest('button'); if(!b) return;
    $$('#wpWeather button').forEach(x=>x.classList.toggle('on', x===b));
    const s = SC(); if(s && s.setWeather) s.setWeather(b.dataset.weather);
  });
  const wpFx = $('#wpFx');
  wpFx && wpFx.addEventListener('click', e=>{
    const b = e.target.closest('button'); if(!b) return;
    b.classList.toggle('on');
    const s = SC(); if(s && s.setFx) s.setFx(b.dataset.fx, b.classList.contains('on'));
  });
  $('#wpReset') && $('#wpReset').addEventListener('click', ()=>{
    $$('#wpWeather button').forEach(x=>x.classList.toggle('on', x.dataset.weather==='clear'));
    $$('#wpFx button').forEach(x=>x.classList.add('on'));
    if(wpTime){ wpTime.value = 0; wpTimeVal.textContent = 'Day'; }
    const s = SC(); if(s && s.reset) s.reset();
    toast('world reset');
  });

  /* ---------- QR code (byte mode, ECC M, versions 1-5) ---------- */
  const QRCode = (function(){
    const EXP = new Array(512), LOG = new Array(256);
    (function(){
      let x = 1;
      for (let i = 0; i < 255; i++){
        EXP[i] = x; LOG[x] = i;
        x <<= 1;
        if (x & 0x100) { x ^= 0x11d; }
      }
      for (let i = 255; i < 512; i++) { EXP[i] = EXP[i - 255]; }
    })();

    function gmul(a, b){ return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

    function polyMul(a, b){
      const out = new Array(a.length + b.length - 1).fill(0);
      for (let i = 0; i < a.length; i++){
        for (let j = 0; j < b.length; j++){ out[i + j] ^= gmul(a[i], b[j]); }
      }
      return out;
    }

    function genPoly(n){
      let g = [1];
      for (let i = 0; i < n; i++){ g = polyMul(g, [1, EXP[i]]); }
      return g;
    }

    function rsEncode(data, ecLen){
      const g = genPoly(ecLen);
      const res = data.slice();
      for (let i = 0; i < ecLen; i++){ res.push(0); }
      for (let i = 0; i < data.length; i++){
        const coef = res[i];
        if (coef !== 0){
          for (let j = 0; j < g.length; j++){ res[i + j] ^= gmul(g[j], coef); }
        }
      }
      return res.slice(data.length);
    }

    const INFO = {
      1: { ec: 10, blocks: [16], align: [] },
      2: { ec: 16, blocks: [28], align: [18] },
      3: { ec: 26, blocks: [44], align: [22] },
      4: { ec: 18, blocks: [32, 32], align: [26] },
      5: { ec: 24, blocks: [43, 43], align: [30] }
    };

    function utf8(text){
      const out = [];
      for (let i = 0; i < text.length; i++){
        const c = text.charCodeAt(i);
        if (c < 0x80) { out.push(c); }
        else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)); }
        else { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
      }
      return out;
    }

    function make(text, forceMask){
      const bytes = utf8(text);
      let ver = 0;
      for (let v = 1; v <= 5; v++){
        const cap = INFO[v].blocks.reduce((a, b) => a + b, 0);
        if (bytes.length + 2 <= cap) { ver = v; break; }
      }
      if (!ver) { return null; }

      const info = INFO[ver];
      const totalData = info.blocks.reduce((a, b) => a + b, 0);
      const size = 17 + ver * 4;
      const mask = (typeof forceMask === 'number') ? forceMask : 4;

      const bits = [];
      function push(val, len){ for (let i = len - 1; i >= 0; i--){ bits.push((val >> i) & 1); } }
      push(4, 4);
      push(bytes.length, 8);
      for (let i = 0; i < bytes.length; i++){ push(bytes[i], 8); }
      const capBits = totalData * 8;
      push(0, Math.min(4, capBits - bits.length));
      while (bits.length % 8) { bits.push(0); }
      const pads = [0xEC, 0x11];
      let pi = 0;
      while (bits.length < capBits){ push(pads[pi % 2], 8); pi++; }

      const cw = [];
      for (let i = 0; i < bits.length; i += 8){
        let b = 0;
        for (let j = 0; j < 8; j++){ b = (b << 1) | bits[i + j]; }
        cw.push(b);
      }

      const dataBlocks = [], ecBlocks = [];
      let off = 0;
      for (let bi = 0; bi < info.blocks.length; bi++){
        const blk = cw.slice(off, off + info.blocks[bi]);
        off += info.blocks[bi];
        dataBlocks.push(blk);
        ecBlocks.push(rsEncode(blk, info.ec));
      }
      const maxData = Math.max.apply(null, info.blocks);
      const final = [];
      for (let i = 0; i < maxData; i++){
        for (let bi = 0; bi < dataBlocks.length; bi++){
          if (i < dataBlocks[bi].length) { final.push(dataBlocks[bi][i]); }
        }
      }
      for (let i = 0; i < info.ec; i++){
        for (let bi = 0; bi < ecBlocks.length; bi++){ final.push(ecBlocks[bi][i]); }
      }

      const m = [];
      for (let r = 0; r < size; r++){ m.push(new Array(size).fill(null)); }
      function set(r, c, v){ if (r >= 0 && r < size && c >= 0 && c < size) { m[r][c] = v; } }

      [[0, 0], [0, size - 7], [size - 7, 0]].forEach(function(f){
        for (let i = -1; i <= 7; i++){
          for (let j = -1; j <= 7; j++){
            const on = (i >= 0 && i <= 6 && j >= 0 && j <= 6) &&
              (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4));
            set(f[0] + i, f[1] + j, on ? 1 : 0);
          }
        }
      });

      for (let i = 8; i < size - 8; i++){
        set(6, i, (i % 2 === 0) ? 1 : 0);
        set(i, 6, (i % 2 === 0) ? 1 : 0);
      }

      info.align.forEach(function(a){
        for (let i = -2; i <= 2; i++){
          for (let j = -2; j <= 2; j++){
            set(a + i, a + j, Math.max(Math.abs(i), Math.abs(j)) !== 1 ? 1 : 0);
          }
        }
      });

      set(size - 8, 8, 1);

      let fmtData = (0 << 3) | mask;
      let rem = fmtData;
      for (let i = 0; i < 10; i++){ rem = (rem << 1) ^ ((rem >>> 9) * 0x537); }
      const fmt = ((fmtData << 10) | rem) ^ 0x5412;
      const fbit = n => (fmt >> n) & 1;

      for (let i = 0; i <= 5; i++){ set(i, 8, fbit(i)); }
      set(7, 8, fbit(6));
      set(8, 8, fbit(7));
      set(8, 7, fbit(8));
      for (let i = 9; i < 15; i++){ set(8, 14 - i, fbit(i)); }
      for (let i = 0; i < 8; i++){ set(8, size - 1 - i, fbit(i)); }
      for (let i = 8; i < 15; i++){ set(size - 15 + i, 8, fbit(i)); }

      const taken = m.map(row => row.map(v => v !== null));
      let idx = 0;
      const totalBits = final.length * 8;
      function bitAt(n){
        if (n >= totalBits) { return 0; }
        return (final[Math.floor(n / 8)] >> (7 - (n % 8))) & 1;
      }

      let up = true;
      for (let col = size - 1; col > 0; col -= 2){
        if (col === 6) { col = 5; }
        for (let row = 0; row < size; row++){
          const r = up ? (size - 1 - row) : row;
          for (let k = 0; k < 2; k++){
            const c = col - k;
            if (!taken[r][c]){ m[r][c] = bitAt(idx); idx++; }
          }
        }
        up = !up;
      }

      function masked(r, c){
        if (mask === 0) { return (r + c) % 2 === 0; }
        if (mask === 1) { return r % 2 === 0; }
        if (mask === 2) { return c % 3 === 0; }
        if (mask === 3) { return (r + c) % 3 === 0; }
        if (mask === 4) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; }
        if (mask === 5) { return ((r * c) % 2) + ((r * c) % 3) === 0; }
        if (mask === 6) { return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; }
        return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      }

      for (let r = 0; r < size; r++){
        for (let c = 0; c < size; c++){
          if (!taken[r][c] && masked(r, c)) { m[r][c] ^= 1; }
        }
      }

      return m;
    }

    return { make: make };
  })();

  const qrCanvas = $('#qrCanvas');
  if (qrCanvas){
    const m = QRCode.make('shresthaxcoder.github.io');
    if (m){
      const ctx = qrCanvas.getContext('2d');
      const n = m.length;
      const quiet = 3;
      const total = n + quiet * 2;
      const cell = Math.floor(qrCanvas.width / total);
      const off = Math.floor((qrCanvas.width - cell * total) / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
      ctx.fillStyle = '#0d1b2e';
      for (let r = 0; r < n; r++){
        for (let c = 0; c < n; c++){
          if (m[r][c]) {
            ctx.fillRect(off + (c + quiet) * cell, off + (r + quiet) * cell, cell, cell);
          }
        }
      }
    }
  }

  /* ---------- offline banner ---------- */
  const offlineBar = $('#offlineBar');
  function paintOnline(){
    if (!offlineBar) { return; }
    offlineBar.classList.toggle('show', !navigator.onLine);
  }
  addEventListener('online', function(){ paintOnline(); toast('back online'); });
  addEventListener('offline', function(){ paintOnline(); });
  paintOnline();

  /* ---------- share card, WhatsApp ---------- */
  const SITE_URL = 'https://shresthaxcoder.github.io';

  function buildShareCard(){
    const W = 1200, H = 630;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0d1b2e');
    g.addColorStop(0.55, '#122744');
    g.addColorStop(1, '#07101c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const world = document.getElementById('world');
    if (world && world.width){
      ctx.save();
      ctx.globalAlpha = 0.85;
      const scale = Math.max(W / world.width, H / world.height);
      const dw = world.width * scale, dh = world.height * scale;
      ctx.drawImage(world, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.restore();
    }

    const shade = ctx.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(7,16,28,0.15)');
    shade.addColorStop(0.55, 'rgba(7,16,28,0.72)');
    shade.addColorStop(1, 'rgba(7,16,28,0.96)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(240,192,96,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(22, 22, W - 44, H - 44);

    ctx.fillStyle = '#f0c060';
    ctx.font = '700 22px ui-monospace, monospace';
    ctx.fillText('SHRESTHAXCODER', 64, 96);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 92px Georgia, serif';
    ctx.fillText('Shrestha', 64, 210);

    ctx.fillStyle = '#b9cbe4';
    ctx.font = '400 30px Georgia, serif';
    ctx.fillText('Frontend designer & AI builder', 64, 262);
    ctx.fillText('from Darbhanga, India', 64, 302);

    ctx.fillStyle = '#ffd98a';
    ctx.font = '600 26px ui-monospace, monospace';
    ctx.fillText('shresthaxcoder.github.io', 64, H - 74);

    const qm = QRCode.make('shresthaxcoder.github.io');
    if (qm){
      const n = qm.length, quiet = 2, total = n + quiet * 2;
      const box = 150, cell = Math.floor(box / total);
      const ox = W - 64 - cell * total, oy = H - 64 - cell * total;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox - 8, oy - 8, cell * total + 16, cell * total + 16);
      ctx.fillStyle = '#0d1b2e';
      for (let r = 0; r < n; r++){
        for (let c = 0; c < n; c++){
          if (qm[r][c]) { ctx.fillRect(ox + (c + quiet) * cell, oy + (r + quiet) * cell, cell, cell); }
        }
      }
    }

    return cv;
  }

  function shareSiteCard(){
    const cv = buildShareCard();
    cv.toBlob(function(blob){
      if (!blob) { toast('could not build the card'); return; }
      const file = new File([blob], 'shrestha-card.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })){
        navigator.share({ files: [file], title: 'Shrestha', text: SITE_URL }).catch(function(){});
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'shrestha-card.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
      toast('share card saved');
    }, 'image/png');
  }

  function shareWhatsApp(){
    const text = 'Shrestha — frontend designer & AI builder. Take a look: ' + SITE_URL;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }

  const rideExitBtn = $('#rideExit');
  if (rideExitBtn){
    rideExitBtn.addEventListener('click', function(){
      const s = SC();
      if (s && s.stopRide) { s.stopRide(); }
      toast('back to the island');
    });
    setInterval(function(){
      const s = SC();
      const riding = !!(s && s.isRiding && s.isRiding());
      rideExitBtn.classList.toggle('on', riding);
    }, 400);
  }

  function rideCar(){
    const s = SC();
    if (s && s.rideCar){
      if (s.isRiding && s.isRiding()){ s.stopRide(); toast('back to the island'); return; }
      s.rideCar();
      toast('hold on \u2014 press Esc to get off');
    } else {
      toast('the world is still loading');
    }
  }

  /* ---------- 5. command palette ---------- */
  const palette = $('#palette'), pInput = $('#paletteInput'), pList = $('#paletteList');
  function palItems(){
    const out = SECS.map(s=>({label:s[1], kind:'Section', key:'', act:()=>{ location.hash='#'+s[0]; }}));
    DATA.forEach(p=>out.push({label:p.name, kind:'Project', key:p.badge, act:()=>{ openModal(p.id); }}));
    out.push({label:'Toggle theme', kind:'Action', key:'T', act:()=>$('#themeBtn').click()});
    out.push({label:'Toggle stats HUD', kind:'Action', key:'H', act:toggleHud});
    out.push({label:'Keyboard shortcuts', kind:'Action', key:'?', act:()=>$('#keys').classList.add('open')});
    out.push({label:'Email Shrestha', kind:'Action', key:'', act:()=>{ location.href='mailto:iamshresthax@gmail.com'; }});
    DATA.forEach(function(p){ if (CASES[p.id]) { out.push({label:'Case study: ' + p.name, kind:'Case study', key:'', act:function(){ openCase(p.id); }}); } });
    out.push({label:'Build your own version of this page', kind:'Play', key:'', act:openBuild});
    out.push({label:'Play the island ending', kind:'Play', key:'', act:function(){ if (window.__playIntro) { window.__playIntro(); } }});
    out.push({label:'Ride a flying car', kind:'World', key:'', act:rideCar});
    out.push({label:'Share card for the site', kind:'Share', key:'', act:shareSiteCard});
    out.push({label:'Share on WhatsApp', kind:'Share', key:'', act:shareWhatsApp});
    out.push({label:'Show the QR code', kind:'Share', key:'', act:()=>{ const q=$('#qrCanvas'); if(q){ q.scrollIntoView({behavior:'smooth', block:'center'}); q.classList.add('pulse'); setTimeout(()=>q.classList.remove('pulse'),1600); } }});
    out.push({label:'Copy link to this site', kind:'Share', key:'', act:()=>{ if(navigator.clipboard){ navigator.clipboard.writeText(SITE_URL).then(()=>toast('link copied')); } }});
    out.push({label:'Switch to Hindi', kind:'Action', key:'', act:()=>{ const b=document.querySelector('[data-lang="hi"]'); if(b) b.click(); }});
    out.push({label:'Switch to English', kind:'Action', key:'', act:()=>{ const b=document.querySelector('[data-lang="en"]'); if(b) b.click(); }});
    out.push({label:'Open the voxel piano', kind:'Play', key:'', act:()=>{ const b=$('#pianoBtn'); if(b) b.click(); }});
    out.push({label:'Turn the laser on', kind:'Play', key:'', act:()=>{ const b=$('#laserBtn'); if(b) b.click(); }});
    out.push({label:'Play Voxel Tower Defence', kind:'Play', key:'', act:()=>{ location.href='game/'; }});
    out.push({label:'GitHub profile', kind:'Action', key:'', act:()=>window.open('https://github.com/shresthaxcoder','_blank')});
    return out;
  }
  let palSel = 0, palData = [];
  function renderPalette(q){
    const all = palItems();
    palData = q ? all.filter(i=>i.label.toLowerCase().includes(q.toLowerCase())) : all;
    palSel = 0;
    pList.innerHTML = palData.map((i,k)=>'<button data-k="'+k+'" class="'+(k===0?'sel':'')+'"><span class="pi">'+i.kind+'</span>'+i.label+(i.key?'<span class="pk">'+i.key+'</span>':'')+'</button>').join('') || '<div style="padding:18px;color:var(--mute);font-size:13px">No matches</div>';
  }
  function openPalette(){ palette.classList.add('open'); document.body.classList.add('locked'); pInput.value=''; renderPalette(''); setTimeout(()=>pInput.focus(),60); }
  function closePalette(){ palette.classList.remove('open'); document.body.classList.remove('locked'); }
  pInput && pInput.addEventListener('input', ()=>renderPalette(pInput.value));
  pList && pList.addEventListener('click', e=>{ const b=e.target.closest('[data-k]'); if(b) runPal(+b.dataset.k); });
  function runPal(k){ const it = palData[k]; if(!it) return; closePalette(); setTimeout(it.act, 120); }
  document.addEventListener('click', e=>{ if(e.target.closest('[data-pclose]')) closePalette(); });

  /* ---------- 6. shortcuts sheet ---------- */
  const keysSheet = $('#keys');
  document.addEventListener('click', e=>{ if(e.target.closest('[data-kclose]')) keysSheet.classList.remove('open'); });

  /* ---------- 7. project search ---------- */
  const filtersEl = $('#filters');
  if(filtersEl){
    filtersEl.insertAdjacentHTML('beforeend',
      '<span class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'+
      '<input id="projSearch" placeholder="Search projects…" aria-label="Search projects"></span>');
    const si = $('#projSearch');
    si.addEventListener('input', ()=>{
      const q = si.value.trim().toLowerCase();
      let shown = 0;
      $$('#projects .card').forEach(c=>{
        const txt = c.textContent.toLowerCase();
        const ok = !q || txt.includes(q);
        c.classList.toggle('hide', !ok); if(ok) shown++;
      });
      $$('#filters button').forEach(x=>x.classList.remove('on'));
    });
  }

  /* ---------- 9. rotating quote ---------- */
  const QUOTES = [
    ['Design interfaces that feel alive.', 'mission.txt'],
    ['Most people my age consume the internet. I build it.', 'whoami'],
    ['Built through hands, not tutorials.', 'method'],
    ['The web should feel like it came back from 2047.', 'manifesto']
  ];
  const aboutCopy = document.querySelector('.about-copy');
  if(aboutCopy){
    const q = document.createElement('div');
    q.className = 'quoter';
    q.innerHTML = '<p id="qText"></p><span id="qSrc"></span><div class="qdots" id="qDots"></div>';
    aboutCopy.appendChild(q);
    const qText = $('#qText'), qSrc = $('#qSrc'), qDots = $('#qDots');
    qDots.innerHTML = QUOTES.map((_,i)=>'<button data-q="'+i+'" class="'+(i===0?'on':'')+'" aria-label="Quote '+(i+1)+'"></button>').join('');
    let qi = 0, qTimer;
    function showQ(i){
      qi = i; const cur = QUOTES[i];
      qText.style.opacity = 0; qSrc.style.opacity = 0;
      setTimeout(()=>{ qText.textContent = cur[0]; qSrc.textContent = cur[1];
        qText.style.opacity = 1; qSrc.style.opacity = 1;
        $$('#qDots button').forEach((b,k)=>b.classList.toggle('on', k===i)); }, 200);
    }
    function cycle(){ showQ((qi+1)%QUOTES.length); }
    qDots.addEventListener('click', e=>{ const b=e.target.closest('[data-q]'); if(b){ showQ(+b.dataset.q); clearInterval(qTimer); qTimer=setInterval(cycle,6000); } });
    showQ(0);
    if(!reduce) qTimer = setInterval(cycle, 6000);
  }

  /* ---------- 10. live GitHub stats ---------- */
  const contactLinks = document.querySelector('.contact-links');
  if(contactLinks){
    const g = document.createElement('div');
    g.className = 'ghstats';
    g.innerHTML = '<div><b id="ghRepos">–</b><span>Repos</span></div><div><b id="ghStars">–</b><span>Stars</span></div><div><b id="ghFollow">–</b><span>Followers</span></div>';
    contactLinks.appendChild(g);
    (async function(){
      try{
        const u = await fetch('https://api.github.com/users/shresthaxcoder').then(r=>{ if(!r.ok) throw 0; return r.json(); });
        $('#ghRepos').textContent = u.public_repos ?? 2;
        $('#ghFollow').textContent = u.followers ?? 0;
        const rs = await fetch('https://api.github.com/users/shresthaxcoder/repos?per_page=100').then(r=>{ if(!r.ok) throw 0; return r.json(); });
        $('#ghStars').textContent = Array.isArray(rs) ? rs.reduce((a,b)=>a+(b.stargazers_count||0),0) : 0;
      }catch(e){ $('#ghRepos').textContent='2'; $('#ghStars').textContent='0'; $('#ghFollow').textContent='0'; }
    })();
  }

  /* ---------- 11. visits ---------- */
  const foot = document.querySelector('.foot');
  if(foot){
    let n = 0, last = 'first visit';
    try{
      n = (+localStorage.getItem('shrestha-visits')||0) + 1;
      localStorage.setItem('shrestha-visits', n);
      const l = localStorage.getItem('shrestha-last'); if(l) last = 'last seen '+l;
      localStorage.setItem('shrestha-last', new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short'}));
    }catch(e){ n = 1; }
    const s = document.createElement('span');
    s.textContent = 'visit #' + n + ' · ' + last;
    foot.appendChild(s);
  }

  /* ---------- 12. heading scramble ---------- */
  function scrambleEl(el){
    if(reduce) return;
    const nodes = [];
    (function walk(n){ for(const c of n.childNodes){ if(c.nodeType===3 && c.nodeValue.trim()) nodes.push({node:c, orig:c.nodeValue});
      else if(c.nodeType===1 && c.tagName!=='BR') walk(c); } })(el);
    if(!nodes.length) return;
    let f = 0; const total = 20;
    const id = setInterval(()=>{ f++;
      const p = f/total;
      nodes.forEach(o=>{ const keep = Math.floor(o.orig.length*p);
        o.node.nodeValue = o.orig.slice(0,keep) + o.orig.slice(keep).replace(/[^\s]/g, ()=>CHARS[Math.floor(Math.random()*CHARS.length)]); });
      if(f>=total){ nodes.forEach(o=>o.node.nodeValue = o.orig); clearInterval(id); }
    }, 30);
  }
  const sio = new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){
    const h = e.target.querySelector('h2.title'); if(h) scrambleEl(h); sio.unobserve(e.target); } }); }, {threshold:0.35});
  $$('.reveal').forEach(el=>{ if(el.querySelector('h2.title')) sio.observe(el); });

  /* ---------- 14. lightbox navigation + share ---------- */
  const mShot = $('#mShot');
  if(mShot){
    mShot.insertAdjacentHTML('beforeend',
      '<button class="lb-nav prev" data-lb="prev" aria-label="Previous project">&#8249;</button>'+
      '<button class="lb-nav next" data-lb="next" aria-label="Next project">&#8250;</button>'+
      '<span class="lb-count" id="lbCount"></span>');
  }
  let curIdx = -1;
  document.addEventListener('click', e=>{
    const o = e.target.closest('[data-open]');
    if(o){ curIdx = DATA.findIndex(p=>p.id===o.dataset.open); updLb();
      setTimeout(()=>{ const a = $('#mActions');
        if(a && !a.querySelector('.share')){
          const b = document.createElement('button'); b.className='mini share';
          b.innerHTML = 'Share <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 14v5h14v-5"/></svg>';
          b.addEventListener('click', shareProject); a.appendChild(b);
        } }, 30);
    }
    const lb = e.target.closest('[data-lb]');
    if(lb){ step(lb.dataset.lb === 'next' ? 1 : -1); }
  });
  function updLb(){
    const c = $('#lbCount'); if(c) c.textContent = curIdx>=0 ? (curIdx+1)+' / '+DATA.length : '';
  }
  function step(dir){
    if(curIdx < 0) return;
    curIdx = (curIdx + dir + DATA.length) % DATA.length;
    const p = DATA[curIdx];
    $('#mShot').querySelector('img, .ph');
    $('#mShot').innerHTML = '<button class="lb-nav prev" data-lb="prev">&#8249;</button><button class="lb-nav next" data-lb="next">&#8250;</button><span class="lb-count" id="lbCount"></span>' +
      (p.img ? '<img src="'+p.img+'" alt="'+p.name+'">' : '<div style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.5);font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase">in development</div>');
    $('#mId').textContent = p.id + ' · ' + p.badge;
    $('#mTitle').textContent = p.name;
    $('#mDesc').textContent = p.desc;
    $('#mList').innerHTML = p.feats.map(f=>'<li>'+f+'</li>').join('');
    $('#mMeta').innerHTML = p.meta.map(m=>'<span>'+m[0]+'<b>'+m[1]+'</b></span>').join('');
    $('#mActions').innerHTML = (p.live ? '<a class="mini solid" href="'+p.live+'" target="_blank" rel="noopener">Open live site'+arrow+'</a>' : '<span class="mini" style="cursor:default">Coming soon</span>') + '<button class="mini" data-close>Close</button>';
    updLb();
  }
  function shareProject(){
    const p = DATA[curIdx]; if(!p) return;
    const url = p.live || location.href;
    const data = {title:p.name+' — Shrestha', text:p.desc, url:url};
    if(navigator.share){ navigator.share(data).catch(()=>{}); }
    else if(navigator.clipboard){ navigator.clipboard.writeText(url).then(()=>toast('link copied')).catch(()=>toast(url)); }
    else toast(url);
  }

  /* ---------- 15. global keyboard ---------- */
  document.addEventListener('keydown', e=>{
    const typing = /INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openPalette(); return; }
    if(e.key==='Escape'){ const w = SC(); if(w && w.isRiding && w.isRiding()){ w.stopRide(); toast('back to the island'); } }
    if(typing){
      if(palette.classList.contains('open')){
        if(e.key==='Escape') closePalette();
        if(e.key==='ArrowDown'){ e.preventDefault(); palSel=Math.min(palSel+1,palData.length-1); markPal(); }
        if(e.key==='ArrowUp'){ e.preventDefault(); palSel=Math.max(palSel-1,0); markPal(); }
        if(e.key==='Enter'){ e.preventDefault(); runPal(palSel); }
      }
      return;
    }
    if(palette.classList.contains('open')) return;
    if(e.key==='Escape'){ keysSheet.classList.remove('open'); closePalette(); return; }
    if(e.key==='?'){ keysSheet.classList.toggle('open'); return; }
    if(e.key.toLowerCase()==='h'){ toggleHud(); return; }
    if(e.key.toLowerCase()==='t'){ $('#themeBtn').click(); return; }
    if(e.key.toLowerCase()==='w'){ wpanel.classList.toggle('open'); return; }
    if(document.getElementById('modal').classList.contains('open')){
      if(e.key==='ArrowRight') step(1);
      if(e.key==='ArrowLeft') step(-1);
    }
  });
  function markPal(){ $$('#paletteList button').forEach((b,i)=>b.classList.toggle('sel', i===palSel)); }

  /* ---------- 16. scroll sync ---------- */
  addEventListener('scroll', ()=>{
    syncChapters();
    if(ribbon && !ribbonHidden) ribbon.classList.toggle('show', window.scrollY > window.innerHeight*0.55);
  }, {passive:true});
  syncChapters();
  /* ==================== v5: UI FEATURE LAYER ==================== */

  /* ---- 👉 PASTE YOUR VIDEO LINK HERE (YouTube / Vimeo / .mp4) ---- */
  const VIDEO_URL = 'https://x.com/ItsIndianx/status/2112146222899515846';

  (function(){
    const frame = $('#videoFrame'); if(!frame) return;
    const empty = $('#videoEmpty'), note = $('#videoNote');
    function embed(u){
      if(!u) return false;
      let src = u;
      let kind = 'iframe';
      const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      const xt = u.match(/(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/(\d+)/);
      if(yt){
        src = 'https://www.youtube.com/embed/' + yt[1] + '?rel=0&modestbranding=1';
      } else if(vm){
        src = 'https://player.vimeo.com/video/' + vm[1];
      } else if(xt){
        src = 'https://platform.twitter.com/embed/Tweet.html?id=' + xt[1] + '&dnt=true';
        kind = 'tweet';
      } else if(/\.(mp4|webm|ogg)(\?|$)/i.test(u)){
        kind = 'video';
      }
      if(empty) empty.remove();
      if(note) note.textContent = kind === 'video' ? 'mp4' : (kind === 'tweet' ? 'post on x' : 'embedded');
      if(kind === 'tweet'){
        frame.style.aspectRatio = 'auto';
        frame.style.height = 'clamp(460px, 72vh, 700px)';
      }
      if(kind === 'video'){
        frame.insertAdjacentHTML('beforeend', '<video src="'+src+'" controls playsinline preload="metadata"></video>');
      } else {
        frame.insertAdjacentHTML('beforeend', '<iframe src="'+src+'" title="Shrestha — video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>');
      }
      if(kind === 'tweet'){
        frame.insertAdjacentHTML('afterend', '<p style="margin-top:12px;font-size:13px;color:var(--mute)">If the post does not load, <a href="'+u+'" target="_blank" rel="noopener" style="color:var(--accent)">open it on X</a>.</p>');
      }
      return true;
    }
    if(!embed(VIDEO_URL)){
      const q = new URLSearchParams(location.search).get('video');
      if(q) embed(q);
    }
  })();

  /* ---------- 1. accent colour picker ---------- */
  const ACCENTS = [['#ff5a3c','#1f6feb','Coral'],['#0ea5a5','#7c5cff','Teal'],['#e0a106','#2f6fed','Amber'],
                   ['#e0245e','#3a7bd5','Rose'],['#2f9e44','#0ea5e9','Forest'],['#1f6feb','#ff5a3c','Blue']];
  const accentsEl = $('#accents');
  let accentIdx = 0; try{ accentIdx = +(localStorage.getItem('shrestha-accent')||0) || 0; }catch(e){}
  function applyAccent(i){
    const a = ACCENTS[i] || ACCENTS[0];
    document.documentElement.style.setProperty('--accent', a[0]);
    document.documentElement.style.setProperty('--accent-2', a[1]);
    $$('#accents button').forEach((b,k)=>b.classList.toggle('on', k===i));
    try{ localStorage.setItem('shrestha-accent', i); }catch(e){}
  }
  if(accentsEl){
    accentsEl.innerHTML = ACCENTS.map((a,i)=>'<button data-a="'+i+'" title="'+a[2]+'" aria-label="'+a[2]+' accent"><i style="background:linear-gradient(145deg,'+a[0]+','+a[1]+')"></i></button>').join('');
    accentsEl.addEventListener('click', e=>{ const b=e.target.closest('[data-a]'); if(b){ applyAccent(+b.dataset.a); toast('accent: '+ACCENTS[+b.dataset.a][2].toLowerCase()); } });
    applyAccent(accentIdx);
  }

  /* ---------- 2. reading progress ring in the dock ---------- */
  const dock = $('#dock');
  if(dock){
    dock.insertAdjacentHTML('afterbegin',
      '<span class="ring" title="Reading progress"><svg viewBox="0 0 40 40"><circle class="bg" cx="20" cy="20" r="17"></circle>'+
      '<circle class="fg" id="ringFg" cx="20" cy="20" r="17" stroke-dasharray="106.8" stroke-dashoffset="106.8"></circle></svg><b id="ringPct">0</b></span>');
  }

  /* ---------- 3. now widget + time on site ---------- */
  const nowW = $('#nowWidget'); const t0 = Date.now();
  function fmt(n){ return (n<10?'0':'')+n; }
  setInterval(function(){
    const d = new Date(Date.now() + (new Date().getTimezoneOffset()+330)*60000);
    const nt = $('#nowTime'); if(nt) nt.textContent = fmt(d.getHours())+':'+fmt(d.getMinutes());
    const s = Math.floor((Date.now()-t0)/1000);
    const ns = $('#nowSession'); if(ns) ns.textContent = Math.floor(s/60)+':'+fmt(s%60);
  }, 1000);

  /* ---------- 4. auto theme by local time ---------- */
  (function(){
    let savedTheme = null; try{ savedTheme = localStorage.getItem('shrestha-theme'); }catch(e){}
    if(!savedTheme){
      const h = new Date().getHours();
      if(h >= 19 || h < 6) document.documentElement.setAttribute('data-theme','dark');
    }
  })();

  /* ---------- 5. heading parallax ---------- */
  const heads = $$('main .reveal h2.title').map(function(h){ return {el:h, host:h.closest('section')}; });

  /* ---------- 6. skill chip tooltips ---------- */
  const TIPS = {
    'HTML / CSS':'Semantic markup and hand-written CSS — no frameworks needed for layout.',
    'JavaScript':'Vanilla JS: DOM, canvas, WebGL glue and interaction logic.',
    'React':'Component-driven UI, state and hooks.',
    'UI / UX Design':'Layout, hierarchy, motion and the feel of an interface.',
    'Prompt Engineering':'Getting reliable structure out of LLMs.',
    'LLM API Integration':'Wiring models into real product surfaces.',
    'Python':'Scripting and small backend tools.',
    'Node.js':'Servers, tooling and build steps.',
    'Three.js':'Real-time 3D in the browser — this page uses it.',
    'Responsive':'Layouts that hold together from phone to ultrawide.',
    'Animation':'Motion that guides the eye instead of decorating.',
    'Design Systems':'Tokens, components and rules that scale.',
    'AI Workflows':'Making AI part of the build loop, not a novelty.',
    'Prompt-driven':'Designing with prompts as a first-class input.'
  };
  const tipEl = $('#tooltip');
  function showTip(target){
    const t = TIPS[target.textContent.trim()]; if(!t || !tipEl) return;
    const r = target.getBoundingClientRect();
    tipEl.textContent = t; tipEl.classList.add('show');
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = Math.max(10, Math.min(innerWidth-w-10, r.left + r.width/2 - w/2)) + 'px';
    tipEl.style.top = Math.max(10, r.top - h - 10) + 'px';
  }
  function hideTip(){ if(tipEl) tipEl.classList.remove('show'); }
  document.addEventListener('pointerover', function(e){ const c = e.target.closest && e.target.closest('.chip'); if(c) showTip(c); });
  document.addEventListener('pointerout', function(e){ if(e.target.closest && e.target.closest('.chip')) hideTip(); });

  /* ---------- 7. print / résumé + copy link + back-to-top rocket ---------- */
  const footEl = document.querySelector('.foot');
  if(footEl){
    const b = document.createElement('button');
    b.className='mini'; b.style.marginTop='4px';
    b.innerHTML = 'Print / save PDF <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z"/></svg>';
    b.addEventListener('click', function(){ toast('opening print dialog'); setTimeout(function(){ window.print(); }, 260); });
    footEl.appendChild(b);
  }
  $$('#projects .card').forEach(function(card){
    const btn = card.querySelector('[data-open]'); if(!btn) return;
    const id = btn.dataset.open;
    const actions = card.querySelector('.card-actions'); if(!actions) return;
    const c = document.createElement('button');
    c.className='mini copy'; c.textContent='Copy link';
    c.addEventListener('click', function(ev){
      ev.stopPropagation();
      const url = location.origin + location.pathname + '#work';
      if(navigator.clipboard) navigator.clipboard.writeText(url).then(function(){ toast('link copied'); }).catch(function(){ toast(url); });
      else toast(url);
    });
    actions.appendChild(c);
  });
  const topLink = dock ? dock.querySelector('a[href="#top"]') : null;
  if(topLink){
    topLink.innerHTML = '<span class="tip">Rocket to top</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l7-9 7 9M12 4v11M8 19h8"/></svg>';
    topLink.addEventListener('click', function(){
      if(reduce) return;
      const f = document.createElement('i'); f.className='heart'; f.textContent='\uD83D\uDE80';
      f.style.left = (innerWidth/2-10)+'px'; f.style.bottom = '70px'; f.style.fontSize='26px';
      const host = $('#hearts'); if(host){ host.appendChild(f); setTimeout(function(){ f.remove(); }, 1500); }
    });
  }

  /* ---------- 8. view toggle + confetti on filter ---------- */
  const filtersRow = $('#filters');
  if(filtersRow){
    const vb = document.createElement('button');
    vb.className='mini copy'; vb.style.marginLeft='8px'; vb.textContent='List view';
    vb.addEventListener('click', function(){
      const p = $('#projects'); const on = p.classList.toggle('list');
      vb.textContent = on ? 'Grid view' : 'List view';
      toast(on ? 'list view' : 'grid view');
    });
    filtersRow.appendChild(vb);
    filtersRow.addEventListener('click', function(e){
      if(e.target.closest('button') && !e.target.closest('.mini')){
        const r = e.target.getBoundingClientRect();
        burst(r.left + r.width/2, r.top + r.height/2);
      }
    });
  }

  /* ---------- 9. settings toggles (sound, motion, contrast, cursor) ---------- */
  const wpBody = document.querySelector('.wpanel-body');
  if(wpBody){
    const row = document.createElement('div');
    row.className='wp-row'; row.style.marginTop='14px';
    row.innerHTML = '<span class="wp-lbl">Display</span><div class="toggles" id="v5Toggles">'+
      '<button data-t="motion">Reduce motion</button>'+
      '<button data-t="contrast">High contrast</button>'+
      '<button data-t="cursor">Voxel cursor</button>'+
      '<button data-t="sound">Ambient sound</button>'+
      '<button data-t="photo">Focus mode</button>'+
      '<button data-t="watermark">Watermark</button></div>';
    wpBody.appendChild(row);
  }
  let audioCtx = null, audioNodes = null;
  function toggleSound(on){
    try{
      if(on){
        if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const g = audioCtx.createGain(); g.gain.value = 0.0; g.connect(audioCtx.destination);
        const o1 = audioCtx.createOscillator(); o1.type='sine'; o1.frequency.value=174;
        const o2 = audioCtx.createOscillator(); o2.type='sine'; o2.frequency.value=261.6;
        const lfo = audioCtx.createOscillator(); lfo.frequency.value=0.08;
        const lg = audioCtx.createGain(); lg.gain.value=0.02; lfo.connect(lg); lg.connect(g.gain);
        o1.connect(g); o2.connect(g); o1.start(); o2.start(); lfo.start();
        g.gain.setTargetAtTime(0.035, audioCtx.currentTime, 1.2);
        audioNodes = {o1,o2,lfo,g};
      } else if(audioNodes){
        audioNodes.g.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
        const n = audioNodes; audioNodes = null;
        setTimeout(function(){ try{ n.o1.stop(); n.o2.stop(); n.lfo.stop(); }catch(e){} }, 900);
      }
    }catch(e){ toast('audio unavailable'); }
  }
  const togEl = $('#v5Toggles');
  togEl && togEl.addEventListener('click', function(e){
    const b = e.target.closest('button'); if(!b) return;
    const on = !b.classList.contains('on'); b.classList.toggle('on', on);
    const k = b.dataset.t;
    if(k==='motion'){ document.body.classList.toggle('rm', on); toast(on?'motion reduced':'motion on'); }
    if(k==='contrast'){ document.body.classList.toggle('hc', on); toast(on?'high contrast':'normal contrast'); }
    if(k==='cursor'){ document.body.classList.toggle('voxcursor', on); toast(on?'voxel cursor':'normal cursor'); }
    if(k==='sound'){ toggleSound(on); toast(on?'ambient on':'ambient off'); }
    if(k==='photo'){ setFocus(on); }
    if(k==='watermark'){ document.body.classList.toggle('watermark-on', on); toast(on?'watermark on':'watermark off'); }
  });

  /* ---------- 9b. the time machine ---------- */
  const eraSlider = $('#wpEra');
  const eraOut = $('#wpEraVal');
  if(eraSlider){
    eraSlider.addEventListener('input', function(){
      const v = Number(eraSlider.value) / 100;
      const sc = SC();
      if(sc && sc.setEra) sc.setEra(v);
      if(eraOut) eraOut.textContent = String(Math.round(2023 + v * 7));
      unlockBadge('travel');
    });
  }

  /* ---------- 9c. pose the boy and take a photo ---------- */
  const poseBar = $('#boyPoses');
  if(poseBar){
    poseBar.addEventListener('click', function(e){
      const b = e.target.closest('button'); if(!b) return;
      if(b.id === 'boyShot'){
        if(!window.__boyShot){ toast('the boy is still loading'); return; }
        window.__boyShot(function(shot){
          shot.toBlob(function(blob){
            if(!blob){ toast('could not build the photo'); return; }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'shrestha-me.png';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
            toast('saved shrestha-me.png');
            unlockBadge('photo');
          }, 'image/png');
        });
        return;
      }
      const name = b.getAttribute('data-pose');
      if(window.__boyPose) window.__boyPose(name);
      poseBar.querySelectorAll('[data-pose]').forEach(function(x){ x.classList.toggle('on', x === b); });
      toast('pose: ' + b.textContent.toLowerCase());
      unlockBadge('pose');
    });
  }

  /* ---------- 10. focus mode, fullscreen, wake lock ---------- */
  var focusOn = false;
  var wakeLock = null;
  var overlayHistory = null;

  function pushOverlay(name) {
    if (overlayHistory !== null) {
      return;
    }
    overlayHistory = name;
    try {
      history.pushState({ overlay: name }, '');
    } catch (e) {
      overlayHistory = null;
    }
  }

  function popOverlay(name) {
    if (overlayHistory !== name) {
      return;
    }
    overlayHistory = null;
    try {
      history.back();
    } catch (e) {}
  }

  function askFullscreen() {
    var el = document.documentElement;
    if (!el.requestFullscreen) {
      return;
    }
    var result = el.requestFullscreen();
    if (result && result.catch) {
      result.catch(function () {});
    }
  }

  function dropFullscreen() {
    if (!document.fullscreenElement || !document.exitFullscreen) {
      return;
    }
    var result = document.exitFullscreen();
    if (result && result.catch) {
      result.catch(function () {});
    }
  }

  function holdScreenAwake() {
    if (!navigator.wakeLock || !navigator.wakeLock.request) {
      return;
    }
    navigator.wakeLock.request('screen').then(function (lock) {
      wakeLock = lock;
    }).catch(function () {});
  }

  function releaseScreenAwake() {
    if (!wakeLock) {
      return;
    }
    try {
      wakeLock.release();
    } catch (e) {}
    wakeLock = null;
  }

  function setFocus(on) {
    if (on === focusOn) {
      return;
    }
    focusOn = on;
    document.body.classList.toggle('photo', on);
    var toggleButton = togEl && togEl.querySelector('[data-t="photo"]');
    if (toggleButton) {
      toggleButton.classList.toggle('on', on);
    }
    if (on === true) {
      askFullscreen();
      holdScreenAwake();
      pushOverlay('focus');
      toast('focus mode on');
      unlockBadge('focus');
      return;
    }
    dropFullscreen();
    releaseScreenAwake();
    popOverlay('focus');
  }

  window.__toggleFocus = function () {
    setFocus(!focusOn);
  };

  var focusButton = $('#focusBtn');
  if (focusButton) {
    focusButton.addEventListener('click', function () {
      setFocus(true);
    });
  }

  var exitButton = $('#pbExit');
  if (exitButton) {
    exitButton.addEventListener('click', function () {
      setFocus(false);
    });
  }

  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && focusOn === true) {
      setFocus(false);
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && focusOn === true) {
      holdScreenAwake();
    }
  });

  /* ---------- 10b. share a clean picture of the world ---------- */
  function buildShareCanvas(done) {
    var scene = SC();
    var source = scene && scene.renderer ? scene.renderer.domElement : null;
    if (!source) {
      toast('the world is still loading');
      return;
    }
    var out = document.createElement('canvas');
    out.width = source.width;
    out.height = source.height;
    var paint = out.getContext('2d');
    paint.fillStyle = '#0b1522';
    paint.fillRect(0, 0, out.width, out.height);
    paint.drawImage(source, 0, 0);

    var unit = out.width / 1200;
    var edge = 36 * unit;
    var strip = 160 * unit;

    var fade = paint.createLinearGradient(0, out.height - strip, 0, out.height);
    fade.addColorStop(0, 'rgba(6,11,19,0)');
    fade.addColorStop(1, 'rgba(6,11,19,0.94)');
    paint.fillStyle = fade;
    paint.fillRect(0, out.height - strip, out.width, strip);

    paint.textAlign = 'left';
    paint.fillStyle = '#ffffff';
    paint.font = '700 ' + (48 * unit) + 'px "Space Grotesk", system-ui, sans-serif';
    paint.fillText('SHRESTHA', edge, out.height - edge - 40 * unit);

    paint.fillStyle = 'rgba(255,255,255,0.75)';
    paint.font = '400 ' + (25 * unit) + 'px "Plus Jakarta Sans", system-ui, sans-serif';
    paint.fillText('Frontend designer & AI builder', edge, out.height - edge - 4 * unit);

    paint.textAlign = 'right';
    paint.fillStyle = '#6ff5c8';
    paint.font = '400 ' + (25 * unit) + 'px "Space Mono", monospace';
    paint.fillText('shresthaxcoder.github.io', out.width - edge, out.height - edge - 4 * unit);

    done(out);
  }

  function downloadBlob(blob) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'shrestha-voxel-world.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 5000);
    toast('saved shrestha-voxel-world.png');
  }

  function flashShutter() {
    var shutter = $('#shutter');
    if (!shutter) {
      return;
    }
    shutter.style.opacity = '0.85';
    setTimeout(function () {
      shutter.style.opacity = '0';
    }, 140);
  }

  function shareView() {
    flashShutter();
    setTimeout(function () {
      buildShareCanvas(function (out) {
        out.toBlob(function (blob) {
          if (!blob) {
            toast('could not build the picture');
            return;
          }
          var file = null;
          try {
            file = new File([blob], 'shrestha-voxel-world.png', { type: 'image/png' });
          } catch (e) {
            file = null;
          }
          if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            unlockBadge('share');
            navigator.share({ files: [file], title: 'Shrestha — voxel world', text: 'shresthaxcoder.github.io' })
              .catch(function () {});
            return;
          }
          downloadBlob(blob);
        }, 'image/png');
      });
    }, 180);
  }

  function saveView() {
    flashShutter();
    setTimeout(function () {
      buildShareCanvas(function (out) {
        out.toBlob(function (blob) {
          if (!blob) {
            toast('could not build the picture');
            return;
          }
          downloadBlob(blob);
        }, 'image/png');
      });
    }, 180);
  }

  var shareButton = $('#pbShare');
  if (shareButton) {
    shareButton.addEventListener('click', shareView);
  }

  var saveButton = $('#pbSave');
  if (saveButton) {
    saveButton.addEventListener('click', saveView);
  }

  /* ---------- 10c. double tap says hello ---------- */
  var noticeTimer = null;

  function showWorldNotice() {
    var notice = $('#worldNotice');
    if (!notice) {
      return;
    }
    notice.classList.add('show');
    unlockBadge('hello');
    if (noticeTimer) {
      clearTimeout(noticeTimer);
    }
    noticeTimer = setTimeout(function () {
      notice.classList.remove('show');
    }, 2600);
  }

  var lastTapAt = 0;
  var lastTapX = 0;
  var lastTapY = 0;

  document.addEventListener('pointerup', function (event) {
    var onControl = event.target && event.target.closest
      ? event.target.closest('a, button, input, textarea, .modal, .palette, .keys, .wpanel')
      : null;
    if (onControl) {
      lastTapAt = 0;
      return;
    }
    var now = Date.now();
    var dx = event.clientX - lastTapX;
    var dy = event.clientY - lastTapY;
    var moved = Math.sqrt(dx * dx + dy * dy);
    if (now - lastTapAt < 320 && moved < 46) {
      lastTapAt = 0;
      showWorldNotice();
      return;
    }
    lastTapAt = now;
    lastTapX = event.clientX;
    lastTapY = event.clientY;
  });

  /* ---------- 10d. android back button closes what is open ---------- */
  var baseOpenModal = openModal;
  var baseCloseModal = closeModal;
  openModal = function (id) {
    baseOpenModal(id);
    pushOverlay('modal');
  };
  closeModal = function () {
    var wasOpen = overlayHistory === 'modal';
    baseCloseModal();
    if (wasOpen) {
      popOverlay('modal');
    }
  };

  var baseOpenPalette = openPalette;
  var baseClosePalette = closePalette;
  openPalette = function () {
    baseOpenPalette();
    pushOverlay('palette');
  };
  closePalette = function () {
    var wasOpen = overlayHistory === 'palette';
    baseClosePalette();
    if (wasOpen) {
      popOverlay('palette');
    }
  };

  window.addEventListener('popstate', function () {
    var which = overlayHistory;
    if (which === null) {
      return;
    }
    overlayHistory = null;
    if (which === 'focus') {
      setFocus(false);
    }
    if (which === 'modal') {
      baseCloseModal();
    }
    if (which === 'palette') {
      baseClosePalette();
    }
    if (which === 'keys') {
      var sheet = $('#keys');
      if (sheet) {
        sheet.classList.remove('open');
      }
    }
  });

  /* ---------- 11. fact ticker ---------- */
  const FACTS = [
    'The first browser I used was built by someone else. Mine is called MyDaksha.',
    'Every voxel on this page is placed by hand-written JavaScript.',
    'The whole 3D world is one canvas and about 4,000 blocks.',
    'I started with DevTools open on someone else\u2019s website, changing one colour.',
    'This page has no framework, no build step and no dependencies beyond Three.js.',
    'There are 19 separate animated things in the sky above you right now.'
  ];
  const contactSection = document.querySelector('#contact .wrap');
  if(contactSection){
    const f = document.createElement('div');
    f.className='facts reveal';
    f.innerHTML = '<span class="fl">Did you know</span><p id="factText"></p>';
    f.style.gridColumn = '1 / -1';
    contactSection.appendChild(f);
    io.observe(f);
    const ft = $('#factText'); let fi = 0;
    function nextFact(){ ft.style.opacity = 0; setTimeout(function(){ ft.textContent = FACTS[fi % FACTS.length]; ft.style.opacity = 1; fi++; }, 320); }
    nextFact(); if(!reduce) setInterval(nextFact, 5200);
  }

  /* ---------- 12. table of contents dropdown ---------- */
  const navRight = document.querySelector('.nav-right');
  if(navRight){
    const wrap = document.createElement('div');
    wrap.className='nav-toc';
    wrap.innerHTML = '<button class="icon-btn" id="tocBtn" aria-label="Contents" title="Contents">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg></button>'+
      '<div class="toc" id="tocList"></div>';
    navRight.insertBefore(wrap, navRight.firstChild);
    const list = $('#tocList');
    const SECT = [['top','Home'],['about','About'],['video','Watch'],['work','Work'],['skills','Skills'],['journey','Journey'],['resume','R&eacute;sum&eacute;'],['contact','Contact']];
    list.innerHTML = SECT.map(function(s,i){ return '<a href="#'+s[0]+'">'+s[1]+'<b>0'+(i+1)+'</b></a>'; }).join('');
    $('#tocBtn').addEventListener('click', function(e){ e.stopPropagation(); wrap.classList.toggle('open'); });
    list.addEventListener('click', function(){ wrap.classList.remove('open'); });
    document.addEventListener('click', function(){ wrap.classList.remove('open'); });
  }

  /* The favicon is now the real logo, so the old colour cycling is gone. */

  /* ---------- 15. scroll-driven: ring, parallax, widgets, arrows ---------- */
  function onScroll5(){
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.max(0, Math.min(1, y/h)) : 0;
    const ring = $('#ringFg');
    if(ring) ring.setAttribute('stroke-dashoffset', String(106.8 * (1-p)));
    const rp = $('#ringPct'); if(rp) rp.textContent = Math.round(p*100);
    if(nowW) nowW.classList.toggle('show', y > window.innerHeight*0.8);
    heads.forEach(function(o){
      const r = o.host.getBoundingClientRect();
      const k = Math.max(-1, Math.min(1, (r.top + r.height/2 - innerHeight/2) / innerHeight));
      o.el.style.transform = 'translateY(' + (k * -22).toFixed(1) + 'px)';
    });
  }
  window.addEventListener('scroll', onScroll5, {passive:true});
  onScroll5();

  /* ---------- 16. arrow-key section navigation ---------- */
  document.addEventListener('keydown', function(e){
    if(/INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName)) return;
    if(document.getElementById('modal').classList.contains('open')) return;
    if($('#palette').classList.contains('open')) return;
    if(e.key === 'Escape' && focusOn){ setFocus(false); return; }
    if(e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const ids = ['top','about','video','work','skills','journey','resume','contact'];
    let cur = 0;
    ids.forEach(function(id,i){ const el = document.getElementById(id); if(el && el.getBoundingClientRect().top <= innerHeight*0.42) cur = i; });
    const nx = Math.max(0, Math.min(ids.length-1, cur + (e.key==='ArrowDown'?1:-1)));
    e.preventDefault();
    const t = document.getElementById(ids[nx]); if(t) t.scrollIntoView({behavior: reduce?'auto':'smooth', block:'start'});
  });
  /* ==================== v6: INSTALL AS AN APP ==================== */

  // Put an install button in the navigation bar. It stays hidden until the
  // browser says the page can actually be installed.
  var navRightBox = document.querySelector('.nav-right');
  var installButton = null;

  if (navRightBox) {
    installButton = document.createElement('button');
    installButton.id = 'installBtn';
    installButton.className = 'icon-btn';
    installButton.title = 'Install this app';
    installButton.setAttribute('aria-label', 'Install this app');
    installButton.style.display = 'none';
    installButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M8 11l4 4 4-4M5 21h14"/></svg>';
    navRightBox.insertBefore(installButton, navRightBox.firstChild);
  }

  var installPrompt = null;

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPrompt = event;
    if (installButton) {
      installButton.style.display = 'grid';
    }
  });

  if (installButton) {
    installButton.addEventListener('click', function () {
      if (!installPrompt) {
        toast('open your browser menu and choose "Install app"');
        return;
      }
      installPrompt.prompt();
      installPrompt = null;
      installButton.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', function () {
    if (installButton) {
      installButton.style.display = 'none';
    }
    toast('app installed');
  });

  // Register the service worker so the page can be installed and reopened offline.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {
        // Opened straight from a file, or the browser blocked it. The page still works.
      });
    });
  }

  window.addEventListener('offline', function () {
    toast('offline — showing the cached copy');
  });

  window.addEventListener('online', function () {
    toast('back online');
  });

  // Show a small badge when running as an installed app.
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    document.body.classList.add('standalone');
  }
})();
