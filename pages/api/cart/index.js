// API Route: Get cart contents
export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get cart from cookies
    const cartCookie = req.cookies.cart || '[]';
    let cart = [];

    try {
        cart = JSON.parse(cartCookie);
    } catch (e) {
        cart = [];
    }

    return res.status(200).json({ cart });
}
