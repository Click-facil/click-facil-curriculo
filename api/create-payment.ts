/**
 * api/create-payment.ts
 *
 * Cria um pagamento no Mercado Pago (PIX ou cartão).
 * Variáveis de ambiente necessárias:
 *   MP_ACCESS_TOKEN  — seu Access Token (APP_USR-...)
 *   MP_NOTIFICATION_URL — https://click-facil-curriculo.vercel.app/api/confirm-payment
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const MP_BASE = "https://api.mercadopago.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { method, uid, email, token, issuer_id, installments, payment_method_id } = req.body as {
    method: "pix" | "card";
    uid: string;
    email: string;
    // card only
    token?: string;
    issuer_id?: string;
    installments?: number;
    payment_method_id?: string;
  };

  if (!uid || !email || !method) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const body: Record<string, unknown> = {
      transaction_amount: 9.9,
      description: "Templates Premium — Click Fácil",
      external_reference: uid, // usado pelo webhook para identificar o usuário
      metadata: { uid },
      payer: { email },
      notification_url: process.env.MP_NOTIFICATION_URL,
    };

    if (method === "pix") {
      body.payment_method_id = "pix";
    } else {
      // cartão
      if (!token || !payment_method_id) {
        return res.status(400).json({ error: "Missing card token" });
      }
      body.token = token;
      body.payment_method_id = payment_method_id;
      body.issuer_id = issuer_id;
      body.installments = installments || 1;
    }

    const mpRes = await fetch(`${MP_BASE}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${uid}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const payment = await mpRes.json() as {
      id: number;
      status: string;
      status_detail: string;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
        };
      };
    };

    if (!mpRes.ok) {
      console.error("MP error:", payment);
      return res.status(400).json({ error: "Erro ao criar pagamento", detail: payment });
    }

    // Para PIX, devolve o QR code
    if (method === "pix") {
      return res.status(200).json({
        payment_id: payment.id,
        status: payment.status,
        qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      });
    }

    // Para cartão, devolve o status direto
    return res.status(200).json({
      payment_id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
    });
  } catch (err) {
    console.error("create-payment error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
