import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrder, type Order } from '../api/orders';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!token || !orderId) return;

      try {
        const orderData = await getOrder(token, Number(orderId));
        setOrder(orderData);
      } catch {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [token, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{error || 'Order not found'}</p>
      </div>
    );
  }

  const isSuccess = order.status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto text-center">
        {isSuccess ? (
          <CheckCircleIcon className="mx-auto h-16 w-16 text-success" />
        ) : (
          <XCircleIcon className="mx-auto h-16 w-16 text-error" />
        )}

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {isSuccess ? 'Order Confirmed!' : 'Order Failed'}
        </h1>

        <p className="mt-2 text-gray-600">
          {isSuccess
            ? 'Thank you for your purchase. Your order has been confirmed.'
            : 'Your payment was declined. Please try again with a different card.'}
        </p>

        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={order.product_image}
            alt={order.product_name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4 text-left">
            <h2 className="text-lg font-semibold text-gray-800">{order.product_name}</h2>
            <p className="text-gray-600">Order #{order.id}</p>
            <p className="text-gray-600">Card ending in {order.card_last_four}</p>
            <p className="text-xl font-bold text-gray-900 mt-2">${parseFloat(order.product_price).toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 space-x-4">
          <Link
            to="/"
            className="inline-block py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="inline-block py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
