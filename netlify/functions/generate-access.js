import { getStore } from "@netlify/blobs";
import crypto from "crypto";

export default async (req) => {
  // 1. Valida que a chamada veio mesmo da Hotmart
  const hottokRecebido = req.headers.get("x-hotmart-hottok");
  if (hottokRecebido !== process.env.HOTMART_HOTTOK) {
    return new Response("Não autorizado", { status: 401 });
  }

  const payload = await req.json();

  // 2. Só processa se for compra aprovada
  if (payload.event !== "PURCHASE_APPROVED") {
    return new Response("Ignorado", { status: 200 });
  }

  const email = payload.data.buyer.email;
  const produto = payload.data.product.name;

  const store = getStore("acessos");
  const codigo = crypto.randomBytes(4).toString("hex");

  await store.setJSON(codigo, {
    email,
    produto,
    usado: false,
    criadoEm: new Date().toISOString(),
    expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    maxUsos: 3,
    usos: 0,
  });

  // 3. Envia o e-mail com o link de acesso (ver seção de e-mail transacional)

  return new Response("OK", { status: 200 });
};
