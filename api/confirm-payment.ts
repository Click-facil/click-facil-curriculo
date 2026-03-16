/**
 * api/confirm-payment.ts
 * Vercel Serverless Function
 *
 * Recebe a notificação de pagamento do Mercado Pago (IPN/Webhook),
 * verifica o status e marca o usuário como premium no Firestore.
 *
 * URL que você cadastra no painel do MP:
 *   https://click-facil-curriculo.vercel.app/api/confirm-payment
 *
 * Variáveis de ambiente necessárias (Vercel Dashboard → Settings → Env Vars):
 *   MP_ACCESS_TOKEN   — seu Access Token do Mercado Pago (começa com APP_USR-)
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY  — chave privada da service account (com \n)
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Firestore REST API — sem precisar do SDK server-side
async function getFirestoreToken(clientEmail: string, privateKey: string): Promise<string> {
  const { SignJWT } = await import("jose");
  const keyPem = privateKey.replace(/\\n/g, "\n");
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyPem);

  // Importa a chave RSA
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    (() => {
      // Converte PEM para ArrayBuffer
      const b64 = keyPem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
      const bin = atob(b64);
      const buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      return buf.buffer;
    })(),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256" })
    .sign(cryptoKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
  });
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function grantPremiumFirestore(uid: string): Promise<void> {
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY!;

  const accessToken = await getFirestoreToken(clientEmail, privateKey);

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
  await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        premium: { booleanValue: true },
        grantedAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // MP envia GET para confirmar a URL
  if (req.method === "GET") {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { type, data: body } = req.body as { type: string; data: { id: string } };

    // Só processa notificações de pagamento
    if (type !== "payment") {
      return res.status(200).json({ ignored: true });
    }

    const paymentId = body?.id;
    if (!paymentId) return res.status(400).json({ error: "Missing payment id" });

    // Consulta o pagamento na API do MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });
    const payment = (await mpRes.json()) as {
      status: string;
      metadata?: { uid?: string };
      external_reference?: string;
    };

    if (payment.status !== "approved") {
      return res.status(200).json({ status: payment.status, action: "none" });
    }

    // O UID do Firebase deve vir no campo metadata.uid OU external_reference
    const uid = payment.metadata?.uid || payment.external_reference;
    if (!uid) {
      console.warn("Pagamento aprovado mas sem UID do usuário:", paymentId);
      return res.status(200).json({ warning: "No uid in payment" });
    }

    await grantPremiumFirestore(uid);
    console.log(`Premium concedido: uid=${uid}, payment=${paymentId}`);
    return res.status(200).json({ ok: true, uid });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
