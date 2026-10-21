/* Site configuration — edit this file after deployment.
   formEndpoint: URL that receives the contact/quote forms as JSON (POST).
     - Leave "" to keep the safe fallback (the form validates, then offers a pre-filled e-mail; nothing is sent automatically).
     - Examples: "backend/contact.php" (PHP hosting) or "/.netlify/functions/contact" (Netlify) — see README.md.
   mailTo: address used by the fallback and in error messages. */
window.ITC_CONFIG = {
  formEndpoint: "",
  mailTo: "contact@itconsultinggroup.net"
};
