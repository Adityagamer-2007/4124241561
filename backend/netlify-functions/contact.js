/* IT CONSULTING SARL — form receiver for Netlify Functions (also adaptable to Vercel/Cloudflare).
   Sends the e-mail through the Resend HTTP API. Secrets are read from environment variables ONLY:
     RESEND_API_KEY  (required)   ITC_MAIL_TO (default contact@itconsultinggroup.net)   ITC_MAIL_FROM (a sender verified in Resend)
   Set endpoint in assets/js/config.js:  formEndpoint: "/.netlify/functions/contact"  */
"use strict";
const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, body: JSON.stringify(body) });
const clean = (v, max) => String(Array.isArray(v) ? v.join(", ") : (v == null ? "" : v)).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
const line = (v, max) => clean(v, max).replace(/[\r\n\t]+/g, " ");
const escHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "method_not_allowed" });
  let d; try { d = JSON.parse(event.body || "{}"); } catch (_) { return json(400, { ok: false, error: "bad_request" }); }
  if (d.website) return json(200, { ok: true }); // honeypot
  const name = line(d.name, 120), email = line(d.email, 160), message = clean(d.message, 5000), location = line(d.location, 160);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 20 || !location) return json(422, { ok: false, error: "validation" });
  const key = process.env.RESEND_API_KEY;
  if (!key) return json(500, { ok: false, error: "not_configured" });
  const kind = d.form === "quote" ? "Demande de devis" : "Message via le site";
  const rows = [["Nom", name], ["E-mail", email], ["Téléphone", line(d.phone, 40)], ["Société", line(d.company, 160)], ["Pays / lieu du projet", location],
    ["Service demandé", line(d.service, 80)], ["Services concernés", line(d.services, 300)], ["Type de site", line(d.scale, 60)], ["Délai souhaité", line(d.timeline, 60)], ["Page", line(d.page, 160)]].filter((r) => r[1]);
  const text = rows.map((r) => `${r[0]} : ${r[1]}`).join("\n") + `\n\nMessage :\n${message}\n`;
  const html = "<table>" + rows.map((r) => `<tr><td><b>${escHtml(r[0])}</b></td><td>${escHtml(r[1])}</td></tr>`).join("") + `</table><p style="white-space:pre-wrap">${escHtml(message)}</p>`;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.ITC_MAIL_FROM || "IT CONSULTING site <no-reply@itconsultinggroup.net>", to: [process.env.ITC_MAIL_TO || "contact@itconsultinggroup.net"], reply_to: email, subject: `${kind} — ${name}`, text, html }) });
    if (!r.ok) return json(502, { ok: false, error: "send_failed" });
    return json(200, { ok: true });
  } catch (_) { return json(502, { ok: false, error: "send_failed" }); }
};
