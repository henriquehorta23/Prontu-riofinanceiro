import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const codigo = url.searchParams.get("code");

  if (!codigo) {
    return new Response("Código não informado", { status: 400 });
  }

  const store = getStore("acessos");
  const registro = await store.get(codigo, { type: "json" });

  if (!registro) {
    return new Response("Código inválido", { status: 403 });
  }

  if (new Date(registro.expiraEm) < new Date()) {
    return new Response("Código expirado", { status: 403 });
  }

  if (registro.usos >= registro.maxUsos) {
    return new Response("Limite de acessos atingido", { status: 403 });
  }

  // Atualiza contagem de uso
  registro.usos += 1;
  registro.usado = true;
  await store.setJSON(codigo, registro);

  // Opção A: redireciona para uma URL assinada/temporária do conteúdo real
  // Opção B: seta um cookie de sessão de curta duração e redireciona para a página protegida
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": `acesso_${registro.produto}=valido; Path=/; Max-Age=3600; HttpOnly; Secure`,
      Location: `/conteudo/${registro.produto}`,
    },
  });
};
