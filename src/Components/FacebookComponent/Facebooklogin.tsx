import React, {
  useEffect,
  useState,
} from "react";

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

const FACEBOOK_APP_ID =
  "958159627267632";

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

const FacebookLogin: React.FC = () => {

  // ======================================================
  // STATES
  // ======================================================

  const [sdkLoaded, setSdkLoaded] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [apiLoading, setApiLoading] =
    useState(false);

  const [user, setUser] =
    useState<FacebookUser | null>(null);

  const [, setAccessToken] =
    useState("");

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [selectedBusiness, setSelectedBusiness] =
    useState("");

  const [pages, setPages] =
    useState<FacebookPage[]>([]);

    useEffect(() => {
  console.log("PAGES STATE:", pages);
}, [pages]);

  const [selectedPage, setSelectedPage] =
    useState("");

  const [forms, setForms] =
    useState<LeadForm[]>([]);

  const [selectedForm, setSelectedForm] =
    useState("");

  const [leads, setLeads] =
    useState<Lead[]>([]);

  // ======================================================
  // LOAD FACEBOOK SDK
  // ======================================================

  useEffect(() => {

    if (
      document.getElementById(
        "facebook-jssdk"
      )
    ) {
      setSdkLoaded(true);
      return;
    }

    const script =
      document.createElement("script");

    script.id =
      "facebook-jssdk";

    script.src =
      "https://connect.facebook.net/en_US/sdk.js";

    script.async = true;

    script.defer = true;

    document.body.appendChild(script);

    window.fbAsyncInit = () => {

      window.FB.init({

        appId:
          FACEBOOK_APP_ID,

        cookie: true,

        xfbml: false,

        version: "v19.0",
      });

      console.log(
        "✅ Facebook SDK Initialized"
      );

      setSdkLoaded(true);
    };

  }, []);

  // ======================================================
  // USER PROFILE
  // ======================================================

  const fetchUserProfile = () => {

    window.FB.api(

      "/me",

      {
        fields:
          "id,name,picture,accounts",
      },

      (
        response: FacebookUser
      ) => {

        setUser(response);
      }
    );
  };

  // ======================================================
  // LOGIN
  // ======================================================
const handleFacebookLogin = () => {
  // Facebook Login requires HTTPS
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

      const token = response.authResponse.accessToken;

      console.log("ACCESS TOKEN:", token);
      console.log("GRANTED SCOPES:", response.authResponse.grantedScopes);

      setAccessToken(token);

      localStorage.setItem(
        "facebook_access_token",
        token
      );

      // Show permissions granted
      window.FB.api(
        "/me/permissions",
        (permissionResponse: any) => {
          console.log("PERMISSIONS:", permissionResponse);
        }
      );

      // Fetch Facebook pages/businesses
      fetchFacebookData(token);

      // Fetch user profile
      fetchUserProfile();

      message.success("Facebook Login Successful");
    },
    {
      // pages_show_list,pages_read_engagement,business_management,leads_retrieval,pages_manage_ads
      scope:
        "public_profile,pages_show_list,pages_read_engagement,business_management,leads_retrieval,pages_manage_ads",
      auth_type: "rerequest",
      return_scopes: true,
    }
  );
};

  interface FacebookPage {
  id: string;
  name: string;
  category: string;
  category_list: {
    id: string;
    name: string;
  }[];
  access_token: string;
  tasks: string[];
}

interface Business {
  id: string;
  name: string;
}


