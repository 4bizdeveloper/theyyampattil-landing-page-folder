<?php
// send-mail.php
// Manual PHPMailer includes (no Composer, no .env)
// Place PHPMailer.php, SMTP.php, Exception.php in phpmailer/ next to this file

// Show errors while debugging (disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

date_default_timezone_set('UTC');

require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo "Method not allowed";
    exit;
}

// Honeypot anti-spam
if (!empty($_POST['hp'])) {
    http_response_code(400);
    echo "Spam detected";
    exit;
}

// Collect and sanitize inputs
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$job     = trim($_POST['job'] ?? '');
$message = trim($_POST['message'] ?? '');
$country = strtoupper(trim($_POST['country'] ?? ''));

// -----------------------------
// Server-side phone normalization (defensive)
// Supports UAE (AE) and Saudi (SA) rules and preserves international + format.
// Falls back to digits-only for other countries.
// -----------------------------
function normalize_phone($raw, $countryHint = '') {
    $s = trim((string)$raw);
    if ($s === '') return '';

    // If starts with +, keep + and strip non-digits after it
    if (strpos($s, '+') === 0) {
        return '+' . preg_replace('/\D+/', '', substr($s, 1));
    }

    // Remove all non-digits
    $digits = preg_replace('/\D+/', '', $s);
    $countryHint = strtoupper(trim((string)$countryHint));

    // UAE rules
    if ($countryHint === 'AE' || preg_match('/^0?5\d{7,}$/', $digits) || preg_match('/^971\d{6,}$/', $digits)) {
        if (preg_match('/^971\d+$/', $digits)) {
            return '+' . $digits;
        }
        $digits = preg_replace('/^0/', '', $digits);
        return '+971' . $digits;
    }

    // Saudi Arabia rules
    if ($countryHint === 'SA' || preg_match('/^0?5\d{7,}$/', $digits) || preg_match('/^966\d{6,}$/', $digits)) {
        if (preg_match('/^966\d+$/', $digits)) {
            return '+' . $digits;
        }
        $digits = preg_replace('/^0/', '', $digits);
        return '+966' . $digits;
    }

    // If digits already start with a known country code (e.g., 1, 44, 91, etc.), you may want to add +.
    // Simple heuristic: if digits length > 7 and starts with common country code lengths (1-3 digits), keep digits.
    // Do not auto-guess for ambiguous local numbers; return digits-only.
    return $digits;
}

// Normalize phone using optional country hint (hidden field)
$phone = normalize_phone($phone, $country);

// Basic validation (use normalized phone)
if (!$name || !$email || !$phone || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo "Please provide name, valid email and phone.";
    exit;
}

// Destination and subject
$toEmail = '4bizdeveloper@gmail.com';
$subject = "New Quote Request from Theyyam Pattil GCC Landing page ✅: " . $name;

// Plain text body (clear line breaks)
$bodyPlain  = "You have received a new quote request from your website Theyyampattil GCC landing page:\n\n";
$bodyPlain .= "Name: $name\n";
$bodyPlain .= "Email: $email\n";
$bodyPlain .= "Phone: $phone\n";
if ($country) {
    $bodyPlain .= "Country: $country\n";
}
$bodyPlain .= "\nMessage:\n$message\n";

// HTML body for nicer formatting in mail clients
$bodyHtml = "
<!doctype html>
<html>
  <head>
    <meta charset='utf-8'>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #111; }
      .container { padding: 12px; }
      .meta { margin-bottom: 12px; }
      .meta strong { display:inline-block; width:90px; }
      .message { white-space: pre-wrap; border-top:1px solid #eee; padding-top:10px; margin-top:10px; }
      a { color: #1a73e8; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class='container'>
      <h2>New Quote Request</h2>
      <p>Source: <strong>Theyyampattil GCC landing page</strong></p>
      <div class='meta'>
        <p><strong>Name:</strong> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</p>
        <p><strong>Email:</strong> <a href='mailto:" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</a></p>
        <p><strong>Phone:</strong> " . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</p>" .
        ($country ? "<p><strong>Country:</strong> " . htmlspecialchars($country, ENT_QUOTES, 'UTF-8') . "</p>" : "") . "
        <p><strong>Job title:</strong> " . htmlspecialchars($job, ENT_QUOTES, 'UTF-8') . "</p>
      </div>
      <div class='message'>
        <strong>Message:</strong>
        <div>" . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</div>
      </div>
    </div>
  </body>
</html>
";

// -----------------------------
// SMTP configuration (preserve credentials)
// -----------------------------
$smtpHost  = 'smtp.gmail.com';
$smtpPort  = 465;            // 465 for SMTPS, 587 for STARTTLS
$smtpSecure = true;          // true = SMTPS (465), false = STARTTLS (587)
$smtpUser  = '4bizdeveloper@gmail.com';
$smtpPass  = 'ruln cyfp riyf zibz'; // preserved as requested
$fromEmail = '4bizdeveloper@gmail.com'; // using Gmail account as From
$fromName  = 'Website';

// Basic credential check
if (empty($smtpUser) || empty($smtpPass)) {
    error_log('Mail configuration error: SMTP_USER or SMTP_PASS not set in send-mail.php');
    http_response_code(500);
    echo "Mail configuration error";
    exit;
}

try {
    // create PHPMailer instance
    $mail = new PHPMailer(true);

    // Debug: set to 0 in production. 2 for verbose (writes to error_log)
    $mail->SMTPDebug = 0;
    $mail->Debugoutput = 'error_log';

    // Configure SMTP
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->SMTPSecure = $smtpSecure ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int)$smtpPort;
    $mail->CharSet    = 'UTF-8';

    // Optional: allow self-signed certs if your environment requires it
    // $mail->SMTPOptions = [
    //     'ssl' => [
    //         'verify_peer' => false,
    //         'verify_peer_name' => false,
    //         'allow_self_signed' => true
    //     ]
    // ];

    // Message
    $mail->setFrom($fromEmail, $fromName);
    $mail->addAddress($toEmail);
    $mail->addReplyTo($email, $name);

    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body    = $bodyHtml;
    $mail->AltBody = $bodyPlain;

    $mail->send();

    // Redirect to thank-you page
    header("Location: /thank-you.html");
    exit;
} catch (Exception $e) {
    // Log the error for debugging
    error_log('PHPMailer Exception: ' . $e->getMessage());

    // Fallback to PHP mail()
    $headers  = "From: $fromEmail\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (mail($toEmail, $subject, $bodyPlain, $headers)) {
        header("Location: /thank-you.html");
        exit;
    }

    http_response_code(500);
    echo "Failed to send message. Try again later.";
    exit;
}
