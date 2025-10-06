/**
 * Environment management utilities
 * Handles sandbox vs production environment selection
 */

export type Environment = 'sandbox' | 'production';

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private currentEnvironment: Environment = 'sandbox';

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadEnvironment();
    }
  }

  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  private loadEnvironment(): void {
    try {
      // Try to determine environment from fbrTokenType
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const sellerData = user.sellerData;
          
          if (sellerData?.fbrTokenType) {
            const tokenType = sellerData.fbrTokenType.toLowerCase();
            if (tokenType === 'production') {
              this.currentEnvironment = 'production';
            } else if (tokenType === 'sandbox') {
              this.currentEnvironment = 'sandbox';
            } else {
              this.currentEnvironment = 'sandbox'; // Default fallback
            }
          } else {
            this.currentEnvironment = 'sandbox'; // Default fallback
          }
        } catch (parseError) {
          this.currentEnvironment = 'sandbox'; // Default fallback
        }
      } else {
        this.currentEnvironment = 'sandbox'; // Default fallback
      }
    } catch (error) {
      console.error('Error loading environment:', error);
      this.currentEnvironment = 'sandbox';
    }
  }

  getCurrentEnvironment(): Environment {
    return this.currentEnvironment;
  }

  async setEnvironment(environment: Environment): Promise<boolean> {
    this.currentEnvironment = environment;
    
    if (typeof window !== 'undefined') {
      try {
        // Call API to update environment
        const token = localStorage.getItem('token');
        const tokenType = environment === 'production' ? 'Production' : 'Sandbox';
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers/environment-change`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            tokenType: tokenType
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            // Update FBR token and fbrTokenType based on environment
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                const sellerData = user.sellerData;
                
                if (sellerData) {
                  if (environment === 'production' && sellerData.fbrProdToken) {
                    localStorage.setItem('fbrToken', sellerData.fbrProdToken);
                    // Update fbrTokenType in user data
                    user.sellerData.fbrTokenType = 'Production';
                    localStorage.setItem('user', JSON.stringify(user));
                  } else if (environment === 'sandbox' && sellerData.fbrSandBoxToken) {
                    localStorage.setItem('fbrToken', sellerData.fbrSandBoxToken);
                    // Update fbrTokenType in user data
                    user.sellerData.fbrTokenType = 'Sandbox';
                    localStorage.setItem('user', JSON.stringify(user));
                  }
                }
              } catch (error) {
                console.error('Error updating FBR token:', error);
              }
            }
            return true;
          } else {
            console.error('API returned unsuccessful response:', data);
            return false;
          }
        } else {
          const errorData = await response.json();
          console.error('API call failed:', errorData);
          return false;
        }
      } catch (error) {
        console.error('Error changing environment:', error);
        return false;
      }
    }
    
    return false;
  }

  isProduction(): boolean {
    return this.currentEnvironment === 'production';
  }

  isSandbox(): boolean {
    return this.currentEnvironment === 'sandbox';
  }

  getApiEndpoint(): string {
    return this.currentEnvironment === 'production' 
      ? 'https://api.fbr.gov.pk/production'
      : 'https://api.fbr.gov.pk/sandbox';
  }

  getEnvironmentDisplayName(): string {
    return this.currentEnvironment === 'production' ? 'Production' : 'Sandbox';
  }

  getEnvironmentColor(): string {
    return this.currentEnvironment === 'production' ? 'red' : 'yellow';
  }

  getEnvironmentDescription(): string {
    return this.currentEnvironment === 'production'
      ? 'Live FBR integration - Real invoices will be submitted'
      : 'Test environment - Safe for testing and development';
  }
}

export const environmentManager = EnvironmentManager.getInstance();

// Helper functions for easy access
export const getCurrentEnvironment = (): Environment => environmentManager.getCurrentEnvironment();
export const isProduction = (): boolean => environmentManager.isProduction();
export const isSandbox = (): boolean => environmentManager.isSandbox();
export const getApiEndpoint = (): string => environmentManager.getApiEndpoint();
