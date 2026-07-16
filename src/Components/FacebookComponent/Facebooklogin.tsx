import { useEffect, useState } from "react";
import { message } from "antd";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const FACEBOOK_APP_ID = "2115848182608591";

interface FacebookUser {
  id: string;
  name: string;
  picture?: any;
  email?: string;
}

export default function FacebookLogin() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<FacebookUser | null>(null);
  const [accessToken, setAccessToken] = useState("");

  //==================================================
  // LOAD FACEBOOK SDK
  //==================================================

  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");

    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: "v25.0",
      });

      console.log("Facebook SDK Initialized");

      setSdkLoaded(true);
    };
  }, []);

  //==================================================
  // USER PROFILE
  //==================================================

  const fetchUserProfile = () => {
    window.FB.api(
      "/me",
      {
        fields: "id,name,picture,email",
      },
      (response: any) => {
        console.log("USER PROFILE");
        console.log(response);

        setUser(response);
      }
    );
  };

  //==================================================
  // USER PAGES
  //==================================================

  const fetchPages = () => {
    window.FB.api(
      "/me/accounts",
      "GET",
      {},
      (response: any) => {
        console.log("FACEBOOK PAGES");
        console.log(response);
      }
    );
  };

  //==================================================
  // BUSINESSES
  //==================================================

  const fetchBusinesses = () => {
    window.FB.api(
      "/me/businesses",
      "GET",
      {},
      (response: any) => {
        console.log("BUSINESSES");
        console.log(response);
      }
    );
  };

  //==================================================
  // PERMISSIONS
  //==================================================

  const fetchPermissions = () => {
    window.FB.api(
      "/me/permissions",
      (response: any) => {
        console.log("PERMISSIONS");
        console.log(response);
      }
    );
  };

  //==================================================
  // LOGIN
  //==================================================

  const handleFacebookLogin = () => {
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      message.error("Facebook Login requires HTTPS");
      return;
    }

    if (!sdkLoaded) {
      message.error("Facebook SDK not loaded");
      return;
    }

    setLoading(true);

    window.FB.login(
      (response: any) => {
        setLoading(false);

        console.log("LOGIN RESPONSE");
        console.log(response);

        if (!response.authResponse) {
          message.warning("Facebook Login Cancelled");
          return;
        }

        const token = response.authResponse.accessToken;

        console.log("ACCESS TOKEN");
        console.log(token);

        console.log("GRANTED SCOPES");
        console.log(response.authResponse.grantedScopes);

        setAccessToken(token);

        localStorage.setItem(
          "facebook_access_token",
          token
        );

        fetchPermissions();

        fetchUserProfile();

        fetchPages();

        fetchBusinesses();

        message.success("Facebook Login Successful");
      },
      {
        scope: [
          "public_profile",
          "pages_show_list",
          "pages_read_engagement",
          "business_management",
          "pages_manage_ads",
          "leads_retrieval",
        ].join(","),

        auth_type: "rerequest",

        return_scopes: true,
      }
    );
  };

  //==================================================
  // LOGOUT
  //==================================================

  const handleLogout = () => {
    window.FB.logout(() => {
      localStorage.removeItem("facebook_access_token");
      setUser(null);
      setAccessToken("");
      message.success("Logged out");
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={handleFacebookLogin} disabled={loading}>
        Login with Facebook
      </button>

      <button
        onClick={handleLogout}
        style={{ marginLeft: 10 }}
      >
        Logout
      </button>

      <hr />

      <h3>User</h3>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <hr />

      <h3>Access Token</h3>

      <textarea
        rows={5}
        cols={100}
        value={accessToken}
        readOnly
      />
    </div>
  );
}