// API client for backend communication
// Use Next.js API routes (same port as frontend) if available, otherwise fall back to external backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ConcreteCalculationInput {
  projectArea: number;
  floors: number;
  foundationDepth: number;
  wallThickness: number;
  slabThickness: number;
}

export interface SteelCalculationInput {
  concreteVolume: number;
  steelRatio?: number;
}

export interface CostEstimationInput {
  concreteVolume: number;
  steelWeight: number;
  concretePricePerCubicMeter: number;
  steelPricePerKg: number;
}

export interface ConcreteCalculationResult {
  totalVolume: number;
  foundationVolume: number;
  columnsVolume: number;
  slabsVolume: number;
  beamsVolume: number;
  stairsVolume: number;
  wallsVolume: number;
}

export interface SteelCalculationResult {
  totalWeight: number;
  mainSteelWeight: number;
  secondarySteelWeight: number;
  columnsSteel: number;
  beamsSteel: number;
  slabsSteel: number;
  foundationSteel: number;
}

export interface CostEstimationResult {
  concreteCost: number;
  steelCost: number;
  totalCost: number;
  costBreakdown: {
    concrete: number;
    steel: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('[API Request]', url, options.method || 'GET');
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle different types of errors
      let errorMessage = 'حدث خطأ في الاتصال بالخادم';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'فشل الاتصال بالخادم. يرجى التأكد من أن الموقع يعمل بشكل صحيح';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Concrete calculations
  async calculateConcrete(input: ConcreteCalculationInput): Promise<ApiResponse<ConcreteCalculationResult>> {
    return this.request<ConcreteCalculationResult>('/calculations/concrete', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // Steel calculations
  async calculateSteel(input: SteelCalculationInput): Promise<ApiResponse<SteelCalculationResult>> {
    return this.request<SteelCalculationResult>('/calculations/steel', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // Cost estimation
  async estimateCosts(input: CostEstimationInput): Promise<ApiResponse<CostEstimationResult>> {
    return this.request<CostEstimationResult>('/calculations/cost-estimation', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // Generate cost report
  async generateCostReport(projectId: string, calculationType: 'concrete' | 'steel', input: any): Promise<ApiResponse<any>> {
    return this.request('/calculations/generate-cost-report', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        calculationType,
        input,
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/calculations/health');
  }

  // Test server connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      if (response.success) {
        console.log('✅ Server connection successful');
        console.log('Server info:', response);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      console.error(`Make sure the backend server is running on ${API_BASE_URL.replace('/api', '')}`);
      return false;
    }
  }
}

export const apiClient = new ApiClient();
