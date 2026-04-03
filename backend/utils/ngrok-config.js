import { authtoken } from "ngrok";
import ngrok from 'ngrok';
import dotenv from 'dotenv';
dotenv.config();

let ngrokUrl = null
let ngrokReady = false

export const startNgrok = async () => {

    try {
        if(!process.env.NGROK_AUTH_TOKEN  ){
            console.warn('ngrok enviroment variable is not set')
            ngrokReady = true;
            return null
        }
        console.log('killing any current ngrok processes....')
         await ngrok.kill()

        const port = process.env.NGROK_URL || 8000
        console.log(`ngork is running on port${port}`)


        const url = await ngrok.connect({
            addr:port,
            authtoken:process.env.NGROK_AUTH_TOKEN ,
              onStatusChange: status => {
                console.log(`Ngrok status: ${status}`);
            },

        })
        
        ngrokUrl = url;
        ngrokReady = true;
        console.log(`ngrok started on ${ngrokUrl}`)
        return ngrokUrl
    } catch (error) {
        console.error('Error starting ngrok:', error);
        ngrokReady = false;
    }
}
export const isNgrokUrl = () => ngrokUrl
export const isNgrokReady = () => ngrokReady