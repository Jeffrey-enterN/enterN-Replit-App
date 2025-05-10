import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function MigrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const runMigration = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('POST', '/api/admin/db/migrate', {
        key: 'enterN-admin-secret-key',
        migration: 'swiped_by'
      });
      
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      
      toast({
        title: 'Migration Result',
        description: data.success ? 'Migration completed successfully' : `Migration failed: ${data.message || 'Unknown error'}`,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Migration failed:', error);
      setResult(JSON.stringify(error, null, 2));
      
      toast({
        title: 'Migration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Database Migration Tool</h1>
      <p className="mb-6 text-muted-foreground">
        This tool runs a migration to add the swiped_by column to the swipes table.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Run Migration</CardTitle>
          <CardDescription>
            Add swipedBy column to swipes table to fix employer swiping functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            disabled={isLoading} 
            onClick={runMigration}
            className="mb-4"
          >
            {isLoading ? 'Running Migration...' : 'Run Migration'}
          </Button>
          
          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded overflow-auto max-h-[300px]">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}