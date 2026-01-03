'use client';

import { useState, useEffect } from 'react';
import { BrandBrain } from '@/types/brand-brain';

export function useBrandBrain() {
  const [brandProfiles, setBrandProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all brand profiles
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brand-brain');
      
      if (!response.ok) {
        throw new Error('Failed to fetch brand profiles');
      }
      
      const data = await response.json();
      setBrandProfiles(data.profiles || []);
      
      // Find active profile
      const active = data.profiles?.find((p: any) => p.is_active);
      setActiveProfile(active || null);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active profile only
  const fetchActiveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brand-brain?active=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch active profile');
      }
      
      const data = await response.json();
      setActiveProfile(data.profiles?.[0] || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create new profile
  const createProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/brand-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create brand profile');
      }
      
      const data = await response.json();
      await fetchProfiles(); // Refresh list
      return data.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Update profile
  const updateProfile = async (id: string, profileData: any) => {
    try {
      const response = await fetch(`/api/brand-brain/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update brand profile');
      }
      
      const data = await response.json();
      await fetchProfiles(); // Refresh list
      return data.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Delete profile
  const deleteProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/brand-brain/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete brand profile');
      }
      
      await fetchProfiles(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Validate content
  const validateContent = async (
    content: string, 
    options?: { 
      brandProfileId?: string;
      contentType?: string;
      funnelId?: string;
      pageId?: string;
    }
  ) => {
    try {
      const response = await fetch('/api/brand-brain/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, ...options })
      });
      
      if (!response.ok) {
        throw new Error('Failed to validate content');
      }
      
      const data = await response.json();
      return data.validation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Get AI system prompt
  const getSystemPrompt = async (brandProfileId?: string) => {
    try {
      const response = await fetch('/api/brand-brain/system-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandProfileId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get system prompt');
      }
      
      const data = await response.json();
      return data.systemPrompt;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    brandProfiles,
    activeProfile,
    loading,
    error,
    fetchProfiles,
    fetchActiveProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    validateContent,
    getSystemPrompt
  };
}
