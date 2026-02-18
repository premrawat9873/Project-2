import axios from 'axios';
import type { AxiosInstance } from 'axios'

const API_URL = 'https://backend.premrawat9873.workers.dev';

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface ApiResponse {
  jwt: string;
  id?: string;
  error?: string;
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  async signIn(data: SignInData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post('/api/v1/user/signin', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async signUp(data: SignUpData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post('/api/v1/user/signup', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBlog(): Promise<any> {
    try {
      const response = await axiosInstance.get('/api/v1/blog');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAllBlogs(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const response = await axiosInstance.get('/api/v1/blog/bulk', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createBlog(data: any): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/v1/blog/create', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBlogById(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/v1/blog/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateBlog(id: string, data: any): Promise<any> {
    try {
      const response = await axiosInstance.put(`/api/v1/blog/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteBlog(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/v1/blog/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
