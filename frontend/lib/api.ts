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

// UI Monitoring interfaces
export interface UiMonitoringItem {
  client_id: string;
  report_id: string;
  monitoring_id: number | string;
  timestamp: string;
  app: string;
  window: string;
  text?: string;
  text_output?: string;
  text_length: number;
  metadata?: Record<string, unknown>;
  platform?: string;
  os?: string;
  os_version?: string;
  hostname?: string;
  initial_traversal_at?: string;
  extracted_at?: string;
  app_version?: string;
  reporting_period_start?: string;
  reporting_period_end?: string;
}

export interface UiMonitoringResponse {
  items: UiMonitoringItem[];
  total: number;
}

export interface UiMonitoringQueryParams {
  client_id?: string;
  app?: string;
  window?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}

// UI Monitoring API functions
export async function getUiMonitoring(params: UiMonitoringQueryParams): Promise<UiMonitoringResponse> {
  const response = await api.get('/query/ui-monitoring', { params });
  return response.data;
}

export async function getUiMonitoringApps(clientId?: string): Promise<string[]> {
  const params = clientId ? { client_id: clientId } : {};
  const response = await api.get('/query/ui-monitoring/apps', { params });
  return response.data;
}

export async function getUiMonitoringWindows(clientId?: string, app?: string): Promise<string[]> {
  const params: Record<string, string> = {};
  if (clientId) params.client_id = clientId;
  if (app) params.app = app;

  const response = await api.get('/query/ui-monitoring/windows', { params });
  return response.data;
}

// 工作时间分析接口
export interface TimeUsageItem {
  user_id: string;
  app_name: string;
  window_name: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  is_active: boolean;
  category?: string;
  productivity_type?: string;
}

export interface UsageBreakdown {
  productive: number;
  non_productive: number;
  neutral: number;
}

export interface TimeUsageSummary {
  total_time_seconds: number;
  productive_time_seconds: number;
  non_productive_time_seconds: number;
  neutral_time_seconds: number;
  productivity_score: number;
  daily_usage: Record<string, UsageBreakdown>;
  hourly_usage: Record<string, UsageBreakdown>;
}

export interface TimeUsageResponse {
  items: TimeUsageItem[];
  summary: TimeUsageSummary;
  total: number;
}

export interface TimeUsageQueryParams {
  user_id?: string;
  start_date?: string;
  end_date?: string;
  app_name?: string;
  category?: string;
  group_by?: 'hour' | 'day' | 'week' | 'month';
  page?: number;
  page_size?: number;
}

// 应用使用分析接口
export interface AppUsageItem {
  app_name: string;
  total_time_seconds: number;
  percentage: number;
  session_count: number;
  avg_session_time: number;
  category?: string;
  productivity_type?: string;
  icon_path?: string;
}

export interface AppCategoryUsage {
  category: string;
  total_time_seconds: number;
  percentage: number;
  apps: string[];
}

export interface AppUsageResponse {
  apps: AppUsageItem[];
  categories: AppCategoryUsage[];
  total_time_seconds: number;
}

export interface AppUsageQueryParams {
  user_id?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  limit?: number;
}

// 生产力评分接口
export interface ProductivityScore {
  date: string;
  score: number;
  productive_time_seconds: number;
  non_productive_time_seconds: number;
  neutral_time_seconds: number;
  total_time_seconds: number;
}

export interface ProductivityTrend {
  dates: string[];
  scores: number[];
  productive_times: number[];
  non_productive_times: number[];
  neutral_times: number[];
  total_times: number[];
  avg_score: number;
  max_score: number;
  min_score: number;
}

export interface ProductivityResponse {
  current: ProductivityScore;
  trend: ProductivityTrend;
  top_productive_apps: AppUsageItem[];
  top_non_productive_apps: AppUsageItem[];
}

export interface ProductivityQueryParams {
  user_id?: string;
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month';
}

// API 函数
export async function getTimeUsage(params: TimeUsageQueryParams): Promise<TimeUsageResponse> {
  const response = await api.get('/productivity/time-usage', { params });
  return response.data;
}

export async function getAppUsage(params: AppUsageQueryParams): Promise<AppUsageResponse> {
  const response = await api.get('/productivity/app-usage', { params });
  return response.data;
}

export async function getProductivityScore(params: ProductivityQueryParams): Promise<ProductivityResponse> {
  const response = await api.get('/productivity/score', { params });
  return response.data;
}

export async function getAppCategories(): Promise<{ id: number, name: string, productivity_type: string }[]> {
  const response = await api.get('/productivity/categories');
  return response.data;
}

// OCR文本接口
export interface OcrTextItem {
  client_id: string;
  report_id: string;
  frame_id: number | string;
  timestamp: string;
  app_name: string;
  window_name: string;
  text: string;
  focused: boolean;
  text_length: number;
  platform?: string;
  os?: string;
  os_version?: string;
  hostname?: string;
  extracted_at?: string;
  app_version?: string;
  reporting_period_start?: string;
  reporting_period_end?: string;
}

export interface OcrTextResponse {
  items: OcrTextItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface OcrTextQueryParams {
  client_id?: string;
  app_name?: string;
  window_name?: string;
  focused?: boolean;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
  sort_order?: 'asc' | 'desc';
}

// OCR文本API函数
export async function getOcrText(params: OcrTextQueryParams): Promise<OcrTextResponse> {
  const queryParams: Record<string, any> = {
    ...params,
    limit: params.pageSize,
    offset: params.pageSize ? (params.page ? (params.page - 1) * params.pageSize : 0) : 0
  };
  
  // 删除前端特定的参数
  delete queryParams.page;
  delete queryParams.pageSize;
  
  const response = await api.get('/query/ocr-text', { params: queryParams });
  return response.data;
}

export async function getOcrTextApps(clientId?: string): Promise<string[]> {
  const params = clientId ? { client_id: clientId } : {};
  const response = await api.get('/query/ocr-text/apps', { params });
  return response.data;
}

export async function getOcrTextWindows(clientId?: string, appName?: string): Promise<string[]> {
  const params: Record<string, string> = {};
  if (clientId) params.client_id = clientId;
  if (appName) params.app_name = appName;

  const response = await api.get('/query/ocr-text/windows', { params });
  return response.data;
} 