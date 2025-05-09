import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import EmployerLayout from "@/components/layouts/employer-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Settings, Sliders, ThumbsUp } from "lucide-react";
import { SLIDER_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type for company slider preferences
type SliderPreferences = {
  preferredSliders: string[];
  preferredSides: Record<string, "left" | "right">;
};

export default function SliderPreferencesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>(SLIDER_CATEGORIES[0].id);
  
  // State for selected sliders
  const [selectedSliders, setSelectedSliders] = useState<string[]>([]);
  const [selectedSides, setSelectedSides] = useState<Record<string, "left" | "right">>({});

  // Get existing preferences if any
  const { data: companyData, isLoading } = useQuery({
    queryKey: ['/api/company/current'],
    enabled: !!user,
  });

  // Set initial selections from company data
  useEffect(() => {
    if (companyData?.sliderPreferences) {
      setSelectedSliders(companyData.sliderPreferences.preferredSliders || []);
      setSelectedSides(companyData.sliderPreferences.preferredSides || {});
    }
  }, [companyData]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: SliderPreferences) => {
      const response = await apiRequest('POST', '/api/company/slider-preferences', preferences);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your slider preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/company/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/matches/feed'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle slider selection
  const toggleSliderSelection = (sliderId: string) => {
    setSelectedSliders(prev => {
      // If already selected, remove it
      if (prev.includes(sliderId)) {
        // Also remove from sides
        const newSides = { ...selectedSides };
        delete newSides[sliderId];
        setSelectedSides(newSides);
        
        return prev.filter(id => id !== sliderId);
      }
      
      // If not selected and less than 3 are selected, add it
      if (prev.length < 3) {
        return [...prev, sliderId];
      }
      
      // Otherwise, show a warning
      toast({
        title: "Maximum selections reached",
        description: "You can select a maximum of 3 slider preferences.",
        variant: "destructive",
      });
      
      return prev;
    });
  };

  // Handle side selection
  const selectSide = (sliderId: string, side: "left" | "right") => {
    if (!selectedSliders.includes(sliderId)) {
      // Can't select a side for an unselected slider
      return;
    }
    
    setSelectedSides(prev => ({
      ...prev,
      [sliderId]: side
    }));
  };

  // Handle save
  const handleSave = () => {
    // Verify all selected sliders have a side preference
    const missingSliders = selectedSliders.filter(id => !selectedSides[id]);
    
    if (missingSliders.length > 0) {
      toast({
        title: "Missing preferences",
        description: "Please select a preferred side for all selected sliders.",
        variant: "destructive",
      });
      return;
    }

    savePreferencesMutation.mutate({
      preferredSliders: selectedSliders,
      preferredSides: selectedSides
    });
  };

  // Find a slider by ID across all categories
  const findSlider = (sliderId: string) => {
    for (const category of SLIDER_CATEGORIES) {
      const slider = category.sliders.find(s => s.id === sliderId);
      if (slider) {
        return slider;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <EmployerLayout>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Matching Preferences</h1>
            <p className="text-muted-foreground mt-1">
              Select the values that matter most to your company when matching with candidates
            </p>
          </div>
          <Button 
            variant="default" 
            onClick={handleSave}
            disabled={savePreferencesMutation.isPending}
          >
            {savePreferencesMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Preferences
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selected preferences card */}
          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Selected Preferences</CardTitle>
                  <CardDescription>
                    Select up to 3 sliders that matter most to your company and indicate which side you prefer
                  </CardDescription>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Sliders className="mr-2 h-5 w-5" />
                  <span>{selectedSliders.length}/3 Selected</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedSliders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't selected any preferences yet</p>
                  <p className="text-sm">
                    Select sliders from the categories below to indicate your company's preferences
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSliders.map(sliderId => {
                    const slider = findSlider(sliderId);
                    if (!slider) return null;
                    
                    return (
                      <div key={sliderId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{slider.name}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleSliderSelection(sliderId)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <Button
                            variant={selectedSides[sliderId] === "left" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => selectSide(sliderId, "left")}
                          >
                            <span className="truncate">{slider.leftLabel}</span>
                          </Button>
                          
                          <Button
                            variant={selectedSides[sliderId] === "right" ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => selectSide(sliderId, "right")}
                          >
                            <span className="truncate">{slider.rightLabel}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedSliders.length > 0 && (
                <Alert className="mt-4">
                  <ThumbsUp className="h-4 w-4" />
                  <AlertTitle>How these preferences work</AlertTitle>
                  <AlertDescription>
                    Jobseekers whose preferences align with yours will appear higher in your match feed.
                    This helps you find candidates who are most likely to fit your company culture.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Categories and sliders */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Slider Categories</CardTitle>
              <CardDescription>
                Browse through the categories to find the sliders that are most important to your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9">
                  {SLIDER_CATEGORIES.map(category => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="text-xs sm:text-sm whitespace-normal h-auto py-2"
                    >
                      {category.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {SLIDER_CATEGORIES.map(category => (
                  <TabsContent key={category.id} value={category.id} className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-muted-foreground mb-6">
                      {category.description}
                    </p>
                    
                    <div className="space-y-6">
                      {category.sliders.map(slider => {
                        const isSelected = selectedSliders.includes(slider.id);
                        const selectedSide = selectedSides[slider.id];
                        
                        return (
                          <div 
                            key={slider.id} 
                            className={cn(
                              "border rounded-lg p-4 transition-colors",
                              isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <h4 className="font-medium">{slider.name}</h4>
                                {isSelected && (
                                  <Badge className="ml-2" variant="secondary">Selected</Badge>
                                )}
                              </div>
                              
                              <Button
                                variant={isSelected ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleSliderSelection(slider.id)}
                              >
                                {isSelected ? "Remove" : "Select"}
                              </Button>
                            </div>
                            
                            {isSelected && (
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <Button
                                  variant={selectedSide === "left" ? "default" : "outline"}
                                  className="justify-start"
                                  onClick={() => selectSide(slider.id, "left")}
                                >
                                  <span className="truncate">{slider.leftLabel}</span>
                                </Button>
                                
                                <Button
                                  variant={selectedSide === "right" ? "default" : "outline"}
                                  className="justify-start"
                                  onClick={() => selectSide(slider.id, "right")}
                                >
                                  <span className="truncate">{slider.rightLabel}</span>
                                </Button>
                              </div>
                            )}
                            
                            {!isSelected && (
                              <div className="grid grid-cols-2 mt-3">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-left p-2 text-sm text-muted-foreground">
                                        {slider.leftLabel}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p className="max-w-xs">{slider.leftLabel}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-right p-2 text-sm text-muted-foreground">
                                        {slider.rightLabel}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p className="max-w-xs">{slider.rightLabel}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployerLayout>
  );
}