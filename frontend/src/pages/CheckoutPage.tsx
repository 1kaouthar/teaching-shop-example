import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductsContext';
import { createOrder } from '../api/orders';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { products } = useProducts();
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const product = products.find((p) => p.id === Number(productId));

  const formatCardNumber = (value: string) => {
    return value.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(raw);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const order = await createOrder(token, product.id, cardNumber);
      toast.success('Order placed successfully!');
      navigate(`/order/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Checkout</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-xl font-bold text-gray-900 mt-2">${product.price.toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>

          <div className="mb-4">
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              maxLength={19}
              required
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
              value={formatCardNumber(cardNumber)}
              onChange={handleCardChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter any 16-digit number. Cards starting with 0000 will be declined.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || cardNumber.length !== 16}
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay $${product.price.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
