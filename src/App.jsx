import "./App.css";
import Landing from "./components/Landing";
//import routes from "./pages/Routes";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { useState, useEffect, Suspense, lazy } from "react";
import UserContext from "./lib/UserContext";
import { supabase } from "./lib/Store";
import { useSnackbar } from "notistack";
const ProtectedRoute = lazy(() => import("./pages/ProtectedRoute"));
function App() {
  const [userLoaded, setUserLoaded] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (session) {
        setAccessToken(session?.access_token);
        const currentUser = session?.user;
        setUser(currentUser);
        setUserLoaded(session ? true : false);
        if (session?.user) {
        } else if (error) {
          console.log("🚀 ~ file: _app.jsx:31 ~ useEffect ~ error", error);
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
        const currentUser = session?.user;
        setUser(currentUser);
        if (currentUser) {
          //router.push("/channels/[id]", "/channels/1");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [accessToken]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      enqueueSnackbar("Signed out", { variant: "success" });
    }
  };
  const value = {
    userLoaded,
    user,
    signOut,
  };
  return (
    <UserContext.Provider value={value}>
      <Suspense
        fallback={
          <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        }
      >
        <Router>
          <Routes>
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="/editor" element={<Landing />} />
              </Route>
            </>
          </Routes>
        </Router>
      </Suspense>
    </UserContext.Provider>
  );
}

export default App;
