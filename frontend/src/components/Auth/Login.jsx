
import { GoogleLogin } from "@react-oauth/google";
import "../../App.css";

export default function Login({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🎓</div>

        <h1>Student Progress</h1>
        <p className="login-subtitle">
          Learning Center Management
        </p>

        <div className="login-divider" />

        <h2>Welcome back</h2>
        <p className="login-description">
          Sign in to manage students, track progress,
          and view session history.
        </p>

        <div className="google-login">
          <GoogleLogin
            onSuccess={(response) => onLogin(response.credential)}
            onError={() => console.error("Google Sign-In failed")}
            theme="outline"
            size="large"
            shape="rectangular"
            width="320"
            text="signin_with"
          />
        </div>

        <p className="login-footer">
          Authorized staff only
        </p>
      </div>
    </div>
  );
}
