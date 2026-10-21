/* Offline test of the Netlify handler: validation, honeypot, success and failure paths (fetch is mocked). Run: npm run test:function */
const assert = require("assert"); const { handler } = require("./contact.js");
const ev = (b, m = "POST") => ({ httpMethod: m, body: typeof b === "string" ? b : JSON.stringify(b) });
const good = { name: "Jean Test", email: "jean@exemple.com", message: "Nous souhaitons installer huit caméras.", location: "Goma", form: "quote", services: ["securite-electronique"] };
(async () => {
  assert.strictEqual((await handler(ev({}, "GET"))).statusCode, 405);
  assert.strictEqual((await handler(ev("{bad"))).statusCode, 400);
  assert.strictEqual((await handler(ev({ ...good, email: "x" }))).statusCode, 422);
  assert.strictEqual((await handler(ev({ ...good, message: "court" }))).statusCode, 422);
  assert.strictEqual((await handler(ev({ ...good, website: "spam" }))).statusCode, 200);
  delete process.env.RESEND_API_KEY; assert.strictEqual((await handler(ev(good))).statusCode, 500);
  process.env.RESEND_API_KEY = "k"; let sent;
  global.fetch = async (u, o) => { sent = { u, o }; return { ok: true }; };
  assert.strictEqual((await handler(ev(good))).statusCode, 200);
  const p = JSON.parse(sent.o.body); assert.strictEqual(p.reply_to, "jean@exemple.com"); assert.ok(p.subject.includes("Demande de devis")); assert.ok(sent.o.headers.Authorization === "Bearer k");
  global.fetch = async () => ({ ok: false }); assert.strictEqual((await handler(ev(good))).statusCode, 502);
  global.fetch = async () => { throw new Error("net"); }; assert.strictEqual((await handler(ev(good))).statusCode, 502);
  const h = await handler(ev({ ...good, name: "<b>X</b>\r\nBcc: a@b.c" })); global.fetch = async (u, o) => { sent = o; return { ok: true }; }; await handler(ev({ ...good, name: "<b>X</b>\r\nBcc: a@b.c" }));
  assert.ok(!/<b>X/.test(JSON.parse(sent.body).html)); assert.ok(!/[\r\n]/.test(JSON.parse(sent.body).subject));
  console.log("netlify function: all tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
