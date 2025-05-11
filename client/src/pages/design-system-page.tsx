import React from 'react';
import {
  Container,
  Section,
  Heading,
  Text,
  Flex,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Separator,
  Input,
  Textarea,
  Checkbox,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  brandColors,
  semanticColors,
} from '@/components/ui/design-system';

/**
 * Design System Documentation Page
 * 
 * This page serves as interactive documentation for the design system.
 * It showcases all the components and design tokens with examples.
 */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <Container>
        <Section padding="lg">
          <Heading level="h1" className="mb-4">enterN Design System</Heading>
          <Text size="lg" className="max-w-3xl mb-8">
            This design system provides a collection of reusable components and styles
            to ensure consistency throughout the enterN application.
          </Text>
          
          <Separator className="my-8" />
          
          {/* Typography */}
          <Section padding="md">
            <Heading level="h2" className="mb-6">Typography</Heading>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Headings</CardTitle>
                <CardDescription>
                  Heading styles from h1 to h6
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Heading level="h1" className="mb-4">Heading 1</Heading>
                <Heading level="h2" className="mb-4">Heading 2</Heading>
                <Heading level="h3" className="mb-4">Heading 3</Heading>
                <Heading level="h4" className="mb-4">Heading 4</Heading>
                <Heading level="h5" className="mb-4">Heading 5</Heading>
                <Heading level="h6" className="mb-4">Heading 6</Heading>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Text Styles</CardTitle>
                <CardDescription>
                  Various text styles for different contexts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Text size="2xl">2XL Text</Text>
                <Text size="xl">XL Text</Text>
                <Text size="lg">Large Text</Text>
                <Text>Base Text (Default)</Text>
                <Text size="sm">Small Text</Text>
                <Text size="xs">Extra Small Text</Text>
                
                <Separator className="my-4" />
                
                <Text weight="bold">Bold Text</Text>
                <Text weight="semibold">Semibold Text</Text>
                <Text weight="medium">Medium Text</Text>
                <Text weight="normal">Normal Text</Text>
                <Text weight="light">Light Text</Text>
                
                <Separator className="my-4" />
                
                <Text color="muted">Muted Text</Text>
                <Text color="primary">Primary Text</Text>
                <Text color="secondary">Secondary Text</Text>
                <Text color="accent">Accent Text</Text>
                <Text color="success">Success Text</Text>
                <Text color="warning">Warning Text</Text>
                <Text color="error">Error Text</Text>
              </CardContent>
            </Card>
          </Section>
          
          {/* Colors */}
          <Section padding="md">
            <Heading level="h2" className="mb-6">Colors</Heading>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>
                  The primary brand colors used across the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Grid cols={2} gap="md" className="lg:grid-cols-3">
                  <ColorCard name="Teal" color="bg-brand-teal text-white" hex="#0097B1" />
                  <ColorCard name="Pink" color="bg-brand-pink text-white" hex="#FF66C4" />
                  <ColorCard name="Cyan" color="bg-brand-cyan text-black" hex="#5CE1E6" />
                  <ColorCard name="Lime" color="bg-brand-lime text-black" hex="#C8FD04" />
                  <ColorCard name="Black" color="bg-brand-black text-white" hex="#000000" />
                  <ColorCard name="Dark Gray" color="bg-brand-darkgray text-white" hex="#767979" />
                  <ColorCard name="Gray" color="bg-brand-gray text-black" hex="#B6B6B6" />
                  <ColorCard name="White" color="bg-brand-white text-black border" hex="#FFFFFF" />
                </Grid>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
                <CardDescription>
                  Colors with specific meanings and functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Grid cols={2} gap="md" className="lg:grid-cols-3">
                  <ColorCard name="Primary" color="bg-primary text-primary-foreground" />
                  <ColorCard name="Secondary" color="bg-secondary text-secondary-foreground" />
                  <ColorCard name="Accent" color="bg-accent text-accent-foreground" />
                  <ColorCard name="Muted" color="bg-muted text-muted-foreground" />
                  <ColorCard name="Success" color="bg-success text-white" />
                  <ColorCard name="Warning" color="bg-warning text-black" />
                  <ColorCard name="Error" color="bg-destructive text-white" />
                  <ColorCard name="Info" color="bg-info text-white" />
                </Grid>
              </CardContent>
            </Card>
          </Section>
          
          {/* Components */}
          <Section padding="md">
            <Heading level="h2" className="mb-6">Components</Heading>
            
            {/* Buttons */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  Button components in different variants and sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Heading level="h4" className="mb-4">Variants</Heading>
                <Flex gap="md" wrap="wrap" className="mb-6">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </Flex>
                
                <Heading level="h4" className="mb-4">Sizes</Heading>
                <Flex gap="md" wrap="wrap" className="mb-6" align="center">
                  <Button size="default">Default</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><span>🔍</span></Button>
                </Flex>
                
                <Heading level="h4" className="mb-4">States</Heading>
                <Flex gap="md" wrap="wrap" className="mb-6">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button className="opacity-70">Hover (simulated)</Button>
                </Flex>
              </CardContent>
            </Card>
            
            {/* Form Controls */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Form Controls</CardTitle>
                <CardDescription>
                  Form input components for user interaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Grid cols={1} gap="md" className="md:grid-cols-2">
                  <div className="space-y-2">
                    <Text weight="medium">Text Input</Text>
                    <Input placeholder="Enter text here..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Text weight="medium">Textarea</Text>
                    <Textarea placeholder="Enter longer text here..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Text weight="medium">Checkbox</Text>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Accept terms and conditions
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Text weight="medium">Switch</Text>
                    <div className="flex items-center space-x-2">
                      <Switch id="airplane-mode" />
                      <label
                        htmlFor="airplane-mode"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Airplane Mode
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Text weight="medium">Select</Text>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Cards and Badges */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cards and Badges</CardTitle>
                <CardDescription>
                  Container and indicator components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Heading level="h4" className="mb-4">Card Variants</Heading>
                <Grid cols={1} gap="md" className="md:grid-cols-2 lg:grid-cols-3 mb-8">
                  <Card variant="default">
                    <CardHeader>
                      <CardTitle>Default Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text>This is a default card.</Text>
                    </CardContent>
                  </Card>
                  
                  <Card variant="interactive">
                    <CardHeader>
                      <CardTitle>Interactive Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text>This card has hover effects.</Text>
                    </CardContent>
                  </Card>
                  
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Elevated Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text>This card has more elevation.</Text>
                    </CardContent>
                  </Card>
                  
                  <Card variant="highlight">
                    <CardHeader>
                      <CardTitle>Highlighted Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text>This card is highlighted.</Text>
                    </CardContent>
                  </Card>
                  
                  <Card variant="accent">
                    <CardHeader>
                      <CardTitle>Accent Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text>This card has accent styling.</Text>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Heading level="h4" className="mb-4">Badges</Heading>
                <Flex gap="md" wrap="wrap">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </Flex>
              </CardContent>
            </Card>
            
            {/* Layout */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Layout Components</CardTitle>
                <CardDescription>
                  Components for arranging content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Heading level="h4" className="mb-4">Container</Heading>
                <div className="bg-muted/20 mb-8 border rounded">
                  <Container size="default" className="p-4 bg-muted/10 border border-dashed border-muted-foreground/50">
                    <Text>This is a container with default max-width</Text>
                  </Container>
                </div>
                
                <Heading level="h4" className="mb-4">Flex Layout</Heading>
                <Flex gap="md" align="center" className="mb-8 bg-muted/20 p-4 border rounded">
                  <div className="bg-primary text-primary-foreground p-4 rounded">Item 1</div>
                  <div className="bg-primary text-primary-foreground p-4 rounded">Item 2</div>
                  <div className="bg-primary text-primary-foreground p-4 rounded">Item 3</div>
                </Flex>
                
                <Heading level="h4" className="mb-4">Grid Layout</Heading>
                <Grid cols={3} gap="md" className="mb-8 bg-muted/20 p-4 border rounded">
                  <div className="bg-secondary text-secondary-foreground p-4 rounded">Item 1</div>
                  <div className="bg-secondary text-secondary-foreground p-4 rounded">Item 2</div>
                  <div className="bg-secondary text-secondary-foreground p-4 rounded">Item 3</div>
                  <div className="bg-secondary text-secondary-foreground p-4 rounded">Item 4</div>
                  <div className="bg-secondary text-secondary-foreground p-4 rounded">Item 5</div>
                  <div className="bg-secondary text-secondary-foreground p-4 rounded">Item 6</div>
                </Grid>
              </CardContent>
            </Card>
          </Section>
        </Section>
      </Container>
    </div>
  );
}

// Helper component for displaying color swatches
function ColorCard({ name, color, hex }: { name: string; color: string; hex?: string }) {
  return (
    <div className="flex flex-col">
      <div className={`h-20 rounded-md mb-2 ${color} flex items-center justify-center`}>
        {hex && <span className="text-xs">{hex}</span>}
      </div>
      <Text weight="medium">{name}</Text>
    </div>
  );
}