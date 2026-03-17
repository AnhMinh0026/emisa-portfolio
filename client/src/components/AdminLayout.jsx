import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { PictureOutlined, DollarOutlined, LogoutOutlined, AppstoreOutlined } from "@ant-design/icons";
import useAuthStore from "../store/useAuthStore";

const { Sider, Content, Header } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    {
      key: "/admin/images",
      icon: <PictureOutlined />,
      label: "Quản lý Ảnh",
    },
    {
      key: "/admin/categories",
      icon: <AppstoreOutlined />,
      label: "Danh Mục",
    },
    {
      key: "/admin/pricing",
      icon: <DollarOutlined />,
      label: "Bảng Giá",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
      navigate("/admin");
    } else {
      navigate(key);
    }
  };

  const currentKey = location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        width={220}
        style={{
          background: "#111",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            padding: "28px 24px 20px",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <p style={{ color: "#aaa", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", margin: 0 }}>
            Admin
          </p>
          <h1
            style={{
              color: "#fff",
              fontSize: 18,
              fontFamily: "serif",
              letterSpacing: 3,
              textTransform: "uppercase",
              margin: "4px 0 0",
              cursor: "pointer",
            }}
            onClick={() => navigate("/home")}
          >
            Emisa
          </h1>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            background: "#111",
            border: "none",
            marginTop: 12,
            color: "#ccc",
          }}
          theme="dark"
        />
      </Sider>

      {/* Main content area */}
      <Layout style={{ marginLeft: 220 }}>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #eee",
            height: 60,
            lineHeight: "60px",
            paddingInline: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <span style={{ fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "#111", fontWeight: 500 }}>
            {currentKey === "/admin/images" ? "Quản lý Ảnh" : currentKey === "/admin/categories" ? "Danh Mục" : "Quản lý Bảng Giá"}
          </span>
          <span style={{ fontSize: 11, color: "#999", letterSpacing: 1 }}>
            Dashboard
          </span>
        </Header>

        <Content style={{ padding: "32px", background: "#f7f7f7", minHeight: "calc(100vh - 60px)" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
