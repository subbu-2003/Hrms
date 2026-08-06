import React, { useEffect, useState } from "react";

import {
  Button,
  Avatar,
  message,
  Card,
  Typography,
  Select,
  Table,
  Spin,
  Divider,
  Tag,
  Empty,
} from "antd";

import {
  FacebookFilled,
  LogoutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import "./Facebooklogin.css";

const { Title, Text } = Typography;

const FACEBOOK_APP_ID = "958159627267632";

// Keep this ONE constant and use it everywhere instead of hardcoding
// version strings in different fetch calls. Bump this in one place only.
const FB_GRAPH_VERSION = "v21.0";

// ======================================================
// TYPES
// ======================================================

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookUser {
  id: string;
  name: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  category_list: {
    id: string;
    name: string;
  }[];
  access_token: string;
  tasks: string[]; // e.g. ["MANAGE", "CREATE_CONTENT", "MODERATE", "ADVERTISE"]
}

interface Business {
  id: string;
  name: string;
}

interface LeadForm {
  id: string;
  name: string;
  status?: string;
}

interface LeadField {
  name: string;
  values: string[];
}

interface Lead {
  id: string;
  created_time: string;
  field_data: LeadField[];
}

// Facebook considers a user an "Admin" of a Page when the tasks array
// for that page contains "MANAGE". Non-admin roles (editor, moderator,
// advertiser, analyst) never get this task.
const isPageAdmin = (page: FacebookPage): boolean =>
  Array.isArray(page.tasks) && page.tasks.includes("MANAGE");

const FacebookLogin: React.FC = () => {
  // ======================================================
  // STATES
  // ======================================================

  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const [user, setUser] = useState<FacebookUser | null>(null);
  // accessToken value itself isn't rendered anywhere in the UI, only
  // used inside handlers (closures capture it via setAccessToken calls
  // and localStorage), so we intentionally don't read the getter here
  // to avoid a TS6133 "declared but never read" build error.
  const [, setAccessToken] = useState("");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");

  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState("");

  const [forms, setForms] = useState<LeadForm[]>([]);
  const [selectedForm, setSelectedForm] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    console.log("PAGES STATE:", pages);
  }, [pages]);

  // ======================================================
  // LOAD FACEBOOK SDK
  // ======================================================

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
        version: FB_GRAPH_VERSION,
      });

      console.log("✅ Facebook SDK Initialized:", FB_GRAPH_VERSION);
      setSdkLoaded(true);
    };
  }, []);

  // ======================================================
  // USER PROFILE
  // ======================================================

  const fetchUserProfile = () => {
    window.FB.api(
      "/me",
      { fields: "id,name,picture" },
      (response: FacebookUser) => {
        setUser(response);
      }
    );
  };

  // ======================================================
  // LOGIN
  // ======================================================

  const handleFacebookLogin = () => {
    // Facebook Login requires HTTPS (localhost is exempt for dev)
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

        console.log("LOGIN RESPONSE:", response);

        if (!response.authResponse) {
          message.warning("Facebook Login Cancelled");
          return;
        }

        // NOTE: This is a SHORT-LIVED user access token (valid ~1-2 hours).
        // For production, send this token to your backend and exchange it
        // for a long-lived token using your app secret:
        //
        //   GET https://graph.facebook.com/{version}/oauth/access_token
        //       ?grant_type=fb_exchange_token
        //       &client_id={app-id}
        //       &client_secret={app-secret}   <-- NEVER put this in frontend
        //       &fb_exchange_token={short-lived-token}
        //
        // Do NOT store the raw token in localStorage in production;
        // keep it server-side and use your own session/JWT on the client.
        const token = response.authResponse.accessToken;

        console.log("ACCESS TOKEN:", token);
        console.log("GRANTED SCOPES:", response.authResponse.grantedScopes);

        setAccessToken(token);
        localStorage.setItem("facebook_access_token", token);

        // Show permissions granted (debug only)
        window.FB.api("/me/permissions", (permissionResponse: any) => {
          console.log("PERMISSIONS:", permissionResponse);
        });

        fetchUserProfile();
        fetchFacebookData(token);

        message.success("Facebook Login Successful");
      },
      {
        scope:
          "public_profile,pages_show_list,pages_read_engagement,business_management,leads_retrieval",
        auth_type: "rerequest",
        return_scopes: true,
      }
    );
  };

  // ======================================================
  // GET PAGES (ADMIN ONLY)
  // ======================================================

  const fetchFacebookData = async (token: string): Promise<void> => {
    try {
      setApiLoading(true);

      const response = await fetch(
        `https://graph.facebook.com/${FB_GRAPH_VERSION}/me?fields=id,name,accounts{id,name,category,category_list,access_token,tasks}&access_token=${token}`
      );

      const data = await response.json();

      console.log("FACEBOOK RESPONSE:", data);

      if (data.error) {
        message.error(data.error.message);
        return;
      }

      const allPages: FacebookPage[] = data.accounts?.data ?? [];

      // Only keep pages where the logged-in user has the "MANAGE" task,
      // i.e. is an Administrator of that page. Editors/Moderators/
      // Advertisers/Analysts are filtered out here.
      const adminPages = allPages.filter(isPageAdmin);

      if (allPages.length > 0 && adminPages.length === 0) {
        message.warning(
          "You are not an Administrator on any of your Facebook Pages."
        );
      }

      setPages(adminPages);

      setBusinesses(
        adminPages.map((page) => ({
          id: page.id,
          name: page.category,
        }))
      );

      console.log("Admin Pages:", adminPages);
    } catch (error) {
      console.error(error);
      message.error("Failed to load Facebook data");
    } finally {
      setApiLoading(false);
    }
  };

  // ======================================================
  // GET FORMS
  // ======================================================

  const getLeadForms = async (pageId: string) => {
    try {
      setApiLoading(true);
      setSelectedPage(pageId);
      setSelectedForm("");
      setLeads([]);

      const page = pages.find((p) => p.id === pageId);

      if (!page) {
        message.error("Page not found");
        return;
      }

      // Defense in depth: even though `pages` only ever contains admin
      // pages, double-check here before using the page access token.
      if (!isPageAdmin(page)) {
        message.error("You must be an Administrator of this Page.");
        return;
      }

      const response = await fetch(
        `https://graph.facebook.com/${FB_GRAPH_VERSION}/${pageId}/leadgen_forms?access_token=${page.access_token}`
      );

      const data = await response.json();

      console.log("FORMS:", data);

      if (data.error) {
        message.error(data.error.message);
        return;
      }

      setForms(data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load forms");
    } finally {
      setApiLoading(false);
    }
  };

  // ======================================================
  // GET LEADS
  // ======================================================

  const getLeads = async (formId: string) => {
    try {
      setApiLoading(true);
      setSelectedForm(formId);

      const page = pages.find((p) => p.id === selectedPage);

      if (!page) {
        message.error("Page not found");
        return;
      }

      if (!isPageAdmin(page)) {
        message.error("You must be an Administrator of this Page.");
        return;
      }

      const response = await fetch(
        `https://graph.facebook.com/${FB_GRAPH_VERSION}/${formId}/leads?access_token=${page.access_token}`
      );

      const data = await response.json();

      console.log("LEADS:", data);

      if (data.error) {
        message.error(data.error.message);
        return;
      }

      setLeads(data.data || []);
      message.success("Leads Loaded Successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to load leads");
    } finally {
      setApiLoading(false);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    if (!window.FB) return;

    window.FB.logout(() => {
      setUser(null);
      setBusinesses([]);
      setPages([]);
      setForms([]);
      setLeads([]);
      setSelectedBusiness("");
      setSelectedPage("");
      setSelectedForm("");
      setAccessToken("");
      localStorage.removeItem("facebook_access_token");

      message.success("Logged out successfully");
    });
  };

  // ======================================================
  // TABLE
  // ======================================================

  const columns = [
    {
      title: "Lead ID",
      dataIndex: "id",
      key: "id",
      width: 220,
    },
    {
      title: "Created Time",
      dataIndex: "created_time",
      key: "created_time",
      width: 220,
    },
    {
      title: "Lead Details",
      key: "lead_details",
      render: (_: any, record: Lead) => (
        <div>
          {record.field_data?.map((field, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <Tag color="blue">{field.name}</Tag>
              {field.values?.join(", ")}
            </div>
          ))}
        </div>
      ),
    },
  ];

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="facebook-login-container">
      {!user ? (
        <Button
          type="primary"
          icon={<FacebookFilled />}
          loading={loading}
          onClick={handleFacebookLogin}
          className="facebook-login-btn"
        >
          Continue with Facebook
        </Button>
      ) : (
        <Card className="facebook-user-card">
          <div style={{ textAlign: "center" }}>
            <Avatar size={90} src={user.picture?.data?.url} />
            <Title level={4} style={{ marginTop: 10 }}>
              {user.name}
            </Title>
          </div>

          <Divider />

          <Text strong>Businesses</Text>

          <Select
            placeholder="Select Business"
            style={{ width: "100%", marginTop: 10 }}
            value={selectedBusiness || undefined}
            onChange={(value) => setSelectedBusiness(value)}
          >
            {businesses.map((business) => (
              <Select.Option key={business.id} value={business.id}>
                {business.name}
              </Select.Option>
            ))}
          </Select>

          <Divider />

          <Text strong>Facebook Pages (Admin only)</Text>

          {pages.length === 0 && !apiLoading && (
            <div style={{ marginTop: 10 }}>
              <Empty description="No Pages found where you are an Administrator" />
            </div>
          )}

          {pages.length > 0 && (
            <Select
              placeholder="Select Page"
              style={{ width: "100%", marginTop: 10 }}
              value={selectedPage || undefined}
              onChange={(value) => {
                setSelectedPage(value);
                getLeadForms(value);
              }}
            >
              {pages.map((page) => (
                <Select.Option key={page.id} value={page.id}>
                  {page.name}
                </Select.Option>
              ))}
            </Select>
          )}

          <Divider />

          <Text strong>Lead Forms</Text>

          <Select
            placeholder="Select Lead Form"
            style={{ width: "100%", marginTop: 10 }}
            value={selectedForm || undefined}
            onChange={(value) => getLeads(value)}
            disabled={forms.length === 0}
          >
            {forms.map((form) => (
              <Select.Option key={form.id} value={form.id}>
                {form.name}
              </Select.Option>
            ))}
          </Select>

          {apiLoading && (
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Spin />
            </div>
          )}

          {!apiLoading && leads.length === 0 && selectedForm && (
            <div style={{ marginTop: 20 }}>
              <Empty description="No Leads Found" />
            </div>
          )}

          {leads.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <Button
                icon={<ReloadOutlined />}
                style={{ marginBottom: 15 }}
                onClick={() => getLeads(selectedForm)}
              >
                Refresh Leads
              </Button>

              <Table
                columns={columns}
                dataSource={leads}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
              />
            </div>
          )}

          <Divider />

          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Card>
      )}
    </div>
  );
};

export default FacebookLogin;