import mongoose from 'mongoose';
require('dotenv').config();



async function connectDB() {
    const client = mongoose.connect(process.env.MONGO_URI);
        try{
            await client;
            console.log('Connected to database');
        }
        catch(err){
            console.log({message:"Error Connecting to Database",err});
        }
    
}

export default connectDB;