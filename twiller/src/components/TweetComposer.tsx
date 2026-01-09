"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Image,
  Smile,
  Calendar,
  MapPin,
  BarChart3,
  Globe,
  Mic,
} from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";

const MAX_AUDIO_SIZE_MB = 100;
const MAX_AUDIO_DURATION = 300; // seconds

const TweetComposer = ({ onTweetPosted }: any) => {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [imageurl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* AUDIO + OTP */
  const [showAudioUI, setShowAudioUI] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  /* RECORDING */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  if (!user) return null;

  /* ---------- IST TIME CHECK (2 PM – 7 PM) ---------- */
  const isValidUploadTime = () => {
    const now = new Date();
    const istHour = (now.getUTCHours() + 5.5) % 24;
    return istHour >= 14 && istHour < 19;
  };

  /* ---------- IMAGE UPLOAD ---------- */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsLoading(true);

    const form = new FormData();
    form.append("image", e.target.files[0]);

    const res = await axios.post(
      "https://api.imgbb.com/1/upload?key=97f3fb960c3520d6a88d7e29679cf96f",
      form
    );

    setImageUrl(res.data.data.display_url);
    setIsLoading(false);
  };

  /* ---------- OTP ---------- */
  const requestOtp = async () => {
    await axiosInstance.post("/api/audio/send-otp", { email: user.email });
    toast.info("OTP sent to your email");
  };

  const verifyOtp = async () => {
    try {
      const res = await axiosInstance.post("/api/audio/verify-otp", {
        email: user.email,
        otp,
      });

      // success path
      setOtpVerified(true);
      toast.success("OTP verified successfully");
    } catch (err: any) {
      // error path (wrong OTP / expired OTP)
      const message = err?.response?.data?.error || "Invalid or expired OTP";
      toast.error(message);
    }
  };

  /* ---------- AUDIO FILE VALIDATION ---------- */
  const validateAudio = (file: File) => {
    if (!isValidUploadTime()) {
      toast.error("Audio allowed only between 2 PM – 7 PM IST");
      return false;
    }

    if (file.size > MAX_AUDIO_SIZE_MB * 1024 * 1024) {
      toast.info("Audio exceeds 100MB, Not allowed");
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(audio.duration <= MAX_AUDIO_DURATION);
      };
    });
  };

  /* ---------- AUDIO RECORD ---------- */
  const startRecording = async () => {
    if (!isValidUploadTime()) {
      toast.error("Recording allowed only between 2 PM – 7 PM IST");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recordedChunks.current = [];
    recorder.ondataavailable = (e) => recordedChunks.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
      if (blob.size > MAX_AUDIO_SIZE_MB * 1024 * 1024) {
        toast.info("Recorded audio exceeds size limit");
        return;
      }
      setAudioFile(new File([blob], "recorded-audio.webm"));
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadAudio = async () => {
    if (!audioFile) return null;

    const formData = new FormData();
    formData.append("audio", audioFile);

    const res = await axiosInstance.post("/api/audio/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.audioUrl;
  };

  /* ---------- SUBMIT TWEET ---------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!content.trim() && !audioFile) return;

    setIsLoading(true);
    let audioUrl = null;

    if (audioFile) audioUrl = await uploadAudio();

    try {
      const res = await axiosInstance.post("/post", {
        author: user._id,
        content,
        image: imageurl,
        audio: audioUrl,
      });

      onTweetPosted(res.data,true);

      setContent("");
      setImageUrl("");
      setAudioFile(null);
      setOtpVerified(false);
      setShowAudioUI(false);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(
          error.response.data?.error ||
            "Tweet limit reached. Please upgrade your plan."
        );
      } else {
        toast.error("Failed to post tweet. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent border-none text-xl text-white resize-none min-h-[120px]"
              />

              {/* ACTION BAR */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-blue-400">
                  <label className="p-2 rounded-full hover:bg-blue-900/20 cursor-pointer">
                    <Image className="h-5 w-5" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>

                  <Button variant="ghost" size="sm">
                    <BarChart3 />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Calendar />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MapPin />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAudioUI(!showAudioUI)}
                  >
                    <Mic />
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 rounded-full px-6"
                >
                  Post
                </Button>
              </div>

              {/* AUDIO UI */}
              {showAudioUI && (
                <div className="mt-4 p-4 border border-gray-800 rounded-xl">
                  {!otpVerified ? (
                    <>
                      <Button onClick={requestOtp}>Request OTP</Button>
                      <input
                        className="mt-2 w-full bg-black border p-2 text-white"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <Button className="mt-2" onClick={verifyOtp}>
                        Verify OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <input
                        className="text-sm text-gray-400"
                        type="file"
                        accept="audio/*"
                        onChange={async (e) => {
                          if (
                            e.target.files?.[0] &&
                            (await validateAudio(e.target.files[0]))
                          ) {
                            setAudioFile(e.target.files[0]);
                          }
                        }}
                      />

                      <div className="mt-2 flex gap-2">
                        {!isRecording ? (
                          <Button onClick={startRecording}>
                            Start Recording
                          </Button>
                        ) : (
                          <Button onClick={stopRecording}>
                            Stop Recording
                          </Button>
                        )}
                      </div>

                      {audioFile && (
                        <audio
                          className="mt-2"
                          controls
                          src={URL.createObjectURL(audioFile)}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TweetComposer;
