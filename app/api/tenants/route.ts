import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For tenant creation, we should use the /auth/register endpoint instead of /tenants
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      // Handle validation errors
      if (response.status === 400) {
        return NextResponse.json(
          { 
            message: 'Validation failed',
            error: error.message || 'Invalid data provided',
            status: 'validation_error'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          message: error.message || 'Failed to create tenant',
          status: 'error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Tenant creation error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const url = `${API_BASE_URL}/tenants`;
    console.log('Frontend API: Attempting to fetch tenants from:', url);
    console.log('Frontend API: API_BASE_URL:', API_BASE_URL);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Frontend API: Response status:', response.status);
    console.log('Frontend API: Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('Frontend API: Error response:', error);
      
      // Handle authentication errors gracefully
      if (response.status === 401) {
        return NextResponse.json(
          { 
            message: 'Authentication required',
            error: 'Please log in to access tenant data',
            status: 'unauthorized'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          message: error.message || 'Failed to fetch tenants',
          status: 'error',
          backendStatus: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Frontend API: Success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Frontend API: Tenant fetch error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
