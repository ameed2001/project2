// API client for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ في الاتصال بالخادم'
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
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();
