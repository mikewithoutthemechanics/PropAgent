'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Property, PropertyFormData } from '@/types/property';
import { Button } from '@/components/ui';
import { useCollection, writeLocal } from '@/lib/persistence';
import { sampleProperties } from '@/lib/sample-data';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { items, update } = useCollection<Property>('user_properties', []);

  const property = useMemo(() => {
    return (
      items.find((p) => p.id === propertyId) ||
      sampleProperties.find((p) => p.id === propertyId) ||
      null
    );
  }, [items, propertyId]);

  const initialData: Partial<PropertyFormData> | undefined = useMemo(() => {
    if (!property) return undefined;
    return {
      title: property.title,
      description: property.description,
      listingType: property.listingType,
      type: property.type,
      location: property.location,
      pricing: property.pricing,
      specs: property.specs,
      features: property.features,
    };
  }, [property]);

  const handleSubmit = useCallback(
    async (data: PropertyFormData) => {
      if (!property) return;
      setIsSubmitting(true);
      try {
        update(property.id, {
          title: data.title,
          description: data.description,
          listingType: data.listingType,
          type: data.type,
          location: data.location,
          pricing: data.pricing,
          specs: data.specs,
          features: data.features,
          updatedAt: new Date().toISOString(),
          slug: data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        });
        await new Promise((resolve) => setTimeout(resolve, 400));
        setShowSuccess(true);
        setTimeout(() => {
          router.push(`/properties/${property.id}`);
        }, 1200);
      } catch (error) {
        console.error('Failed to update property:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, update, property],
  );

  const handleSaveDraft = useCallback(
    async (data: PropertyFormData) => {
      writeLocal(`property_draft_${propertyId}`, {
        data,
        savedAt: new Date().toISOString(),
      });
    },
    [propertyId],
  );

  if (!property) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Property not found</h1>
        <p className="text-slate-500 mb-6">
          This property doesn&apos;t exist or has been removed.
        </p>
        <Link href="/properties">
          <Button>Back to Properties</Button>
        </Link>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Property Updated</h1>
        <p className="text-slate-500 mb-6">Redirecting you to the property details…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/properties/${property.id}`}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Property</h1>
          <p className="text-slate-500 text-sm">{property.title}</p>
        </div>
      </div>

      <PropertyForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
