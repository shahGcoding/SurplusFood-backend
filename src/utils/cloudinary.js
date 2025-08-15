import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error("File path is required for upload");
        }
        // Upload the file to Cloudinary
           const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto", // Automatically detect the resource type
           // Optional specify a folder in Cloudinary
           })
        
          fs.unlinkSync(filePath); // Delete the file from local storage
          
            
           return response

    } catch (error) {
        fs.unlinkSync(filePath); // Delete the file from local storage
        console.error("Error uploading file to Cloudinary:", error);
        throw error; // Rethrow the error for further handling   
    }
}

export { uploadOnCloudinary };