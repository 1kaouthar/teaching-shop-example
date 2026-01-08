from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from .models import Product, Order


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_creates_user_and_returns_token(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_register_duplicate_username_fails(self):
        User.objects.create_user(username='existing', password='pass123')
        response = self.client.post('/api/auth/register/', {
            'username': 'existing',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_token(self):
        User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_invalid_credentials_fails(self):
        User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OrderTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.other_user = User.objects.create_user(username='otheruser', password='testpass123')
        self.product = Product.objects.create(
            name='Test Product',
            description='A test product',
            price='29.99',
            imageUrl='/test.jpg'
        )
        # Login and get token
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.token = response.data['token']

    def test_create_order_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        response = self.client.post('/api/orders/', {
            'product_id': self.product.id,
            'card_number': '1234567890123456'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'paid')
        self.assertEqual(response.data['card_last_four'], '3456')

    def test_create_order_unauthenticated_fails(self):
        response = self.client.post('/api/orders/', {
            'product_id': self.product.id,
            'card_number': '1234567890123456'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_invalid_card_fails(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        response = self.client.post('/api/orders/', {
            'product_id': self.product.id,
            'card_number': '123'  # Too short
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_order_declined_card(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        response = self.client.post('/api/orders/', {
            'product_id': self.product.id,
            'card_number': '0000123456789012'  # Starts with 0000
        })
        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        self.assertIn('error', response.data)

    def test_list_orders_returns_only_user_orders(self):
        # Create order for current user
        Order.objects.create(
            user=self.user,
            product=self.product,
            card_last_four='1234',
            status='paid'
        )
        # Create order for other user
        Order.objects.create(
            user=self.other_user,
            product=self.product,
            card_last_four='5678',
            status='paid'
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only user's own order


class AdminOrdersTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin',
            password='adminpass123',
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            username='regular',
            password='regularpass123'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='A test product',
            price='29.99',
            imageUrl='/test.jpg'
        )
        Order.objects.create(
            user=self.admin_user,
            product=self.product,
            card_last_four='1111',
            status='paid'
        )
        Order.objects.create(
            user=self.regular_user,
            product=self.product,
            card_last_four='2222',
            status='paid'
        )

    def test_admin_can_view_all_orders(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'admin',
            'password': 'adminpass123'
        })
        token = response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        response = self.client.get('/api/admin/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_non_admin_cannot_view_admin_orders(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'regular',
            'password': 'regularpass123'
        })
        token = response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        response = self.client.get('/api/admin/orders/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_returns_is_staff_for_admin(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'admin',
            'password': 'adminpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['user']['is_staff'])

    def test_login_returns_is_staff_false_for_regular_user(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'regular',
            'password': 'regularpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['user']['is_staff'])

    def test_register_returns_is_staff_false(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data['user']['is_staff'])
