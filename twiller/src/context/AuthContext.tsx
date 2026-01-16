"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";
import { toast } from "react-toastify";
import { getDeviceInfo } from "@/utils/deviceInfo";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  loginHistory?: {
    browser: string;
    os: string;
    deviceType: "desktop" | "mobile";
    ipAddress: string;
    loginAt: string;
  }[];

  email: string;
  website: string;
  location: string;
  plan: "free" | "bronze" | "silver" | "gold";
  tweetsUsed: number;
  planExpiresAt: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  googlesignin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pendingOtpUser, setPendingOtpUser] = useState<{
    userId: string;
    email: string;
  } | null>(null);
  const [otp, setOtp] = useState("");

  const trackLogin = async (userId: string, email: string) => {
    try {
      const device = getDeviceInfo();

      await axiosInstance.post("/api/track-login", {
        userId,
        browser: device.browser,
        os: device.os,
        deviceType: device.deviceType,
      });

      // Re-fetch updated user
      const res = await axiosInstance.get("/loggedinuser", {
        params: { email },
      });

      if (res.data) {
        const freshUser = {
          ...res.data,
          _id: res.data._id.toString(),
        };

        setUser(freshUser);
        localStorage.setItem("twitter-user", JSON.stringify(freshUser));
      }
    } catch (err: any) {
      const errorCode = err.response?.data?.error;

      // 🔐 CHROME → SEND EMAIL OTP
      if (errorCode === "OTP_REQUIRED") {
        await axiosInstance.post("/api/login-otp/send", {
          userId,
        });

        setPendingOtpUser({ userId, email });
        toast.info("OTP sent to your email");

        throw new Error("OTP_REQUIRED");
      }

      // ⏰ MOBILE TIME BLOCK
      if (errorCode) {
        toast.error(errorCode);
        throw new Error(errorCode);
      }

      toast.error("Login blocked by security policy");
      throw err;
    }
  };

  const verifyLoginOtp = async (otp: string) => {
    if (!pendingOtpUser) return;

    try {
      await axiosInstance.post("/api/login-otp/verify", {
        userId: pendingOtpUser.userId,
        otp,
      });

      // Retry login tracking AFTER OTP success
      await trackLogin(pendingOtpUser.userId, pendingOtpUser.email);

      setPendingOtpUser(null);
      toast.success("Login verified");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    }
  };

  const hasTrackedLogin = useRef(false);

  useEffect(() => {
    // Check for existing session

    const unsubcribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          const res = await axiosInstance.get("/loggedinuser", {
            params: { email: firebaseUser.email },
          });

          if (res.data) {
            const freshUser = {
              ...res.data,
              _id: res.data._id.toString(),
            };

            setUser(freshUser);
            localStorage.setItem("twitter-user", JSON.stringify(freshUser));
          }
        } catch (err) {
          console.log("Failed to fetch user:", err);
        }
      } else {
        setUser(null);
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
    });
    return () => unsubcribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const usercred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseuser = usercred.user;

      const res = await axiosInstance.get("/loggedinuser", {
        params: { email: firebaseuser.email },
      });

      if (!res.data) throw new Error("User not found");

      const freshUser = {
        ...res.data,
        _id: res.data._id.toString(),
      };

      // 🔐 Track login ONCE
      try {
        await trackLogin(freshUser._id, freshUser.email);
        setUser(freshUser);
        localStorage.setItem("twitter-user", JSON.stringify(freshUser));
      } catch (err: any) {
        if (err.message === "OTP_REQUIRED") {
          // ⛔ STOP LOGIN FLOW — wait for OTP
          return;
        }

        throw err;
      }

      localStorage.setItem("twitter-user", JSON.stringify(freshUser));
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed");
      }

      await signOut(auth);
      setUser(null);
      localStorage.removeItem("twitter-user");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    setIsLoading(true);
    // Mock authentication - in real app, this would call an API
    const usercred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = usercred.user;
    const newuser: any = {
      username,
      displayName,
      avatar:
        user.photoURL ||
        "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: user.email,
    };
    const res = await axiosInstance.post("/register", newuser);
    if (res.data) {
      const freshUser = {
        ...res.data,
        _id: res.data._id.toString(),
      };

      setUser(freshUser);
      localStorage.setItem("twitter-user", JSON.stringify(freshUser));
    }
    // const mockUser: User = {
    //   id: '1',
    //   username,
    //   displayName,
    //   avatar: 'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400',
    //   bio: '',
    //   joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    // };
    setIsLoading(false);
  };

  const logout = async () => {
    hasTrackedLogin.current = false;
    setUser(null);
    await signOut(auth);
    localStorage.removeItem("twitter-user");
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => {
    if (!user) return;

    setIsLoading(true);
    // Mock API call - in real app, this would call an API
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser: User = {
      ...user,
      ...profileData,
    };
    const res = await axiosInstance.patch(
      `/userupdate/${user.email}`,
      updatedUser
    );
    if (res.data) {
      setUser(updatedUser);
      localStorage.setItem("twitter-user", JSON.stringify(updatedUser));
    }

    setIsLoading(false);
  };
  const googlesignin = async () => {
    setIsLoading(true);

    try {
      const googleauthprovider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleauthprovider);
      const firebaseuser = result.user;

      if (!firebaseuser?.email) {
        throw new Error("No email found in Google account");
      }

      let userData;

      const res = await axiosInstance.get("/loggedinuser", {
        params: { email: firebaseuser.email },
      });

      if (res.data) {
        userData = res.data;
      } else {
        const newuser = {
          username: firebaseuser.email.split("@")[0],
          displayName: firebaseuser.displayName || "User",
          avatar:
            firebaseuser.photoURL ||
            "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg",
          email: firebaseuser.email,
        };

        const registerRes = await axiosInstance.post("/register", newuser);
        userData = registerRes.data;
      }

      if (userData) {
        setUser(userData);

        localStorage.setItem("twitter-user", JSON.stringify(userData));

        if (!hasTrackedLogin.current) {
          const device = getDeviceInfo();

          if (device.browser !== "Chrome") {
            await trackLogin(userData._id, userData.email);
          }
        }
      } else {
        throw new Error("Login/Register failed: No user data returned");
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        updateProfile,
        logout,
        isLoading,
        googlesignin,
      }}
    >
      {children}

      {pendingOtpUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-80">
            <h2 className="text-white font-semibold mb-2">Verify Login</h2>

            <input
              className="w-full p-2 bg-black border border-gray-700 rounded mb-3"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={() => verifyLoginOtp(otp)}
              className="w-full bg-blue-500 py-2 rounded"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
