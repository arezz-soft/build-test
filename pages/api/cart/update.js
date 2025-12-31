// API Route: Update item quantity in cart
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, quantity } = req.body || {};

    if (!id) {
        return res.status(400).json({ error: 'Missing id' });
    }

    // Get existing cart from cookies
    const cartCookie = req.cookies.cart || '[]';
    let cart = [];

    try {
        cart = JSON.parse(cartCookie);
    } catch (e) {
        cart = [];
    }

    // Update cart based on quantity
    if (quantity < 1) {
        // Remove item if quantity is less than 1
        cart = cart.filter(item => item.id !== id);
    } else {
        // Update quantity
        cart = cart.map(item =>
            item.id === id ? { ...item, quantity } : item
        );
    }

    // Set cookie with updated cart
    res.setHeader('Set-Cookie', `cart=${JSON.stringify(cart)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);

    return res.status(200).json({ cart });
}
