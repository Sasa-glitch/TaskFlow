import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./components/Auth/Auth";
import TaskManager from "./components/TaskManager/TaskManager";
import { supabase } from "./utils/supabase";
import type { Session } from "@supabase/supabase-js";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import { useToast } from "./components/Toast/ToastContext";

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const { showToast } = useToast();

    const getSession = async () => {
        const authSession = await supabase.auth.getSession();
        setSession(authSession.data.session);
        if (authSession.error) {
            console.error(
                "An error happened getting the session",
                authSession.error,
            );
        } else {
            console.log("auth session here", authSession.data.session);
        }
    };
    useEffect(function () {
        getSession();
        const { data: authSub } = supabase.auth.onAuthStateChange(
            (_event, session: Session | null) => {
                setSession(session);
            },
        );
        return () => {
            authSub.subscription.unsubscribe;
        };
    }, []);
    const logOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("an error happend during sign out", error);
            showToast(error.message, "error");
        } else {
            console.log("sign out successfuly");
            showToast("Signed out successfully", "success");
        }
    };

    return (
        <>
            <div className="page-container">
                <ThemeToggle />

                <div className="content-wrapper">
                    {session ? (
                        <>
                            <button
                                onClick={logOut}
                                className="btn btn-primary"
                            >
                                LogOut
                            </button>
                            <TaskManager userSession={session} />
                        </>
                    ) : (
                        <Auth />
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
