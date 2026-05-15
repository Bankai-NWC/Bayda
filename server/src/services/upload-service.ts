import type { UploadApiResponse } from 'cloudinary';

import cloudinary from '../config/cloudinary.js';

class UploadService {
  async uploadImage(fileBuffer: Buffer, folder: string = 'products'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        })
        .end(fileBuffer);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}

export default new UploadService();
