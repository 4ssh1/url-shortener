export interface Link {
  id: string;
  originalUrl: string;
  shortUrl: string;
  backHalf: string;
  clicks: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkRequest {
  url: string;
  customBackHalf?: string;
}

export interface CreateLinkResponse {
  success: boolean;
  data: Link;
  message?: string;
}

export interface LinksResponse {
  success: boolean;
  data: Link[];
  message?: string;
}

export interface LinkAnalytics {
  linkId: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: {
    date: string;
    clicks: number;
  }[];
  clicksByCountry: {
    country: string;
    clicks: number;
  }[];
  clicksByDevice: {
    device: string;
    clicks: number;
  }[];
  clicksByBrowser: {
    browser: string;
    clicks: number;
  }[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: LinkAnalytics;
  message?: string;
}

export interface DeleteLinkResponse {
  success: boolean;
  message?: string;
}