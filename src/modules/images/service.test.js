const imageService = require('./service');
const imageModel = require('./model');
const cloudinary = require('cloudinary').v2;

// src/modules/images/service.test.js

jest.mock('./model');
jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            upload_stream: jest.fn()
        },
        config: jest.fn()
    }
}));

describe('imageService.uploadAndSaveImages', () => {
    const mockFiles = [
        { buffer: Buffer.from('file1'), size: 123 },
        { buffer: Buffer.from('file2'), size: 456 }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should upload files and save images, returning image ids', async () => {
        // Mock cloudinary upload_stream
        cloudinary.uploader.upload_stream.mockImplementation((options, cb) => {
            return {
                end: () => {
                    // Simulate async upload
                    setImmediate(() => cb(null, {
                        public_id: 'img123',
                        secure_url: 'https://cloudinary.com/img123.jpg',
                        format: 'jpg',
                        width: 100,
                        height: 200
                    }));
                }
            };
        });

        // Mock imageModel.createImage
        imageModel.createImage.mockResolvedValueOnce({ id: 'img123' });
        imageModel.createImage.mockResolvedValueOnce({ id: 'img123' });

        const result = await imageService.uploadAndSaveImages(mockFiles);

        expect(cloudinary.uploader.upload_stream).toHaveBeenCalledTimes(2);
        expect(imageModel.createImage).toHaveBeenCalledTimes(2);
        expect(result).toEqual(['img123', 'img123']);
    });

    it('should reject if cloudinary upload fails', async () => {
        cloudinary.uploader.upload_stream.mockImplementation((options, cb) => {
            return {
                end: () => {
                    setImmediate(() => cb(new Error('Upload failed')));
                }
            };
        });

        await expect(imageService.uploadAndSaveImages(mockFiles)).rejects.toThrow('Upload failed');
        expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    });
});