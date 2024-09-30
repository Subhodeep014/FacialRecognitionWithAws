import axios from "axios";
import dotenv from "dotenv"
dotenv.config();
export const authentication = async(req,res)=>{
    try {
        // Extract the image from the request
        const { image } = req.body;
    
        if (!image) {
          return res.status(400).json({ message: "Image is required for authentication" });
        }
    
        // Prepare the request for API Gateway
        const gatewayUrl = "https://knmdq1d6e5.execute-api.ap-south-1.amazonaws.com/api-v1/employee";
        
        const response = await axios.post(gatewayUrl, {
          image: image, // Send the image in base64 as expected by the Lambda function
        }, {
          headers: {
            "Content-Type": "application/json"
          }
        });
    
        // Forward the response from the API Gateway to the frontend
        res.status(response.status).json(response.data);
    
    } catch (error) {
        if (error.response) {
            console.error("API response error:", error.response.data);
            res.status(error.response.status).json({ 
              message: "Error occurred while authenticating employee", 
              error: error.response.data 
            });
          } else if (error.request) {
            console.error("No response from API:", error.request);
            res.status(500).json({ message: "No response from API Gateway" });
          } else {
            console.error("Error in request setup:", error.message);
            res.status(500).json({ message: error.message });
        }
    }
};