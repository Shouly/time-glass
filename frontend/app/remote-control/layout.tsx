import { Metadata } from "next";

export const metadata: Metadata = {
  title: "远程控制 | Time Glass",
  description: "管理和控制连接的客户端设备",
};

export default function RemoteControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 