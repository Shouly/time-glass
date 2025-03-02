import axios from 'axios';

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 生产力类型枚举
export enum ProductivityType {
  PRODUCTIVE = 'PRODUCTIVE',
  NEUTRAL = 'NEUTRAL',
  DISTRACTING = 'DISTRACTING'
}

// 应用类别接口
export interface AppCategory {
  id: number;
  name: string;
  productivity_type: ProductivityType;
  created_at: string;
}

export interface AppCategoryCreate {
  name: string;
  productivity_type: ProductivityType;
}

// 应用使用时间接口
export interface HourlyAppUsage {
  id: number;
  app_name: string;
  category_id: number;
  usage_date: string;
  hour: number;
  duration_minutes: number;
  created_at: string;
}

export interface HourlyAppUsageCreate {
  app_name: string;
  category_id: number;
  usage_date: string;
  hour: number;
  duration_minutes: number;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// 生产力摘要接口
export interface ProductivitySummary {
  start_date: string;
  end_date: string;
  productive_minutes: number;
  neutral_minutes: number;
  distracting_minutes: number;
  total_minutes: number;
  productive_percentage: number;
  neutral_percentage: number;
  distracting_percentage: number;
}

// 每日应用使用统计接口
export interface DailyAppUsage {
  date: string;
  app_name: string;
  category_id: number;
  category_name: string;
  productivity_type: ProductivityType;
  total_minutes: number;
}

// 小时应用使用统计接口
export interface HourlyUsageSummary {
  hour: string;
  productive: number;
  neutral: number;
  distracting: number;
}

// 按应用分组的小时使用统计接口
export interface HourlyAppUsageSummary {
  hour: string;
  app_name: string;
  duration_minutes: number;
  productivity_type: ProductivityType;
}

// 应用类别API函数
export async function createAppCategory(category: AppCategoryCreate): Promise<AppCategory> {
  const response = await api.post('/app-usage/categories', category);
  return response.data;
}

export async function getAppCategories(
  page: number = 1,
  pageSize: number = 100,
  productivityType?: ProductivityType
): Promise<PaginatedResponse<AppCategory>> {
  const params: Record<string, any> = {
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };

  if (productivityType) {
    params.productivity_type = productivityType;
  }

  const response = await api.get('/app-usage/categories', { params });
  return response.data;
}

export async function getAppCategory(id: number): Promise<AppCategory> {
  const response = await api.get(`/app-usage/categories/${id}`);
  return response.data;
}

export async function updateAppCategory(id: number, category: AppCategoryCreate): Promise<AppCategory> {
  const response = await api.put(`/app-usage/categories/${id}`, category);
  return response.data;
}

export async function deleteAppCategory(id: number): Promise<{ status: string; message: string }> {
  const response = await api.delete(`/app-usage/categories/${id}`);
  return response.data;
}

// 应用使用时间API函数
export async function recordAppUsage(usage: HourlyAppUsageCreate): Promise<HourlyAppUsage> {
  const response = await api.post('/app-usage/usage', usage);
  return response.data;
}

export async function getAppUsage(
  startDate: string,
  endDate: string,
  appName?: string,
  categoryId?: number,
  page: number = 1,
  pageSize: number = 100
): Promise<PaginatedResponse<HourlyAppUsage>> {
  const params: Record<string, any> = {
    start_date: startDate,
    end_date: endDate,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };

  if (appName) {
    params.app_name = appName;
  }

  if (categoryId) {
    params.category_id = categoryId;
  }

  const response = await api.get('/app-usage/usage', { params });
  return response.data;
}

// 生产力统计API函数
export async function getProductivitySummary(
  startDate: string,
  endDate: string
): Promise<ProductivitySummary> {
  const params = {
    start_date: startDate,
    end_date: endDate,
  };

  const response = await api.get('/app-usage/productivity-summary', { params });
  return response.data;
}

// 每日应用使用统计API函数
export async function getDailyAppUsage(
  startDate: string,
  endDate: string
): Promise<DailyAppUsage[]> {
  const params = {
    start_date: startDate,
    end_date: endDate,
  };

  const response = await api.get('/app-usage/daily-usage', { params });
  return response.data;
}

// 按应用分组的小时使用统计API函数
export async function getHourlyAppUsage(
  date: string
): Promise<HourlyAppUsageSummary[]> {
  const params = {
    date: date,
  };

  console.log('调用API: /app-usage/hourly-app-usage，参数:', params);
  console.log('完整URL:', `${API_BASE_URL}/app-usage/hourly-app-usage?date=${date}`);

  try {
    const response = await api.get('/app-usage/hourly-app-usage', { params });
    console.log('API响应状态:', response.status);
    return response.data;
  } catch (error) {
    console.error('API调用失败:', error);
    if (axios.isAxiosError(error)) {
      console.error('请求URL:', error.config?.url);
      console.error('请求参数:', error.config?.params);
      console.error('响应状态:', error.response?.status);
      console.error('响应数据:', error.response?.data);
    }
    throw error;
  }
}

// 导出所有API函数
export const AppUsageApi = {
  createAppCategory,
  getAppCategories,
  getAppCategory,
  updateAppCategory,
  deleteAppCategory,
  recordAppUsage,
  getAppUsage,
  getProductivitySummary,
  getDailyAppUsage,
  getHourlyAppUsage,
}; 