<?php
/**
 * IT CONSULTING SARL — form receiver for PHP hosting (cPanel, shared Apache/Nginx+PHP).
 * Receives JSON (or classic form POST) from the contact and quote forms and sends one e-mail.
 *
 * Configuration (environment variables, or edit the defaults below on a private server):
 *   ITC_MAIL_TO   recipient address                  (default: contact@itconsultinggroup.net)
 *   ITC_MAIL_FROM sender address on YOUR domain      (default: no-reply@itconsultinggroup.net)
 * The sender address must belong to a domain configured on the host, otherwise many providers reject the mail.
 * No credentials are stored here; this uses PHP's mail() through the host's mail system.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function out(int $code, array $body): void { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { header('Allow: POST'); out(405, ['ok' => false, 'error' => 'method_not_allowed']); }

$raw = file_get_contents('php://input', false, null, 0, 65536);
$ct  = $_SERVER['CONTENT_TYPE'] ?? '';
$in  = (stripos($ct, 'application/json') !== false) ? json_decode((string)$raw, true) : $_POST;
if (!is_array($in)) out(400, ['ok' => false, 'error' => 'bad_request']);

if (!empty($in['website'])) out(200, ['ok' => true]);                       // honeypot: pretend success to bots

function clean($v, int $max): string {                                       // strip control chars (blocks header injection), trim, cap length
    $v = is_array($v) ? implode(', ', array_map('strval', $v)) : (string)$v;
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}
$name = clean($in['name'] ?? '', 120);  $email = clean($in['email'] ?? '', 160);   $msg = clean($in['message'] ?? '', 5000);
$loc  = clean($in['location'] ?? '', 160);
if (mb_strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($msg) < 20 || $loc === '') out(422, ['ok' => false, 'error' => 'validation']);
if (preg_match('/[\r\n]/', $name . $email)) out(422, ['ok' => false, 'error' => 'validation']);

$kind = (($in['form'] ?? '') === 'quote') ? 'Demande de devis' : 'Message via le site';
$fields = ['Nom' => $name, 'E-mail' => $email, 'Téléphone' => clean($in['phone'] ?? '', 40), 'Société' => clean($in['company'] ?? '', 160),
           'Pays / lieu du projet' => $loc, 'Service demandé' => clean($in['service'] ?? '', 80), 'Services concernés' => clean($in['services'] ?? '', 300),
           'Type de site' => clean($in['scale'] ?? '', 60), 'Délai souhaité' => clean($in['timeline'] ?? '', 60), 'Page' => clean($in['page'] ?? '', 160)];
$body = '';
foreach ($fields as $k => $v) if ($v !== '') $body .= "$k : $v\n";
$body .= "\nMessage :\n$msg\n";

$to   = getenv('ITC_MAIL_TO')   ?: 'contact@itconsultinggroup.net';
$from = getenv('ITC_MAIL_FROM') ?: 'no-reply@itconsultinggroup.net';
$subject = '=?UTF-8?B?' . base64_encode("$kind — $name") . '?=';
$headers = ["From: IT CONSULTING site <$from>", "Reply-To: $name <$email>", 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'X-Mailer: itc-site-form'];

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));
if (!$sent) { error_log('itc contact.php: mail() failed'); out(502, ['ok' => false, 'error' => 'send_failed']); }
out(200, ['ok' => true]);
