import { useRouter } from "expo-router";
import { useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { getUID } from "../util/aysnStore";

export default function Index() {
  const router = useRouter();
  let userId;
  async function asynFun() {
    userId = await getUID();
  }
  asynFun()

  useEffect(() => {
    const timeout = setTimeout(async () => {
    
        console.log(userId);
        
      if (userId) {
        router.replace("/(app)/HomeScreen");
      } else {
        router.replace("/(auth)/Login");
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [userId]);

  return <LoadingScreen />;
}
