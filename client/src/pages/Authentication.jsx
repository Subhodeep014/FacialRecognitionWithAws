import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
const Authentication = () => {
  const {toast} = useToast();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
      stopCamera();
    }
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera]);

  const sendImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const base64Image = image.split(',')[1];

      const response = await fetch("/api/get/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        const bodyData = JSON.parse(data.body);
        console.log("Body Data:", bodyData); 
    
        // Access the fullName property
        const fullName = bodyData.fullName; // "Subhodeep Basak"
        console.log("Full Name:", fullName); // Output the full name
        toast({
          title: `Authentication successfull, Welcome${fullName}`,
          variant: "success",
          duration : 2500,
          
        })
        setResult(`Authentication successfull, Welcome ${fullName}` || 'Employee recognized');
      } else {
        setResult('Error recognizing employee');
      }

    } catch (error) {
      console.error('Error sending image:', error);
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
            <Button onClick={retake} variant="outline" className="w-full" disabled={loading}>
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
