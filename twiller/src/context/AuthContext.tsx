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
  pendingOtpUser: {
    userId: string;
    email: string;
  } | null;

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
  const otpRequestedRef = useRef(false);

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

if (errorCode === "OTP_REQUIRED") {
  if (!otpRequestedRef.current) {
    otpRequestedRef.current = true;

    await axiosInstance.post("/api/login-otp/send", { userId });

    const pending = { userId, email };
    setPendingOtpUser(pending);
    localStorage.setItem("pendingLoginOtp", JSON.stringify(pending));

    toast.info("OTP sent to your email. Please verify.");
  }

  // 🔥 VERY IMPORTANT
  await signOut(auth);
  setUser(null);
  localStorage.removeItem("twitter-user");

  return "OTP_REQUIRED";
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

      // 🔐 RE-LOGIN after OTP
      const res = await axiosInstance.get("/loggedinuser", {
        params: { email: pendingOtpUser.email },
      });

      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));

      
      localStorage.removeItem("pendingLoginOtp");
      otpRequestedRef.current = false;
      setPendingOtpUser(null);

      toast.success("Login verified");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    }
  };

  const hasTrackedLogin = useRef(false);
  useEffect(() => {
    const pending = localStorage.getItem("pendingLoginOtp");
    if (pending) {
      setPendingOtpUser(JSON.parse(pending));
    }
  }, []);

  useEffect(() => {
    // Check for existing session

const unsubcribe = onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser?.email) {
    setUser(null);
    localStorage.removeItem("twitter-user");
    setIsLoading(false);
    return;
  }

  try {
    const res = await axiosInstance.get("/loggedinuser", {
      params: { email: firebaseUser.email },
    });

    setUser(res.data);
    localStorage.setItem("twitter-user", JSON.stringify(res.data));
  } catch (err: any) {
  if (err.response?.data?.error === "OTP_REQUIRED") {
    const pending = {
      userId: err.response.data.userId,
      email: firebaseUser.email,
    };

    setPendingOtpUser(pending);
    localStorage.setItem("pendingLoginOtp", JSON.stringify(pending));
    toast.info("Please verify OTP to continue");

    await signOut(auth);
    setUser(null);
    setIsLoading(false);
    return;
  }

  await signOut(auth);
  setUser(null);
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
      const result = await trackLogin(freshUser._id, freshUser.email);

      if (result === "OTP_REQUIRED") {
        return; // ⛔ stop login until OTP verified
      }

      setUser(freshUser);
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
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseuser = result.user;

    if (!firebaseuser?.email) {
      throw new Error("No email found in Google account");
    }

    // 1️⃣ Find or create user in DB
    let userData;
    try {
      const res = await axiosInstance.get("/loggedinuser", {
        params: { email: firebaseuser.email },
      });
      userData = res.data;
    } catch {
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

    if (!userData) {
      throw new Error("User creation failed");
    }

    // 2️⃣ OTP / device / time gate happens HERE
    const loginResult = await trackLogin(userData._id, userData.email);

    if (loginResult === "OTP_REQUIRED") {
      // 🔥 DO NOT set user
      // 🔥 DO NOT call /loggedinuser
      return;
    }

    // 3️⃣ OTP passed → NOW fetch fresh user
    const freshRes = await axiosInstance.get("/loggedinuser", {
      params: { email: firebaseuser.email },
    });

    setUser(freshRes.data);
    localStorage.setItem("twitter-user", JSON.stringify(freshRes.data));
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
        pendingOtpUser,
      }}
    >
      {children}

      {pendingOtpUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-80">
            <h2 className="text-white font-semibold mb-2">Verify Login</h2>

            <input
              className="w-full p-2 bg-black border border-gray-700 rounded mb-3 text-white"
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
