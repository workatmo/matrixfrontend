import AdminLayout from "@/components/admin/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AttributePlaceholderPageProps {
  title: string;
}

export default function AttributePlaceholderPage({ title }: AttributePlaceholderPageProps) {
  return (
    <AdminLayout title={title}>
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              This page is ready for your Shadcn CRUD UI integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No content yet. Use this page to manage {title.toLowerCase()} attributes.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
