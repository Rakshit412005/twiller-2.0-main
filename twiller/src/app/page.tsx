import Landing from "@/components/Landing";
import Mainlayout from "@/components/layout/Mainlayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Image from "next/image";
export const dynamic = "force-dynamic";

export default function Home() {

  return (
    <AuthProvider>
      <Mainlayout>
        {" "}
        <Landing />
      </Mainlayout>
    </AuthProvider>
  );
}
