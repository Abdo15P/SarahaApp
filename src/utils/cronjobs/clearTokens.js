import cron from 'node-cron';
import * as DBService from "../../DB/db.service.js"
import { TokenModel } from '../../DB/models/Token.model.js';


cron.schedule('* * * * *', async () => {
  
    
    try {
        const tokens = await DBService.deleteMany({ 
        model: TokenModel,
        filter:{
            expiresAt: { $lt: new Date() } 
        }
      
    });
    // console.log("cleared tokens")
    }catch(error){
        // console.log("clearTokens error",error)
    }
}, {
});