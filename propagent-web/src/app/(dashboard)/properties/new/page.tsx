'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Property, PropertyFormData } from '@/types/property';
import { Button } from '@/components/ui';
import { useCollection, newId, writeLocal } from '@/lib/persistence';

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { add: addProperty } = useCollection<Property>('user_properties', []);

  const handleSubmit = useCallback(async (data: PropertyFormData) => {
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const property: Property = {
        id: newId('prop'),
        title: data.title,
        description: data.description,
        listingType: data.listingType,
        type: data.type,
        status: 'active',
        location: data.location,
        pricing: data.pricing,
        specs: data.specs,
        features: data.features,
        images: [],
        agent: {
          id: 'agent_demo',
          name: 'You',
          email: 'you@agentloop.co.za',
          phone: '+27 00 000 0000',
          agencyName: 'Agent Loop',
        },
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
        viewCount: 0,
        inquiryCount: 0,
        favoriteCount: 0,
        syndicatedTo: [],
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        isDraft: false,
      };

      addProperty(property);
      await new Promise(resolve => setTimeout(resolve, 500));

      setShowSuccess(true);

      setTimeout(() => {
        router.push('/properties');
      }, 1500);
    } catch (error) {
      console.error('Failed to create property:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [router, addProperty]);

  const handleSaveDraft = useCallback(async (data: PropertyFormData) => {
    writeLocal('property_draft', {
      data,
      savedAt: new Date().toISOString(),
    });
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
