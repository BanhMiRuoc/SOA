// src/api/menuService.ts
import { MenuItem } from '@/types/menu.types';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Get token from localStorage for authorization header
const getToken = () => localStorage.getItem('token');

/**
 * Lấy tất cả các menu items từ API
 */
export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const response = await axios.get<MenuItem[]>(`${API_URL}/menu`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = handleAxiosError(error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Lấy tất cả các menu items có sẵn từ API
 */
export const getAvailableMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const response = await axios.get<MenuItem[]>(`${API_URL}/menu/available`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = handleAxiosError(error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Thêm một menu item mới
 */
export const addMenuItem = async (menuItem: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  try {
    const response = await axios.post<MenuItem>(`${API_URL}/menu`, menuItem, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = handleAxiosError(error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Cập nhật một menu item
 */
export const updateMenuItem = async (id: number, menuItem: Partial<MenuItem>): Promise<MenuItem> => {
  try {
    const response = await axios.put<MenuItem>(`${API_URL}/menu/${id}`, menuItem, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = handleAxiosError(error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Helper function để xử lý lỗi từ Axios
 */
const handleAxiosError = (error: any): string => {
  if (error.response) {
    // Server responded with a status code that falls out of the range of 2xx
    const data = error.response.data;
    
    if (data && data.message) {
      return data.message;
    }
    
    if (data && data.error) {
      return data.error;
    }
    
    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      case 401:
        return 'Bạn cần đăng nhập để thực hiện thao tác này.';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này.';
      case 404:
        return 'Không tìm thấy dữ liệu yêu cầu.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      default:
        return `Lỗi: ${error.response.status} ${error.response.statusText}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    return 'Không thể kết nối đến máy chủ.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return `Lỗi: ${error.message}`;
  }
};

/**
 * Bật/tắt tính khả dụng của một menu item
 */
export const toggleAvailability = async (id: number): Promise<MenuItem> => {
  try {
    const response = await axios.patch<MenuItem>(`${API_URL}/menu/${id}/toggle-availability`, {}, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = handleAxiosError(error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Bật/tắt hiển thị của một menu item trên giao diện đặt món
 */
export const toggleVisibility = async (id: number): Promise<MenuItem> => {
  try {
    const response = await axios.patch<MenuItem>(`${API_URL}/menu/${id}/toggle-visibility`, {}, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = handleAxiosError(error);
      throw new Error(errorMessage);
    }
    throw error;
  }
};