'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { PropertyFormData } from '@/types/property';
import { Button } from '@/components/ui';

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = useCallback(async (data: PropertyFormData) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      // await fetch('/api/properties', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        router.push('/properties');
      }, 2000);
    } catch (error) {
      console.error('Failed to create property:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  const handleSaveDraft = useCallback(async (data: PropertyFormData) => {
    // In a real app, this would save to localStorage or a drafts API
    console.log('Saving draft:', data);
    
    // Store in localStorage for demo
    localStorage.setItem('property_draft', JSON.stringify({
      data,
      savedAt: new Date().toISOString(),
    }));
  }, []);

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Property Created Successfully!</h1>
        <p className="text-slate-500 mb-6">Your property listing has been published and is now live.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/properties">
            <Button variant="outline">View All Properties</Button>
          </Link>
          <Link href="/properties/new">
            <Button>Add Another Property</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/properties"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Property</h1>
          <p className="text-slate-500 text-sm">Create a new property listing</p>
        </div>
      </div>

      {/* Form */}
      <PropertyForm
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
