import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { useState, useEffect, Suspense, lazy } from "react";
import { supabase } from "./lib/Store";
import { useSnackbar } from "notistack";
//import Landing from "./components/Landing";
import Landing from "./components/Landing";
import { useRef } from "react";
import ProtectedRoute from "./pages/ProtectedRoute";
function App() {
  const { enqueueSnackbar } = useSnackbar();
  const [accessToken, setAccessToken] = useState(null);
  const sessionRef = useRef(false);
  useEffect(() => {
    console.count("sessionRef");
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!session) {
        console.log("%cLogged", "color:lightgreen");
        setAccessToken(session?.access_token);
        if (error) {
          enqueueSnackbar(error, { variant: "error" });
        }
      }
    };
    getSession();
  }, []);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== accessToken) {
        setAccessToken(session?.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [accessToken]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      sessionRef.current = null;
      localStorage.removeItem("user");
      enqueueSnackbar("Signed out", { variant: "success" });
    }
  };
  const value = {
    signOut,
  };
  return (
    <Router>
      <Routes>
        <>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" exact element={<Landing signOut={signOut} />} />
          </Route>
        </>
      </Routes>
    </Router>
  );
}

export default App;
