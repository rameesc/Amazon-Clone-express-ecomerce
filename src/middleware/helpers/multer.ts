
import path from "path"
import multer from "multer"
import fs from "fs"


// Helper function to ensure directory exists
const ensureDirectoryExists = (directoryPath:string) => {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  };

  // Base upload path (using absolute path for reliability)
const baseUploadPath = path.join(process.cwd(), 'public', 'uploads');

//user

const storageByUser = multer.diskStorage({
    destination:((req,file,cb)=>{

        cb(null,'public/uploads/user')
    }),
    filename:((req,file,cb)=>{
        cb(null,file.fieldname+'-'+req.authUser?._id+'-'+Date.now()+'-'+path.extname(file.originalname))

    })
})

//admin s
const storage = multer.diskStorage({
    destination:((req,file,cb)=>{

        cb(null,'public/uploads/admin')
    }),
    filename:((req,file,cb)=>{
        cb(null,file.fieldname+'-'+req.admin._id+'-'+Date.now()+'-'+path.extname(file.originalname))

    })
})

//superadmin s
const storageBySuperAdmin = multer.diskStorage({
    destination:((req,file,cb)=>{

        cb(null,'./public/uploads')

        
    }),
    filename:((req,file,cb)=>{
        cb(null,file.fieldname+'-'+req.authUser?.role +'-'+req.authUser?._id+'-'+Date.now()+'-'+path.extname(file.originalname))

    })
    
})

//banner
const storageBanner = multer.diskStorage({
    destination:((req,file,cb)=>{

        cb(null,'./public/uploads/banner')

        
    }),
    filename:((req,file,cb)=>{
        cb(null,file.fieldname+'-'+Date.now()+'-'+path.extname(file.originalname))

    })
    
})

//product image
const productImagesUpload = multer.diskStorage({
    destination:((req,file,cb)=>{

        cb(null,'./public/uploads/product')

        
    }),
    filename:((req,file,cb)=>{
        cb(null,file.fieldname+'-'+req.admin._id+'-'+Date.now()+'-'+path.extname(file.originalname))
       

    })
    
})
//category image
const categoryImagesUpload = multer.diskStorage({
    destination:((req,file,cb)=>{

        const uploadPath = path.join(baseUploadPath,'category')
        ensureDirectoryExists(uploadPath);
        

       

        cb(null,uploadPath)

        
    }),
    filename:((req,file,cb)=>{
        cb(null,file.fieldname+'-'+Date.now()+'-'+path.extname(file.originalname))
       

    })
    
})


const limits={fileSize:1480*3230}

export const uploadUserPhoto=multer({storage:storageByUser,limits:limits}).single("photo");

export const uploadAdminphoto=multer({storage:storage,limits:limits}).single("admin")
export const uploadAdminDoc=multer({storage:storage,limits:limits}).single("doc")

export const uploadBannerPhoto=multer({storage:storageBanner,limits:limits}).single("banner")

export const uploadProductsImages=multer({storage:productImagesUpload}).array("productImages",4)

export const uploadCategoryImage=multer({storage:categoryImagesUpload,limits:limits}).single("category")