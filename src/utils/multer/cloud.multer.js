import multer from "multer";


export const fileValidation={
    image: ['image/gif','image/jpeg','image/png'],
    document:['application/pdf']
}
export const cloudFileUpload=({validation=[],maxSize=3*1024*1024}={})=>{
   
    const storage =multer.diskStorage({

    })

    const fileFilter = function(req,file,callback){
        if(validation.includes(file.mimetype)){
            
            return callback(null,true)
        }
   
        return callback("Invalid file format",false)
    }

   
  
    return multer({
        
        fileFilter,
        limits:{
            fileSize:maxSize
        },
        storage
    })
}