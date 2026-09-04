import { getStore } from "@netlify/blobs";
import crypto from "crypto";

export default async (req) => {
  // Aqui você valida a assinatura do webhook do seu gateway de pagamento
  // (ex.: Stripe: verificação com stripe.webhooks.constructEvent)
  const { email, produto } = await req.json();

  const store = getStore("acessos");
  const codigo = crypto.randomBytes(4).toString("hex"); // ex: "a1b2c3d4"

  const registro = {
    email,
    produto,
    usado: false,
    criadoEm: new Date().toISOString(),
    expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 dias
    maxUsos: 3, // permite reacessar algumas vezes, não só 1
    usos: 0,
  };

  await store.setJSON(codigo, registro);

  // Envie o e-mail aqui (Resend, SendGrid, Postmark, etc.)
  // com o link: https://seusite.com/acesso?code=${codigo}

  return new Response(JSON.stringify({ ok: true, codigo }), { status: 200 });
};
