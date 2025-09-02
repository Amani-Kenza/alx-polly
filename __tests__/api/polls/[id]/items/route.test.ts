import { GET, POST } from '@/app/api/polls/[id]/items/route';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Mock the NextResponse.json method
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options }))
  }
}));

describe('Poll Items API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/polls/[id]/items', () => {
    const mockRequest = {} as Request;
    const mockParams = { id: '123' };

    it('should return all items for a poll', async () => {
      // Mock the Supabase response
      const mockItems = [
        { id: 1, poll_id: '123', label: 'Option 1' },
        { id: 2, poll_id: '123', label: 'Option 2' }
      ];
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockItems,
          error: null
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await GET(mockRequest, { params: mockParams });

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('poll_items');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('poll_id', '123');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(NextResponse.json).toHaveBeenCalledWith({ items: mockItems });
    });

    it('should handle database error', async () => {
      // Mock the Supabase error response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await GET(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      );
    });
  });

  describe('POST /api/polls/[id]/items', () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        label: 'New Option'
      })
    } as unknown as Request;
    const mockParams = { id: '123' };

    it('should create a new poll item', async () => {
      // Mock the Supabase response
      const mockItem = { id: 3, poll_id: '123', label: 'New Option' };
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockItem,
          error: null
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await POST(mockRequest, { params: mockParams });

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockRequest.json).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('poll_items');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        poll_id: '123',
        label: 'New Option'
      });
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { item: mockItem },
        { status: 201 }
      );
    });

    it('should handle invalid JSON body', async () => {
      // Mock JSON parsing error
      const mockRequestWithError = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as Request;

      // Call the handler
      await POST(mockRequestWithError, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    });

    it('should handle missing label', async () => {
      // Mock request with empty label
      const mockRequestWithEmptyLabel = {
        json: jest.fn().mockResolvedValue({
          label: ''
        })
      } as unknown as Request;

      // Call the handler
      await POST(mockRequestWithEmptyLabel, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "'label' is required" },
        { status: 422 }
      );
    });

    it('should handle database error', async () => {
      // Mock the Supabase error response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
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