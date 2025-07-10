// test deploy file
export default async function handler(req, res) {
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

