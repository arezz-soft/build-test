import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../style/Admin.module.css';
import Image from 'next/image';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Head from 'next/head';

export default function AdminDashboard() {
  const router = useRouter();
  const [product, setProduct] = useState({
    name: '',
    price: '',
    image: null,
    imagePreview: '',
    category: 'computers',
    id: null     // For editing mode
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('add');   // 'add' or 'manage'

  const [allProducts, setAllProducts] = useState([]);

  // Load products from localStorage on initial render
  
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/admin/login');
      return;
    }

    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        setAllProducts(parsedProducts);
        console.log('Products loaded from localStorage:', parsedProducts.length);
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(allProducts));
      console.log('Products saved to localStorage:', allProducts.length);
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }, [allProducts]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP).');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image size too large. Please choose an image under 5MB.');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);

      // Create a regular HTMLImageElement for validation
      const img = document.createElement('img');
      img.onload = () => {
        // Update state with the validated image
        setProduct({
          ...product,
          image: file,
          imagePreview: imageUrl
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        alert('Error loading image. Please try another file.');
        e.target.value = ''; // Clear the file input
      };
      img.src = imageUrl;

    } catch (error) {
      console.error('Error handling image:', error);
      alert('Error processing image. Please try again.');
      e.target.value = ''; // Clear the file input
    }
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = allProducts.filter(p => p.id !== productId);
      setAllProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  };

  const handleEdit = (productToEdit) => {
    setProduct({
      ...productToEdit,
      imagePreview: productToEdit.image,
      image: null
    });
    setIsEditMode(true);
    setActiveTab('add');
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.price.includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const handleImageAndSave = async (base64Image) => {
      try {
        // Validate image size
        if (base64Image) {
          const sizeInBytes = Math.ceil((base64Image.length * 3) / 4);
          const sizeInMB = sizeInBytes / (1024 * 1024);
          
          if (sizeInMB > 5) { // Limit to 5MB
            alert('Image size too large. Please choose an image under 5MB.');
            return;
          }
        }

        const productData = {
          name: product.name,
          price: product.price,
          image: base64Image || product.imagePreview, // Use existing image if no new one
          category: product.category,
          id: isEditMode ? product.id : Date.now(),
          dateAdded: isEditMode ? product.dateAdded : new Date().toISOString(),
          lastModified: new Date().toISOString()
        };

        let updatedProducts;
        if (isEditMode) {
          updatedProducts = allProducts.map(p => 
            p.id === product.id ? productData : p
          );
        } else {
          updatedProducts = [...allProducts, productData];
        }

        // Update state (this will trigger the useEffect to save to localStorage)
        setAllProducts(updatedProducts);

        // Reset form
        setProduct({
          name: '',
          price: '',
          image: null,
          imagePreview: '',
          category: 'computers',
          id: null
        });
        setIsEditMode(false);

        // Clear file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
        
        alert(`Product ${isEditMode ? 'updated' : 'added'} successfully!`);

      } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product. Please try again.');
      }
    };

    try {
      if (product.image) {
        const reader = new FileReader();
        reader.onloadend = () => handleImageAndSave(reader.result);
        reader.onerror = () => {
          console.error('Error reading file:', reader.error);
          alert('Error reading image file. Please try again.');
        };
        reader.readAsDataURL(product.image);
      } else {
        await handleImageAndSave(null);
      }
    } catch (error) {
      console.error('Error in submit handler:', error);
      alert('Error processing form. Please try again.');
    }
  };

  return (

    <div className={styles.dashboardContainer}>
      <Head>
        <title>Admin Dashboard - Build Computers</title>
        <link rel="icon" href="https://build-computer.vercel.app/favicon.ico" sizes="any" />
        <link rel="icon" href="https://build-computer.vercel.app/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-16.png" sizes="16x16" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-24.png" sizes="24x24" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-32.png" sizes="32x32" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-64.png" sizes="64x64" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-128.png" sizes="128x128" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-180.png" sizes="180x180" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-256.png" sizes="256x256" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-512.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="https://build-computer.vercel.app/icons/icon-180.png" />
        <meta name="msapplication-TileColor" content="#0a0a0c" />
        <meta name="msapplication-TileImage" content="https://build-computer.vercel.app/icons/icon-512.png" />
        <meta name="theme-color" content="#0a0a0c" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="https://build-computer.vercel.app/manifest.json" />
        <meta name="description" content="Admin Dashboard for Build Computers - Manage your inventory and orders." />
        <meta property="og:site_name" content="Build Computers" />
        <meta property="og:title" content="Admin Dashboard - Build Computers" />
        <meta property="og:description" content="Manage your premium computer builds and components." />
        <meta property="og:image" content="https://build-computer.vercel.app/icons/og-image.png" />
        <meta property="og:image:secure_url" content="https://build-computer.vercel.app/icons/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:url" content="https://build-computer.vercel.app/admin/dashboard" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Admin Dashboard - Build Computers" />
        <meta name="twitter:description" content="Admin Dashboard for Build Computers" />
        <meta name="twitter:image" content="https://build-computer.vercel.app/icons/og-image.png" />
      </Head>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'add' ? styles.active : ''}`}
          onClick={() => setActiveTab('add')}
        >
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'manage' ? styles.active : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Products
        </button>
      </div>

      {activeTab === 'add' ? (
        <div className={styles.uploadSection}>
          <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              value={product.name}
              onChange={(e) => setProduct({...product, name: e.target.value})}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              value={product.price}
              onChange={(e) => setProduct({...product, price: e.target.value})}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="image">Product Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              required={!isEditMode}
            />
            {product.imagePreview && (
              <div className={styles.imagePreview}>
                <img
                  src={product.imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={product.category}
              onChange={(e) => setProduct({...product, category: e.target.value})}
              required
            >
              <option value="computers">Computers</option>
              <option value="laptops">Laptops</option>
              <option value="supplies">Supplies</option>
            </select>
          </div>

          <button type="submit" className={styles.submitButton}>
            {isEditMode ? 'Update Product' : 'Add Product'}
          </button>
          {isEditMode && (
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => {
                setIsEditMode(false);
                setProduct({
                  name: '',
                  price: '',
                  image: null,
                  imagePreview: '',
                  category: 'computers',
                  id: null
                });
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>
      ) : (
        <div className={styles.manageSection}>
          <div className={styles.searchBar}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.productsList}>
            {filteredProducts.map((p) => (
              <div key={p.id} className={styles.productItem}>
                <div className={styles.productImage}>
                  {p.image.startsWith('data:image') || p.image.startsWith('blob:') ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '100px', height: '100px', objectFit: "contain" }}
                    />
                  ) : (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={100}
                      height={100}
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h3>{p.name}</h3>
                  <p>Price: {p.price}</p>
                  <p>Category: {p.category}</p>
                </div>
                <div className={styles.productActions}>
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEdit(p)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(p.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
