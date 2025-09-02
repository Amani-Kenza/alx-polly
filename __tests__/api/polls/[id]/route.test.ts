import { GET, PATCH, DELETE } from '@/app/api/polls/[id]/route';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Mock the NextResponse.json method
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options }))
  }
}));

describe('Poll ID API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/polls/[id]', () => {
    const mockRequest = {} as Request;
    const mockParams = Promise.resolve({ id: '123' });

    it('should return a specific poll', async () => {
      // Mock the Supabase response
      const mockPoll = { id: 123, question: 'Test Poll' };
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPoll,
          error: null
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await GET(mockRequest, { params: mockParams });

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('polls');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 123);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({ poll: mockPoll });
    });

    it('should handle invalid poll id', async () => {
      const invalidParams = Promise.resolve({ id: 'abc' });

      // Call the handler
      await GET(mockRequest, { params: invalidParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid poll id' },
        { status: 400 }
      );
    });

    it('should handle poll not found', async () => {
      // Mock the Supabase error response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await GET(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Not found' },
        { status: 404 }
      );
    });
  });

  describe('PATCH /api/polls/[id]', () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        question: 'Updated Question',
        description: 'Updated Description'
      })
    } as unknown as Request;
    const mockParams = Promise.resolve({ id: '123' });

    it('should update a poll', async () => {
      // Mock the Supabase response
      const mockUpdatedPoll = { id: 123, question: 'Updated Question', description: 'Updated Description' };
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedPoll,
          error: null
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await PATCH(mockRequest, { params: mockParams });

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockRequest.json).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('polls');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        question: 'Updated Question',
        description: 'Updated Description'
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 123);
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({ poll: mockUpdatedPoll });
    });

    it('should handle invalid JSON body', async () => {
      // Mock JSON parsing error
      const mockRequestWithError = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as Request;

      // Call the handler
      await PATCH(mockRequestWithError, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    });

    it('should handle invalid poll id', async () => {
      const invalidParams = Promise.resolve({ id: 'abc' });

      // Call the handler
      await PATCH(mockRequest, { params: invalidParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid poll id' },
        { status: 400 }
      );
    });

    it('should handle database error', async () => {
      // Mock the Supabase error response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await PATCH(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      );
    });
  });

  describe('DELETE /api/polls/[id]', () => {
    const mockRequest = {} as Request;
    const mockParams = Promise.resolve({ id: '123' });

    it('should delete a poll', async () => {
      // Mock the Supabase response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await DELETE(mockRequest, { params: mockParams });

      // Assertions
      expect(createServerSupabaseClient).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('polls');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 123);
      expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle invalid poll id', async () => {
      const invalidParams = Promise.resolve({ id: 'abc' });

      // Call the handler
      await DELETE(mockRequest, { params: invalidParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid poll id' },
        { status: 400 }
      );
    });

    it('should handle database error', async () => {
      // Mock the Supabase error response
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Database error' }
        })
      };
      (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      // Call the handler
      await DELETE(mockRequest, { params: mockParams });

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Database error' },
        { status: 500 }
      );
    });
  });
});