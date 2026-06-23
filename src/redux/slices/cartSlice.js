import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

// Helper toast style
const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
  }
};

// Async thunk to fetch customer's cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data; // CartDTO
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart.');
    }
  }
);

// Async thunk to add product to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/cart/add', null, { params: { productId, quantity } });
      toast.success('Added to cart!', toastStyle);
      dispatch(fetchCart());
      return { productId, quantity };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart.');
    }
  }
);

// Async thunk to update cart item quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.put('/cart/update', null, { params: { productId, quantity } });
      dispatch(fetchCart());
      return { productId, quantity };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quantity.');
    }
  }
);

// Async thunk to remove single product from cart
export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/cart/remove/${productId}`);
      toast.success('Item removed.', toastStyle);
      dispatch(fetchCart());
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item.');
    }
  }
);

// Async thunk to clear entire cart
export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.delete('/cart/clear');
      toast.success('Cart cleared.', toastStyle);
      dispatch(fetchCart());
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart.');
    }
  }
);

// Async thunk to checkout all items in cart
export const checkoutAll = createAsyncThunk(
  'cart/checkoutAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/cart/checkout');
      toast.success('Order placed successfully!', toastStyle);
      dispatch(fetchCart());
      return response.data; // CustomerProductOrderDTO
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Checkout failed.');
    }
  }
);

// Async thunk to checkout single item directly from cart
export const checkoutItem = createAsyncThunk(
  'cart/checkoutItem',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/cart/checkout/${productId}`);
      toast.success('Order placed successfully!', toastStyle);
      dispatch(fetchCart());
      return response.data; // CustomerProductOrderDTO
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Checkout failed.');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null, // CartDTO { items: [], totalAmount: 0 }
    loading: false,
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.cart = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
