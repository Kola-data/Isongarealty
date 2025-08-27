import useAuthStore from "../store/authStore";

export const initializeAuth = () => {
  const { setAuth } = useAuthStore.getState();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    setAuth(token, JSON.parse(user));
  }

  return !!token;
};
