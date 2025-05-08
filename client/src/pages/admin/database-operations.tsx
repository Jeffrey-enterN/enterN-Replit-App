import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DatabaseOperationsPage() {
  const [adminKey, setAdminKey] = useState<string>("enterN-admin-secret-key");
  const [migrateDraftsLoading, setMigrateDraftsLoading] = useState(false);
  const [migrateDraftsResult, setMigrateDraftsResult] = useState<any>(null);
  const [migrateDraftsError, setMigrateDraftsError] = useState<string | null>(null);
  const [migrateDraftsDeleteAfter, setMigrateDraftsDeleteAfter] = useState(false);

  const [mergeEmployerLoading, setMergeEmployerLoading] = useState(false);
  const [mergeEmployerResult, setMergeEmployerResult] = useState<any>(null);
  const [mergeEmployerError, setMergeEmployerError] = useState<string | null>(null);

  const [removeTablesLoading, setRemoveTablesLoading] = useState(false);
  const [removeTablesResult, setRemoveTablesResult] = useState<any>(null);
  const [removeTablesError, setRemoveTablesError] = useState<string | null>(null);
  const [removeTablesConfirm, setRemoveTablesConfirm] = useState(false);

  async function runMigrateDrafts() {
    setMigrateDraftsLoading(true);
    setMigrateDraftsResult(null);
    setMigrateDraftsError(null);

    try {
      const response = await apiRequest("POST", "/api/admin/migrate-drafts", {
        key: adminKey,
        deleteDrafts: migrateDraftsDeleteAfter
      });
      
      const result = await response.json();
      setMigrateDraftsResult(result);
    } catch (error) {
      console.error("Error migrating drafts:", error);
      setMigrateDraftsError(String(error));
    } finally {
      setMigrateDraftsLoading(false);
    }
  }

  async function runMergeEmployer() {
    setMergeEmployerLoading(true);
    setMergeEmployerResult(null);
    setMergeEmployerError(null);

    try {
      const response = await apiRequest("POST", "/api/admin/merge-employer-company", {
        key: adminKey
      });
      
      const result = await response.json();
      setMergeEmployerResult(result);
    } catch (error) {
      console.error("Error merging employer to company:", error);
      setMergeEmployerError(String(error));
    } finally {
      setMergeEmployerLoading(false);
    }
  }

  async function runRemoveTables() {
    setRemoveTablesLoading(true);
    setRemoveTablesResult(null);
    setRemoveTablesError(null);

    try {
      const response = await apiRequest("POST", "/api/admin/remove-employer-tables", {
        key: adminKey,
        confirm: removeTablesConfirm
      });
      
      const result = await response.json();
      setRemoveTablesResult(result);
    } catch (error) {
      console.error("Error removing tables:", error);
      setRemoveTablesError(String(error));
    } finally {
      setRemoveTablesLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Database Operations</h1>
      
      <Alert className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          These operations make permanent changes to the database. Only proceed if you understand what you're doing.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="migrate-drafts">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="migrate-drafts">Migrate Drafts</TabsTrigger>
          <TabsTrigger value="merge-employer">Merge Employer Profiles</TabsTrigger>
          <TabsTrigger value="remove-tables">Remove Employer Tables</TabsTrigger>
        </TabsList>

        <TabsContent value="migrate-drafts">
          <Card>
            <CardHeader>
              <CardTitle>Migrate Company Profile Drafts</CardTitle>
              <CardDescription>
                Convert company profile drafts into real company records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="delete-drafts" 
                  checked={migrateDraftsDeleteAfter} 
                  onCheckedChange={(checked) => setMigrateDraftsDeleteAfter(!!checked)} 
                />
                <label
                  htmlFor="delete-drafts"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Delete drafts after migration
                </label>
              </div>

              {migrateDraftsResult && (
                <div className="mb-4 p-4 border rounded bg-slate-50">
                  <h3 className="font-medium mb-2">Results:</h3>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(migrateDraftsResult, null, 2)}
                  </pre>
                </div>
              )}

              {migrateDraftsError && (
                <Alert variant="destructive" className="mb-4">
                  <X className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{migrateDraftsError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={runMigrateDrafts} disabled={migrateDraftsLoading}>
                {migrateDraftsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Migrate Drafts to Companies"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="merge-employer">
          <Card>
            <CardHeader>
              <CardTitle>Merge Employer Profiles</CardTitle>
              <CardDescription>
                Migrate employer_profiles data into the companies table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mergeEmployerResult && (
                <div className="mb-4 p-4 border rounded bg-slate-50">
                  <h3 className="font-medium mb-2">Results:</h3>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(mergeEmployerResult, null, 2)}
                  </pre>
                </div>
              )}

              {mergeEmployerError && (
                <Alert variant="destructive" className="mb-4">
                  <X className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{mergeEmployerError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={runMergeEmployer} disabled={mergeEmployerLoading}>
                {mergeEmployerLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Merge Employer Profiles to Companies"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="remove-tables">
          <Card>
            <CardHeader>
              <CardTitle>Remove Employer Tables</CardTitle>
              <CardDescription>
                Permanently remove the employer_profiles and employer_profile_drafts tables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="confirm-remove" 
                  checked={removeTablesConfirm} 
                  onCheckedChange={(checked) => setRemoveTablesConfirm(!!checked)} 
                />
                <label
                  htmlFor="confirm-remove"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm I want to permanently remove these tables
                </label>
              </div>

              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  This operation is irreversible. Make sure you have migrated all data from the 
                  employer_profiles and employer_profile_drafts tables before proceeding.
                </AlertDescription>
              </Alert>

              {removeTablesResult && (
                <div className="mb-4 p-4 border rounded bg-slate-50">
                  <h3 className="font-medium mb-2">Results:</h3>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(removeTablesResult, null, 2)}
                  </pre>
                </div>
              )}

              {removeTablesError && (
                <Alert variant="destructive" className="mb-4">
                  <X className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{removeTablesError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                onClick={runRemoveTables} 
                disabled={removeTablesLoading || !removeTablesConfirm}
              >
                {removeTablesLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Remove Employer Tables"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}