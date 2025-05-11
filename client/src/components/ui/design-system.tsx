/**
 * Design System Component
 * 
 * This component serves as a convenient export point for all design system
 * components, making it easy to import multiple components from a single source.
 */
import React from 'react';

// Re-export all design system components
export { Container } from '@/components/ui/container';
export { Section } from '@/components/ui/section';
export { Grid } from '@/components/ui/grid';
export { Flex } from '@/components/ui/flex';
export { Heading } from '@/components/ui/heading';
export { Text } from '@/components/ui/text';
export { CardExtended as Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card-extended';

// Re-export all base UI components that are part of the design system
export { Button, buttonVariants } from '@/components/ui/button';
export { Input } from '@/components/ui/input';
export { Textarea } from '@/components/ui/textarea';
export { Badge } from '@/components/ui/badge';
export { Separator } from '@/components/ui/separator';
export { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
export { Checkbox } from '@/components/ui/checkbox';
export { Label } from '@/components/ui/label';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export { Switch } from '@/components/ui/switch';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export { Toast, ToastAction } from '@/components/ui/toast';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Re-export utility functions selectively to avoid conflicts
export { cn } from '@/lib/utils';
export { 
  formatDate, 
  formatDateForInput, 
  getInitials, 
  truncateText,
  cardStyles,
  animations,
  statusVariants,
  layouts
} from '@/lib/utils';

// Export design tokens
export { 
  brandColors,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animation,
  breakpoints,
  layoutPatterns,
  gradients
} from '@/lib/design-tokens';

// Export variants selectively
export {
  containerVariants,
  sectionVariants,
  cardVariants,
  headingVariants,
  textVariants,
  badgeExtendedVariants,
  gridVariants,
  flexVariants
} from '@/components/ui/variants';

/**
 * Design System Documentation Component
 * 
 * This component renders documentation for the design system.
 * It's a placeholder for now - expand as needed.
 */
export function DesignSystem() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">enterN Design System</h1>
      <p className="text-lg mb-4">
        This is the central component library and design system for the enterN application.
        Use these components to ensure consistency across the UI.
      </p>
    </div>
  );
}

export default DesignSystem;