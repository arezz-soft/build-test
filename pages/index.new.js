import Head from "next/head";
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

  // Load initial data
  useEffect(() => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setAllProducts(products);
    setCart(savedCart);
  }, []);

  // Handle search
  useEffect(() => {
    const searchParam = router.query.search;
    if (searchParam) {
      setSearch(decodeURIComponent(searchParam));
    }
  }, [router.query.search]);

  // Update filtered products
  useEffect(() => {
    const filtered = searchProducts(allProducts, search);
    setFilteredProducts(filtered);
  }, [search, allProducts]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Typewriter effect for hero heading
  useEffect(() => {
    let idx = 0;
    let deleting = false;
    let timer = null;
    const type = () => {
      if (!deleting) {
        idx += 1;
        setDisplayText(fullHeroText.slice(0, idx));
        if (idx === fullHeroText.length) {
          deleting = true;
          timer = setTimeout(type, 1200);
        } else {
          timer = setTimeout(type, 80);
        }
      } else {
        idx -= 1;
        setDisplayText(fullHeroText.slice(0, idx));
        if (idx === 0) {
          deleting = false;
          timer = setTimeout(type, 500);
        } else {
          timer = setTimeout(type, 40);
        }
      }
    };

    setDisplayText('');
    type();
    return () => { if (timer) clearTimeout(timer); };
  }, [fullHeroText]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push({
        pathname: '/',
        query: { search: search.trim() }
      }, undefined, { shallow: true });
    } else {
      router.push('/', undefined, { shallow: true });
    }
  };

  // Add to cart function
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert('Product added to cart!');
  };

  // Filter products by category
  const computers = filteredProducts.filter(p => p.category === 'computers');
  const laptops = filteredProducts.filter(p => p.category === 'laptops');
  const supplies = filteredProducts.filter(p => p.category === 'supplies');

  return (
    <div className="page-container">
      <Head>
        <title>
          {search.trim() ? `Search: ${search} - Build Computers` : 'Build Computers'}
        </title>
      </Head>

      <header className="main-header">
        <div className="header-logo" onClick={() => router.push('/')}>Build Computers</div>
        <button className="search-toggle mobile-only" aria-label="Open search" onClick={() => { setSearchOpen(v => !v); setTimeout(() => searchInputRef.current?.focus(), 60); }}>🔍</button>
        <form className={`search-form ${searchOpen ? 'expanded' : ''}`} onSubmit={handleSearch}>
          <input ref={searchInputRef} type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        </form>
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
        {search.trim() ? (
          <section className="search-results">
            <div className="search-results-container">
              <h2>Search Results for "{search}"</h2>
              {filteredProducts.length === 0 ? (
                <div className="no-results">
                  <p>No products found matching your search.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price}</p>
                      <p className="product-category">{product.category}</p>
                      <button 
                        onClick={() => addToCart(product)} 
                        className="add-to-cart-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="home-content">
            <section className="hero">
              <h1 aria-live="polite">
                <span className="fixed">Build </span>
                <span className="typewriter">{displayText}</span>
              </h1>
              <p>Choose the best components and create your perfect setup.</p>
              <button>Get Started</button>
            </section>

            <div className="product-categories">
              <section id="computers" className="products">
                <h2>Computers</h2>
                <div className="product-grid">
                  {computers.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price}</p>
                      <p className="product-category">{product.category}</p>
                      <button 
                        onClick={() => addToCart(product)} 
                        className="add-to-cart-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section id="laptops" className="products">
                <h2>Laptops</h2>
                <div className="product-grid">
                  {laptops.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price}</p>
                      <p className="product-category">{product.category}</p>
                      <button 
                        onClick={() => addToCart(product)} 
                        className="add-to-cart-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section id="supplies" className="products">
                <h2>Supplies</h2>
                <div className="product-grid">
                  {supplies.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price}</p>
                      <p className="product-category">{product.category}</p>
                      <button 
                        onClick={() => addToCart(product)} 
                        className="add-to-cart-btn"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>© 2025 Build Computers. All rights reserved.</p>
      </footer>
    </div>
  );
}
