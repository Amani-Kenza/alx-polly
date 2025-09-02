// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the Next.js headers function
jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Map()),
}));

// Mock the Supabase client
jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [],
          error: null
        })),
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          })),
          order: jest.fn(() => ({
            data: [],
            error: null
          })),
          data: [],
          error: null
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: '123' },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: '123' },
              error: null
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null
        }))
      }))
    })),
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    }
  }))
}));