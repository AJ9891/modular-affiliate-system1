'use client';

import { useState } from 'react';
import { useBrandBrain } from '@/hooks/useBrandBrain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BrandBrainPage() {
  const {
    brandProfiles,
    activeProfile,
    loading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    validateContent
  } = useBrandBrain();

  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [testContent, setTestContent] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    brand_name: '',
    mission: '',
    values: [] as string[],
    target_audience: '',
    archetype: '',
    voice_tone: 'professional' as any,
    formality_level: 3,
    humor_level: 'subtle' as any,
    emoji_usage: 'rare' as any,
  });

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingProfile(null);
    setFormData({
      brand_name: '',
      mission: '',
      values: [],
      target_audience: '',
      archetype: '',
      voice_tone: 'professional',
      formality_level: 3,
      humor_level: 'subtle',
      emoji_usage: 'rare',
    });
  };

  const handleEdit = (profile: any) => {
    setIsCreating(false);
    setEditingProfile(profile);
    setFormData({
      brand_name: profile.brand_name || '',
      mission: profile.mission || '',
      values: profile.values || [],
      target_audience: profile.target_audience || '',
      archetype: profile.archetype || '',
      voice_tone: profile.voice_tone || 'professional',
      formality_level: profile.formality_level || 3,
      humor_level: profile.humor_level || 'subtle',
      emoji_usage: profile.emoji_usage || 'rare',
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createProfile(formData);
      } else if (editingProfile) {
        await updateProfile(editingProfile.id, formData);
      }
      setEditingProfile(null);
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand profile?')) {
      try {
        await deleteProfile(id);
      } catch (err) {
        console.error('Error deleting profile:', err);
      }
    }
  };

  const handleValidateContent = async () => {
    if (!testContent.trim()) return;
    
    setValidating(true);
    try {
      const result = await validateContent(testContent);
      setValidationResult(result);
    } catch (err) {
      console.error('Error validating content:', err);
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            BrandBrain
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your brand personality, AI rules, and compliance policies
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Brand Profile
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profiles">Brand Profiles</TabsTrigger>
          <TabsTrigger value="validator">Content Validator</TabsTrigger>
          <TabsTrigger value="editor">Profile Editor</TabsTrigger>
        </TabsList>

        {/* Profiles List */}
        <TabsContent value="profiles" className="space-y-4">
          {brandProfiles.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No brand profiles yet</p>
                <Button onClick={handleCreateNew}>Create Your First Profile</Button>
              </CardContent>
            </Card>
          ) : (
            brandProfiles.map(profile => (
              <Card key={profile.id} className={profile.is_active ? 'border-purple-500 border-2' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {profile.brand_name}
                        {profile.is_active && (
                          <Badge variant="default">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {profile.mission || 'No mission statement'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(profile)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(profile.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Voice Tone</p>
                      <p className="text-muted-foreground">{profile.voice_tone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Formality</p>
                      <p className="text-muted-foreground">{profile.formality_level || 'Not set'}/5</p>
                    </div>
                    <div>
                      <p className="font-medium">Humor Level</p>
                      <p className="text-muted-foreground">{profile.humor_level || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Target</p>
                      <p className="text-muted-foreground truncate">
                        {profile.target_audience || 'Not set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Content Validator */}
        <TabsContent value="validator">
          <Card>
            <CardHeader>
              <CardTitle>Validate Content Against Brand Guidelines</CardTitle>
              <CardDescription>
                Test your content to see how well it aligns with your brand rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-content">Content to Validate</Label>
                <Textarea
                  id="test-content"
                  placeholder="Enter your content here..."
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  rows={8}
                  className="mt-1"
                />
              </div>
              
              <Button onClick={handleValidateContent} disabled={validating || !testContent.trim()}>
                {validating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Validate Content'
                )}
              </Button>

              {validationResult && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Validation Results</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Brand Alignment Score:</span>
                      <Badge variant={validationResult.score >= 80 ? 'default' : validationResult.score >= 60 ? 'secondary' : 'destructive'}>
                        {validationResult.score}/100
                      </Badge>
                    </div>
                  </div>

                  {validationResult.violations.length === 0 ? (
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertDescription>
                        Great! No violations found. Your content aligns well with your brand guidelines.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-2">
                      {validationResult.violations.map((violation: any, idx: number) => (
                        <Alert key={idx} variant={violation.severity === 'error' ? 'destructive' : 'default'}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <p className="font-medium">{violation.message}</p>
                            {violation.suggestion && (
                              <p className="text-sm mt-1 text-muted-foreground">
                                Suggestion: {violation.suggestion}
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Editor */}
        <TabsContent value="editor">
          {!isCreating && !editingProfile ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Select a profile to edit or create a new one
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreating ? 'Create New Brand Profile' : 'Edit Brand Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  
                  <div>
                    <Label htmlFor="brand_name">Brand Name *</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                      placeholder="Your Brand Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mission">Mission Statement</Label>
                    <Textarea
                      id="mission"
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      placeholder="What is your brand's mission?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                      placeholder="Who is your target audience?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="archetype">Brand Archetype</Label>
                    <Input
                      id="archetype"
                      value={formData.archetype}
                      onChange={(e) => setFormData({ ...formData, archetype: e.target.value })}
                      placeholder="e.g., The Sage, The Hero, The Maverick"
                    />
                  </div>
                </div>

                {/* Voice & Tone */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Voice & Tone</h3>
                  
                  <div>
                    <Label htmlFor="voice_tone">Overall Tone</Label>
                    <Select
                      value={formData.voice_tone}
                      onValueChange={(value) => setFormData({ ...formData, voice_tone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="formality_level">Formality Level: {formData.formality_level}/5</Label>
                    <Input
                      id="formality_level"
                      type="range"
                      min="1"
                      max="5"
                      value={formData.formality_level}
                      onChange={(e) => setFormData({ ...formData, formality_level: parseInt(e.target.value) })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="humor_level">Humor Level</Label>
                    <Select
                      value={formData.humor_level}
                      onValueChange={(value) => setFormData({ ...formData, humor_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="subtle">Subtle</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="emoji_usage">Emoji Usage</Label>
                    <Select
                      value={formData.emoji_usage}
                      onValueChange={(value) => setFormData({ ...formData, emoji_usage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="frequent">Frequent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave}>Save Profile</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingProfile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
