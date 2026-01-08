'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import AddBlockForm from '@/app/components/blocks/AddBlockForm';
import { BlockFormData } from '@/app/types/block';

interface AddBlockPageProps {
  params: Promise<{
    projectId: string;
    buildingId: string;
  }>;
}

// Mock data - replace with actual API calls
const MOCK_PROJECT_NAME = 'Sunset Towers';
const MOCK_BUILDING_NAME = 'North Wing';

export default function AddBlockPage({ params: paramsPromise }: AddBlockPageProps) {
  const params = use(paramsPromise);
  const router = useRouter();

  const handleSave = async (formData: BlockFormData) => {
    try {
      // Call API to save block as draft
      console.log('Saving block as draft:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      alert('Block saved as draft successfully!');

      // Redirect back to blocks listing
      router.push(
        `/builder/dashboard/projects/${params.projectId}/buildings/${params.buildingId}/blocks`
      );
    } catch (error) {
      console.error('Error saving block:', error);
      alert('Error saving block. Please try again.');
    }
  };

  const handlePublish = async (formData: BlockFormData) => {
    try {
      // Show confirmation dialog
      if (
        !confirm(
          'Are you sure you want to publish this block? It will be visible on the portal immediately.',
        )
      ) {
        return;
      }

      // Call API to publish block
      console.log('Publishing block:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Block published successfully!');
      
      // Redirect back to blocks listing
      router.push(
        `/builder/dashboard/projects/${params.projectId}/buildings/${params.buildingId}/blocks`
      );
    } catch (error) {
      console.error('Error publishing block:', error);
      alert('Error publishing block. Please try again.');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push(
        `/builder/dashboard/projects/${params.projectId}/buildings/${params.buildingId}/blocks`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              PropertyHub
            </div>
            <div className="flex items-center gap-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddBlockForm
          projectId={params.projectId}
          buildingId={params.buildingId}
          projectName={MOCK_PROJECT_NAME}
          buildingName={MOCK_BUILDING_NAME}
          onSave={handleSave}
          onPublish={handlePublish}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
