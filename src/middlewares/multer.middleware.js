import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); // Specify the directory to store uploaded files
  },
  filename: (req, file, cb) => {
    // we ignore this below line for now
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9); // Create a unique suffix for the filename
    //cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname); // Create a unique filename
    cb(null, file.originalname); // Use the original filename 
},
});

export const upload = multer({
  storage: storage, 
})
