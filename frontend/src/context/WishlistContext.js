import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext'; 
import { useToast } from '../components/ToastNotification'; 

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { t, language } = useLanguage(); 
  const { showToast } = useToast(); 
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const { isAuthenticated, API_BASE_URL, token } = useAuth(); 
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated && API_BASE_URL && token) {
      setLoadingWishlist(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Accept-Language': language 
            }
        });
        setWishlistItems(response.data || []); 
      } catch (error) {
        console.error('WishlistContext: Failed to fetch wishlist:', error.response?.data?.message || error.message);
        setWishlistItems([]); 
      } finally {
        setLoadingWishlist(false);
      }
    } else {
      setWishlistItems([]); 
    }
  }, [isAuthenticated, API_BASE_URL, token, language]); 

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistItems([]); 
    }
  }, [isAuthenticated, fetchWishlist]); 

  const addToWishlist = async (productOrProductId) => {
    if (!isAuthenticated) {
      showToast(t('wishlist.loginRequired') || 'Please login to add items to your wishlist.', 'info');
      navigate('/login');
      return;
    }
    
    const productId = typeof productOrProductId === 'object' ? productOrProductId?._id : productOrProductId;
    if (!productId) { 
        showToast(t('wishlist.productDataIncompleteAdd') || 'Product data is incomplete!', 'error');
        return;
    }

    if (isFavorite(productId)) { 
        showToast(t('wishlist.alreadyInWishlist') || "Product is already in your wishlist.", 'info'); 
        return;
    }

    setLoadingWishlist(true);
    try {
      await axios.post(`${API_BASE_URL}/api/wishlist/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchWishlist();
    } catch (error) {
      console.error('WishlistContext: Failed to add to wishlist:', error.response?.data?.message || error.message);
      showToast(`${t('wishlist.addFailed') || 'Could not add product to wishlist.'}`, 'error');
    } finally {
        setLoadingWishlist(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    if (!productId) {
        showToast(t('wishlist.productDataIncompleteRemove') || "Cannot remove product: ID is missing.", 'error');
        return;
    }
    setLoadingWishlist(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      await fetchWishlist();
    } catch (error) {
      console.error('WishlistContext: Failed to remove from wishlist:', error.response?.data?.message || error.message);
      showToast(`${t('wishlist.removeFailed') || 'Could not remove product from wishlist.'}`, 'error');
    } finally {
        setLoadingWishlist(false);
    }
  };

  const isFavorite = useCallback((productId) => {
    if (!productId || !Array.isArray(wishlistItems)) {
        return false;
    }
    return wishlistItems.some(item => item && item._id && item._id.toString() === productId.toString());
  }, [wishlistItems]); 

  const toggleFavorite = async (productOrProductId) => {
    if (!isAuthenticated) {
        showToast(t('wishlist.loginRequiredToggle') || "Please log in to use the wishlist.", 'info');
        navigate('/login');
        return;
    }
    
    const productId = typeof productOrProductId === 'object' ? productOrProductId?._id : productOrProductId;
    if (!productId) { 
        showToast(t('wishlist.productDataIncompleteToggle') || "Product data is incomplete.", 'error');
        return;
    }

    if (isFavorite(productId)) { 
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productOrProductId);
    }
  };

  const value = {
    wishlistItems, 
    isFavorite,
    toggleFavorite,
    wishlistCount: wishlistItems.length, 
    loadingWishlist,
    fetchWishlist, 
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};