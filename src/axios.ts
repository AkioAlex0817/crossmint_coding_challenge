import { config } from 'dotenv';
config();
import axios, { Method } from 'axios';

export const API_URL = process.env.PUBLIC_API_URL;
export const CANDIDATE_ID = process.env.PUBLIC_CANDIDATE_ID;

export const apiInstance = axios.create({
  baseURL: API_URL,
});
apiInstance.defaults.headers.common['Content-Type'] = 'application/json';

interface _FetcherConfig {
  method: Method;
  url: string;
  query?: Record<string, string | number | boolean>;
  data?: any;
}

export type FetcherConfig = _FetcherConfig;

export const fetcher = async (
  config: FetcherConfig,
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  const { method, url, query, data, ...rest } = config;
  try {
    if (data) {
      data.candidateId = CANDIDATE_ID;
    }
    const res = await apiInstance.request({
      method,
      url,
      params: query,
      data: data,
      ...rest,
    });

    return {
      success: true,
      message: 'success',
      data: res.data,
    };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      message: err.response.data?.message,
      data: {},
    };
  }
};
