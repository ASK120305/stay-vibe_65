import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

interface Hotel {
  id: string;
  name: string;
  image: string;
  price: number;
}

function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Hotel[]>("favorites", []);
  const [isLoading, setIsLoading] = useState(false);

  const addToFavorites = useCallback((hotel: Hotel) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setFavorites(prev => {
        const exists = prev.some(fav => fav.id === hotel.id);
        if (exists) return prev;
        return [...prev, hotel];
      });
      setIsLoading(false);
    }, 300);
  }, [setFavorites]);

  const removeFromFavorites = useCallback((hotelId: string) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setFavorites(prev => prev.filter(fav => fav.id !== hotelId));
      setIsLoading(false);
    }, 300);
  }, [setFavorites]);

  const isFavorite = useCallback((hotelId: string) => {
    return favorites.some(fav => fav.id === hotelId);
  }, [favorites]);

  const toggleFavorite = useCallback((hotel: Hotel) => {
    if (isFavorite(hotel.id)) {
      removeFromFavorites(hotel.id);
    } else {
      addToFavorites(hotel);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    isLoading,
  };
}

export default useFavorites;