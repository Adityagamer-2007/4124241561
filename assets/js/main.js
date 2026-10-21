(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CFG = window.ITC_CONFIG || {};
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }

  /* ---------- navigation ---------- */
  var header = $(".site-header"), toggle = $(".menu-toggle"), nav = $("#site-nav");
  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    doc.body.style.overflow = open && window.innerWidth <= 1060 ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(!header.classList.contains("nav-open")); });
  $$(".has-sub > button").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = b.parentNode, open = !li.classList.contains("open");
      $$(".has-sub.open").forEach(function (o) { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); });
      li.classList.toggle("open", open); b.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  doc.addEventListener("click", function (e) {
    if (!e.target.closest(".has-sub")) $$(".has-sub.open").forEach(function (o) { o.classList.remove("open"); $("button", o).setAttribute("aria-expanded", "false"); });
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    $$(".has-sub.open").forEach(function (o) { o.classList.remove("open"); var b = $("button", o); b.setAttribute("aria-expanded", "false"); b.focus(); });
    if (header && header.classList.contains("nav-open")) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 1060) setMenu(false); });

  /* ---------- scroll reveals ---------- */
  var revs = $$(".rv, .rv-img");
  if ("IntersectionObserver" in window && !reduce) {
    var mk = function (th) { var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); } });
    }, { threshold: th, rootMargin: "0px 0px -6% 0px" }); return o; };
    var ioText = mk(.12), ioImg = mk(0); /* clip-path'd elements need threshold 0 */
    revs.forEach(function (el) { (el.classList.contains("rv-img") ? ioImg : ioText).observe(el); });
  } else revs.forEach(function (el) { el.classList.add("in"); });

  /* ---------- 3D pointer tilt (mouse only) ---------- */
  if (!reduce) {
    $$(".stage").forEach(function (st) {
      var inner = $(".stage-inner", st);
      st.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse" || e.buttons) return;
        var r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        inner.style.setProperty("--ry", (x * 12).toFixed(2) + "deg"); inner.style.setProperty("--rx", (-y * 9).toFixed(2) + "deg");
      });
      st.addEventListener("pointerleave", function () { inner.style.setProperty("--ry", "0deg"); inner.style.setProperty("--rx", "0deg"); });
    });
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty("--try", (x * 6).toFixed(2) + "deg"); el.style.setProperty("--trx", (-y * 5).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--try", "0deg"); el.style.setProperty("--trx", "0deg"); });
    });
    /* depth parallax */
    var deps = $$(".depth"), tick = false;
    var upd = function () {
      tick = false; var vh = window.innerHeight;
      deps.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var c = (r.top + r.height / 2 - vh / 2) / vh, s = parseFloat(el.getAttribute("data-speed") || "40");
        el.style.setProperty("--py", (c * s * -1).toFixed(1) + "px");
      });
    };
    if (deps.length) { window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd(); }
    /* page exit transition */
    doc.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute("download")) return;
      var u; try { u = new URL(a.href, location.href); } catch (_) { return; }
      if (u.origin !== location.origin || u.pathname === location.pathname || /^(mailto|tel):/.test(a.getAttribute("href"))) return;
      e.preventDefault(); doc.body.classList.add("leaving"); setTimeout(function () { location.href = a.href; }, 220);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) doc.body.classList.remove("leaving"); });
  }

  /* ---------- forms ---------- */
  var MSG = {
    required: "Ce champ est obligatoire.",
    email: "Saisissez une adresse e-mail valide (exemple : nom@societe.com).",
    tel: "Saisissez un numéro valide, avec l’indicatif pays si possible (exemple : +243 …).",
    min: function (n) { return "Merci de détailler un peu plus (au moins " + n + " caractères)."; },
    group: "Sélectionnez au moins une option."
  };
  function check(field) {
    var el = $("input,select,textarea", field), err = $(".err", field), rules = (field.getAttribute("data-v") || "").split(" ").filter(Boolean), val, m = "";
    if (field.hasAttribute("data-group")) {
      var any = $$("input:checked", field).length > 0; m = rules.indexOf("required") > -1 && !any ? MSG.group : "";
      if (err) err.textContent = m; $$("input", field).forEach(function (i) { i.setAttribute("aria-invalid", m ? "true" : "false"); }); return !m;
    }
    val = (el.value || "").trim();
    rules.forEach(function (r) {
      if (m) return;
      if (r === "required" && !val) m = MSG.required;
      else if (val && r === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) m = MSG.email;
      else if (val && r === "tel" && !/^\+?[\d\s().-]{7,20}$/.test(val)) m = MSG.tel;
      else if (val && r.indexOf("min:") === 0 && val.length < +r.slice(4)) m = MSG.min(+r.slice(4));
    });
    if (err) err.textContent = m; el.setAttribute("aria-invalid", m ? "true" : "false");
    return !m;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function collect(form) {
    var d = {}; $$("[name]", form).forEach(function (i) {
      if (i.type === "checkbox") { if (i.checked) (d[i.name] = d[i.name] || []).push(i.value); }
      else if (i.type !== "submit") d[i.name] = i.value.trim();
    }); return d;
  }
  function toText(d, kind) {
    var L = [["Nom", d.name], ["E-mail", d.email], ["Téléphone", d.phone], ["Société", d.company], ["Pays / lieu du projet", d.location],
      ["Service demandé", d.service], ["Services concernés", d.services && d.services.join(", ")], ["Type de site / ampleur", d.scale], ["Délai souhaité", d.timeline], ["Message", d.message]];
    return L.filter(function (x) { return x[1]; }).map(function (x) { return x[0] + " : " + x[1]; }).join("\n");
  }
  $$("form[data-form]").forEach(function (form) {
    var status = $(".form-status", form), btn = $("button[type=submit]", form), kind = form.getAttribute("data-form");
    function show(cls, html) { status.className = "form-status show " + cls; status.innerHTML = html; status.setAttribute("tabindex", "-1"); status.focus({ preventScroll: false }); }
    $$(".field", form).forEach(function (f) {
      $$("input,select,textarea", f).forEach(function (i) {
        i.addEventListener("blur", function () { if (f.getAttribute("data-touched") || i.value) check(f); f.setAttribute("data-touched", "1"); });
        i.addEventListener("input", function () { if (i.getAttribute("aria-invalid") === "true") check(f); });
        i.addEventListener("change", function () { if (f.hasAttribute("data-group")) check(f); });
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = $$(".field", form).filter(function (f) { return !check(f); });
      if (bad.length) {
        show("bad", "<h3>Le formulaire contient " + bad.length + " champ" + (bad.length > 1 ? "s" : "") + " à corriger</h3><p>Vérifiez les messages indiqués sous les champs concernés.</p>");
        var first = $("input,select,textarea", bad[0]); setTimeout(function () { first && first.focus(); }, 30); return;
      }
      var d = collect(form);
      if (d.website) { show("ok", "<h3>Merci</h3><p>Votre demande a été enregistrée.</p>"); form.reset(); return; } // honeypot
      d.form = kind; d.page = location.pathname;
      var subject = (kind === "quote" ? "Demande de devis" : "Message via le site") + " — " + (d.name || "");
      if (!CFG.formEndpoint) {
        var body = toText(d, kind), mailto = "mailto:" + (CFG.mailTo || "contact@itconsultinggroup.net") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        show("info", "<h3>Votre message n’a pas encore été envoyé</h3><p>L’envoi automatique n’est pas activé sur cette installation du site (aucun serveur de réception n’est configuré). Vos informations sont complètes : envoyez-les en un clic depuis votre messagerie, ou copiez le texte.</p><div class=\"actions\"><a class=\"btn btn--sm\" href=\"" + esc(mailto) + "\">Ouvrir ma messagerie</a><button type=\"button\" class=\"btn btn--ghost btn--sm\" data-copy>Copier le message</button></div>");
        var cp = $("[data-copy]", status);
        cp.addEventListener("click", function () {
          var done = function () { cp.textContent = "Message copié"; };
          if (navigator.clipboard) navigator.clipboard.writeText(body).then(done, function () { fallbackCopy(body); done(); }); else { fallbackCopy(body); done(); }
        });
        return;
      }
      btn.disabled = true; form.classList.add("is-loading"); btn.setAttribute("aria-busy", "true");
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { ctl && ctl.abort(); }, 20000);
      fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.ok === false) throw new Error(j.error || ("HTTP " + r.status)); return j; }); })
        .then(function () { show("ok", "<h3>Merci, votre demande a bien été transmise</h3><p>Notre équipe reviendra vers vous à l’adresse e-mail indiquée.</p>"); form.reset(); $$(".field", form).forEach(function (f) { f.removeAttribute("data-touched"); }); })
        .catch(function () { show("bad", "<h3>L’envoi a échoué</h3><p>Votre message n’a pas été transmis. Réessayez dans quelques instants, ou écrivez-nous directement à <a href=\"mailto:" + esc(CFG.mailTo || "contact@itconsultinggroup.net") + "\">" + esc(CFG.mailTo || "contact@itconsultinggroup.net") + "</a>.</p>"); })
        .then(function () { clearTimeout(to); btn.disabled = false; btn.removeAttribute("aria-busy"); form.classList.remove("is-loading"); });
    });
  });
  function fallbackCopy(t) { var a = doc.createElement("textarea"); a.value = t; a.style.position = "fixed"; a.style.opacity = "0"; doc.body.appendChild(a); a.select(); try { doc.execCommand("copy"); } catch (_) {} doc.body.removeChild(a); }

  /* prefill requested service from ?service= */
  var qs = new URLSearchParams(location.search).get("service");
  if (qs) { var sel = $("select[name=service]"); if (sel) { $$("option", sel).forEach(function (o) { if (o.value === qs) sel.value = qs; }); } var cb = $("input[name=services][value=\"" + qs.replace(/"/g, "") + "\"]"); if (cb) cb.checked = true; }
})();
