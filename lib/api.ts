import { toast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get the token from localStorage (in a real app, you might use a more secure method)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Set up headers with authentication
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    // If the response is not ok, throw an error
    if (!response.ok) {
      // Check if it's an auth error
      if (response.status === 401) {
        // Clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }

      // Try to get error details from the response
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    // Re-throw the error for the caller to handle
    throw error;
  }
}

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: any) => {
    return fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return fetchWithAuth("/auth/me");
  },

  forgotPassword: async (email: string) => {
    return fetchWithAuth("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};

// Resources API calls
export const resourcesApi = {
  getAllResources: async (params: any = {}) => {
    // Convert params object to query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchWithAuth(`/resources${queryString}`);
  },

  getResourceById: async (id: string) => {
    return fetchWithAuth(`/resources/${id}`);
  },

  createResource: async (resourceData: any) => {
    return fetchWithAuth("/resources", {
      method: "POST",
      body: JSON.stringify(resourceData),
    });
  },

  updateResource: async (id: string, resourceData: any) => {
    return fetchWithAuth(`/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(resourceData),
    });
  },

  deleteResource: async (id: string) => {
    return fetchWithAuth(`/resources/${id}`, {
      method: "DELETE",
    });
  },

  getLowStockResources: async () => {
    return fetchWithAuth("/resources/low-stock");
  },

  getExpiringResources: async (days: number = 30) => {
    return fetchWithAuth(`/resources/expiry?days=${days}`);
  },
};

// Categories API calls
export const categoriesApi = {
  getAllCategories: async () => {
    return fetchWithAuth("/categories");
  },

  getCategoryById: async (id: string) => {
    return fetchWithAuth(`/categories/${id}`);
  },

  createCategory: async (categoryData: any) => {
    return fetchWithAuth("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id: string, categoryData: any) => {
    return fetchWithAuth(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (id: string) => {
    return fetchWithAuth(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// Transactions API calls
export const transactionsApi = {
  getAllTransactions: async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchWithAuth(`/transactions${queryString}`);
  },

  getTransactionById: async (id: string) => {
    return fetchWithAuth(`/transactions/${id}`);
  },

  createTransaction: async (transactionData: any) => {
    return fetchWithAuth("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  },

  updateTransactionStatus: async (id: string, statusData: any) => {
    return fetchWithAuth(`/transactions/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },

  getOverdueTransactions: async () => {
    return fetchWithAuth("/transactions/overdue");
  },

  getUserTransactions: async (userId?: string) => {
    const queryString = userId ? `?user_id=${userId}` : "";
    return fetchWithAuth(`/transactions/user${queryString}`);
  },
};

// Reservations API calls
export const reservationsApi = {
  getAllReservations: async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchWithAuth(`/reservations${queryString}`);
  },

  getReservationById: async (id: string) => {
    return fetchWithAuth(`/reservations/${id}`);
  },

  createReservation: async (reservationData: any) => {
    return fetchWithAuth("/reservations", {
      method: "POST",
      body: JSON.stringify(reservationData),
    });
  },

  updateReservation: async (id: string, reservationData: any) => {
    return fetchWithAuth(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(reservationData),
    });
  },

  cancelReservation: async (id: string, reason?: string) => {
    return fetchWithAuth(`/reservations/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },

  getUpcomingReservations: async () => {
    return fetchWithAuth("/reservations/upcoming");
  },

  getResourceAvailability: async (resourceId: string, date: string) => {
    return fetchWithAuth(`/reservations/availability/${resourceId}?date=${date}`);
  },
};

// Analytics API calls
export const analyticsApi = {
  getResourceUsage: async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchWithAuth(`/analytics/resource-usage${queryString}`);
  },

  getPopularResources: async (limit: number = 10) => {
    return fetchWithAuth(`/analytics/popular-resources?limit=${limit}`);
  },

  getInventoryValueBreakdown: async () => {
    return fetchWithAuth("/analytics/inventory-value");
  },

  getUserActivity: async (days: number = 30) => {
    return fetchWithAuth(`/analytics/user-activity?days=${days}`);
  },

  getDashboardStats: async () => {
    return fetchWithAuth("/analytics/dashboard-stats");
  },
};

// Error handler utility that can be used throughout the app
export const handleApiError = (error: any, customMessage?: string) => {
  console.error("API Error:", error);
  
  // Show toast notification
  toast({
    variant: "destructive",
    title: "Error",
    description: customMessage || error.message || "An unexpected error occurred",
  });
  
  return null;
};
