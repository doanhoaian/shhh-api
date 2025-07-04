const cloudinary = require("cloudinary").v2;
const imageModel = require("./model");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageService = {
    async uploadAndSaveImages(files) {
        const uploadPromises = files.map(file =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        resource_type: "image",
                        folder: "shhh/posts"
                    },
                    async (error, result) => {
                        if (error) return reject(error);
                        const baseUrl = result.secure_url.split("/upload/")[0] + "/upload/";
                        const image = await imageModel.createImage({
                            id: result.public_id,
                            base_url: baseUrl,
                            format: result.format,
                            width: result.width,
                            height: result.height,
                            size: file.size || 0
                        });
                        resolve(image.id);
                    }
                );
                stream.end(file.buffer);
            })
        );
        return Promise.all(uploadPromises);
    }
};

module.exports = imageService;