import multer from "multer";
import path from  'node:path'
import fs from 'node:fs'
import { generalFields } from "../../middleware/validation.middleware.js";

export const fileValidation={
    image: ['image/gif','image/jpeg','image/png'],
    document:['application/pdf']
}
export const localFileUpload=({customPath="general",validation=[],maxSize=3*1024*1024}={})=>{
    let basePath=`uploads/${customPath}`
    const storage =multer.diskStorage({

        destination: function (req,file,callback){
            if(req.user?._id){
                basePath+=`/${req.user._id}`
            }
            const fullPath=path.resolve(`./src/${basePath}`)

    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath,{recursive:true})
    }

            callback(null,path.resolve(fullPath))
        },
        filename: function (req,file,callback){
            const uniqueFileName= Date.now()+"__"+ Math.random()+"__"+file.originalname
            file.finalPath= basePath+"/"+uniqueFileName
            callback(null, uniqueFileName)
        }
    })

    const fileFilter = function(req,file,callback){
        if(validation.includes(file.mimetype)){
            
            return callback(null,true)
        }
   
        return callback("Invalid file format",false)
    }

   
  
    return multer({
        dest:"./temp",
        fileFilter,
        limits:{
            fileSize:maxSize
        },
        storage
    })
}