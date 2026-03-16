/**
 * api/check-payment.ts
 *
 * Verifica o status de um pagamento no Mercado Pago.
 * Usado pelo polling do CheckoutModal.
 *
 * GET /api/check-payment?payment_id=123456
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { payment_id } = req.query;
  if (!payment_id) return res.status(400).json({ error: "Missing payment_id" });

  try {
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${payment_id}`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
    );

    const payment = await mpRes.json() as {
      id: number;
      status: string;
      status_detail: string;
      external_reference: string;
    };

    return res.status(200).json({
      status: payment.status,
      status_detail: payment.status_detail,
      uid: payment.external_reference,
    });
  } catch (err) {
    console.error("check-payment error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
