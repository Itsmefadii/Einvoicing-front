export interface User {
  id: string;
  ntn: string;
  name: string;
  environment: 'sandbox' | 'production';
  email?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
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
      const expiresAt = localStorage.getItem('session_expires');

      if (token && userStr && expiresAt) {
        const user = JSON.parse(userStr);
        const expires = parseInt(expiresAt);

        if (Date.now() < expires) {
          this.session = { user, token, expiresAt: expires };
        } else {
          this.clearSession();
        }
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
      localStorage.setItem('session_expires', session.expiresAt.toString());
      
      // Also set cookie for middleware
      const maxAge = Math.floor((session.expiresAt - Date.now()) / 1000);
      document.cookie = `token=${session.token}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }
  }

  private clearSession(): void {
    this.session = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('session_expires');
      
      // Also clear cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  async login(ntn: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock login for development
      if (ntn === '1234567' && password === 'password123') {
        const user: User = {
          id: '1',
          ntn: '1234567',
          name: 'Demo Company',
          environment: 'sandbox',
          email: 'demo@company.com'
        };

        const session: AuthSession = {
          user,
          token: 'mock-jwt-token-12345',
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        this.session = session;
        this.saveSession(session);
        return { success: true };
      }

      // Real API login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ntn, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const session: AuthSession = {
          user: data.user,
          token: data.access_token,
          expiresAt: Date.now() + (data.expires_in * 1000)
        };

        this.session = session;
        this.saveSession(session);
        return { success: true };
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
    if (this.session && Date.now() < this.session.expiresAt) {
      return this.session;
    }
    
    if (this.session && Date.now() >= this.session.expiresAt) {
      this.clearSession();
    }
    
    return null;
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
          token: data.access_token,
          expiresAt: Date.now() + (data.expires_in * 1000)
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
