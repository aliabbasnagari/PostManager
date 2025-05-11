import axios from 'axios';

console.log("BACKEND URL: ", process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://ec2-3-109-152-75.ap-south-1.compute.amazonaws.com:5000",
});

export default api;
