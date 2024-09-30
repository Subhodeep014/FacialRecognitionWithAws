import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Upload, ShieldCheck, Zap, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
export default function Registration() {
  const navigate = useNavigate();
    const [showRegistration, setShowRegistration] = useState(false);
    const [fullName, setFullName] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const {toast} = useToast();
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImage(file);
        setPreview(URL.createObjectURL(file));
      }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        if (!fullName || !image) {
          setError('Please provide both full name and image.');
          return;
        }
    
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('image', image);
    
        try {
          const response = await fetch('api/add/register', {
            method: 'POST',
            body: formData,
          });
    
          if (!response.ok) {
            throw new Error('Registration failed');
          }
    
          toast({
            title: "Registration done successfully!!",
            variant: "success",
            duration : 2500,
            
          })
          navigate("/");
        } catch (error) {
          setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">FaceSecure™</h1>
            <p className="text-xl text-gray-600">Next-Generation Facial Authentication</p>
          </header>
    
          {!showRegistration ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <FeatureCard
                  icon={<ShieldCheck className="h-12 w-12 text-primary" />}
                  title="Secure"
                  description="State-of-the-art facial recognition ensures only you can access your account."
                />
                <FeatureCard
                  icon={<Zap className="h-12 w-12 text-primary" />}
                  title="Fast"
                  description="Login in seconds with just a glance. No more forgotten passwords."
                />
                <FeatureCard
                  icon={<Lock className="h-12 w-12 text-primary" />}
                  title="Private"
                  description="Your facial data is encrypted and never shared with third parties."
                />
              </div>
              <div className="text-center">
                <Button size="lg" onClick={() => setShowRegistration(true)}>
                  Get Started Now
                </Button>
              </div>
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Create Your FaceSecure™ Account</CardTitle>
                <CardDescription>Register with facial recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="image">Profile Image</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Label
                          htmlFor="image"
                          className="cursor-pointer flex items-center justify-center w-full h-44 border-2 border-dashed rounded-md hover:border-primary"
                        >
                          {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                          ) : (
                            <div className="text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <span className="mt-2 block text-sm font-semibold text-gray-900">
                                Upload image
                              </span>
                            </div>
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowRegistration(false)}>Back</Button>
                <Button onClick={handleSubmit}>Register</Button>
              </CardFooter>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </Card>
          )}
        </div>
    );
}
    
function FeatureCard({ icon, title, description }) {
    return (
    <Card className="text-center">
        <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        </CardContent>
    </Card>
    );
}

