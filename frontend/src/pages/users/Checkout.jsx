import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Checkout = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products/${productId}`);
        setProduct(res.data);
        setError(null);
      } catch (err) {
        setError('Could not load product.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleCheckout = () => {
    // For now, just simulate checkout
    alert(`Checkout complete for product: ${product.name}`);
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div>
      <h2>Checkout</h2>
      <div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <p>Price: ${product.price}</p>
        <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '300px' }} />
      </div>
      <button onClick={handleCheckout}>Confirm Purchase</button>
    </div>
  );
};

export default Checkout;
