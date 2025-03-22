import { GoogleAuthService } from '../../../src/api/services/googleAuthService';
import { GoogleAuth, JWT } from 'google-auth-library';

// Mock dependencies
jest.mock('google-auth-library');

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock GoogleAuth implementation
    (GoogleAuth as unknown as jest.Mock).mockImplementation(() => {
      return {
        getClient: jest.fn().mockResolvedValue({
          getAccessToken: jest.fn().mockResolvedValue({
            token: 'mock-access-token',
            res: {
              data: {
                expires_in: 3600,
              },
            },
          }),
        }),
      };
    });
    
    // Create service instance
    service = new GoogleAuthService();
  });
  
  describe('getAccessToken', () => {
    it('should return cached token if valid', async () => {
      // Set up a valid token using private properties
      (service as any).accessToken = 'cached-token';
      (service as any).tokenExpiry = Date.now() + 3600000; // Valid for 1 hour
      
      const token = await service.getAccessToken();
      
      expect(token).toBe('cached-token');
      // Verify that getClient was not called
      expect((service as any).googleAuth.getClient).not.toHaveBeenCalled();
    });
    
    it('should get a new token if expired', async () => {
      // Set up an expired token using private properties
      (service as any).accessToken = 'expired-token';
      (service as any).tokenExpiry = Date.now() - 1000; // Expired
      
      const token = await service.getAccessToken();
      
      expect(token).toBe('mock-access-token');
      // Verify that getClient was called
      expect((service as any).googleAuth.getClient).toHaveBeenCalled();
    });
    
    it('should handle token retrieval errors', async () => {
      // Mock token retrieval error
      (service as any).googleAuth.getClient = jest.fn().mockRejectedValue(new Error('Token error'));
      
      await expect(service.getAccessToken()).rejects.toThrow('Token error');
    });
  });
});