const fetchFacebookData = async (token: string): Promise<void> => {
  try {
    setApiLoading(true);

    const response = await fetch(
      `https://graph.facebook.com/v25.0/me?fields=id,name,accounts{id,name,category,category_list,access_token,tasks}&access_token=${token}`
    );

    const data = await response.json();

    console.log("FACEBOOK RESPONSE:", data);

    if (data.error) {
      message.error(data.error.message);
      return;
    }

    const pages = data.accounts?.data ?? [];

    setPages(pages);

    setBusinesses(
      pages.map((page: any) => ({
        id: page.id,
        name: page.category,
      }))
    );

    console.log("Pages:", pages);
  } catch (error) {
    console.error(error);
    message.error("Failed to load Facebook data");
  } finally {
    setApiLoading(false);
  }
};
  // ======================================================
  // GET PAGES
  // ======================================================

 interface FacebookPage {
  id: string;
  name: string;
  category: string;
  category_list: {
    id: string;
    name: string;
  }[];
  access_token: string;
  tasks: string[];
}


  // ======================================================
  // GET FORMS
  // ======================================================

  const getLeadForms =
    async (
      pageId: string
    ) => {

      try {

        setApiLoading(true);

        setSelectedPage(
          pageId
        );

        setSelectedForm("");

        setLeads([]);

        const page =
          pages.find(
            (p) =>
              p.id === pageId
          );

        if (!page) {

          message.error(
            "Page not found"
          );

          return;
        }

        const response =
          await fetch(

            `https://graph.facebook.com/v19.0/${pageId}/leadgen_forms?access_token=${page.access_token}`

          );

        const data =
          await response.json();

        console.log(
          "FORMS:",
          data
        );

        if (data.error) {

          message.error(
            data.error.message
          );

          return;
        }

        setForms(
          data.data || []
        );

      } catch (error) {

        console.error(error);

        message.error(
          "Failed to load forms"
        );

      } finally {

        setApiLoading(false);
      }
    };

  // ======================================================
  // GET LEADS
  // ======================================================

  const getLeads = async (
    formId: string
  ) => {

    try {

      setApiLoading(true);

      setSelectedForm(
        formId
      );

      const page =
        pages.find(
          (p) =>
            p.id ===
            selectedPage
        );

      if (!page) {

        message.error(
          "Page not found"
        );

        return;
      }

      const response =
        await fetch(

          `https://graph.facebook.com/v19.0/${formId}/leads?access_token=${page.access_token}`

        );

      const data =
        await response.json();

      console.log(
        "LEADS:",
        data
      );

      if (data.error) {

        message.error(
          data.error.message
        );

        return;
      }

      setLeads(
        data.data || []
      );

      message.success(
        "Leads Loaded Successfully"
      );

    } catch (error) {

      console.error(error);

      message.error(
        "Failed to load leads"
      );

    } finally {

      setApiLoading(false);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {

    if (!window.FB)
      return;

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

      localStorage.clear();

      message.success(
        "Logged out successfully"
      );
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
      title:
        "Created Time",

      dataIndex:
        "created_time",

      key:
        "created_time",

      width: 220,
    },

    {
      title:
        "Lead Details",

      key:
        "lead_details",

      render: (
        _: any,
        record: Lead
      ) => (

        <div>

          {record.field_data?.map(
            (
              field,
              index
            ) => (

              <div
                key={
                  index
                }
                style={{
                  marginBottom: 10,
                }}
              >

                <Tag color="blue">
                  {
                    field.name
                  }
                </Tag>

                {field.values?.join(
                  ", "
                )}

              </div>
            )
          )}

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
          icon={
            <FacebookFilled />
          }
          loading={
            loading
          }
          onClick={
            handleFacebookLogin
          }
          className="facebook-login-btn"
        >
          Continue with Facebook
        </Button>

      ) : (

        <Card className="facebook-user-card">

          <div
            style={{
              textAlign:
                "center",
            }}
          >

            <Avatar
              size={90}
              src={
                user.picture
                  ?.data?.url
              }
            />

            <Title
              level={4}
              style={{
                marginTop: 10,
              }}
            >
              {user.name}
            </Title>

          

          </div>

          <Divider />

          <Text strong>
            Businesses
          </Text>

         <Select
    placeholder="Select Business"
    style={{ width: "100%", marginTop: 10 }}
    value={selectedBusiness || undefined}
    onChange={(value) => setSelectedBusiness(value)}
>
    {businesses.map((business) => (
        <Select.Option
            key={business.id}
            value={business.id}
        >
            {business.name}
        </Select.Option>
    ))}
</Select>

          <Divider />

          <Text strong>
            Facebook Pages
          </Text>

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
        <Select.Option
            key={page.id}
            value={page.id}
        >
            {page.name}
        </Select.Option>
    ))}
</Select>

          <Divider />

          <Text strong>
            Lead Forms
          </Text>

          <Select
            placeholder="Select Lead Form"
            style={{
              width: "100%",
              marginTop: 10,
            }}
            value={
              selectedForm ||
              undefined
            }
            onChange={(
              value
            ) =>
              getLeads(
                value
              )
            }
          >

            {forms.map(
              (form) => (

                <Select.Option
                  key={
                    form.id
                  }
                  value={
                    form.id
                  }
                >
                  {form.name}
                </Select.Option>
              )
            )}

          </Select>

          {apiLoading && (

            <div
              style={{
                marginTop: 20,
                textAlign:
                  "center",
              }}
            >
              <Spin />
            </div>
          )}

          {!apiLoading &&
            leads.length ===
              0 &&
            selectedForm && (

              <div
                style={{
                  marginTop: 20,
                }}
              >
                <Empty description="No Leads Found" />
              </div>
            )}

          {leads.length >
            0 && (

            <div
              style={{
                marginTop: 20,
              }}
            >

              <Button
                icon={
                  <ReloadOutlined />
                }
                style={{
                  marginBottom: 15,
                }}
                onClick={() =>
                  getLeads(
                    selectedForm
                  )
                }
              >
                Refresh Leads
              </Button>

              <Table
                columns={
                  columns
                }
                dataSource={
                  leads
                }
                rowKey="id"
                pagination={{
                  pageSize: 5,
                }}
                scroll={{
                  x: true,
                }}
              />

            </div>
          )}

          <Divider />

          <Button
            danger
            icon={
              <LogoutOutlined />
            }
            onClick={
              handleLogout
            }
          >
            Logout
          </Button>

        </Card>
      )}

    </div>
  );
};

export default FacebookLogin;