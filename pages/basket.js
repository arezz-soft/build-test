import { useState, useEffect, useRef } from 'react';
import { searchProducts } from '../utils/search';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Basket() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const router = useRouter();
  // Add to cart function for dropdown
  const addToCart = (product) => {
    fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, quantity: 1 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.cart) setCart(data.cart);
        alert('Successfully added to cart!');
      })
      .catch(() => alert('Failed to add to cart'));
  };
  // Load all products for search dropdown (optional, can be removed if not needed)
  const [allProducts, setAllProducts] = useState([]);
  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(products => setAllProducts(products))
      .catch(() => setAllProducts([]));
  }, []);
  useEffect(() => {
    setFilteredProducts(searchProducts(allProducts, search));
  }, [search, allProducts]);


  // ...existing code...

  useEffect(() => {
    // load cart from serverless API
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => setCart(data.cart || []))
      .catch(() => setCart([]));
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    // send update to serverless API
    fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId, quantity: newQuantity })
    })
      .then(res => res.json())
      .then(data => setCart(data.cart || []))
      .catch(() => alert('Failed to update cart'));
  };

  // Cart is persisted on the server; no localStorage sync here.

  const clearCart = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('Clear all items from your cart?');
      if (!ok) return;
    }
    fetch('/api/cart/clear', { method: 'POST' })
      .then(() => setCart([]))
      .catch(() => alert('Failed to clear cart'));
  };

  const total = cart.reduce((sum, item) =>
    sum + (parseFloat(item.price.replace('$', '')) * item.quantity), 0
  );

  const handleCheckout = () => {
    if (!cart || cart.length === 0) return;
    // Build message lines for each item: quantity x name - price - subtotal
    const lines = cart.map(item => {
      const unit = parseFloat(item.price.replace('$', ''));
      const subtotal = (unit * item.quantity).toFixed(2);
      return `${item.quantity} x ${item.name} - ${item.price} - Subtotal: $${subtotal}`;
    });

    const message = `Order from Build Computers:\n${lines.join('\n')}\n\nTotal: $${total.toFixed(2)}`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/+96407517039790?text=${encoded}`;
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  };


  // Shared header for both empty and filled basket
  const BasketHeader = () => (
    <header className="main-header">
      <div className="header-logo" onClick={() => router.push('/')}>Build Computers</div>
      <button className="search-toggle mobile-only" aria-label="Open search" onClick={() => { setSearchOpen(v => !v); setTimeout(() => searchInputRef.current?.focus(), 60); }}>🔍</button>
      <div className={`search-container ${searchOpen ? 'expanded' : ''}`}>
        <form className={`search-form ${searchOpen ? 'expanded' : ''}`} onSubmit={e => { e.preventDefault(); return false; }}>
          <input ref={searchInputRef} type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </form>
        {search.trim() && (
          <div className="search-dropdown">
            <div className="search-results-quick">
              {filteredProducts.length === 0 ? (
                <div className="no-results"><p>No products found</p></div>
              ) : (
                <div className="quick-results">
                  {filteredProducts.slice(0, 4).map(product => (
                    <div key={product.id} className="quick-result-item">
                      <div className="quick-result-image">
                        <Image src={product.image} alt={product.name} width={50} height={50} style={{ borderRadius: "5px" }} />
                      </div>
                      <div className="quick-result-info">
                        <h4>{product.name}</h4>
                        <p className="quick-result-price">${product.price}</p>
                        <button className="quick-add-to-cart" onClick={() => addToCart(product)}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <nav className={`nav-menu ${mobileOpen ? 'active' : ''}`}>
        <Link href="/#computers" onClick={() => setMobileOpen(false)}>Computers 🖥️</Link>
        <Link href="/#laptops" onClick={() => setMobileOpen(false)}>Laptops 💻</Link>
        <Link href="/#supplies" onClick={() => setMobileOpen(false)}>Supplies 📦</Link>
        <Link href="/basket" className="basket-link" onClick={() => setMobileOpen(false)}>
          Basket 🛒
          {cart.length > 0 && (
            <span className="badge-count">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Link>
      </nav>
      <button className="hamburger-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
        <span className={`hamburger-line ${mobileOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${mobileOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${mobileOpen ? 'active' : ''}`}></span>
      </button>
    </header>
  );

  if (cart.length === 0) {
    return (
      <>
        <Head>
          <title>My Basket - Build Computers</title>
          <link rel="icon" href="https://build-computer.vercel.app/favicon.ico" sizes="any" />
          <link rel="icon" href="https://build-computer.vercel.app/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-16.png" sizes="16x16" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-24.png" sizes="24x24" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-32.png" sizes="32x32" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-64.png" sizes="64x64" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-128.png" sizes="128x128" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-180.png" sizes="180x180" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-192.png" sizes="192x192" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-256.png" sizes="256x256" />
          <link rel="icon" href="https://build-computer.vercel.app/icons/icon-512.png" sizes="512x512" />
          <link rel="apple-touch-icon" href="https://build-computer.vercel.app/icons/icon-180.png" />
          <meta name="msapplication-TileColor" content="#0a0a0c" />
          <meta name="msapplication-TileImage" content="https://build-computer.vercel.app/icons/icon-512.png" />
          <meta name="theme-color" content="#0a0a0c" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="manifest" href="https://build-computer.vercel.app/manifest.json" />
          <meta name="description" content="View your selected computer components and proceed to checkout." />

          {/* Open Graph Meta Tags for Social Previews */}
          <meta property="og:site_name" content="Build Computers" />
          <meta property="og:title" content="My Basket - Build Computers" />
          <meta property="og:description" content="View your selected computer components and proceed to checkout." />
          <meta property="og:image" content="https://build-computer.vercel.app/icons/og-image.png" />
          <meta property="og:image:width" content="1024" />
          <meta property="og:image:height" content="1024" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:alt" content="Build Computers Premium Logo" />
          <meta property="og:url" content="https://build-computer.vercel.app/basket" />
          <meta property="og:type" content="website" />

          {/* Twitter Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="My Basket - Build Computers" />
          <meta name="twitter:description" content="View your selected computer components and proceed to checkout." />
          <meta name="twitter:image" content="https://build-computer.vercel.app/icons/og-image.png" />
          <meta name="twitter:image:width" content="1024" />
          <meta name="twitter:image:height" content="1024" />
          <meta name="twitter:image:type" content="image/png" />
          <meta name="twitter:image:alt" content="Build Computers Premium Logo" />
          <meta name="twitter:url" content="https://build-computer.vercel.app/basket" />
          <meta name="twitter:type" content="website" />
        </Head>
        <BasketHeader />
        <div className="empty-cart">
          <h1>Your basket is empty</h1>
          <p>Start shopping to add items to your basket</p>
          <b><Link href="/" className="continue-shopping">Continue Shopping</Link></b>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Basket - Build Computers</title>
        <link rel="icon" href="https://build-computer.vercel.app/favicon.ico" sizes="any" />
        <link rel="icon" href="https://build-computer.vercel.app/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-16.png" sizes="16x16" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-24.png" sizes="24x24" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-32.png" sizes="32x32" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-64.png" sizes="64x64" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-128.png" sizes="128x128" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-180.png" sizes="180x180" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-192.png" sizes="192x192" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-256.png" sizes="256x256" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-512.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="https://build-computer.vercel.app/icons/icon-180.png" />
        <meta name="msapplication-TileColor" content="#0a0a0c" />
        <meta name="msapplication-TileImage" content="https://build-computer.vercel.app/icons/icon-512.png" />
        <meta name="theme-color" content="#0a0a0c" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="https://build-computer.vercel.app/manifest.json" />
        <meta name="description" content="View your selected computer components and proceed to checkout." />

        {/* Open Graph Meta Tags for Social Previews */}
        <meta property="og:site_name" content="Build Computers" />
        <meta property="og:title" content="My Basket - Build Computers" />
        <meta property="og:description" content="View your selected computer components and proceed to checkout." />
        <meta property="og:image" content="https://build-computer.vercel.app/icons/og-image.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Build Computers Premium Logo" />
        <meta property="og:url" content="https://build-computer.vercel.app/basket" />
        <meta property="og:type" content="website" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Basket - Build Computers" />
        <meta name="twitter:description" content="View your selected computer components and proceed to checkout." />
        <meta name="twitter:image" content="https://build-computer.vercel.app/icons/og-image.png" />
        <meta name="twitter:image:width" content="1024" />
        <meta name="twitter:image:height" content="1024" />
        <meta name="twitter:image:type" content="image/png" />
        <meta name="twitter:image:alt" content="Build Computers Premium Logo" />
        <meta name="twitter:url" content="https://build-computer.vercel.app/basket" />
        <meta name="twitter:type" content="website" />
      </Head>
      <BasketHeader />
      <main className="basket-page">
        <div className="basket-container">
          <h1>My Basket 🛒</h1>
          <div className="basket-grid">
            <div className="basket-items">
              {cart.map((item) => (
                <div key={item.id} className="basket-item">
                  <div className="item-image">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={150}
                      height={150}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="item-details">
                    <h2>{item.name}</h2>
                    <p className="item-category">{item.category}</p>
                    <p className="item-price">{item.price}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => updateQuantity(item.id, 0)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="item-total">
                    ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="basket-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <button className="remove-all-btn" onClick={clearCart}>
                Clear Cart
              </button>
              <Link href="/" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <p>© Build Computers ||  All rights reserved.</p>
        <p>Created by <strong> <a target="_blank" href="https://arez.netlify.app">Arez </a>
          & <a target="_blank" href="https://hastemuhsin.netlify.app/">Hasty</a></strong></p>
      </footer>
    </>
  );
}







