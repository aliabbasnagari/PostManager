import axios from "axios";

console.log("BACKEND URL ENV: ", process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "http://ec2-43-205-124-117.ap-south-1.compute.amazonaws.com:5000",
});

console.log("BACKEND URL: ", api.defaults.baseURL);

export default api;
