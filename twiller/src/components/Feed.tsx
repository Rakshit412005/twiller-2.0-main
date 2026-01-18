import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import LoadingSpinner from "./loading-spinner";
import TweetCard from "./TweetCard";
import TweetComposer from "./TweetComposer";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";



interface Tweet {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  liked?: boolean;
  retweeted?: boolean;
  image?: string;
}
const triggerNotificationIfMatched = (
  tweet: any,
  notificationsEnabled: boolean
) => {
 

  if (!notificationsEnabled) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const text = tweet.content.toLowerCase();

  if ((text.includes("cricket") && text.includes("science")) || text.includes("science") && text.includes("cricket")) {
   
    new Notification("New Tweet Alert", {
      body: tweet.content,
    });
  }
};



const tweets: Tweet[] = [
  {
    id: "1",
    author: {
      id: "2",
      username: "elonmusk",
      displayName: "Elon Musk",
      avatar:
        "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "Just had an amazing conversation about the future of AI. The possibilities are endless!",
    timestamp: "2h",
    likes: 1247,
    retweets: 324,
    comments: 89,
    liked: false,
    retweeted: false,
  },
  {
    id: "2",
    author: {
      id: "3",
      username: "sarahtech",
      displayName: "Sarah Johnson",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: false,
    },
    content:
      "Working on some exciting new features for our app. Can't wait to share what we've been building! 🚀",
    timestamp: "4h",
    likes: 89,
    retweets: 23,
    comments: 12,
    liked: true,
    retweeted: false,
  },
  {
    id: "3",
    author: {
      id: "4",
      username: "designguru",
      displayName: "Alex Chen",
      avatar:
        "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "The new design system is finally complete! It took 6 months but the results are incredible. Clean, consistent, and accessible.",
    timestamp: "6h",
    likes: 456,
    retweets: 78,
    comments: 34,
    liked: false,
    retweeted: true,
    image:
      "https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];
const Feed = () => {
  const { t } = useTranslation();
  console.log("Feed rendered");

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [tweets, setTweets] = useState<any>([]);
  const [loading, setloading] = useState(false);
 const fetchTweets = async () => {
    try {
      setloading(true);
      const res = await axiosInstance.get("/post");
      setTweets(res.data);

      
     
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  };
  useEffect(() => {
    fetchTweets();
  }, []);
 const handlenewtweet = (newtweet: any, fromUserAction = false) => {
  setTweets((prev: any) => [newtweet, ...prev]);

  if (fromUserAction) {
    triggerNotificationIfMatched(newtweet, notificationsEnabled);
  }
};

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">{t("nav.home")}</h1>
        </div>

        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-800 rounded-none h-auto">
            <TabsTrigger
              value="foryou"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-1 data-[state=active]:border-blue-100 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
            >
              {t("for_you")}
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-1 data-[state=active]:border-blue-100 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
            >
             {t("following")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
<div className="px-4 py-2">
  <button
    onClick={async () => {
      if (!("Notification" in window)) {
        toast.error("Notifications not supported");
        return;
      }

     
      if (!notificationsEnabled) {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          setNotificationsEnabled(true);
          toast.success("Notifications enabled");
        } else {
          toast.error("Notification permission denied");
        }
      } else {
        setNotificationsEnabled(false);
        toast.info("Notifications disabled");
      }
    }}
    className={`${
      notificationsEnabled
        ? "bg-gray-600 hover:bg-gray-700"
        : "bg-blue-500 hover:bg-blue-600"
    } text-white font-semibold rounded-full px-4 py-2`}
  >
    {notificationsEnabled ? `${t("disable_notifications")}` : `${t("enable_notifications")}`}
  </button>
</div>


      <TweetComposer onTweetPosted={handlenewtweet}/>
      
      <div className="divide-y divide-gray-800">
        {loading ? (
          <Card className="bg-black border-none">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p>Loading tweets...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          tweets.map((tweet: any) => <TweetCard key={tweet._id} tweet={tweet} />)
        )}
      </div>
    </div>
  );

};

export default Feed;
