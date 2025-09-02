import { POST } from '@/app/api/polls/[id]/vote/route';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Mock the NextResponse.json method
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options }))
  }
}));

describe('Poll Vote API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/polls/[id]/vote', () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        item_id: 456
      })
    } as unknown as Request;
    const mockParams = { id: '123' };

    it('should create a vote successfully', async () => {
      // Mock the Supabase responses
      const mockVote = { id: 789, poll_id: 123, item_id: 456, voter_id: 'test-user-id' };
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        },
        from: jest.fn((table) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: 123, created_by: 'user-123' },
                error: null
              })
            };
          } else if (table === 'poll_items') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: 456, poll_id: 123 },
                error: null
              })
            };
          } else if (table === 'votes') {
            return {
              delete: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockVote,
                error: null
              })
            };
          }
          return {};
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest, { params: mockParams });

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockRequest.json).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('polls');
      expect(mockSupabase.from).toHaveBeenCalledWith('poll_items');
      expect(mockSupabase.from).toHaveBeenCalledWith('votes');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { vote: mockVote },
        { status: 201 }
      );
    });

    it('should handle unauthorized requests', async () => {
      // Mock unauthorized user
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Unauthorized' }
          })
        }
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('should handle invalid JSON body', async () => {
      // Mock JSON parsing error
      const mockRequestWithError = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as Request;

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        }
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequestWithError, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    });

    it('should handle invalid item_id', async () => {
      // Mock request with invalid item_id
      const mockRequestWithInvalidItemId = {
        json: jest.fn().mockResolvedValue({
          item_id: 'abc'
        })
      } as unknown as Request;

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        }
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequestWithInvalidItemId, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "'item_id' must be a number" },
        { status: 422 }
      );
    });

    it('should handle invalid poll_id', async () => {
      const invalidParams = { id: 'abc' };

      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        }
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest, { params: invalidParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "'poll_id' must be a number" },
        { status: 422 }
      );
    });

    it('should handle poll not found', async () => {
      // Mock poll not found
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        },
        from: jest.fn((table) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' }
              })
            };
          }
          return {};
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Poll not found' },
        { status: 404 }
      );
    });

    it('should handle invalid item', async () => {
      // Mock invalid item
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        },
        from: jest.fn((table) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: 123, created_by: 'user-123' },
                error: null
              })
            };
          } else if (table === 'poll_items') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: 456, poll_id: 999 }, // Different poll_id
                error: null
              })
            };
          }
          return {};
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid item' },
        { status: 400 }
      );
    });

    it('should handle database error when inserting vote', async () => {
      // Mock database error
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        },
        from: jest.fn((table) => {
          if (table === 'polls') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: 123, created_by: 'user-123' },
                error: null
              })
            };
          } else if (table === 'poll_items') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: 456, poll_id: 123 },
                error: null
              })
            };
          } else if (table === 'votes') {
            return {
              delete: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            };
          }
          return {};
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      );
    });
  });
});