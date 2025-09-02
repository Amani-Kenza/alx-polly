import { GET, POST } from '@/app/api/polls/route';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Mock the NextResponse.json method
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options }))
  }
}));

describe('Polls API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/polls', () => {
    it('should return all polls', async () => {
      // Mock the Supabase response
      const mockPolls = [{ id: '1', question: 'Test Poll' }];
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPolls,
          error: null
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await GET();

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('polls');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(NextResponse.json).toHaveBeenCalledWith({ polls: mockPolls });
    });

    it('should handle errors', async () => {
      // Mock the Supabase error response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await GET();

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      );
    });
  });

  describe('POST /api/polls', () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        question: 'Test Question',
        description: 'Test Description',
        options: ['Option 1', 'Option 2']
      })
    } as unknown as Request;

    it('should create a new poll with options', async () => {
      // Mock the Supabase responses
      const mockPoll = { id: '123', question: 'Test Question', description: 'Test Description' };
      const mockSupabase = {
        from: jest.fn((table) => {
          if (table === 'polls') {
            return {
              insert: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockPoll,
                error: null
              })
            };
          } else if (table === 'poll_items') {
            return {
              insert: jest.fn().mockResolvedValue({
                data: null,
                error: null
              })
            };
          }
          return {};
        }),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        }
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest);

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockRequest.json).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('polls');
      expect(mockSupabase.from).toHaveBeenCalledWith('poll_items');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { poll: mockPoll },
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
      await POST(mockRequest);

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
      await POST(mockRequestWithError);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    });

    it('should handle missing question', async () => {
      // Mock request with empty question
      const mockRequestWithEmptyQuestion = {
        json: jest.fn().mockResolvedValue({
          question: '',
          description: 'Test Description'
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
      await POST(mockRequestWithEmptyQuestion);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "'question' is required" },
        { status: 422 }
      );
    });

    it('should handle database error when creating poll', async () => {
      // Mock database error
      const mockSupabase = {
        from: jest.fn(() => ({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
          })
        }
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      );
    });
  });
});