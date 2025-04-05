
// Default environment variables
const defaultEnv = {
  API_URL: "http://localhost:5000/api",
};

// Export environment variables
export const env = {
  API_URL: import.meta.env.VITE_API_URL || defaultEnv.API_URL,
};
