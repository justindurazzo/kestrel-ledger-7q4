(function () {
  "use strict";
  var KEY_W = "dimsum.welcome.v1", KEY_A = "dimsum.app.v1";
  var force = /(^|[?&])welcome=1(&|$)/.test(location.search);
  var seen = false;
  try { var w = JSON.parse(localStorage.getItem(KEY_W) || "null"); seen = !!(w && w.done); } catch (e) {}

  function loadApp() {
    var s = document.createElement("script");
    s.src = "main.js";
    document.body.appendChild(s);
  }
  if (seen && !force) { loadApp(); return; }

  var ans = { name: "", reason: "", topics: [] };
  var root = document.createElement("div");
  root.id = "welcome";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Welcome to Dim Sum");
  var stage = document.createElement("div");
  stage.className = "wl-stage";
  root.appendChild(stage);
  document.body.appendChild(root);

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function swap(build) {
    stage.classList.add("fade");
    setTimeout(function () {
      stage.textContent = "";
      build();
      stage.scrollTop = 0;
      stage.classList.remove("fade");
    }, 260);
  }
  function foot(nextLabel, onNext, onSkip) {
    var f = el("div", "wl-foot");
    var s = el("button", "wl-skip", "Skip");
    s.type = "button"; s.addEventListener("click", onSkip);
    var n = el("button", "wl-next", nextLabel);
    n.type = "button"; n.addEventListener("click", onNext);
    f.appendChild(s); f.appendChild(n);
    return f;
  }

  var timer;
  function intro() {
    var box = el("div", "wl-intro");
    var logo = el("div", "wl-logo");
    logo.setAttribute("aria-label", "Dim Sum");
    [["d1", "D"], ["d2", "I"], ["d3", "M"]].forEach(function (p) { logo.appendChild(el("span", p[0], p[1])); });
    logo.appendChild(el("span", "dot"));
    [["s1", "S"], ["s2", "U"], ["s3", "M"]].forEach(function (p) { logo.appendChild(el("span", p[0], p[1])); });
    box.appendChild(logo);
    box.appendChild(el("div", "wl-hint", "Tap to begin"));
    var go = function () { clearTimeout(timer); box.onclick = null; step1(); };
    box.onclick = go;
    stage.appendChild(box);
    timer = setTimeout(go, 3200);
  }

  function step1() {
    swap(function () {
      var st = el("div", "wl-step");
      st.appendChild(el("p", "wl-count", "1 of 3"));
      var h = el("h1", "wl-line");
      h.appendChild(el("span", "soft", "My name is"));
      var inp = el("input", "wl-input");
      inp.type = "text"; inp.maxLength = 40; inp.placeholder = "your name";
      inp.setAttribute("autocomplete", "given-name");
      inp.setAttribute("autocapitalize", "words");
      inp.setAttribute("enterkeyhint", "next");
      inp.setAttribute("aria-label", "Your name");
      inp.value = ans.name;
      h.appendChild(inp);
      st.appendChild(h);
      var next = function () { ans.name = inp.value.trim(); step2(); };
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); next(); } });
      stage.appendChild(st);
      stage.appendChild(foot("Next", next, function () { ans.name = ""; step2(); }));
    });
  }

  var reasons = ["learn something new", "scroll better", "find something to watch", "just curious"];
  function step2() {
    swap(function () {
      var st = el("div", "wl-step");
      st.appendChild(el("p", "wl-count", "2 of 3"));
      var h = el("h1", "wl-line");
      h.appendChild(el("span", "soft", ans.name ? "I'm " + ans.name + ", and I'm here to" : "I'm here to"));
      st.appendChild(h);
      var chips = el("div", "wl-chips");
      reasons.forEach(function (r) {
        var b = el("button", "wl-chip", r);
        b.type = "button";
        b.setAttribute("aria-pressed", String(ans.reason === r));
        b.addEventListener("click", function () {
          ans.reason = ans.reason === r ? "" : r;
          [].forEach.call(chips.children, function (c) { c.setAttribute("aria-pressed", String(c.textContent === ans.reason)); });
        });
        chips.appendChild(b);
      });
      st.appendChild(chips);
      stage.appendChild(st);
      stage.appendChild(foot("Next", step3, function () { ans.reason = ""; step3(); }));
    });
  }

  var groups = ["Arts", "Sciences", "Civics"];
  function step3() {
    swap(function () {
      var st = el("div", "wl-step");
      st.appendChild(el("p", "wl-count", "3 of 3"));
      var h = el("h1", "wl-line");
      h.appendChild(el("span", "soft", "I'd like to start with"));
      st.appendChild(h);
      var chips = el("div", "wl-chips");
      groups.forEach(function (g) {
        var b = el("button", "wl-chip", g);
        b.type = "button";
        b.setAttribute("aria-pressed", String(ans.topics.indexOf(g) >= 0));
        b.addEventListener("click", function () {
          var i = ans.topics.indexOf(g);
          if (i >= 0) ans.topics.splice(i, 1); else ans.topics.push(g);
          b.setAttribute("aria-pressed", String(i < 0));
        });
        chips.appendChild(b);
      });
      st.appendChild(chips);
      stage.appendChild(st);
      stage.appendChild(foot("Start", finish, function () { ans.topics = []; finish(); }));
    });
  }

  var map = { Arts: ["Music", "Painting"], Sciences: ["Physics", "Mathematics", "Space"], Civics: ["Politics", "History"] };
  function finish() {
    try {
      localStorage.setItem(KEY_W, JSON.stringify({ done: true, name: ans.name, reason: ans.reason, topics: ans.topics, at: new Date().toISOString() }));
    } catch (e) {}
    var interests = [];
    ans.topics.forEach(function (g) { interests = interests.concat(map[g]); });
    if (!interests.length) interests = ["Physics", "Mathematics", "Space", "Music", "Painting", "Politics"];
    try {
      var cur = JSON.parse(localStorage.getItem(KEY_A) || "null") || {};
      cur.onboarded = true; cur.interests = interests; cur.tab = "feed";
      localStorage.setItem(KEY_A, JSON.stringify(cur));
    } catch (e) {}
    loadApp();
    root.classList.add("out");
    setTimeout(function () { root.remove(); }, 450);
  }

  intro();
})();
