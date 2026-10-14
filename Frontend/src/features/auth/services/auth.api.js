/**
 *  4 layers of React-frontent Architecture
 * 
 * UI
 * => component
 * => pages
 * 
 * Hook --> for managing state and api layers
 * => hooks
 * 
 * State --> data store
 * => auth.context.jsx
 * => ai.context.jsx
 * 
 * API --> for communicate with backend
 * => services
 *      => auth.api.js
 * 
 */

import axios from "axios";

export async function register({username,email,password}){
    try{
        const response = await axios.post('http://localhost:3000/api/auth/register',{
            username,email,password
        },{
            withCredentials:true //server having access to read and set data in cookies
        })
        return response.data
    } catch(err){
        console.log(err)
    }
}

export async function login({email,password}){
    try{
        const response = await axios.post('http://localhost:3000/api/auth/login',{
            email,password
        },{
            withCredentials:true
        })
        return response.data
    } catch(err){
        console.log(err)
    }
}

export async function logout(){
    try{
        const response = await axios.get("http://localhost:3000/api/auth/logout",{
            withCredentials:true
        })
        return response.data
    }catch(err){
        console.log(err)
    }
}