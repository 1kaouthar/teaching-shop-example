# Subject 1: Product Categories

## Objective
Add categories to products and display them grouped by category on the frontend.

**Git skills practiced:** branching, committing, pushing, creating a Pull Request

---

## Setup

1. Clone the repository (if not already done)
2. Create your feature branch from `main` called `feature/product-categories`
3. Start the development servers with `./start-dev.sh`

---

## Tasks

### Task 1: Backend - Add Category to Product Model

**File to modify:** `backend/core/api/models.py`

Add a `category` field to the `Product` model with choices: `bavoirs`, `doudous`, `couvertures`

```diff
 class Product(models.Model):
+    CATEGORY_CHOICES = [
+        ('bavoirs', 'Bavoirs'),
+        ('doudous', 'Doudous'),
+        ('couvertures', 'Couvertures'),
+    ]
+
     id = models.AutoField(primary_key=True)
     name = models.CharField(max_length=100)
     description = models.TextField()
     price = models.DecimalField(max_digits=10, decimal_places=2)
     imageUrl = models.CharField(max_length=200)
+    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='bavoirs')
```

**Git:** Commit your changes with a clear message

---

### Task 2: Backend - Run Database Migration

Create and apply the migration using Django's `makemigrations` and `migrate` commands.

**Git:** Commit the generated migration file

---

### Task 3: Backend - Verify the API

Check that http://localhost:8000/api/products/ now returns the `category` field in the JSON response.

The serializer uses `fields = '__all__'` so no code change is needed here.

---

### Task 4: Frontend - Update the Product Type

**File to modify:** `frontend/src/api/products.ts`

Add the `category` field to both interfaces:

```diff
 export interface Product {
   id: number;
   name: string;
   price: number;
   description: string;
   imageUrl: string;
+  category: string;
 }

 interface RawProduct {
   id: number;
   name: string;
   price: string;
   description: string;
+  category: string;
 }
```

**Git:** Commit your changes

---

### Task 5: Frontend - Create ProductCard Component

**File to create:** `frontend/src/components/ProductCard.tsx`

Create a new component to display a single product:

```tsx
import { Product } from '../api/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full aspect-square object-cover"
      />
      <p className="p-4">
        <span className="block text-lg font-semibold text-gray-800">
          {product.name}
        </span>
        <span className="block text-gray-600">
          {product.description}
        </span>
        <span className="block text-gray-800 font-bold">
          ${product.price.toFixed(2)}
        </span>
      </p>
    </div>
  );
}
```

**Git:** Commit your changes

---

### Task 6: Frontend - Create CategorySection Component

**File to create:** `frontend/src/components/CategorySection.tsx`

Create a component to display a category with its products:

```tsx
import { Product } from '../api/products';
import ProductCard from './ProductCard';

interface CategorySectionProps {
  category: string;
  products: Product[];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 px-8 max-w-4xl mx-auto capitalize">
        {category}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 max-w-4xl mx-auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**Git:** Commit your changes

---

### Task 7: Frontend - Update App.tsx

**File to modify:** `frontend/src/App.tsx`

Import the new component and replace the product grid:

```diff
 import { useProducts } from './contexts/ProductsContext';
+import CategorySection from './components/CategorySection';
 import Spinner from "./Spinner";

+const CATEGORIES = ['bavoirs', 'doudous', 'couvertures'];
+
 export default function App() {
```

Replace the product mapping section with:

```diff
-        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 max-w-4xl mx-auto">
-          <h2 className="sr-only">Produits</h2>
-          {products.map((product) => (
-            ...
-          ))}
-        </div>
+        {CATEGORIES.map((category) => (
+          <CategorySection
+            key={category}
+            category={category}
+            products={products.filter((p) => p.category === category)}
+          />
+        ))}
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
- [ ] Added `category` field to Product model
- [ ] Created and applied migration
- [ ] Updated TypeScript interfaces
- [ ] Created `ProductCard` component
- [ ] Created `CategorySection` component
- [ ] Updated `App.tsx` to use new components
- [ ] Made atomic commits with clear messages
- [ ] Pushed branch and created PR
