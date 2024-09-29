import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

const Authentication = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // Reference to the stream

  const startCamera = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    } catch (err) {
      console.error("Error accessing the camera: ", err);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      setImage(imageDataUrl);
      
      // Stop the camera stream properly
      stopCamera();
    }
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop(); // Stop each track
      });
      videoRef.current.srcObject = null; // Clear the video source
      streamRef.current = null; // Clear the reference
    }
  };

  useEffect(() => {
    startCamera();
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      stopCamera();
    };
  }, [startCamera]);

  const sendImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      // Simulated API call to AWS
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult('Employee recognized: John Doe');
    } catch (error) {
      setResult('Error recognizing employee');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setImage(null);
    setResult(null);
    startCamera();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Employee Facial Recognition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          {!image ? (
            <video ref={videoRef} autoPlay className="w-64 h-64 object-cover rounded-lg" />
          ) : (
            <img src={image} alt="Captured" className="w-64 h-64 object-cover rounded-lg" />
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} width="300" height="300" />
        
        {!image && (
          <Button onClick={captureImage} className="w-full">
            <Camera className="mr-2 h-4 w-4" /> Capture Image
          </Button>
        )}
        
        {image && (
          <>
            <Button onClick={sendImage} className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Image'}
            </Button>
            <Button onClick={retake} variant="outline" className="w-full">
              Retake Photo
            </Button>
          </>
        )}
        
        {result && (
          <p className="text-center w-full font-medium mt-4">
            {result}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Authentication;
