import { AccountChrome } from "@/components/account/AccountChrome";

export default function AccountPublicLayout({ children }: { children: React.ReactNode }) {
  return <AccountChrome>{children}</AccountChrome>;
}
