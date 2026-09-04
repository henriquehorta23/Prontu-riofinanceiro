export default async (request, context) => {
  const cookie = request.headers.get("cookie") || "";

  if (!cookie.includes("acesso_")) {
    return new Response("Acesso negado. Use o link que você recebeu por e-mail.", {
      status: 403,
    });
  }

  return context.next(); // libera o acesso à página
};

export const config = { path: "/conteudo/*" };
