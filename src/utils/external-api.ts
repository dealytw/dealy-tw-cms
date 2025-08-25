/**
 * External API Integration Utilities
 * Handles integrations with third-party services
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface ExternalApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export class ExternalApiClient {
  protected config: ExternalApiConfig;
  private defaultHeaders: Record<string, string>;

  constructor(config: ExternalApiConfig) {
    this.config = {
      timeout: 10000,
      retries: 3,
      ...config
    };
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Dealy-TW-CMS/1.0'
    };

    if (this.config.apiKey) {
      this.defaultHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
  }

  /**
   * Make a GET request to external API
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.config.baseUrl);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.defaultHeaders,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data: data as T, statusCode: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      };
    }
  }

  /**
   * Make a POST request to external API
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.config.baseUrl);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      return { success: true, data: responseData as T, statusCode: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      };
    }
  }

  /**
   * Make a PUT request to external API
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.config.baseUrl);
      
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout!)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      return { success: true, data: responseData as T, statusCode: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      };
    }
  }

  /**
   * Make a request with retry logic
   */
  async requestWithRetry<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        const response = method === 'GET' 
          ? await this.get<T>(endpoint, params)
          : await this.post<T>(endpoint, data);
        
        if (response.success) {
          return response;
        }
        
        lastError = response.error;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < this.config.retries!) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    return { 
      success: false, 
      error: `Failed after ${this.config.retries} attempts. Last error: ${lastError}`,
      statusCode: 500
    };
  }
}

/**
 * Specific API integrations
 */

// Google Analytics API integration
export class GoogleAnalyticsAPI extends ExternalApiClient {
  constructor(apiKey: string) {
    super({
      baseUrl: 'https://analyticsdata.googleapis.com/v1beta',
      apiKey,
      timeout: 15000
    });
  }

  async getPageViews(propertyId: string, startDate: string, endDate: string) {
    return this.post('/properties:runReport', {
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'screenPageViews' }],
      dimensions: [{ name: 'pagePath' }]
    });
  }
}

// Facebook Marketing API integration
export class FacebookMarketingAPI extends ExternalApiClient {
  constructor(accessToken: string) {
    super({
      baseUrl: 'https://graph.facebook.com/v18.0',
      apiKey: accessToken,
      timeout: 20000
    });
  }

  async getAdInsights(adAccountId: string, startDate: string, endDate: string) {
    return this.get(`/act_${adAccountId}/insights`, {
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      fields: 'impressions,clicks,spend,actions'
    });
  }
}

// Email Marketing API integration (Mailchimp)
export class MailchimpAPI extends ExternalApiClient {
  constructor(apiKey: string, serverPrefix: string) {
    super({
      baseUrl: `https://${serverPrefix}.api.mailchimp.com/3.0`,
      apiKey,
      timeout: 15000
    });
  }

  async addSubscriberToList(listId: string, email: string, mergeFields?: Record<string, any>) {
    return this.post(`/lists/${listId}/members`, {
      email_address: email,
      status: 'subscribed',
      merge_fields: mergeFields
    });
  }

  async sendCampaign(listId: string, subject: string, content: string) {
    // Create campaign
    const campaign = await this.post<{ id: string }>('/campaigns', {
      type: 'regular',
      recipients: { list_id: listId },
      settings: {
        subject_line: subject,
        title: subject,
        from_name: 'Dealy TW',
        reply_to: 'noreply@dealy.tw'
      }
    });

    if (!campaign.success || !campaign.data?.id) {
      return campaign;
    }

    // Set campaign content
    const contentResponse = await this.put(`/campaigns/${campaign.data.id}/content`, {
      html: content
    });

    if (!contentResponse.success) {
      return contentResponse;
    }

    // Send campaign
    return this.post(`/campaigns/${campaign.data.id}/actions/send`);
  }
}

// Payment Gateway API integration (Stripe)
export class StripeAPI extends ExternalApiClient {
  constructor(secretKey: string) {
    super({
      baseUrl: 'https://api.stripe.com/v1',
      apiKey: secretKey,
      timeout: 30000
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'twd', metadata?: Record<string, any>) {
    return this.post('/payment_intents', {
      amount,
      currency,
      metadata
    });
  }

  async createCustomer(email: string, name?: string, metadata?: Record<string, any>) {
    return this.post('/customers', {
      email,
      name,
      metadata
    });
  }
}

// Social Media API integration (Twitter)
export class TwitterAPI extends ExternalApiClient {
  constructor(bearerToken: string) {
    super({
      baseUrl: 'https://api.twitter.com/2',
      apiKey: bearerToken,
      timeout: 15000
    });
  }

  async postTweet(text: string) {
    return this.post('/tweets', { text });
  }

  async getTweetMetrics(tweetId: string) {
    return this.get(`/tweets/${tweetId}`, {
      'tweet.fields': 'public_metrics,created_at'
    });
  }
}

// Weather API integration (OpenWeatherMap)
export class WeatherAPI extends ExternalApiClient {
  constructor(apiKey: string) {
    super({
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      apiKey,
      timeout: 10000
    });
  }

  async getCurrentWeather(city: string, countryCode: string = 'TW') {
    return this.get('/weather', {
      q: `${city},${countryCode}`,
      appid: this.config.apiKey,
      units: 'metric'
    });
  }
}

// Currency Exchange API integration
export class CurrencyAPI extends ExternalApiClient {
  constructor(apiKey: string) {
    super({
      baseUrl: 'https://api.exchangerate-api.com/v4',
      apiKey,
      timeout: 10000
    });
  }

  async getExchangeRate(from: string, to: string) {
    return this.get(`/latest/${from}`);
  }
}

/**
 * Utility functions for common API operations
 */

export async function validateApiKey(apiClient: ExternalApiClient, testEndpoint: string): Promise<boolean> {
  try {
    const response = await apiClient.get(testEndpoint);
    return response.success;
  } catch {
    return false;
  }
}

export function formatApiError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Unknown API error occurred';
}

export function sanitizeApiData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      sanitized[key] = typeof value === 'object' ? sanitizeApiData(value) : value;
    }
  }
  
  return sanitized;
}
