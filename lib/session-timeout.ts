import { authManager } from './auth';

class SessionTimeoutManager {
  private static instance: SessionTimeoutManager;
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private readonly SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

  private constructor() {
    this.startSessionMonitoring();
  }

  static getInstance(): SessionTimeoutManager {
    if (!SessionTimeoutManager.instance) {
      SessionTimeoutManager.instance = new SessionTimeoutManager();
    }
    return SessionTimeoutManager.instance;
  }

  private startSessionMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Check session every minute
    setInterval(() => {
      const session = authManager.getSession();
      if (!session) {
        this.handleSessionExpired();
        return;
      }

      const timeUntilExpiry = session.expiresAt - Date.now();
      
      // Show warning 5 minutes before expiry
      if (timeUntilExpiry <= this.SESSION_WARNING_TIME && timeUntilExpiry > 0) {
        this.showSessionWarning(timeUntilExpiry);
      }
      
      // Session expired
      if (timeUntilExpiry <= 0) {
        this.handleSessionExpired();
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  private showSessionWarning(timeUntilExpiry: number): void {
    if (this.warningTimeoutId) return; // Already showing warning

    const minutes = Math.ceil(timeUntilExpiry / (60 * 1000));
    
    // Create warning modal
    const modal = document.createElement('div');
    modal.id = 'session-warning-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Session Expiring Soon</h3>
        <p class="text-gray-600 mb-6">
          Your session will expire in ${minutes} minute${minutes > 1 ? 's' : ''}. 
          Would you like to extend your session?
        </p>
        <div class="flex gap-3">
          <button id="extend-session" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Extend Session
          </button>
          <button id="logout-now" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
            Logout Now
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('extend-session')?.addEventListener('click', () => {
      this.extendSession();
      this.removeWarningModal();
    });

    document.getElementById('logout-now')?.addEventListener('click', () => {
      this.handleSessionExpired();
      this.removeWarningModal();
    });

    // Auto-remove warning after session expires
    this.warningTimeoutId = setTimeout(() => {
      this.removeWarningModal();
    }, timeUntilExpiry);
  }

  private removeWarningModal(): void {
    const modal = document.getElementById('session-warning-modal');
    if (modal) {
      modal.remove();
    }
    this.warningTimeoutId = null;
  }

  private async extendSession(): Promise<void> {
    try {
      const success = await authManager.refreshToken();
      if (!success) {
        this.handleSessionExpired();
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      this.handleSessionExpired();
    }
  }

  private handleSessionExpired(): void {
    authManager.logout();
    
    // Show expired session modal
    const modal = document.createElement('div');
    modal.id = 'session-expired-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Session Expired</h3>
        <p class="text-gray-600 mb-6">
          Your session has expired. Please log in again to continue.
        </p>
        <button id="go-to-login" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Go to Login
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('go-to-login')?.addEventListener('click', () => {
      window.location.href = '/login';
    });
  }

  public resetWarning(): void {
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
    this.removeWarningModal();
  }
}

export const sessionTimeoutManager = SessionTimeoutManager.getInstance();
