# Subject 2: Customer Reviews

## Objective
Add customer reviews for products and display them on the frontend. Reviews are created via Django admin.

**Git skills practiced:** branching, committing, pushing, creating a Pull Request

---

## Setup

1. Clone the repository (if not already done)
2. Create your feature branch from `main` called `feature/customer-reviews`
3. Start the development servers with `./start-dev.sh`

---

## Tasks

### Task 1: Backend - Create Review Model

**File to modify:** `backend/core/api/models.py`

Add a `Review` model linked to Product with author name, rating (1-5), comment, and creation date:

```diff
 from django.db import models
+from django.core.validators import MinValueValidator, MaxValueValidator


 class Product(models.Model):
     ...
+
+
+class Review(models.Model):
+    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
+    author = models.CharField(max_length=100)
+    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
+    comment = models.TextField()
+    created_at = models.DateTimeField(auto_now_add=True)
+
+    def __str__(self):
+        return f"{self.author} - {self.product.name}"
```

**Git:** Commit your changes

---

### Task 2: Backend - Register in Django Admin

**File to create:** `backend/core/api/admin.py`

```python
from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author', 'product', 'rating', 'created_at')
    list_filter = ('rating', 'product')
```

**Git:** Commit your changes

---

### Task 3: Backend - Run Database Migration

Create and apply the migration:

```bash
cd backend/core
uv run python manage.py makemigrations
uv run python manage.py migrate
```

**Git:** Commit the generated migration file

---

### Task 4: Backend - Add Reviews API Endpoint

**File to modify:** `backend/core/api/urls.py`

```diff
-from .models import Product
+from .models import Product, Review


 class ProductSerializer(serializers.ModelSerializer):
     class Meta:
         model = Product
         fields = '__all__'


+class ReviewSerializer(serializers.ModelSerializer):
+    class Meta:
+        model = Review
+        fields = '__all__'
+
+
+class ReviewViewSet(viewsets.ModelViewSet):
+    queryset = Review.objects.all()
+    serializer_class = ReviewSerializer
+
+
 router = routers.DefaultRouter()
 router.register(r'products', ProductViewSet)
+router.register(r'reviews', ReviewViewSet)
```

**Git:** Commit your changes

---

### Task 5: Backend - Create Test Reviews via Admin

1. Go to http://localhost:8000/admin/
2. Login with your superuser account (create one with `uv run python manage.py createsuperuser` if needed)
3. Add a few reviews for existing products

---

### Task 6: Frontend - Create Review Type and API

**File to create:** `frontend/src/api/reviews.ts`

```tsx
export interface Review {
  id: number;
  product: number;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
}

export async function fetchReviews(): Promise<Review[]> {
  const response = await fetch("http://localhost:8000/api/reviews/");
  return response.json();
}
```

**Git:** Commit your changes

---

### Task 7: Frontend - Create ReviewsSection Component

**File to create:** `frontend/src/components/ReviewsSection.tsx`

```tsx
import { useState, useEffect } from 'react';
import { Review, fetchReviews } from '../api/reviews';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews().then(setReviews);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Avis clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{review.author}</span>
                <span className="text-yellow-500">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Git:** Commit your changes

---

### Task 8: Frontend - Add Reviews to App.tsx

**File to modify:** `frontend/src/App.tsx`

```diff
 import { useProducts } from './contexts/ProductsContext';
+import ReviewsSection from './components/ReviewsSection';
 import Spinner from "./Spinner";
```

Add the component before the closing `</main>` tag:

```diff
         </div>
+        <ReviewsSection />
       </main>
```

**Git:** Commit your changes

---

## Push and Create Pull Request

1. Push your branch to the remote repository
2. Create a Pull Request on GitHub:
   - Base: `main`
   - Compare: your feature branch
   - Write a clear title and description
3. Request a review from a teammate

---

## Checklist

- [ ] Created feature branch from `main`
- [ ] Added `Review` model with ForeignKey to Product
- [ ] Registered Review in Django admin
- [ ] Created and applied migration
- [ ] Added reviews API endpoint
- [ ] Created test reviews via admin
- [ ] Created `Review` type and fetch function
- [ ] Created `ReviewsSection` component
- [ ] Updated `App.tsx` to display reviews
- [ ] Made atomic commits with clear messages
- [ ] Pushed branch and created PR
