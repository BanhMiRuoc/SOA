/**
 * Hàm lấy token từ localStorage
 * @returns JWT token hoặc null nếu không có
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Hàm lưu token vào localStorage
 * @param token JWT token
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Xóa token khỏi localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa
 * @returns true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
}; 