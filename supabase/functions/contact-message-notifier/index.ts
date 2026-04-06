// Supabase Edge Function: contact-message-notifier
//
// Triggered by a database webhook when a row is INSERTed into
// `public.contact_messages`. It validates the submitter's email and, if it
// looks legit, sends a notification email via the Brevo Transactional API to
// the portfolio owner.
//
// Required environment secrets (set via supabase functions secrets set):
//   BREVO_API_KEY      — Brevo v3 API key (xkeysib-...)
//   BREVO_SENDER_EMAIL — A *verified* sender in your Brevo account
//   BREVO_SENDER_NAME  — Display name shown in the From header
//   RECIPIENT_EMAIL    — Where notifications get delivered (esfanmerchant@gmail.com)
//   WEBHOOK_SECRET     — Shared secret; the DB trigger sends this in X-Webhook-Secret

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

interface SupabaseWebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: ContactMessageRow | null;
  old_record: ContactMessageRow | null;
}

// Common disposable / throwaway email domains. Not exhaustive but catches the
// loud spammers. Anything else falls through to MX validation.
const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "trashmail.com",
  "yopmail.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "getnada.com",
  "maildrop.cc",
  "sharklasers.com",
  "dispostable.com",
]);

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

async function validateEmail(
  email: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!email || email.length > 254) {
    return { ok: false, reason: "Email empty or too long" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, reason: "Email format invalid" };
  }

  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: "Disposable email domain" };
  }

  // MX record lookup. If the domain has no MX record, it cannot receive
  // mail and is almost certainly fake. Deno's built-in DNS resolver works
  // inside Edge Functions.
  try {
    const mx = await Deno.resolveDns(domain, "MX");
    if (!mx || mx.length === 0) {
      return { ok: false, reason: "Domain has no MX record" };
    }
  } catch (err) {
    return {
      ok: false,
      reason: `MX lookup failed: ${(err as Error).message}`,
    };
  }

  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(row: ContactMessageRow): string {
  const safeName = escapeHtml(row.name);
  const safeEmail = escapeHtml(row.email);
  const safeMessage = escapeHtml(row.message).replace(/\n/g, "<br/>");
  const ua = row.user_agent ? escapeHtml(row.user_agent) : "—";
  const ref = row.referrer ? escapeHtml(row.referrer) : "—";

  return `
<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0e17;color:#eae5ec;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:24px auto;padding:28px;background:#111827;border:1px solid rgba(94,234,212,0.2);border-radius:14px;">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#5eead4;text-transform:uppercase;">New portfolio contact</p>
    <h2 style="margin:0 0 18px;font-size:22px;font-weight:600;color:#fff;">${safeName}</h2>
    <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">From</p>
    <p style="margin:0 0 14px;"><a href="mailto:${safeEmail}" style="color:#5eead4;text-decoration:none;">${safeEmail}</a></p>
    <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Message</p>
    <div style="margin:0 0 18px;padding:14px 16px;background:#0a0e17;border:1px solid rgba(255,255,255,0.06);border-radius:8px;font-size:14px;line-height:1.55;color:#eae5ec;white-space:pre-wrap;">${safeMessage}</div>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:18px 0;" />
    <p style="margin:0 0 4px;font-size:11px;color:#6b7280;">Submitted at</p>
    <p style="margin:0 0 10px;font-size:12px;color:#9ca3af;">${escapeHtml(row.created_at)}</p>
    <p style="margin:0 0 4px;font-size:11px;color:#6b7280;">Referrer</p>
    <p style="margin:0 0 10px;font-size:12px;color:#9ca3af;">${ref}</p>
    <p style="margin:0 0 4px;font-size:11px;color:#6b7280;">User agent</p>
    <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.5;">${ua}</p>
  </div>
  <p style="text-align:center;font-size:11px;color:#4b5563;margin:0 0 24px;">esfanmerchant.dev — automated notification</p>
</body></html>`.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Shared-secret auth: protects the function from being invoked by anyone
  // other than our own database trigger.
  const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
  const providedSecret = req.headers.get("x-webhook-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let payload: SupabaseWebhookPayload;
  try {
    payload = (await req.json()) as SupabaseWebhookPayload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (payload.type !== "INSERT" || !payload.record) {
    return new Response(
      JSON.stringify({ skipped: true, reason: "not an insert" }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  const row = payload.record;

  // Validate email
  const validation = await validateEmail(row.email);
  if (!validation.ok) {
    console.warn(
      `[contact-notifier] dropped message ${row.id} — ${validation.reason}`
    );
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: validation.reason,
        message_id: row.id,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  // Read Brevo config
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") ?? "Esfan Portfolio";
  const recipient = Deno.env.get("RECIPIENT_EMAIL");

  if (!brevoKey || !senderEmail || !recipient) {
    console.error(
      "[contact-notifier] Missing required env vars (BREVO_API_KEY, BREVO_SENDER_EMAIL, RECIPIENT_EMAIL)"
    );
    return new Response(
      JSON.stringify({ error: "function not configured" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // Send via Brevo Transactional Email API
  const brevoBody = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: recipient }],
    replyTo: { email: row.email, name: row.name },
    subject: `New portfolio contact from ${row.name}`,
    htmlContent: buildEmailHtml(row),
  };

  const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "api-key": brevoKey,
    },
    body: JSON.stringify(brevoBody),
  });

  if (!brevoRes.ok) {
    const errText = await brevoRes.text();
    console.error(
      `[contact-notifier] Brevo send failed (${brevoRes.status}): ${errText}`
    );
    return new Response(
      JSON.stringify({
        error: "brevo send failed",
        status: brevoRes.status,
        details: errText,
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const brevoData = (await brevoRes.json()) as { messageId?: string };
  console.log(
    `[contact-notifier] Notification sent for ${row.id} (brevo id: ${brevoData.messageId})`
  );

  return new Response(
    JSON.stringify({
      ok: true,
      message_id: row.id,
      brevo_message_id: brevoData.messageId ?? null,
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
});
