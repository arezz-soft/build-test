// API Route: Clear cart
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Clear cart by setting empty array
    res.setHeader('Set-Cookie', `cart=[]; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);

    return res.status(200).json({ ok: true });
}
