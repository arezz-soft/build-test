import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../style/Admin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo purposes - replace with real authentication
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      // In a real app, you'd want to set a proper authentication token
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Head>
        <title>Admin Login - Build Computers</title>
        <link rel="icon" href="https://build-computer.vercel.app/favicon.ico" sizes="any" />
        <link rel="icon" href="https://build-computer.vercel.app/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-16.png" sizes="16x16" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-24.png" sizes="24x24" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-32.png" sizes="32x32" />
        <link rel="icon" href="https://build-computer.vercel.app/icons/icon-64.png" sizes="64x64" />
        <link rel="apple-touch-icon" href="https://build-computer.vercel.app/icons/icon-180.png" />
        <link rel="manifest" href="https://build-computer.vercel.app/manifest.json" />

        {/* Open Graph Meta Tags for Social Previews */}
        <meta property="og:site_name" content="Build Computers" />
        <meta property="og:title" content="Admin Login - Build Computers" />
        <meta property="og:description" content="Access the admin panel to manage products and settings." />
        <meta property="og:image" content="https://build-computer.vercel.app/icons/og-image.png" />
        <meta property="og:image:secure_url" content="https://build-computer.vercel.app/icons/og-image.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:url" content="https://build-computer.vercel.app/admin/login" />
        <meta property="og:type" content="website" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Admin Login - Build Computers" />
        <meta name="twitter:description" content="Access the admin panel." />
        <meta name="twitter:image" content="https://build-computer.vercel.app/icons/og-image.png" />
      </Head>
      <div className={styles.loginBox}>
        <h1>Admin Login</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({
                ...credentials,
                username: e.target.value
              })}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
              required
            />
          </div>
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );

}
