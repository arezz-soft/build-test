// API Route: Add item to cart
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, name, price, category, image, quantity } = req.body || {};

    if (!id) {
        return res.status(400).json({ error: 'Missing item id' });
    }

    // Get existing cart from cookies
    const cartCookie = req.cookies.cart || '[]';
    let cart = [];

    try {
        cart = JSON.parse(cartCookie);
    } catch (e) {
        cart = [];
    }

    // Find existing item in cart
    const existingIndex = cart.findIndex(item => item.id === id);

    if (existingIndex !== -1) {
        // Update quantity if item already exists
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + (quantity || 1);
    } else {
        // Add new item to cart
        cart.push({
            id,
            name,
            price,
            category,
            image,
            quantity: quantity || 1
        });
    }

    // Set cookie with updated cart (expires in 7 days)
    res.setHeader('Set-Cookie', `cart=${JSON.stringify(cart)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);

    return res.status(200).json({ cart });
}
