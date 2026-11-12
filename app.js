(function () {
  'use strict';
  var C = window.WEDDING;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var start = new Date(C.start);
  var end = new Date(start.getTime() + C.durationHours * 3600000);

  /* ---------- fill details from config ---------- */
  function part(opt) {
    return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: C.tz }, opt)).format(start);
  }
  var wd = part({ weekday: 'long' }), dn = part({ day: 'numeric' }),
      mo = part({ month: 'long' }), yr = part({ year: 'numeric' });
  $('#wd').textContent = wd;
  $('#dn').textContent = dn;
  $('#mo').textContent = mo;
  $('#yr').textContent = yr;
  $('#tm').innerHTML = C.timeText.replace(' to ', '<br>to ');
  $('#vname').textContent = C.venueName;
  $('#vaddr').textContent = C.venueAddress;
  $('#vwhen').textContent = wd + ' · ' + dn + ' ' + mo + ' ' + yr + ' · ' + C.timeText;
  $('#mapBtn').href = C.mapsLink;

  var contact = $('#contact');
  C.phones.forEach(function (p) {
    var a = document.createElement('a');
    a.className = 'btn alt'; a.href = 'tel:' + p.number; a.textContent = 'Call ' + p.label;
    contact.appendChild(a);
  });
  if (C.whatsapp) {
    var w = document.createElement('a');
    w.className = 'btn alt'; w.target = '_blank'; w.rel = 'noopener';
    w.href = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent('Assalamu alaikum, I will, in sha Allah, attend the Nikkah of Jansiya N & Shajid Shahan P.K on ' + dn + ' ' + mo + ' ' + yr + '.');
    w.textContent = 'Confirm on WhatsApp';
    contact.appendChild(w);
  }

  /* ---------- location QR (built in the browser, hidden if it cannot load) ---------- */
  (function () {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = function () {
      try {
        new window.QRCode($('#qrbox'), { text: C.mapsLink, width: 150, height: 150, colorDark: '#5a1122', colorLight: '#ffffff' });
      } catch (e) { $('#qrcard').style.display = 'none'; }
    };
    s.onerror = function () { $('#qrcard').style.display = 'none'; };
    document.head.appendChild(s);
  })();

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---------- falling petals ---------- */
  var cv = $('#petals'), ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, petals = [], target = 26;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  }
  function mk(init) {
    return { x: Math.random() * W, y: init ? Math.random() * H : -20 * dpr,
      r: (4 + Math.random() * 6) * dpr, vy: (0.5 + Math.random() * 0.9) * dpr,
      vx: (Math.random() - 0.5) * 0.5 * dpr, rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.04, sw: Math.random() * 6.28,
      c: Math.random() < 0.55 ? '255,250,240' : '244,196,204', burst: false };
  }
  function burst(x, y) {
    if (reduce) return;
    for (var i = 0; i < 34; i++) {
      var p = mk(false); p.x = x * dpr; p.y = y * dpr; p.burst = true; p.life = 120;
      var a = Math.random() * 6.28, sp = (2 + Math.random() * 4) * dpr;
      p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - 2 * dpr; petals.push(p);
    }
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    var base = petals.filter(function (p) { return !p.burst; }).length;
    if (base < target && Math.random() < 0.15) petals.push(mk(false));
    petals = petals.filter(function (p) {
      p.sw += 0.02; p.rot += p.vr; p.x += p.vx + Math.sin(p.sw) * 0.4 * dpr; p.y += p.vy;
      if (p.burst) { p.vy += 0.07 * dpr; p.vx *= 0.985; p.life--; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = 'rgba(' + p.c + ',' + (p.burst ? Math.min(1, p.life / 60) * 0.9 : 0.8) + ')';
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, 6.28); ctx.fill(); ctx.restore();
      return p.burst ? (p.life > 0 && p.y < H + 20) : p.y < H + 30;
    });
    requestAnimationFrame(frame);
  }
  if (!reduce) {
    size(); for (var i = 0; i < 18; i++) petals.push(mk(true));
    addEventListener('resize', size); requestAnimationFrame(frame);
  } else { cv.style.display = 'none'; }

  /* ---------- music (optional) ---------- */
  var audio = null, music = $('#music');
  if (C.musicUrl) {
    audio = new Audio(C.musicUrl); audio.loop = true; music.classList.add('show');
    music.addEventListener('click', function () {
      if (audio.paused) { audio.play(); music.classList.remove('off'); } else { audio.pause(); music.classList.add('off'); }
    });
  }

  /* ---------- intro / envelope ---------- */
  var env = $('#env'), intro = $('#intro');
  function openInvite() {
    if (env.classList.contains('open')) return;
    env.classList.add('open');
    if (audio) { audio.play().catch(function () {}); }
    target = 12;
    setTimeout(function () {
      intro.classList.add('gone');
      document.body.classList.remove('locked');
      document.body.classList.add('opened');
      window.scrollTo(0, 0);
      $$('#invite .rv').forEach(function (el) { el.classList.add('in'); });
    }, reduce ? 300 : 2400);
  }
  $('#seal').addEventListener('click', openInvite);
  $('#openHint').addEventListener('click', openInvite);

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var rvIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$('.rv').forEach(function (el) { rvIO.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- bottom menu highlight ---------- */
  var links = $$('#dock a');
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var t = e.target.getAttribute('data-nav');
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-t') === t); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-nav]').forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- countdown ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function tick() {
    var d = start - Date.now();
    if (d <= 0) {
      $('#cd').hidden = true; $('#cdlabel').hidden = true; $('#married').hidden = false; return;
    }
    var s = Math.floor(d / 1000);
    $('#cd-d').textContent = Math.floor(s / 86400);
    $('#cd-h').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cd-m').textContent = pad(Math.floor(s % 3600 / 60));
    $('#cd-s').textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- add to calendar ---------- */
  $('#calBtn').addEventListener('click', function () {
    function f(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); }
    var loc = (C.venueName + ', ' + C.venueAddress).replace(/,/g, '\\,');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nikkah Invitation//EN', 'BEGIN:VEVENT',
      'UID:' + start.getTime() + '@nikkah-invitation', 'DTSTAMP:' + f(new Date()),
      'DTSTART:' + f(start), 'DTEND:' + f(end),
      'SUMMARY:Nikkah of Jansiya N & Shajid Shahan P.K', 'LOCATION:' + loc,
      'DESCRIPTION:' + C.mapsLink, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'nikkah-invitation.ics';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- lanterns & wishes ---------- */
  var sky = $('#sky'), wishline = $('#wishline');
  function lantern(mine, label) {
    var l = document.createElement('div');
    l.className = 'lantern' + (mine ? ' mine' : '');
    l.style.left = (6 + Math.random() * 84) + '%';
    l.style.top = (8 + Math.random() * 58) + '%';
    l.style.setProperty('--t', (4 + Math.random() * 3) + 's');
    l.style.animationDelay = mine ? '0s,2.4s' : (Math.random() * -4) + 's';
    if (label) l.title = label;
    l.appendChild(document.createElement('i'));
    sky.appendChild(l);
    var all = $$('.lantern', sky);
    if (all.length > 24) all[0].remove();
  }
  for (var k = 0; k < 8; k++) lantern(false);

  var form = $('#wishForm'), msg = $('#msg'), count = $('#count');
  msg.addEventListener('input', function () { count.textContent = msg.value.length; });
  $$('.chip').forEach(function (b) {
    b.addEventListener('click', function () {
      msg.value = b.textContent.slice(0, 90); count.textContent = msg.value.length; msg.focus();
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = msg.value.trim();
    if (!text) { msg.focus(); return; }
    var name = ($('#wname').value || 'A guest').trim();
    var btn = $('#lightBtn'); btn.disabled = true;
    var body = new URLSearchParams(new FormData(form)).toString();
    var done = function () {
      lantern(true, name + ': ' + text);
      wishline.textContent = name + ': “' + text + '”';
      toast('Your dua has been lit. JazakAllahu khairan!');
      form.reset(); count.textContent = '0'; btn.disabled = false;
    };
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(done, done);
  });

  /* ---------- say ameen ---------- */
  $('#ameen').addEventListener('click', function (e) {
    var r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2);
    e.currentTarget.textContent = 'Ameen, ya Rabb';
    toast('Ameen. May Allah accept your dua.');
  });

  /* ---------- share ---------- */
  $('#shareBtn').addEventListener('click', function () {
    var data = {
      title: 'Nikkah invitation · Jansiya N & Shajid Shahan P.K',
      text: 'You are warmly invited to the Nikkah on ' + dn + ' ' + mo + ' ' + yr + ', in sha Allah.',
      url: location.href
    };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else { window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + data.url), '_blank', 'noopener'); }
  });
})();
