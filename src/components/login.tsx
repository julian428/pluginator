import PocketBase from "pocketbase";
import { createEffect, createSignal } from "solid-js";

export default function Login() {
  const pb = new PocketBase("http://127.0.0.1:8090");
  const [loggedIn, setLoggedIn] = createSignal(false);
  createEffect(() => {
    setLoggedIn(pb.authStore.isValid);
  });
  const handleLogin = async () => {
    if (pb.authStore.isValid) pb.authStore.clear();
    else {
      try {
        await pb.collection("users").authWithOAuth2({ provider: "google" });
      } catch (error) {
        console.log(error);
      }
    }
  };
  pb.authStore.onChange((data) => setLoggedIn(Boolean(data)));
  return (
    <button onClick={handleLogin}>{loggedIn() ? "logout" : "login"}</button>
  );
}
