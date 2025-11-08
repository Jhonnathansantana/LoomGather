// tests/auth.test.js
import { signInUser } from '../src/auth.js';
import { supabase } from '../src/supabaseClient.js';

// Mock the supabase client
jest.mock('../src/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('signInUser', () => {
  it('should return the session on successful login', async () => {
    // Simulate a successful login
    const mockSession = { user: { id: '123' }, session: { access_token: 'abc' } };
    supabase.auth.signInWithPassword.mockResolvedValue({ data: mockSession, error: null });

    const { data, error } = await signInUser('test@example.com', 'password');

    expect(error).toBeNull();
    expect(data).toEqual(mockSession);
  });
});
