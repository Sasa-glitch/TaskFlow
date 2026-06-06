import { useState } from "react";
import { supabase } from "../../utils/supabase";
import { useToast } from "../Toast/ToastContext";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [forSignUp, setForSignUp] = useState(true);
    const { showToast } = useToast();

    const handleAuth = async () => {
        if (forSignUp) {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });
            if (signUpError) {
                console.error("Error happened during Sign Up", signUpError);
                showToast(signUpError.message, "error");
            } else {
                console.log("User successffuly signed Up");
                showToast("Account created successfully! Check your email or try logging in.", "success");
            }
        } else {
            const { error: signInError } =
                await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
                console.error("Error happened during Sign In", signInError);
                showToast(signInError.message, "error");
            } else {
                console.log("User signed in successffuly");
                showToast("Welcome back! Signed in successfully.", "success");
            }
        }
    };


    return (
        <>
            <form action="" onSubmit={(e) => e.preventDefault()}>
                <h1 className="text-3xl font-extrabold tracking-tight mb-3">Sign<span className="text-accent">{forSignUp ? "Up" : "In"}</span> :</h1>
                <label htmlFor="email" className="input-label">
                    Email
                </label>
                <input
                    className="input-field"
                    type="text"
                    name=""
                    id="email"
                    placeholder="Enter Email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="password" className="input-label">
                    Password
                </label>
                <input
                    className="input-field"
                    type="text"
                    name=""
                    id="password"
                    placeholder="Enter Password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                    <button className="btn-primary" onClick={handleAuth}>
                        {forSignUp ? "Sign Up" : "Sign In"}
                    </button>
                    <button
                        className="btn-edit"
                        type="button"
                        onClick={() => setForSignUp((prev) => !prev)}
                    >
                        Change To {forSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </div>
            </form>
        </>
    );
}
