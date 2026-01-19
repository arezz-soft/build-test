import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { searchProducts } from "../utils/search";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const fullHeroText = 'Your Dream PC';
  const [displayText, setDisplayText] = useState('');

  // Load products from static JSON file so all users see the same products
  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(products => setAllProducts(products))
      .catch(() => setAllProducts([]));

    // Load cart from API
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => setCart(data.cart || []))
      .catch(() => setCart([]));
  }, []);

  // Update filtered products for quick results as user types (live)
  useEffect(() => {
    const termForQuick = search; // live typing shows quick results
    const filtered = searchProducts(allProducts, termForQuick);
    setFilteredProducts(filtered);
  }, [search, allProducts]);

  // Save cart to localStorage

  const handleSearch = (e) => {
    e.preventDefault();
    return false;
  };

  const addToCart = (product) => {
    // Send add request to serverless API
    fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, quantity: 1 })
    })
      .then(res => res.json())
      .then(data => {
        // update local cart state so header count updates immediately
        if (data.cart) setCart(data.cart);
        alert('Successfully added to cart!');
      })
      .catch(() => alert('Failed to add to cart'));
  };

  const renderProductCard = (product) => (
    <div key={product.id} className="product-card">
      <div className="product-image">
        <Image src={product.image} alt={product.name} width={220} height={120} style={{ borderRadius: "10px", display: "fill", objectFit: "cover", width: "100%", height: "100%" }} />
      </div>
      <h3>{product.name}</h3>
      <p className="product-price">${product.price}</p>
      <p className="product-category">{product.category}</p>
      <button onClick={() => addToCart(product)} className="add-to-cart-btn">Add to Cart</button>
    </div>
  );

  // Category lists should always show the full catalog on the home page.
  const computers = allProducts.filter(p => (p.category || '').toLowerCase() === 'computers');
  const laptops = allProducts.filter(p => (p.category || '').toLowerCase() === 'laptops');
  const supplies = allProducts.filter(p => (p.category || '').toLowerCase() === 'supplies');

  // Typewriter effect for hero heading
  useEffect(() => {
    let idx = 0;
    setDisplayText('');
    let deleting = false;
    let timer = null;
    const type = () => {
      if (!deleting) {
        idx += 1;
        setDisplayText(fullHeroText.slice(0, idx));
        if (idx === fullHeroText.length) {
          deleting = true;
          timer = setTimeout(type, 1200); // pause at full text
        } else {
          timer = setTimeout(type, 80);
        }
      } else {
        idx -= 1;
        setDisplayText(fullHeroText.slice(0, idx));
        if (idx === 0) {
          deleting = false;
          timer = setTimeout(type, 500); // pause before re-typing
        } else {
          timer = setTimeout(type, 40);
        }
      }
    };

    type();
    return () => { if (timer) clearTimeout(timer); };
  }, [fullHeroText]);

return (
    <div className="page-container">
      <Head>
        <title>Build~Computers </title>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/icon-24.png" sizes="24x24" />
        <link rel="icon" href="/icons/icon-32.png" sizes="32x32" />
        <link rel="icon" href="/icons/icon-64.png" sizes="64x64" />
        <link rel="icon" href="/icons/icon-96.png" sizes="96x96" />
        <link rel="icon" href="/icons/icon-180.png" sizes="180x180" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" />
        <link rel="icon" href="/icons/icon-512.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileImage" content="/icons/icon-512.png" />

        {/* Open Graph Meta Tags for Social Previews */}
        <meta property="og:site_name" content="Build Computers" />
        <meta property="og:title" content="Build~Computers - Build Your Dream PC" />
        <meta property="og:description" content="Choose the best components and create your perfect setup. Premium computer builds, laptops, and supplies." />
        <meta property="og:image" content="https://build-computer.vercel.app/icons/og-image.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Build Computers Premium Logo" />
        <meta property="og:url" content="https://build-computer.vercel.app/" />
        <meta property="og:type" content="website" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Build~Computers - Build Your Dream PC" />
        <meta name="twitter:description" content="Choose the best components and create your perfect setup." />
        <meta name="twitter:image" content="https://build-computer.vercel.app/icons/og-image.png" />
      </Head>
      <header className="main-header">
        <div className="header-logo" onClick={() => router.push('/')}>
          <span>Build Computers</span>
        </div>
        <button className="search-toggle mobile-only" aria-label="Open search" onClick={() => { setSearchOpen(v => !v); setTimeout(() => searchInputRef.current?.focus(), 60); }}>🔍</button>
        <div className={`search-container ${searchOpen ? 'expanded' : ''}`}>
          <form className={`search-form ${searchOpen ? 'expanded' : ''}`} onSubmit={handleSearch}>
            <input ref={searchInputRef} type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          {search.trim() && (
            <div className="search-dropdown">
              <div className="search-results-quick">
                {filteredProducts.length === 0 ? (
                  <div className="no-results">
                    <p>No products found</p>
                  </div>
                ) : (
                  <div className="quick-results">
                    {filteredProducts.slice(0, 4).map(product => (
                      <div key={product.id} className="quick-result-item" onClick={() => addToCart(product)} role="button" tabIndex={0} onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          addToCart(product);
                        }
                      }}>
                        <div className="quick-result-image">
                          <Image src={product.image} alt={product.name} width={50} height={50} style={{ borderRadius: "5px" }} />
                        </div>
                        <div className="quick-result-info">
                          <h4>{product.name}</h4>
                          <p className="quick-result-price">${product.price}</p>
                          <button className="quick-add-to-cart"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}>
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
          <a href="#computers" onClick={() => setMobileOpen(false)}>Computers 🖥️</a>
          <a href="#laptops" onClick={() => setMobileOpen(false)}>Laptops 💻</a>
          <a href="#supplies" onClick={() => setMobileOpen(false)}>Supplies 📦</a>
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

      <main className="main-content">
        <div className="home-content">
          <section className="hero">
            <h1 aria-live="polite">
              <span className="fixed">Build </span>
              <span className="typewriter">{displayText || ' '}</span>
            </h1>
            <p>Choose the best components and create your perfect setup.</p>
          </section>

          <div className="product-categories">
            <section id="computers" className="products">
              <h2>Computers 🖥️</h2>
              <div className="product-grid">
                {computers.map(renderProductCard)}
              </div>
            </section>

            <section id="laptops" className="products">
              <h2>Laptops 💻</h2>
              <div className="product-grid">
                {laptops.map(renderProductCard)}
              </div>
            </section>

            <section id="supplies" className="products">
              <h2>Supplies 📦</h2>
              <div className="product-grid">
                {supplies.map(renderProductCard)}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer>
        <p>© Build Computers ||  All rights reserved.</p>
        <p>Created by <strong> <a target="_blank" href="https://arez.netlify.app">Arez </a>
          & <a target="_blank" href="https://hastemuhsin.netlify.app/">Hasty</a></strong></p>
      </footer>
    </div>
  );
}




