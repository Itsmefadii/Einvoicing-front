export interface Permission {
  id: number;
  key: string;
  label: string;
  path: string;
  icon: string | null;
  position: number;
  isRender: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  roleId: number;
  roleName: string;
  sellerId: number | null;
  sellerData?: {
    id: number;
    sellerCode: string;
    businessName: string;
    ntnCnic: string;
    businessNatureId: number;
    businessNature: string;
    industryId: number;
    industryName: string;
    address1: string;
    address2: string;
    city: string;
    stateId: number;
    state: string;
    postalCode: string;
    businessPhone: string;
    businessEmail: string;
    fbrSandBoxToken: string;
    fbrProdToken: string;
    logoUrl: string | null;
    isActive: boolean;
  };
  permissions: Permission[];
}

export interface AuthSession {
  user: User;
  token: string;
}

class AuthManager {
  private static instance: AuthManager;
  private session: AuthSession | null = null;

  private constructor() {
    // Initialize session from localStorage if available
    if (typeof window !== 'undefined') {
      this.loadSession();
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadSession(): void {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.session = { user, token };
      }
    } catch (error) {
      console.error('Error loading session:', error);
      this.clearSession();
    }
  }

  private saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));
      
      // Also set cookie for middleware (no expiry)
      document.cookie = `token=${session.token}; path=/; SameSite=Strict`;
    }
  }

  private clearSession(): void {
    this.session = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Also clear cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const session: AuthSession = {
            user: data.data.user,
            token: data.data.token
          };

          this.session = session;
          this.saveSession(session);
          return { success: true };
        } else {
          return { success: false, error: data.message || 'Login failed' };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  logout(): void {
    this.clearSession();
  }

  getSession(): AuthSession | null {
    return this.session;
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }

  getToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const session: AuthSession = {
          user: data.user,
          token: data.access_token
        };

        this.session = session;
        this.saveSession(session);
        return true;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }

    return false;
  }
}

export const authManager = AuthManager.getInstance();
